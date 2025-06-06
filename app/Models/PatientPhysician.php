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
        'physician',
        'DateCreated',
        'CreatedBy',
        'DateModified',
        'ModifiedBy',
    ];

    protected $casts = [
        'DateCreated' => 'datetime',
        'DateModified' => 'datetime',
    ];

    public function getFullNameAttribute()
    {
        return trim($this->first_name . ' ' . $this->middle_name . ' ' . $this->last_name . ' ' . $this->suffix);
    }

    public function getDisplayNameAttribute()
    {
        return "Dr. {$this->full_name} (" . ucfirst($this->physician) . ")";
    }

    public function scopeOfType($query, $type)
    {
        return $query->where('physician', $type);
    }

    public function scopeAdmitting($query)
    {
        return $query->where('physician', 'admitting');
    }

    public function scopeAttending($query)
    {
        return $query->where('physician', 'attending');
    }

    public function patients()
    {
        return $this->hasMany(Patient::class, 'ptphysician_id');
    }
}
