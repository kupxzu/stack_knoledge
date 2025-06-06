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
use Illuminate\Support\Facades\Redis;
use App\Services\CacheService;

class PatientController extends Controller
{
    public function index(Request $request)
    {
        try {
            // Authorization check
            if (!in_array($request->user()->role, ['admin', 'admitting'])) {
                return response()->json(['error' => 'Unauthorized'], 403);
            }
            
            // Get parameters but disable cache
            $perPage = $request->get('per_page', 10);
            $search = $request->get('search', '');
            $sortBy = $request->get('sort_by', 'DateCreated');
            $sortOrder = $request->get('sort_order', 'desc');
            
            // Direct database query without caching
            $query = Patient::with(['patientInfo', 'patientAddress', 'patientRoom', 'patientPhysician']);
            
            if ($search) {
                $query->where(function($q) use ($search) {
                    $q->whereHas('patientInfo', function($subq) use ($search) {
                        $subq->where('first_name', 'like', '%' . $search . '%')
                            ->orWhere('last_name', 'like', '%' . $search . '%')
                            ->orWhere('middle_name', 'like', '%' . $search . '%')
                            ->orWhere('contact_number', 'like', '%' . $search . '%');
                    })
                    ->orWhereHas('patientAddress', function($subq) use ($search) {
                        $subq->where('address', 'like', '%' . $search . '%');
                    })
                    ->orWhereHas('patientRoom', function($subq) use ($search) {
                        $subq->where('room_name', 'like', '%' . $search . '%');
                    })
                    ->orWhereHas('patientPhysician', function($subq) use ($search) {
                        $subq->where('first_name', 'like', '%' . $search . '%')
                            ->orWhere('last_name', 'like', '%' . $search . '%');
                    });
                });
            }

            $allowedSortColumns = ['id', 'DateCreated', 'patient_name'];
            if (!in_array($sortBy, $allowedSortColumns)) {
                $sortBy = 'DateCreated';
            }

            $allowedSortOrders = ['asc', 'desc'];
            if (!in_array($sortOrder, $allowedSortOrders)) {
                $sortOrder = 'desc';
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
            
            // Return response
            return response()->json([
                'data' => $patients->items(),
                'current_page' => $patients->currentPage(),
                'last_page' => $patients->lastPage(),
                'per_page' => $patients->perPage(),
                'total' => $patients->total(),
                'from' => $patients->firstItem(),
                'to' => $patients->lastItem(),
                'fromCache' => false
            ]);
        } catch (\Exception $e) {
            // Log error
            \Log::error('Error in patients index: ' . $e->getMessage());
            return response()->json(['error' => 'Unable to fetch patients'], 500);
        }
    }

    public function show(Request $request, $id)
    {
        try {
            if (!in_array($request->user()->role, ['admin', 'admitting', 'billing'])) {
                return response()->json(['error' => 'Unauthorized'], 403);
            }
            
            $forceRefresh = $request->boolean('force_refresh', false);
            $cacheKey = "patients:single:{$id}";
            
            if (!$forceRefresh) {
                $result = CacheService::remember($cacheKey, function() use ($id) {
                    $patient = Patient::with([
                        'patientInfo',
                        'patientAddress',
                        'patientRoom',
                        'patientPhysician',
                        'activeQR.portal'
                    ])->find($id);
                    
                    if (!$patient) {
                        throw new \Exception("Patient not found", 404);
                    }
                    
                    return [
                        'patient' => [
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
                        ]
                    ];
                });
                
                return response()->json([
                    ...$result['data'],
                    'fromCache' => $result['fromCache']
                ]);
            } else {
                // Force refresh
                CacheService::forget($cacheKey);
                $result = CacheService::remember($cacheKey, function() use ($id) {
                    // Same query as above
                    $patient = Patient::with([
                        'patientInfo',
                        'patientAddress',
                        'patientRoom',
                        'patientPhysician',
                        'activeQR.portal'
                    ])->find($id);
                    
                    if (!$patient) {
                        throw new \Exception("Patient not found", 404);
                    }
                    
                    // Same response format
                    return [
                        'patient' => [
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
                        ]
                    ];
                });
                
                return response()->json([
                    ...$result['data'],
                    'fromCache' => false
                ]);
            }
        } catch (\Exception $e) {
            $statusCode = $e->getCode() && $e->getCode() >= 400 && $e->getCode() < 600 ? $e->getCode() : 500;
            return response()->json(['error' => $e->getMessage()], $statusCode);
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
                'physician_type' => 'required|in:admitting,attending', // Add this validation
            ]);

            DB::beginTransaction();

            // ALWAYS create new patient info (patient-specific data)
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

            // FIND OR CREATE address (reuse existing if found)
            $patientAddress = PatientAddress::firstOrCreate(
                ['address' => $request->address],
                [
                    'DateCreated' => now(),
                    'CreatedBy' => $request->user()->username,
                ]
            );

            // FIND OR CREATE room (reuse existing if found)
            $patientRoom = PatientRoom::firstOrCreate(
                ['room_name' => $request->room_name],
                [
                    'description' => $request->room_description,
                    'DateCreated' => now(),
                    'CreatedBy' => $request->user()->username,
                ]
            );

            // FIND OR CREATE physician (reuse existing if found) - Include physician type
            $patientPhysician = PatientPhysician::firstOrCreate(
                [
                    'first_name' => $request->physician_first_name,
                    'last_name' => $request->physician_last_name,
                    'middle_name' => $request->physician_middle_name,
                    'physician' => $request->physician_type, // Add physician type to search criteria
                ],
                [
                    'suffix' => $request->physician_suffix,
                    'gender' => $request->physician_gender,
                    'DateCreated' => now(),
                    'CreatedBy' => $request->user()->username,
                ]
            );

            // Create the patient record linking to existing/new records
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

            // After successful creation, invalidate list cache
            CacheService::forgetPattern('patients:list');
            
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
                'physician_type' => 'sometimes|required|in:admitting,attending',
            ]);

            DB::beginTransaction();

            // Update patient info (this stays the same)
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

            // Update address (this stays the same)
            if ($request->has('address')) {
                // Find or create address
                $patientAddress = PatientAddress::firstOrCreate(
                    ['address' => $request->address],
                    [
                        'DateCreated' => now(),
                        'CreatedBy' => $request->user()->username,
                    ]
                );
                
                // Update patient to point to this address
                $patient->update(['ptaddress_id' => $patientAddress->id]);
            }

            // Update room (this stays the same)
            if ($request->hasAny(['room_name', 'room_description'])) {
                // Find or create room
                $patientRoom = PatientRoom::firstOrCreate(
                    ['room_name' => $request->room_name],
                    [
                        'description' => $request->room_description,
                        'DateCreated' => now(),
                        'CreatedBy' => $request->user()->username,
                    ]
                );
                
                // Update patient to point to this room
                $patient->update(['ptroom_id' => $patientRoom->id]);
            }

            // FIX: Update physician - FIND OR CREATE instead of updating existing
            if ($request->hasAny(['physician_first_name', 'physician_last_name', 'physician_gender', 'physician_middle_name', 'physician_suffix', 'physician_type'])) {
                
                // Find or create the physician record
                $patientPhysician = PatientPhysician::firstOrCreate(
                    [
                        'first_name' => $request->physician_first_name,
                        'last_name' => $request->physician_last_name,
                        'middle_name' => $request->physician_middle_name,
                        'physician' => $request->physician_type,
                    ],
                    [
                        'suffix' => $request->physician_suffix,
                        'gender' => $request->physician_gender,
                        'DateCreated' => now(),
                        'CreatedBy' => $request->user()->username,
                    ]
                );
                
                // Update patient to point to this physician
                $patient->update(['ptphysician_id' => $patientPhysician->id]);
            }

            DB::commit();

            $patient->load([
                'patientInfo',
                'patientAddress',
                'patientRoom',
                'patientPhysician',
            ]);

            // After successful update, invalidate specific cache
            CacheService::forget("patients:single:{$id}");
            CacheService::forgetPattern('patients:list');
            
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

            // After successful deletion, invalidate specific cache
            CacheService::forget("patients:single:{$id}");
            CacheService::forgetPattern('patients:list');
            
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

            $perPage = $request->get('per_page', 10);
            $search = $request->get('search', '');

            $query = PatientAddress::select('id', 'address');

            if ($search) {
                $query->where('address', 'like', '%' . $search . '%');
            }

            $addresses = $query->orderBy('address')->paginate($perPage);

            return response()->json($addresses);
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

            $perPage = $request->get('per_page', 10);
            $search = $request->get('search', '');

            $query = PatientRoom::select('id', 'room_name as name', 'description');

            if ($search) {
                $query->where('room_name', 'like', '%' . $search . '%')
                      ->orWhere('description', 'like', '%' . $search . '%');
            }

            $rooms = $query->orderBy('room_name')->paginate($perPage);

            return response()->json($rooms);
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

            $perPage = $request->get('per_page', 10);
            $search = $request->get('search', '');

            $query = PatientPhysician::select('id', 'first_name', 'last_name', 'middle_name', 'suffix', 'gender', 'physician');

            if ($search) {
                $query->where('first_name', 'like', '%' . $search . '%')
                      ->orWhere('last_name', 'like', '%' . $search . '%')
                      ->orWhere('middle_name', 'like', '%' . $search . '%');
            }

            $physicians = $query->orderBy('last_name')
                               ->orderBy('first_name')
                               ->paginate($perPage);

            return response()->json($physicians);
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

            // FIX: Convert array to JSON string for logging
            \Log::info('Store physician request data: ' . json_encode($request->all()));

            $request->validate([
                'first_name' => 'required|string|max:255',
                'last_name' => 'required|string|max:255',
                'middle_name' => 'nullable|string|max:255',
                'suffix' => 'nullable|string|max:50',
                'gender' => 'required|in:male,female,others',
                'physician' => 'required|in:admitting,attending',
            ]);

            $createData = [
                'first_name' => $request->first_name,
                'last_name' => $request->last_name,
                'middle_name' => $request->middle_name,
                'suffix' => $request->suffix,
                'gender' => $request->gender,
                'physician' => $request->physician,
                'DateCreated' => now(),
                'CreatedBy' => $request->user()->username,
            ];

            // Remove null values
            $createData = array_filter($createData, function($value) {
                return $value !== null && $value !== '';
            });

            \Log::info('Create data: ' . json_encode($createData));

            $patientPhysician = PatientPhysician::create($createData);

            return response()->json([
                'data' => $patientPhysician, 
                'message' => 'Physician created successfully'
            ], 201);

        } catch (\Illuminate\Validation\ValidationException $e) {
            \Log::error('Validation error: ' . json_encode($e->errors()));
            return response()->json(['error' => 'Validation failed', 'errors' => $e->errors()], 422);
        } catch (\Exception $e) {
            \Log::error('Error creating physician: ' . $e->getMessage());
            \Log::error('Stack trace: ' . $e->getTraceAsString());
            return response()->json(['error' => 'Unable to create physician: ' . $e->getMessage()], 500);
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

            // FIX: Remove the problematic Log::info calls or fix them
            \Log::info('Update physician request data: ' . json_encode($request->all()));
            \Log::info('Physician ID: ' . $id);

            $request->validate([
                'first_name' => 'required|string|max:255',
                'last_name' => 'required|string|max:255',
                'middle_name' => 'nullable|string|max:255',
                'suffix' => 'nullable|string|max:50',
                'gender' => 'required|in:male,female,others',
                'physician' => 'required|in:admitting,attending',
            ]);

            $patientPhysician = PatientPhysician::findOrFail($id);
            
            $updateData = [
                'first_name' => $request->first_name,
                'last_name' => $request->last_name,
                'middle_name' => $request->middle_name,
                'suffix' => $request->suffix,
                'gender' => $request->gender,
                'physician' => $request->physician,
                'DateModified' => now(),
                'ModifiedBy' => $request->user()->username,
            ];

            // Remove null values to avoid database errors
            $updateData = array_filter($updateData, function($value) {
                return $value !== null && $value !== '';
            });

            \Log::info('Update data: ' . json_encode($updateData));

            $patientPhysician->update($updateData);

            return response()->json([
                'data' => $patientPhysician->fresh(), 
                'message' => 'Physician updated successfully'
            ]);

        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            \Log::error('Physician not found: ' . $e->getMessage());
            return response()->json(['error' => 'Physician not found'], 404);
        } catch (\Illuminate\Validation\ValidationException $e) {
            \Log::error('Validation error: ' . json_encode($e->errors()));
            return response()->json(['error' => 'Validation failed', 'errors' => $e->errors()], 422);
        } catch (\Exception $e) {
            \Log::error('Error updating physician: ' . $e->getMessage());
            \Log::error('Stack trace: ' . $e->getTraceAsString());
            return response()->json(['error' => 'Unable to update physician: ' . $e->getMessage()], 500);
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
            \Log::error('Error deleting physician: ' . $e->getMessage());
            return response()->json(['error' => 'Unable to delete physician'], 500);
        }
    }
}