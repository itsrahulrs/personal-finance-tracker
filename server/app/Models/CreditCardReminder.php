<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class CreditCardReminder extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'user_id',
        'card_name',
        'bank_name',
        'card_number',
        'due_amount',
        'due_date',
        'reminder_sent'
    ];
    
    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
