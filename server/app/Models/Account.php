<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Account extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'account_category_id',
        'name',
        'description',
        'balance'
    ];

    protected $dates = ['deleted_at'];

    public function accountCategory() {
        return $this->belongsTo(AccountCategory::class);
    }

    public function transactions() {
        return $this->hasMany(Transaction::class);
    }
}
