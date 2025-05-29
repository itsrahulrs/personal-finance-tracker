<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class FamilyAccount extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'name', 'owner_id'
    ];

    // Relationship to User
    public function owner()
    {
        return $this->belongsTo(User::class, 'owner_id');
    }
    
    public function members()
    {
        return $this->hasMany(FamilyAccountMember::class)->with('user');
    }
}
