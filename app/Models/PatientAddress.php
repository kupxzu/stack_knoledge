<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class PatientAddress extends Model
{
    protected $table = 'patient_address';

    protected $fillable = [
        'address',
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
        return $this->hasMany(Patient::class, 'ptaddress_id');
    }
}
