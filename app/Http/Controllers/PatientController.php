<?php

namespace App\Http\Controllers;

use App\Models\Patient;
use App\Models\PatientInfo;
use App\Models\PatientAddress;
use App\Models\PatientRoom;
use App\Models\PatientPhysician;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;
use Illuminate\Support\Facades\DB;

class PatientController extends Controller
{
    public function index(Request $request)
    {
        try {
            if (!in_array($request->user()->role, ['admin', 'admitting'])) {
                return response()->json(['error' => 'Unauthorized'], 403);
            }

            $perPage = $request->get('per_page', 10);
            $search = $request->get('search', '');
            $sortBy = $request->get('sort_by', 'DateCreated');
            $sortOrder = $request->get('sort_order', 'desc');

            $allowedSortColumns = ['id', 'DateCreated', 'patient_name'];
            if (!in_array($sortBy, $allowedSortColumns)) {
                $sortBy = 'DateCreated';
            }

            $allowedSortOrders = ['asc', 'desc'];
            if (!in_array($sortOrder, $allowedSortOrders)) {
                $sortOrder = 'desc';
            }

            $query = Patient::with(['patientInfo', 'patientAddress', 'patientRoom', 'patientPhysician']);

            if ($search) {
                $query->whereHas('patientInfo', function($q) use ($search) {
                    $q->where('first_name', 'like', '%' . $search . '%')
                      ->orWhere('last_name', 'like', '%' . $search . '%')
                      ->orWhere('middle_name', 'like', '%' . $search . '%')
                      ->orWhere('contact_number', 'like', '%' . $search . '%');
                })
                ->orWhereHas('patientAddress', function($q) use ($search) {
                    $q->where('address', 'like', '%' . $search . '%');
                })
                ->orWhereHas('patientRoom', function($q) use ($search) {
                    $q->where('room_name', 'like', '%' . $search . '%');
                })
                ->orWhereHas('patientPhysician', function($q) use ($search) {
                    $q->where('first_name', 'like', '%' . $search . '%')
                      ->orWhere('last_name', 'like', '%' . $search . '%');
                });
            }

            if ($sortBy === 'patient_name') {
                $query->join('patient_infos', 'patients.ptinfo_id', '=', 'patient_infos.id')
                      ->orderBy('patient_infos.last_name', $sortOrder)
                      ->orderBy('patient_infos.first_name', $sortOrder)
                      ->select('patients.*');
            } else {
                $query->orderBy($sortBy, $sortOrder);
            }

            $patients = $query->paginate($perPage);

            return response()->json($patients);
        } catch (\Exception $e) {
            return response()->json(['error' => 'Unable to fetch patients'], 500);
        }
    }

