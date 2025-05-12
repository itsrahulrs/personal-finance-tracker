<?php

namespace App\Http\Controllers;

use App\Models\FamilyAccountMember;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class FamilyAccountMemberController extends Controller
{
    public function index()
    {
        return FamilyAccountMember::with(['user', 'familyAccount'])->get();
    }

    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'family_account_id' => 'required|exists:family_accounts,id',
            'user_id' => 'required|exists:users,id',
            'role' => 'in:admin,member'
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $member = FamilyAccountMember::create($request->only('family_account_id', 'user_id', 'role'));

        return response()->json([
            'status' => true,
            'message' => 'Member added successfully',
            'data' => $member
        ]);
    }

    public function show($id)
    {
        $member = FamilyAccountMember::with(['user', 'familyAccount'])->find($id);

        if (!$member) {
            return response()->json(['message' => 'Member not found'], 404);
        }

        return $member;
    }

    public function update(Request $request, $id)
    {
        $member = FamilyAccountMember::find($id);

        if (!$member) {
            return response()->json(['message' => 'Member not found'], 404);
        }

        $validator = Validator::make($request->all(), [
            'role' => 'in:admin,member'
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $member->update($request->only('role'));

        return response()->json(['message' => 'Member updated', 'data' => $member]);
    }

    public function destroy($id)
    {
        $member = FamilyAccountMember::find($id);

        if (!$member) {
            return response()->json(['message' => 'Member not found'], 404);
        }

        $member->delete();

        return response()->json(['message' => 'Member deleted']);
    }
}

