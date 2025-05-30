<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class PatientDiagnosis extends Model
{
    protected $table = 'patient_diagnosis';

    protected $fillable = [
        'diagnosis_name',
        'description',
        'DateCreated',
        'CreatedBy',
        'DateModified',
        'ModifiedBy',
    ];

    protected $casts = [
        'DateCreated' => 'datetime',
        'DateModified' => 'datetime',
    ];

    public function patients(): HasMany
    {
        return $this->hasMany(Patient::class, 'ptdiagnosis_id');
    }
}