    public function store(Request $request)
    {
        try {
            if (!in_array($request->user()->role, ['admin', 'admitting'])) {
                return response()->json(['error' => 'Unauthorized'], 403);
            }

            $request->validate([
                'first_name' => 'required|string|max:255',
                'last_name' => 'required|string|max:255',
                'middle_name' => 'nullable|string|max:255',
                'suffix' => 'nullable|string|max:50',
                'civil_status' => 'required|in:single,married,widowed,divorced,separated',
                'gender' => 'required|in:male,female,others',
                'dob' => 'required|date|before:today',
                'contact_number' => 'required|string|max:20',
                'admitted_date' => 'required|date',
                'address' => 'required|string',
                'room_name' => 'required|string|max:255',
                'room_description' => 'nullable|string',
                'physician_first_name' => 'required|string|max:255',
                'physician_last_name' => 'required|string|max:255',
                'physician_middle_name' => 'nullable|string|max:255',
                'physician_suffix' => 'nullable|string|max:50',
                'physician_gender' => 'required|in:male,female,others',
            ]);

            DB::beginTransaction();

            $patientInfo = PatientInfo::create([
                'first_name' => $request->first_name,
                'last_name' => $request->last_name,
                'middle_name' => $request->middle_name,
                'suffix' => $request->suffix,
                'civil_status' => $request->civil_status,
                'gender' => $request->gender,
                'dob' => $request->dob,
                'contact_number' => $request->contact_number,
                'admitted_date' => $request->admitted_date,
                'DateCreated' => now(),
                'CreatedBy' => $request->user()->username,
            ]);

            $patientAddress = PatientAddress::create([
                'address' => $request->address,
                'DateCreated' => now(),
                'CreatedBy' => $request->user()->username,
            ]);

            $patientRoom = PatientRoom::create([
                'room_name' => $request->room_name,
                'description' => $request->room_description,
                'DateCreated' => now(),
                'CreatedBy' => $request->user()->username,
            ]);

            $patientPhysician = PatientPhysician::create([
                'first_name' => $request->physician_first_name,
                'last_name' => $request->physician_last_name,
                'middle_name' => $request->physician_middle_name,
                'suffix' => $request->physician_suffix,
                'gender' => $request->physician_gender,
                'DateCreated' => now(),
                'CreatedBy' => $request->user()->username,
            ]);

            $patient = Patient::create([
                'ptinfo_id' => $patientInfo->id,
                'ptaddress_id' => $patientAddress->id,
                'ptroom_id' => $patientRoom->id,
                'ptphysician_id' => $patientPhysician->id,
                'DateCreated' => now(),
                'CreatedBy' => $request->user()->username,
            ]);

            // Generate QR Code and Portal Access
            $qrController = new PatientQRTPAController();
            $qrData = $qrController->generateQRAndPortal($patient->id, $request->user()->id);

            DB::commit();

            $patient->load([
                'patientInfo',
                'patientAddress',
                'patientRoom',
                'patientPhysician',
                'activeQR.portal'
            ]);

            return response()->json([
                'patient' => $patient,
                'qr_data' => $qrData,
                'message' => 'Patient admitted successfully with QR code generated'
            ], 201);

        } catch (ValidationException $e) {
            DB::rollback();
            throw $e;
        } catch (\Exception $e) {
            DB::rollback();
            return response()->json(['error' => 'Unable to create patient'], 500);
        }
    }

    public function show(Request $request, $id)
    {
        try {
            if (!in_array($request->user()->role, ['admin', 'admitting', 'billing'])) {
                return response()->json(['error' => 'Unauthorized'], 403);
            }

            $patient = Patient::with([
                'patientInfo',
                'patientAddress',
                'patientRoom',
                'patientPhysician',
                'activeQR.portal'
            ])->findOrFail($id);

            $patientData = [
                'id' => $patient->id,
                'patient_info' => $patient->patientInfo,
                'patient_address' => $patient->patientAddress,
                'patient_room' => $patient->patientRoom,
                'patient_physician' => $patient->patientPhysician,
                'qr_code' => $patient->activeQR ? $patient->activeQR->qrcode : null,
                'qr_data' => $patient->activeQR ? [
                    'qr' => $patient->activeQR,
                    'portal' => $patient->activeQR->portal,
                    'qr_image_url' => $patient->activeQR->qrcode ? \Storage::url("qr-codes/{$patient->activeQR->qrcode}.png") : null,
                    'portal_url' => $patient->activeQR->portal ? url("/patient-portal/{$patient->activeQR->portal->access_hash}") : null
                ] : null,
                'created_at' => $patient->DateCreated,
                'created_by' => $patient->CreatedBy
            ];

            return response()->json(['patient' => $patientData]);

        } catch (\Exception $e) {
            return response()->json(['error' => 'Patient not found'], 404);
        }
    }

