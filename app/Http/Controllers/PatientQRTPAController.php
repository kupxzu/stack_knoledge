<?php

namespace App\Http\Controllers;

use App\Models\Patient;
use App\Models\PatientQR;
use App\Models\PatientTransaction;
use App\Models\PatientPortal;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use SimpleSoftwareIO\QrCode\Facades\QrCode;
use Illuminate\Support\Facades\Storage;

class PatientQRTPAController extends Controller
{
    /**
     * Generate QR Code and Portal Access when patient is admitted
     */
    public function generateQRAndPortal($patientId, $userId)
    {
        try {
            DB::beginTransaction();

            $patient = Patient::findOrFail($patientId);

            // Generate unique access hash
            $accessHash = Str::random(32);
            
            // Create portal access (expires in 30 days)
            $portal = PatientPortal::create([
                'patient_id' => $patientId,
                'access_hash' => $accessHash,
                'expires_at' => now()->addDays(30)
            ]);

            // Generate QR code data (portal URL)
            $qrData = url("/patient-portal/{$accessHash}");
            $qrCode = Str::uuid();

            // Create QR record
            $patientQR = PatientQR::create([
                'patient_id' => $patientId,
                'qrcode' => $qrCode,
                'ptportal_id' => $portal->id,
                'action' => 'active'
            ]);

            // Generate QR code image
            $qrCodeImage = QrCode::format('png')->size(200)->generate($qrData);
            $qrPath = "qr-codes/{$qrCode}.png";
            Storage::disk('public')->put($qrPath, $qrCodeImage);

            DB::commit();

            return [
                'qr' => $patientQR,
                'portal' => $portal,
                'qr_image_url' => Storage::url($qrPath),
                'portal_url' => $qrData
            ];

        } catch (\Exception $e) {
            DB::rollback();
            throw $e;
        }
    }

    /**
     * Get active patients for billing (not discharged)
     */
    public function getActivePatients(Request $request)
    {
        try {
            if (!in_array($request->user()->role, ['admin', 'billing'])) {
                return response()->json(['error' => 'Unauthorized'], 403);
            }

            $patients = Patient::with([
                'patientInfo',
                'patientAddress', 
                'patientRoom',
                'patientPhysician',
                'activeQR',
                'transactions'
            ])
            ->whereHas('activeQR', function($query) {
                $query->where('action', 'active');
            })
            ->get()
            ->map(function($patient) {
                return [
                    'id' => $patient->id,
                    'patient_info' => $patient->patientInfo,
                    'patient_address' => $patient->patientAddress,
                    'patient_room' => $patient->patientRoom,
                    'patient_physician' => $patient->patientPhysician,
                    'qr_code' => $patient->activeQR->qrcode ?? null,
                    'total_amount' => $patient->total_amount,
                    'transaction_count' => $patient->transactions->count(),
                    'status' => 'active'
                ];
            });

            return response()->json(['data' => $patients]);

        } catch (\Exception $e) {
            return response()->json(['error' => 'Unable to fetch active patients'], 500);
        }
    }

    /**
     * Get patient details for billing
     */
    public function getPatientForBilling(Request $request, $id)
    {
        try {
            if (!in_array($request->user()->role, ['admin', 'billing'])) {
                return response()->json(['error' => 'Unauthorized'], 403);
            }

            $patient = Patient::with([
                'patientInfo',
                'patientAddress',
                'patientRoom', 
                'patientPhysician',
                'activeQR.portal',
                'transactions' => function($query) {
                    $query->orderBy('created_at', 'desc');
                }
            ])->findOrFail($id);

            // Check if patient is active
            if (!$patient->activeQR || $patient->activeQR->action !== 'active') {
                return response()->json(['error' => 'Patient is not active'], 400);
            }

            return response()->json([
                'patient' => [
                    'id' => $patient->id,
                    'patient_info' => $patient->patientInfo,
                    'patient_address' => $patient->patientAddress,
                    'patient_room' => $patient->patientRoom,
                    'patient_physician' => $patient->patientPhysician,
                    'qr_code' => $patient->activeQR->qrcode,
                    'portal_access' => $patient->activeQR->portal,
                    'transactions' => $patient->transactions,
                    'total_amount' => $patient->total_amount,
                    'status' => $patient->activeQR->action
                ]
            ]);

        } catch (\Exception $e) {
            return response()->json(['error' => 'Patient not found'], 404);
        }
    }

