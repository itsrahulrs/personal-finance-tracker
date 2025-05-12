<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class FamilyAccountMember extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'family_account_id',
        'user_id',
        'role'
    ];

    public $timestamps = false;

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function familyAccount()
    {
        return $this->belongsTo(FamilyAccount::class);
    }
}
