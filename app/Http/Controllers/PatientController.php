<?php

namespace App\Http\Controllers;

use App\Models\Patient;
use App\Models\PatientInfo;
use App\Models\PatientAddress;
use App\Models\PatientRoom;
use App\Models\PatientPhysician;
use App\Models\PatientDiagnosis;
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

            $patients = Patient::with([
                'patientInfo',
                'patientAddress',
                'patientRoom',
                'patientPhysician',
                'patientDiagnosis'
            ])->paginate(20);

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
                'medical_rec_no' => 'required|string|unique:patients|max:255',
                'first_name' => 'required|string|max:255',
                'last_name' => 'required|string|max:255',
                'middle_name' => 'nullable|string|max:255',
                'suffix' => 'nullable|string|max:50',
                'gender' => 'required|in:male,female,others',
                'dob' => 'required|date|before:today',
                'contact_number' => 'required|string|max:20',
                'national_id_number' => 'nullable|string|max:255',
                'admitted_date' => 'required|date',
                'address' => 'required|string',
                'room_name' => 'required|string|max:255',
                'room_description' => 'nullable|string',
                'physician_first_name' => 'required|string|max:255',
                'physician_last_name' => 'required|string|max:255',
                'physician_middle_name' => 'nullable|string|max:255',
                'physician_suffix' => 'nullable|string|max:50',
                'physician_gender' => 'required|in:male,female,others',
                'diagnosis_name' => 'required|string|max:255',
                'diagnosis_description' => 'nullable|string',
            ]);

            DB::beginTransaction();

            $patientInfo = PatientInfo::create([
                'first_name' => $request->first_name,
                'last_name' => $request->last_name,
                'middle_name' => $request->middle_name,
                'suffix' => $request->suffix,
                'gender' => $request->gender,
                'dob' => $request->dob,
                'contact_number' => $request->contact_number,
                'national_id_number' => $request->national_id_number,
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

            $patientDiagnosis = PatientDiagnosis::create([
                'diagnosis_name' => $request->diagnosis_name,
                'description' => $request->diagnosis_description,
                'DateCreated' => now(),
                'CreatedBy' => $request->user()->username,
            ]);

            $patient = Patient::create([
                'medical_rec_no' => $request->medical_rec_no,
                'ptinfo_id' => $patientInfo->id,
                'ptaddress_id' => $patientAddress->id,
                'ptroom_id' => $patientRoom->id,
                'ptphysician_id' => $patientPhysician->id,
                'ptdiagnosis_id' => $patientDiagnosis->id,
                'DateCreated' => now(),
                'CreatedBy' => $request->user()->username,
            ]);

            DB::commit();

            $patient->load([
                'patientInfo',
                'patientAddress',
                'patientRoom',
                'patientPhysician',
                'patientDiagnosis'
            ]);

            return response()->json(['patient' => $patient, 'message' => 'Patient created successfully'], 201);
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
            if (!in_array($request->user()->role, ['admin', 'admitting'])) {
                return response()->json(['error' => 'Unauthorized'], 403);
            }

            $patient = Patient::with([
                'patientInfo',
                'patientAddress',
                'patientRoom',
                'patientPhysician',
                'patientDiagnosis'
            ])->findOrFail($id);

            return response()->json(['patient' => $patient]);
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
                'medical_rec_no' => 'sometimes|required|string|max:255|unique:patients,medical_rec_no,' . $patient->id,
                'first_name' => 'sometimes|required|string|max:255',
                'last_name' => 'sometimes|required|string|max:255',
                'middle_name' => 'nullable|string|max:255',
                'suffix' => 'nullable|string|max:50',
                'gender' => 'sometimes|required|in:male,female,others',
                'dob' => 'sometimes|required|date|before:today',
                'contact_number' => 'sometimes|required|string|max:20',
                'national_id_number' => 'nullable|string|max:255',
                'admitted_date' => 'sometimes|required|date',
                'address' => 'sometimes|required|string',
                'room_name' => 'sometimes|required|string|max:255',
                'room_description' => 'nullable|string',
                'physician_first_name' => 'sometimes|required|string|max:255',
                'physician_last_name' => 'sometimes|required|string|max:255',
                'physician_middle_name' => 'nullable|string|max:255',
                'physician_suffix' => 'nullable|string|max:50',
                'physician_gender' => 'sometimes|required|in:male,female,others',
                'diagnosis_name' => 'sometimes|required|string|max:255',
                'diagnosis_description' => 'nullable|string',
            ]);

            DB::beginTransaction();

            if ($request->hasAny(['first_name', 'last_name', 'gender', 'dob', 'contact_number', 'admitted_date', 'middle_name', 'suffix', 'national_id_number'])) {
                $patient->patientInfo->update(array_filter([
                    'first_name' => $request->first_name ?? $patient->patientInfo->first_name,
                    'last_name' => $request->last_name ?? $patient->patientInfo->last_name,
                    'middle_name' => $request->middle_name ?? $patient->patientInfo->middle_name,
                    'suffix' => $request->suffix ?? $patient->patientInfo->suffix,
                    'gender' => $request->gender ?? $patient->patientInfo->gender,
                    'dob' => $request->dob ?? $patient->patientInfo->dob,
                    'contact_number' => $request->contact_number ?? $patient->patientInfo->contact_number,
                    'national_id_number' => $request->national_id_number ?? $patient->patientInfo->national_id_number,
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

            if ($request->hasAny(['diagnosis_name', 'diagnosis_description'])) {
                $patient->patientDiagnosis->update([
                    'diagnosis_name' => $request->diagnosis_name ?? $patient->patientDiagnosis->diagnosis_name,
                    'description' => $request->diagnosis_description ?? $patient->patientDiagnosis->description,
                    'DateModified' => now(),
                    'ModifiedBy' => $request->user()->username,
                ]);
            }

            if ($request->has('medical_rec_no')) {
                $patient->update([
                    'medical_rec_no' => $request->medical_rec_no,
                    'DateModified' => now(),
                    'ModifiedBy' => $request->user()->username,
                ]);
            }

            DB::commit();

            $patient->load([
                'patientInfo',
                'patientAddress',
                'patientRoom',
                'patientPhysician',
                'patientDiagnosis'
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
}
