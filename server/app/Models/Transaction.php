<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Transaction extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'account_id', 'category_id', 'type', 'name', 'amount', 'description', 'transaction_date'
    ];

    protected $dates = ['transaction_date', 'deleted_at'];

    public function category() {
        return $this->belongsTo(Category::class);
    }

    public function account() {
        return $this->belongsTo(Account::class);
    }
}
