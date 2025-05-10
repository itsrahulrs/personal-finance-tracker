<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class SavingsGoal extends Model
{
    use HasFactory, SoftDeletes;
    
    protected $fillable = [
        'user_id',
        'goal_name',
        'target_amount',
        'current_amount',
        'deadline'
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
