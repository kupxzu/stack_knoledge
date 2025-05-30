<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class PatientPhysician extends Model
{
    protected $table = 'patient_physician';

    protected $fillable = [
        'first_name',
        'last_name',
        'middle_name',
        'suffix',
        'gender',
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
        return $this->hasMany(Patient::class, 'ptphysician_id');
    }
}
