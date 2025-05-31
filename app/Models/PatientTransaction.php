<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class PatientTransaction extends Model
{
    use HasFactory;

    protected $table = 'patients_transaction';

    protected $fillable = [
        'patient_id',
        'amount',
        'soa_pdf'
    ];

    protected $casts = [
        'amount' => 'decimal:2'
    ];

    public function patient()
    {
        return $this->belongsTo(Patient::class);
    }

    public function qr()
    {
        return $this->hasOne(PatientQR::class, 'pttransaction_id');
    }
}
