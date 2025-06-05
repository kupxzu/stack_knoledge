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
use App\Services\CacheService;

class PatientQRTPAController extends Controller
{
    /**
     * Cache TTL constants (in seconds)
     */
    const CACHE_TTL_SHORT = 300;  // 5 minutes
    const CACHE_TTL_MEDIUM = 1800; // 30 minutes
    const CACHE_TTL_LONG = 86400;  // 24 hours

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

            // Clear any cached data for this patient
            $this->clearPatientCache($patientId);

            $result = [
                'qr' => $patientQR,
                'portal' => $portal,
                'qr_image_url' => Storage::url($qrPath),
                'portal_url' => $qrData
            ];

            return $result;

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

            // Check for force refresh parameter
            $forceRefresh = $request->boolean('force_refresh', false);
            $cacheKey = 'billing:active-patients';
            
            if ($forceRefresh) {
                CacheService::forget($cacheKey);
            }

            // Get data from cache or execute query
            $result = CacheService::remember($cacheKey, function() {
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

                return $patients;
            }, self::CACHE_TTL_SHORT);

            return response()->json([
                'data' => $result['data'],
                'fromCache' => $result['fromCache']
            ]);

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

            // Check for force refresh parameter
            $forceRefresh = $request->boolean('force_refresh', false);
            $cacheKey = "billing:patient:{$id}";
            
            if ($forceRefresh) {
                CacheService::forget($cacheKey);
            }

            // Get data from cache or execute query
            $result = CacheService::remember($cacheKey, function() use ($id) {
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
                    throw new \Exception('Patient is not active', 400);
                }

                return [
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
                ];
            }, self::CACHE_TTL_SHORT);

            return response()->json([
                ...$result['data'],
                'fromCache' => $result['fromCache']
            ]);

        } catch (\Exception $e) {
            $statusCode = $e->getCode() >= 400 ? $e->getCode() : 500;
            return response()->json(['error' => $e->getMessage()], $statusCode);
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

            // Clear patient cache after adding transaction
            $this->clearPatientCache($request->patient_id);

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

            // Clear patient cache after discharge
            $this->clearPatientCache($id);
            CacheService::forget('billing:active-patients');

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
            $cacheKey = "patient-portal:{$accessHash}";
            
            $result = CacheService::remember($cacheKey, function() use ($accessHash) {
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
                    throw new \Exception('Invalid access code', 404);
                }

                if ($portal->isExpired()) {
                    throw new \Exception('Access code has expired', 403);
                }

                $patient = $portal->patient;
                $totalAmount = $patient->total_amount;

                return [
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
                ];
            }, self::CACHE_TTL_MEDIUM);

            return response()->json([
                ...$result['data'],
                'fromCache' => $result['fromCache']
            ]);

        } catch (\Exception $e) {
            $statusCode = $e->getCode() >= 400 ? $e->getCode() : 500;
            return response()->json(['error' => $e->getMessage()], $statusCode);
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

            $forceRefresh = $request->boolean('force_refresh', false);
            $cacheKey = "qr-code:{$qrCode}";
            
            if ($forceRefresh) {
                CacheService::forget($cacheKey);
            }

            $result = CacheService::remember($cacheKey, function() use ($qrCode) {
                $patientQR = PatientQR::where('qrcode', $qrCode)->first();

                if (!$patientQR) {
                    throw new \Exception('QR code not found', 404);
                }

                $qrPath = "qr-codes/{$qrCode}.png";
                
                if (!Storage::disk('public')->exists($qrPath)) {
                    // Regenerate QR code if missing
                    $portal = $patientQR->portal;
                    $qrData = url("/patient-portal/{$portal->access_hash}");
                    $qrCodeImage = QrCode::format('png')->size(200)->generate($qrData);
                    Storage::disk('public')->put($qrPath, $qrCodeImage);
                }

                return [
                    'qr_image_url' => Storage::url($qrPath),
                    'portal_url' => url("/patient-portal/{$patientQR->portal->access_hash}")
                ];
            }, self::CACHE_TTL_LONG);

            return response()->json([
                ...$result['data'],
                'fromCache' => $result['fromCache']
            ]);

        } catch (\Exception $e) {
            $statusCode = $e->getCode() >= 400 ? $e->getCode() : 500;
            return response()->json(['error' => $e->getMessage()], $statusCode);
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
                
                // Clear old QR cache
                if ($existingQR->qrcode !== $qrCode) {
                    CacheService::forget("qr-code:{$existingQR->qrcode}");
                }
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

            // Clear related caches
            $this->clearPatientCache($patientId);
            
            // If there was an old portal, clear its cache
            if ($existingPortal && $existingPortal->access_hash !== $accessHash) {
                CacheService::forget("patient-portal:{$existingPortal->access_hash}");
            }

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

    /**
     * Download PDF file (handles CORS properly)
     */
    public function downloadPDF(Request $request)
    {
        try {
            $request->validate([
                'file_path' => 'required|string',
                'filename' => 'nullable|string'
            ]);

            $filePath = $request->get('file_path');
            $filename = $request->get('filename', 'statement.pdf');
            
            // Remove any leading slashes and 'storage/' prefix
            $filePath = ltrim($filePath, '/');
            $filePath = str_replace('storage/', '', $filePath);
            
            // Get the full path in storage
            $fullPath = storage_path('app/public/' . $filePath);
            
            // Check if file exists
            if (!file_exists($fullPath)) {
                return response()->json(['error' => 'File not found'], 404);
            }
            
            // Return the file as download
            return response()->download($fullPath, $filename, [
                'Content-Type' => 'application/pdf',
                'Content-Disposition' => 'attachment; filename="' . $filename . '"'
            ]);
            
        } catch (\Exception $e) {
            return response()->json(['error' => 'Unable to download file'], 500);
        }
    }
    
    /**
     * Clear all cache related to a specific patient
     */
    private function clearPatientCache($patientId)
    {
        CacheService::forget("billing:patient:{$patientId}");
        CacheService::forget('billing:active-patients');
        
        // Find and clear portal cache if it exists
        try {
            $patientQR = PatientQR::where('patient_id', $patientId)->first();
            if ($patientQR) {
                CacheService::forget("qr-code:{$patientQR->qrcode}");
                
                // Clear portal access cache if exists
                if ($patientQR->portal) {
                    CacheService::forget("patient-portal:{$patientQR->portal->access_hash}");
                }
            }
        } catch (\Exception $e) {
            // Silent fail - this is just cache cleanup
            \Log::warning("Error clearing cache: " . $e->getMessage());
        }
    }
}