    /**
     * Add transaction to patient
     */
    public function addTransaction(Request $request)
    {
        try {
            if (!in_array($request->user()->role, ['admin', 'billing'])) {
                return response()->json(['error' => 'Unauthorized'], 403);
            }

            $request->validate([
                'patient_id' => 'required|exists:patients,id',
                'amount' => 'required|numeric|min:0',
                'soa_pdf' => 'nullable|file|mimes:pdf|max:2048'
            ]);

            DB::beginTransaction();

            $patient = Patient::findOrFail($request->patient_id);

            // Check if patient is active
            if (!$patient->activeQR || $patient->activeQR->action !== 'active') {
                return response()->json(['error' => 'Patient is not active'], 400);
            }

            // Handle SOA PDF upload
            $soaPdfPath = null;
            if ($request->hasFile('soa_pdf')) {
                $soaPdfPath = $request->file('soa_pdf')->store('soa-pdfs', 'public');
            }

            // Create transaction
            $transaction = PatientTransaction::create([
                'patient_id' => $request->patient_id,
                'amount' => $request->amount,
                'soa_pdf' => $soaPdfPath
            ]);

            // Update QR with transaction reference
            $patient->activeQR->update([
                'pttransaction_id' => $transaction->id
            ]);

            DB::commit();

            return response()->json([
                'transaction' => $transaction,
                'message' => 'Transaction added successfully'
            ], 201);

        } catch (\Exception $e) {
            DB::rollback();
            return response()->json(['error' => 'Unable to add transaction'], 500);
        }
    }

    /**
     * Discharge patient
     */
    public function dischargePatient(Request $request, $id)
    {
        try {
            if (!in_array($request->user()->role, ['admin', 'billing'])) {
                return response()->json(['error' => 'Unauthorized'], 403);
            }

            DB::beginTransaction();

            $patient = Patient::findOrFail($id);

            // Check if patient is active
            if (!$patient->activeQR || $patient->activeQR->action !== 'active') {
                return response()->json(['error' => 'Patient is already discharged'], 400);
            }

            // Update QR status to discharged
            $patient->activeQR->update([
                'action' => 'discharge'
            ]);

            DB::commit();

            return response()->json(['message' => 'Patient discharged successfully']);

        } catch (\Exception $e) {
            DB::rollback();
            return response()->json(['error' => 'Unable to discharge patient'], 500);
        }
    }

    /**
     * Patient portal access (public endpoint)
     */
    public function getPatientPortal($accessHash)
    {
        try {
            $portal = PatientPortal::with([
                'patient.patientInfo',
                'patient.patientAddress',
                'patient.patientRoom',
                'patient.patientPhysician',
                'patient.transactions' => function($query) {
                    $query->orderBy('created_at', 'desc');
                }
            ])->where('access_hash', $accessHash)->first();

            if (!$portal) {
                return response()->json(['error' => 'Invalid access code'], 404);
            }

            if ($portal->isExpired()) {
                return response()->json(['error' => 'Access code has expired'], 403);
            }

            $patient = $portal->patient;
            $totalAmount = $patient->total_amount;

            return response()->json([
                'patient' => [
                    'id' => $patient->id,
                    'patient_info' => $patient->patientInfo,
                    'patient_address' => $patient->patientAddress,
                    'patient_room' => $patient->patientRoom,
                    'patient_physician' => $patient->patientPhysician,
                    'total_amount' => $totalAmount,
                    'transactions' => $patient->transactions->map(function($transaction) {
                        return [
                            'id' => $transaction->id,
                            'amount' => $transaction->amount,
                            'soa_pdf' => $transaction->soa_pdf ? Storage::url($transaction->soa_pdf) : null,
                            'created_at' => $transaction->created_at
                        ];
                    }),
                    'access_expires_at' => $portal->expires_at
                ]
            ]);

        } catch (\Exception $e) {
            return response()->json(['error' => 'Unable to access portal'], 500);
        }
    }

