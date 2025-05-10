<?php

use App\Http\Controllers\AccountCategoryController;
use App\Http\Controllers\AccountController;
use App\Http\Controllers\SavingsGoalController;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\CategoryController;
use App\Http\Controllers\CreditCardReminderController;
use App\Http\Controllers\TransactionController;
use App\Http\Controllers\UserController;
use App\Models\User;
use Illuminate\Foundation\Auth\EmailVerificationRequest;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider and all of them will
| be assigned to the "api" middleware group. Make something great!
|
*/

Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);
Route::post('/logout', [AuthController::class, 'logout'])->middleware('auth:sanctum');
Route::get('/profile', [AuthController::class, 'profile'])->middleware('auth:sanctum');

Route::get('/email/verify/{id}/{hash}', function (Request $request) {
    $user = User::find($request->route("id"));

    if(!$user) {
        return response()->json([
            'message'=> 'User not found'
        ], 404);
    }

    if($user->hasVerifidEmail) {
        return response()->json([
            'message' => 'Email already verified'
        ], 400);
    }

    $user->markEmailAsVerified();

    return response()->json([
        'message'=> 'Email verified successfully'
    ]);
})->middleware(['signed'])->name('verification.verify');

Route::middleware('auth:sanctum')->post('/email/resend', function (Request $request) {
    
    $request->user()->SendEmailVerificationNotification();
    return response()->json(['message'=> 'Verification email sent']);
})->middleware('auth:sanctum');

Route::middleware(['auth:sanctum'])->group(function () {
    Route::get('/dashboard', function (Request $request) {
        return response()->json([
            'message' => 'Welcome to your dashboard',
            'user' => $request->user()
        ]);
    });
    Route::apiResource('/account-category', AccountCategoryController::class);
    Route::apiResource('/account', AccountController::class);
    Route::apiResource('/category', CategoryController::class);
    Route::apiResource('/transaction', TransactionController::class);
    Route::apiResource('/savings-goals', SavingsGoalController::class);
    Route::apiResource('/credit-card-reminders', CreditCardReminderController::class);
});
