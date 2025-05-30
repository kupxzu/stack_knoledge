<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class LoginLog extends Model
{
    protected $table = 'logs';
    
    protected $fillable = [
        'user_id',
        'login_type',
        'ip_address',
        'user_agent',
        'login_at',
    ];

    protected $casts = [
        'login_at' => 'datetime',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
