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
        Schema::create('family_account_members', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('family_account_id');
            $table->unsignedBigInteger('user_id');
            $table->string('email');
            $table->enum('role', ['admin', 'member'])->default('member');
            $table->enum('status', ['pending', 'accepted', 'declined'])->default('pending');
            $table->string('invitation_token')->nullable()->unique();
            $table->timestamps();
            $table->softDeletes();

            $table->foreign('family_account_id')->references('id')->on('family_accounts')->onDelete('cascade');
            $table->foreign('user_id')->references('id')->on('users')->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('family_account_members');
    }
};
