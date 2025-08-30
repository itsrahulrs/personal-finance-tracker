<?php
namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;

class NotificationController extends Controller
{
    public function saveToken(Request $request)
    {
        $request->validate([
            'user_id' => 'required|exists:users,id',
            'expo_token' => 'required|string',
        ]);

        $user = User::find($request->user_id);
        $user->expo_token = $request->expo_token;
        $user->save();

        return response()->json(['success' => true, 'token' => $user->expo_token]);
    }
}