    public function update(Request $request, $id)
    {
        try {
            if (!in_array($request->user()->role, ['admin', 'admitting'])) {
                return response()->json(['error' => 'Unauthorized'], 403);
            }

            $patient = Patient::findOrFail($id);

            $request->validate([
                'first_name' => 'sometimes|required|string|max:255',
                'last_name' => 'sometimes|required|string|max:255',
                'middle_name' => 'nullable|string|max:255',
                'suffix' => 'nullable|string|max:50',
                'civil_status' => 'sometimes|required|in:single,married,widowed,divorced,separated',
                'gender' => 'sometimes|required|in:male,female,others',
                'dob' => 'sometimes|required|date|before:today',
                'contact_number' => 'sometimes|required|string|max:20',
                'admitted_date' => 'sometimes|required|date',
                'address' => 'sometimes|required|string',
                'room_name' => 'sometimes|required|string|max:255',
                'room_description' => 'nullable|string',
                'physician_first_name' => 'sometimes|required|string|max:255',
                'physician_last_name' => 'sometimes|required|string|max:255',
                'physician_middle_name' => 'nullable|string|max:255',
                'physician_suffix' => 'nullable|string|max:50',
                'physician_gender' => 'sometimes|required|in:male,female,others',

            ]);

            DB::beginTransaction();

            if ($request->hasAny(['first_name', 'last_name', 'gender', 'civil_status', 'dob', 'contact_number', 'admitted_date', 'middle_name', 'suffix'])) {
                $patient->patientInfo->update(array_filter([
                    'first_name' => $request->first_name ?? $patient->patientInfo->first_name,
                    'last_name' => $request->last_name ?? $patient->patientInfo->last_name,
                    'middle_name' => $request->middle_name ?? $patient->patientInfo->middle_name,
                    'suffix' => $request->suffix ?? $patient->patientInfo->suffix,
                    'civil_status' => $request->civil_status ?? $patient->patientInfo->civil_status,
                    'gender' => $request->gender ?? $patient->patientInfo->gender,
                    'dob' => $request->dob ?? $patient->patientInfo->dob,
                    'contact_number' => $request->contact_number ?? $patient->patientInfo->contact_number,
                    'admitted_date' => $request->admitted_date ?? $patient->patientInfo->admitted_date,
                    'DateModified' => now(),
                    'ModifiedBy' => $request->user()->username,
                ], function($value) { return $value !== null; }));
            }

            if ($request->has('address')) {
                $patient->patientAddress->update([
                    'address' => $request->address,
                    'DateModified' => now(),
                    'ModifiedBy' => $request->user()->username,
                ]);
            }

            if ($request->hasAny(['room_name', 'room_description'])) {
                $patient->patientRoom->update([
                    'room_name' => $request->room_name ?? $patient->patientRoom->room_name,
                    'description' => $request->room_description ?? $patient->patientRoom->description,
                    'DateModified' => now(),
                    'ModifiedBy' => $request->user()->username,
                ]);
            }

            if ($request->hasAny(['physician_first_name', 'physician_last_name', 'physician_gender', 'physician_middle_name', 'physician_suffix'])) {
                $patient->patientPhysician->update(array_filter([
                    'first_name' => $request->physician_first_name ?? $patient->patientPhysician->first_name,
                    'last_name' => $request->physician_last_name ?? $patient->patientPhysician->last_name,
                    'middle_name' => $request->physician_middle_name ?? $patient->patientPhysician->middle_name,
                    'suffix' => $request->physician_suffix ?? $patient->patientPhysician->suffix,
                    'gender' => $request->physician_gender ?? $patient->patientPhysician->gender,
                    'DateModified' => now(),
                    'ModifiedBy' => $request->user()->username,
                ], function($value) { return $value !== null; }));
            }


            DB::commit();

            $patient->load([
                'patientInfo',
                'patientAddress',
                'patientRoom',
                'patientPhysician',
            ]);

            return response()->json(['patient' => $patient, 'message' => 'Patient updated successfully']);
        } catch (ValidationException $e) {
            DB::rollback();
            throw $e;
        } catch (\Exception $e) {
            DB::rollback();
            return response()->json(['error' => 'Unable to update patient'], 500);
        }
    }

    public function destroy(Request $request, $id)
    {
        try {
            if (!in_array($request->user()->role, ['admin', 'admitting'])) {
                return response()->json(['error' => 'Unauthorized'], 403);
            }

            $patient = Patient::findOrFail($id);
            $patient->delete();

            return response()->json(['message' => 'Patient deleted successfully']);
        } catch (\Exception $e) {
            return response()->json(['error' => 'Unable to delete patient'], 500);
        }
    }

