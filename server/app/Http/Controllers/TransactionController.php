<?php

namespace App\Http\Controllers;

use App\Models\Transaction;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Auth;

class TransactionController extends Controller
{
    public function index()
    {
        $userId = Auth::id();

        $transactions = Transaction::with(['category', 'account'])
            ->where('user_id', $userId)
            ->get();

        return response()->json([
            'status' => true,
            'message' => 'Transactions retrieved successfully',
            'data' => $transactions
        ]);
    }

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

        if ($validator->fails()) {
            return response()->json([
                'status' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ]);
        }

        $data = $request->all();
        $data['user_id'] = Auth::id();

        $transaction = Transaction::create($data);

        return response()->json([
            'status' => true,
            'message' => 'Transaction created successfully',
            'data' => $transaction
        ]);
    }

    public function show($id)
    {
        try {
            $transaction = Transaction::with(['category', 'account'])
                ->where('user_id', Auth::id())
                ->findOrFail($id);

            return response()->json([
                'status' => true,
                'message' => 'Transaction found successfully',
                'data' => $transaction
            ]);
        } catch (ModelNotFoundException $e) {
            return response()->json([
                'status' => false,
                'message' => 'Transaction not found',
            ], 404);
        }
    }

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

            if ($validator->fails()) {
                return response()->json([
                    'status' => false,
                    'message' => 'Validation error',
                    'errors' => $validator->errors()
                ], 422);
            }

            $transaction = Transaction::where('user_id', Auth::id())->findOrFail($id);
            $transaction->update($request->all());

            return response()->json([
                'status' => true,
                'message' => 'Transaction updated successfully',
                'data' => $transaction->fresh(['category', 'account'])
            ]);
        } catch (ModelNotFoundException $e) {
            return response()->json([
                'status' => false,
                'message' => 'Transaction not found',
            ], 404);
        }
    }

    public function destroy($id)
    {
        try {
            $transaction = Transaction::where('user_id', Auth::id())->findOrFail($id);
            $transaction->delete();

            return response()->json([
                'status' => true,
                'message' => 'Transaction deleted successfully',
            ]);
        } catch (ModelNotFoundException $e) {
            return response()->json([
                'status' => false,
                'message' => 'Transaction not found',
            ], 404);
        }
    }
}
