<?php

namespace App\Http\Controllers;

use App\Mail\FamilyAccountInvitation;
use App\Models\FamilyAccountMember;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Auth;

class FamilyAccountInvitationController extends Controller
{
    public function sendInvite(Request $request)
    {
        $request->validate([
            'family_account_id' => 'required|exists:family_accounts,id',
            'email' => 'required|email',
            'role' => 'in:admin,member',
        ]);

        $token = Str::uuid();
        $user = User::where('email', $request->email)->first();

        $member = FamilyAccountMember::create([
            'family_account_id' => $request->family_account_id,
            'email' => $request->email,
            'user_id' => $user?->id,
            'role' => $request->role ?? 'member',
            'status' => 'pending',
            'invitation_token' => $token,
        ]);

        $invitationUrl = url("/family-members/accept-invite/{$token}");
        Mail::to($request->email)->send(new FamilyAccountInvitation(auth()->user()->name, $invitationUrl));

        return response()->json(['message' => 'Invitation sent successfully', 'token' => $token]);
    }

    public function acceptInvite($token)
    {
        $member = FamilyAccountMember::where('invitation_token', $token)->first();

        if (!$member) {
            return response()->json(['message' => 'Invalid or expired invitation.'], 404);
        }

        // Simulate user auth (in reality, you'd want the user to log in/register)
        $user = Auth::user(); // ensure user is authenticated

        if (!$user) {
            return response()->json(['message' => 'Please log in to accept the invitation.'], 401);
        }

        // Optional: check if the email matches logged-in user
        if ($user->email !== $member->email) {
            return response()->json(['message' => 'This invite was sent to a different email.'], 403);
        }

        $member->update([
            'user_id' => $user->id,
            'status' => 'accepted',
            'invitation_token' => null
        ]);

        return response()->json(['message' => 'Invitation accepted!', 'member' => $member]);
    }
}
