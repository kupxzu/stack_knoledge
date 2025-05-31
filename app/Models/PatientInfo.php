<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class PatientInfo extends Model
{
    protected $table = 'patient_info';

    protected $fillable = [
        'first_name',
        'last_name',
        'middle_name',
        'suffix',
        'gender',
        'dob',
        'contact_number',
        'admitted_date',
        'DateCreated',
        'CreatedBy',
        'DateModified',
        'ModifiedBy',
    ];

    protected $casts = [
        'dob' => 'date',
        'admitted_date' => 'datetime',
        'DateCreated' => 'datetime',
        'DateModified' => 'datetime',
    ];

    public function patients(): HasMany
    {
        return $this->hasMany(Patient::class, 'ptinfo_id');
    }
}