    /**
     * Get QR code image
     */
    public function getQRCode(Request $request, $qrCode)
    {
        try {
            if (!in_array($request->user()->role, ['admin', 'admitting', 'billing'])) {
                return response()->json(['error' => 'Unauthorized'], 403);
            }

            $patientQR = PatientQR::where('qrcode', $qrCode)->first();

            if (!$patientQR) {
                return response()->json(['error' => 'QR code not found'], 404);
            }

            $qrPath = "qr-codes/{$qrCode}.png";
            
            if (!Storage::disk('public')->exists($qrPath)) {
                // Regenerate QR code if missing
                $portal = $patientQR->portal;
                $qrData = url("/patient-portal/{$portal->access_hash}");
                $qrCodeImage = QrCode::format('png')->size(200)->generate($qrData);
                Storage::disk('public')->put($qrPath, $qrCodeImage);
            }

            return response()->json([
                'qr_image_url' => Storage::url($qrPath),
                'portal_url' => url("/patient-portal/{$patientQR->portal->access_hash}")
            ]);

        } catch (\Exception $e) {
            return response()->json(['error' => 'Unable to get QR code'], 500);
        }
    }

    /**
     * Regenerate QR Code and Patient Portal Access
     */
        public function regenerateQRAndPortal(Request $request, $patientId)
        {
            try {
                if (!in_array($request->user()->role, ['admin', 'admitting'])) {
                    return response()->json(['error' => 'Unauthorized'], 403);
                }

                DB::beginTransaction();

                $patient = Patient::findOrFail($patientId);

                // Find existing QR and portal
                $existingQR = $patient->activeQR;
                $existingPortal = $existingQR ? $existingQR->portal : null;

                // Delete old QR image if exists
                if ($existingQR) {
                    $oldQrPath = "qr-codes/{$existingQR->qrcode}.png";
                    if (Storage::disk('public')->exists($oldQrPath)) {
                        Storage::disk('public')->delete($oldQrPath);
                    }
                }

                // Generate new access hash
                $accessHash = Str::random(32);
                
                // Update or create portal access
                if ($existingPortal) {
                    $existingPortal->update([
                        'access_hash' => $accessHash,
                        'expires_at' => now()->addDays(30)
                    ]);
                    $portal = $existingPortal;
                } else {
                    $portal = PatientPortal::create([
                        'patient_id' => $patientId,
                        'access_hash' => $accessHash,
                        'expires_at' => now()->addDays(30)
                    ]);
                }

                // Generate new QR code
                $qrData = url("/patient-portal/{$accessHash}");
                $qrCode = Str::uuid();

                // Update or create QR record
                if ($existingQR) {
                    $existingQR->update([
                        'qrcode' => $qrCode,
                        'ptportal_id' => $portal->id
                    ]);
                    $patientQR = $existingQR;
                } else {
                    $patientQR = PatientQR::create([
                        'patient_id' => $patientId,
                        'qrcode' => $qrCode,
                        'ptportal_id' => $portal->id,
                        'action' => 'active'
                    ]);
                }

                // Generate new QR code image
                $qrCodeImage = QrCode::format('png')->size(200)->generate($qrData);
                $qrPath = "qr-codes/{$qrCode}.png";
                Storage::disk('public')->put($qrPath, $qrCodeImage);

                DB::commit();

                return response()->json([
                    'qr_data' => [
                        'qr' => $patientQR,
                        'portal' => $portal,
                        'qr_image_url' => Storage::url($qrPath),
                        'portal_url' => $qrData
                    ],
                    'message' => 'QR Code regenerated successfully'
                ]);

            } catch (\Exception $e) {
                DB::rollback();
                return response()->json(['error' => 'Unable to regenerate QR code'], 500);
            }
        }
}