    public function getAddresses(Request $request)
    {
        try {
            if (!in_array($request->user()->role, ['admin', 'admitting'])) {
                return response()->json(['error' => 'Unauthorized'], 403);
            }

            $addresses = PatientAddress::select('id', 'address')
                ->orderBy('address')
                ->get();

            return response()->json(['data' => $addresses]);
        } catch (\Exception $e) {
            return response()->json(['error' => 'Unable to fetch addresses'], 500);
        }
    }

    public function getRooms(Request $request)
    {
        try {
            if (!in_array($request->user()->role, ['admin', 'admitting'])) {
                return response()->json(['error' => 'Unauthorized'], 403);
            }

            $rooms = PatientRoom::select('id', 'room_name as name', 'description')
                ->orderBy('room_name')
                ->get();

            return response()->json(['data' => $rooms]);
        } catch (\Exception $e) {
            return response()->json(['error' => 'Unable to fetch rooms'], 500);
        }
    }

    public function getPhysicians(Request $request)
    {
        try {
            if (!in_array($request->user()->role, ['admin', 'admitting'])) {
                return response()->json(['error' => 'Unauthorized'], 403);
            }

            $physicians = PatientPhysician::select('id', 'first_name', 'last_name', 'middle_name', 'suffix', 'gender')
                ->orderBy('last_name')
                ->orderBy('first_name')
                ->get();

            return response()->json(['data' => $physicians]);
        } catch (\Exception $e) {
            return response()->json(['error' => 'Unable to fetch physicians'], 500);
        }
    }

    public function storeAddress(Request $request)
    {
        try {
            if (!in_array($request->user()->role, ['admin', 'admitting'])) {
                return response()->json(['error' => 'Unauthorized'], 403);
            }

            $request->validate([
                'address' => 'required|string|max:500',
            ]);

            $patientAddress = PatientAddress::create([
                'address' => $request->address,
                'DateCreated' => now(),
                'CreatedBy' => $request->user()->username,
            ]);

            return response()->json(['data' => $patientAddress, 'message' => 'Address created successfully'], 201);
        } catch (\Exception $e) {
            return response()->json(['error' => 'Unable to create address'], 500);
        }
    }

    public function storeRoom(Request $request)
    {
        try {
            if (!in_array($request->user()->role, ['admin', 'admitting'])) {
                return response()->json(['error' => 'Unauthorized'], 403);
            }

            $request->validate([
                'room_name' => 'required|string|max:255',
                'description' => 'nullable|string|max:500',
            ]);

            $patientRoom = PatientRoom::create([
                'room_name' => $request->room_name,
                'description' => $request->description,
                'DateCreated' => now(),
                'CreatedBy' => $request->user()->username,
            ]);

            return response()->json(['data' => $patientRoom, 'message' => 'Room created successfully'], 201);
        } catch (\Exception $e) {
            return response()->json(['error' => 'Unable to create room'], 500);
        }
    }

    public function storePhysician(Request $request)
    {
        try {
            if (!in_array($request->user()->role, ['admin', 'admitting'])) {
                return response()->json(['error' => 'Unauthorized'], 403);
            }

            $request->validate([
                'first_name' => 'required|string|max:255',
                'last_name' => 'required|string|max:255',
                'middle_name' => 'nullable|string|max:255',
                'suffix' => 'nullable|string|max:50',
                'gender' => 'required|in:male,female,others',
            ]);

            $patientPhysician = PatientPhysician::create([
                'first_name' => $request->first_name,
                'last_name' => $request->last_name,
                'middle_name' => $request->middle_name,
                'suffix' => $request->suffix,
                'gender' => $request->gender,
                'DateCreated' => now(),
                'CreatedBy' => $request->user()->username,
            ]);

            return response()->json(['data' => $patientPhysician, 'message' => 'Physician created successfully'], 201);
        } catch (\Exception $e) {
            return response()->json(['error' => 'Unable to create physician'], 500);
        }
    }

