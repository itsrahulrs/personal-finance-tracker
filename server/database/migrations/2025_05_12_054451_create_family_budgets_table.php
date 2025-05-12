<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('family_budgets', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('family_account_id');
            $table->unsignedBigInteger('category_id');
            $table->decimal('budget_amount', 10, 2);
            $table->decimal('spent_amount', 10, 2)->default(0.00);
            $table->string('month_year', 7);
            $table->timestamps();
            $table->softDeletes();

            $table->foreign('family_account_id')->references('id')->on('family_accounts')->onDelete('cascade');
            $table->foreign('category_id')->references('id')->on('categories')->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('family_budgets');
    }
};
