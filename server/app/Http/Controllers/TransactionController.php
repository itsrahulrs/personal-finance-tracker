<?php

namespace App\Http\Controllers;

use App\Models\Transaction;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class TransactionController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $transactions = Transaction::with(['category', 'account'])->get();
        return response()->json([
            'status' => true,
            'message' => 'Transaction created successsfully',
            'data' => $transactions
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'account_id' => 'required|exists:accounts,id',
            'category_id' => 'required|exists:categories,id',
            'type' => 'required|in:income,expense',
            'name' => 'required|string',
            'amount' => 'required|decimal:2',
            'description' => 'nullable|string',
            'transaction_date' => 'required|date_format:Y-m-d H:i:s'
        ]);

        if($validator->fails()) {
            return response()->json([
                'status' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ]);
        }

        $transaction = Transaction::create($request->all());
        return response()->json([
            'status' => true,
            'message' => 'Transaction created successsfully',
            'data' => $transaction
        ]);
    }

    /**
     * Display the specified resource.
     */
    public function show($id)
    {
        try {
            $transaction = Transaction::with(['category', 'account'])->findOrFail($id);
            return response()->json([
                'status' => true,
                'message' => 'Transaction found successfully',
                'data' => $transaction
            ], 200);
        } catch (ModelNotFoundException $e) {
            return response()->json([
                'status' => false,
                'message' => 'Transaction not found',
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
                'account_id' => 'required|exists:accounts,id',
                'category_id' => 'required|exists:categories,id',
                'type' => 'required|in:income,expense',
                'name' => 'required|string',
                'amount' => 'required|decimal:2',
                'description' => 'nullable|string',
                'transaction_date' => 'required|date_format:Y-m-d H:i:s'
            ]);
    
            if($validator->fails()) {
                return response()->json([
                    'status' => false,
                    'message' => 'Validation error',
                    'errors' => $validator->errors()
                ], 422);
            }
    
            $transaction = Transaction::with(['category', 'account'])->findOrFail($id);
            $transaction->update($request->all());
            $transaction = Transaction::with(['category', 'account'])->findOrFail($id);
            return response()->json([
                'status' => true,
                'message' => 'Transaction updated successfully',
                'data' => $transaction
            ], 200);
        } catch (ModelNotFoundException $e) {
            return response()->json([
                'status' => false,
                'message' => 'Transaction not found',
            ], 404);
        }
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy($id)
    {
        try {
            $transaction = Transaction::findOrFail($id);
            $transaction->delete();
    
            return response()->json([
                'status' => true,
                'message' => 'Transaction deleted successfully',
            ], 200);
        } catch (ModelNotFoundException $e) {
            return response()->json([
                'status' => false,
                'message' => 'Transaction not found',
            ], 404);
        }
    }
}
