<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class PatientRoom extends Model
{
    protected $table = 'patient_room';

    protected $fillable = [
        'room_name',
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
        return $this->hasMany(Patient::class, 'ptroom_id');
    }
}
