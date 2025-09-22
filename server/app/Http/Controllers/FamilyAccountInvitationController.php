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

        $invitationUrl = url("/api/family-members/accept-invite/{$token}");
        Mail::to($request->email)->send(new FamilyAccountInvitation(auth()->user()->name, $invitationUrl));

        return response()->json(['message' => 'Invitation sent successfully', 'token' => $token]);
    }

    public function acceptInvite($token)
    {
        $member = FamilyAccountMember::where('invitation_token', $token)->first();

        if (!$member) {
            return response("
                <div style='
                    background:#fee2e2;
                    color:#b91c1c;
                    border:1px solid #f87171;
                    padding:15px 20px;
                    border-radius:8px;
                    font-size:16px;
                    max-width:400px;
                    margin:50px auto;
                    text-align:center;
                    font-family:sans-serif;
                '>
                    ❌ Invalid or expired invitation.
                </div>
            ", 404);
        }

        $member->update([
            'status'           => 'accepted',
            'invitation_token' => null
        ]);

        return response("
            <div style='
                background:#dcfce7;
                color:#166534;
                border:1px solid #22c55e;
                padding:15px 20px;
                border-radius:8px;
                font-size:16px;
                max-width:400px;
                margin:50px auto;
                text-align:center;
                font-family:sans-serif;
            '>
                ✅ Invitation accepted successfully!
            </div>
        ");
    }
}
