<?php

namespace App\Http\Controllers;

use App\Models\AccountCategory;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class AccountCategoryController extends Controller
{
    public function index() {
        $accountCategories = AccountCategory::with('accounts')->get();
        return response()->json([
            'status' => true,
            'message' => 'Account categories fetched successfully',
            'data' => $accountCategories
        ], 200);
    }

    public function show($id) {
        try {
            $accountCategory = AccountCategory::findOrFail($id);
            return response()->json([
                'status' => true,
                'message' => 'Account category found successfully',
                'data' => $accountCategory
            ], 200);
        } catch (ModelNotFoundException $e) {
            return response()->json([
                'status' => false,
                'message' => 'Account category not found',
            ], 404);
        }
    }

    public function store(Request $request) {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'description' => 'nullable|string'
        ]);

        if($validator->fails()) {
            return response()->json([
                'status' => false,
                'message' => 'Validation error',
                'errors' => $validator->errors()
            ], 422);
        }

        $accountCategory = AccountCategory::create($request->all());
        return response()->json([
            'status' => true,
            'message' => 'Account category created successfully',
            'data' => $accountCategory
        ], 200);
    }

    public function update(Request $request, $id) {
        try {
            $validator = Validator::make($request->all(), [
                'name' => 'required|string|max:255',
                'description' => 'nullable|string'
            ]);
    
            if($validator->fails()) {
                return response()->json([
                    'status' => false,
                    'message' => 'Validation error',
                    'errors' => $validator->errors()
                ], 422);
            }
    
            $accountCategory = AccountCategory::findOrFail($id);
            $accountCategory->update($request->all());
            return response()->json([
                'status' => true,
                'message' => 'Account category updated successfully',
                'data' => $accountCategory
            ], 200);
        } catch (ModelNotFoundException $e) {
            return response()->json([
                'status' => false,
                'message' => 'Account category not found',
            ], 404);
        }
    }

    public function destroy($id) {
        try {
            $accountCategory = AccountCategory::findOrFail($id);
            $accountCategory->delete();
    
            return response()->json([
                'status' => true,
                'message' => 'Account category deleted successfully',
            ], 200);
        } catch (ModelNotFoundException $e) {
            return response()->json([
                'status' => false,
                'message' => 'Account category not found',
            ], 404);
        }
    }
}
