<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class PatientPortal extends Model
{
    use HasFactory;

    protected $table = 'patients_portal';

    protected $fillable = [
        'patient_id',
        'access_hash',
        'expires_at'
    ];

    protected $casts = [
        'expires_at' => 'datetime'
    ];

    public function patient()
    {
        return $this->belongsTo(Patient::class);
    }

    public function qr()
    {
        return $this->hasOne(PatientQR::class, 'ptportal_id');
    }

    public function isExpired()
    {
        return $this->expires_at->isPast();
    }
}
