<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Hash;
use App\Models\User;

class ProfileController extends Controller
{
    public function update(Request $request)
    {
        /** @var User $user */
        $user = Auth::user();

        $validator = Validator::make($request->all(), [
            'first_name' => 'required|string|max:255',
            'last_name'  => 'required|string|max:255',
            'phone'      => 'nullable|string|max:20',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $user->update($request->only('first_name', 'last_name', 'phone'));

        return response()->json([
            'status' => true,
            'message' => 'Profile updated successfully',
            'data' => $user
        ]);
    }

    public function changePassword(Request $request)
    {
        /** @var User $user */
        $user = Auth::user();

        $validator = Validator::make($request->all(), [
            'current_password' => 'required',
            'new_password'     => 'required|min:8|confirmed',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        if (!Hash::check($request->current_password, $user->password)) {
            return response()->json(['message' => 'Current password is incorrect'], 403);
        }

        $user->password = Hash::make($request->new_password);
        $user->save();

        return response()->json(['message' => 'Password changed successfully']);
    }
}
