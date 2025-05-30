<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Patient extends Model
{
    protected $fillable = [
        'medical_rec_no',
        'ptinfo_id',
        'ptaddress_id',
        'ptroom_id',
        'ptphysician_id',
        'ptdiagnosis_id',
        'DateCreated',
        'CreatedBy',
        'DateModified',
        'ModifiedBy',
    ];

    protected $casts = [
        'DateCreated' => 'datetime',
        'DateModified' => 'datetime',
    ];

    public function patientInfo(): BelongsTo
    {
        return $this->belongsTo(PatientInfo::class, 'ptinfo_id');
    }

    public function patientAddress(): BelongsTo
    {
        return $this->belongsTo(PatientAddress::class, 'ptaddress_id');
    }

    public function patientRoom(): BelongsTo
    {
        return $this->belongsTo(PatientRoom::class, 'ptroom_id');
    }

    public function patientPhysician(): BelongsTo
    {
        return $this->belongsTo(PatientPhysician::class, 'ptphysician_id');
    }

    public function patientDiagnosis(): BelongsTo
    {
        return $this->belongsTo(PatientDiagnosis::class, 'ptdiagnosis_id');
    }
}