    public function updateAddress(Request $request, $id)
    {
        try {
            if (!in_array($request->user()->role, ['admin', 'admitting'])) {
                return response()->json(['error' => 'Unauthorized'], 403);
            }

            $request->validate([
                'address' => 'required|string|max:500',
            ]);

            $patientAddress = PatientAddress::findOrFail($id);
            $patientAddress->update([
                'address' => $request->address,
                'DateModified' => now(),
                'ModifiedBy' => $request->user()->username,
            ]);

            return response()->json(['data' => $patientAddress, 'message' => 'Address updated successfully']);
        } catch (\Exception $e) {
            return response()->json(['error' => 'Unable to update address'], 500);
        }
    }

    public function destroyAddress(Request $request, $id)
    {
        try {
            if (!in_array($request->user()->role, ['admin', 'admitting'])) {
                return response()->json(['error' => 'Unauthorized'], 403);
            }

            $patientAddress = PatientAddress::findOrFail($id);
            $patientAddress->delete();

            return response()->json(['message' => 'Address deleted successfully']);
        } catch (\Exception $e) {
            return response()->json(['error' => 'Unable to delete address'], 500);
        }
    }

    public function updateRoom(Request $request, $id)
    {
        try {
            if (!in_array($request->user()->role, ['admin', 'admitting'])) {
                return response()->json(['error' => 'Unauthorized'], 403);
            }

            $request->validate([
                'room_name' => 'required|string|max:255',
                'description' => 'nullable|string|max:500',
            ]);

            $patientRoom = PatientRoom::findOrFail($id);
            $patientRoom->update([
                'room_name' => $request->room_name,
                'description' => $request->description,
                'DateModified' => now(),
                'ModifiedBy' => $request->user()->username,
            ]);

            return response()->json(['data' => $patientRoom, 'message' => 'Room updated successfully']);
        } catch (\Exception $e) {
            return response()->json(['error' => 'Unable to update room'], 500);
        }
    }

    public function destroyRoom(Request $request, $id)
    {
        try {
            if (!in_array($request->user()->role, ['admin', 'admitting'])) {
                return response()->json(['error' => 'Unauthorized'], 403);
            }

            $patientRoom = PatientRoom::findOrFail($id);
            $patientRoom->delete();

            return response()->json(['message' => 'Room deleted successfully']);
        } catch (\Exception $e) {
            return response()->json(['error' => 'Unable to delete room'], 500);
        }
    }

    public function updatePhysician(Request $request, $id)
    {
        try {
            if (!in_array($request->user()->role, ['admin', 'admitting'])) {
                return response()->json(['error' => 'Unauthorized'], 403);
            }

            $request->validate([
                'first_name' => 'required|string|max:255',
                'last_name' => 'required|string|max:255',
                'middle_name' => 'nullable|string|max:255',
                'suffix' => 'nullable|string|max:50',
                'gender' => 'required|in:male,female,others',
            ]);

            $patientPhysician = PatientPhysician::findOrFail($id);
            $patientPhysician->update([
                'first_name' => $request->first_name,
                'last_name' => $request->last_name,
                'middle_name' => $request->middle_name,
                'suffix' => $request->suffix,
                'gender' => $request->gender,
                'DateModified' => now(),
                'ModifiedBy' => $request->user()->username,
            ]);

            return response()->json(['data' => $patientPhysician, 'message' => 'Physician updated successfully']);
        } catch (\Exception $e) {
            return response()->json(['error' => 'Unable to update physician'], 500);
        }
    }

    public function destroyPhysician(Request $request, $id)
    {
        try {
            if (!in_array($request->user()->role, ['admin', 'admitting'])) {
                return response()->json(['error' => 'Unauthorized'], 403);
            }

            $patientPhysician = PatientPhysician::findOrFail($id);
            $patientPhysician->delete();

            return response()->json(['message' => 'Physician deleted successfully']);
        } catch (\Exception $e) {
            return response()->json(['error' => 'Unable to delete physician'], 500);
        }
    }
}
