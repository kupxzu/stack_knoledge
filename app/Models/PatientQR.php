<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class PatientQR extends Model
{
    use HasFactory;

    protected $table = 'patients_qr';

    protected $fillable = [
        'patient_id',
        'pttransaction_id',
        'qrcode',
        'ptportal_id',
        'action'
    ];

    public function patient()
    {
        return $this->belongsTo(Patient::class);
    }

    public function transaction()
    {
        return $this->belongsTo(PatientTransaction::class, 'pttransaction_id');
    }

    public function portal()
    {
        return $this->belongsTo(PatientPortal::class, 'ptportal_id');
    }
}
