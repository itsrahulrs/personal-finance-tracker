<?php

namespace App\Http\Controllers;

use App\Models\FamilyAccount;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Validator;

class FamilyAccountController extends Controller
{
    // List all family accounts
    public function index()
    {
        $accounts = FamilyAccount::all();
        return response()->json([
            'status' => true,
            'message' => 'Family accounts fetched successfully',
            'data' => $accounts
        ]);
    }

    // Create a new family account
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:100',
            // 'owner_id' => 'required|exists:users,id', // Ensure owner_id exists in the users table
        ]);

        if ($validator->fails()) {
            return response()->json([
                'status' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        $account = FamilyAccount::create([
            'name' => $request->name,
            'owner_id' => Auth::id(),
        ]);

        return response()->json([
            'status' => true,
            'message' => 'Family account created successfully',
            'data' => $account
        ]);
    }

    // Show a specific family account
    public function show($id)
    {
        $account = FamilyAccount::find($id);

        if (!$account) {
            return response()->json([
                'status' => false,
                'message' => 'Account not found',
            ], 404);
        }

        return response()->json([
            'status' => true,
            'message' => 'Family account fetched successfully',
            'data' => $account
        ]);
    }

    // Update a family account
    public function update(Request $request, $id)
    {
        $account = FamilyAccount::find($id);

        if (!$account) {
            return response()->json([
                'status' => false,
                'message' => 'Account not found',
            ], 404);
        }

        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:100',
            // 'owner_id' => 'required|exists:users,id', // Ensure owner_id exists in the users table
        ]);

        if ($validator->fails()) {
            return response()->json([
                'status' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        $account->update([
            'name' => $request->name,
            'owner_id' => Auth::id(),
        ]);

        return response()->json([
            'status' => true,
            'message' => 'Family account updated successfully',
            'data' => $account
        ]);
    }

    // Delete a family account
    public function destroy($id)
    {
        $account = FamilyAccount::find($id);

        if (!$account) {
            return response()->json([
                'status' => false,
                'message' => 'Account not found',
            ], 404);
        }

        $account->delete();

        return response()->json([
            'status' => true,
            'message' => 'Family account deleted successfully',
        ]);
    }
}
