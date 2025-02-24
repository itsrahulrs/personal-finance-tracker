<?php

namespace App\Http\Controllers;

use App\Models\Account;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class AccountController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $account = Account::with('accountCategory')->get();
        return response()->json([
            'status' => true,
            'message' => 'Account fetched successfully',
            'data' => $account
        ], 200);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'account_category_id' => 'required|exists:account_categories,id',
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'balance' => 'required|decimal:2',
        ]);

        if($validator->fails()) {
            return response()->json([
                'status' => false,
                'message' => 'Validation error',
                'errors' => $validator->errors()
            ], 422);
        }

        $account = Account::create($request->all());
        return response()->json([
            'status' => true,
            'message' => 'Account created successfully',
            'data' => $account
        ], 200);
    }

    /**
     * Display the specified resource.
     */
    public function show($id)
    {
        try {
            $account = Account::with('accountCategory')->findOrFail($id);
            return response()->json([
                'status' => true,
                'message' => 'Account found successfully',
                'data' => $account
            ], 200);
        } catch (ModelNotFoundException $e) {
            return response()->json([
                'status' => false,
                'message' => 'Account not found',
            ], 404);
        }
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, $id)
    {
        try {
            $validator = Validator::make($request->all(), [
                'account_category_id' => 'required|exists:account_categories,id',
                'name' => 'required|string|max:255',
                'description' => 'nullable|string',
                'balance' => 'required|decimal:2',
            ]);
    
            if($validator->fails()) {
                return response()->json([
                    'status' => false,
                    'message' => 'Validation error',
                    'errors' => $validator->errors()
                ], 422);
            }
    
            $account = Account::with('accountCategory')->findOrFail($id);
            $account->update($request->all());
            $account = Account::with('accountCategory')->findOrFail($id);
            return response()->json([
                'status' => true,
                'message' => 'Account updated successfully',
                'data' => $account
            ], 200);
        } catch (ModelNotFoundException $e) {
            return response()->json([
                'status' => false,
                'message' => 'Account not found',
            ], 404);
        }
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy($id)
    {
        try {
            $account = Account::findOrFail($id);
            $account->delete();
    
            return response()->json([
                'status' => true,
                'message' => 'Account deleted successfully',
            ], 200);
        } catch (ModelNotFoundException $e) {
            return response()->json([
                'status' => false,
                'message' => 'Account not found',
            ], 404);
        }
    }
}
