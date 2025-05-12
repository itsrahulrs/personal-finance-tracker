<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class FamilyBudget extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'family_account_id',
        'category_id',
        'budget_amount',
        'spent_amount',
        'month_year',
    ];

    public function familyAccount()
    {
        return $this->belongsTo(FamilyAccount::class);
    }

    public function category()
    {
        return $this->belongsTo(Category::class);
    }
}
