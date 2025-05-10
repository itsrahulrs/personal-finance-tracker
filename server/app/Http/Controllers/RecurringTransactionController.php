<?php

namespace App\Http\Controllers;

use App\Models\RecurringTransaction;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Validator;
use Illuminate\Database\Eloquent\ModelNotFoundException;

class RecurringTransactionController extends Controller
{
    public function index()
    {
        $transactions = RecurringTransaction::where('user_id', Auth::id())->get();
        return response()->json([
            'status' => true,
            'message' => 'Recurring transactions fetched successfully',
            'data' => $transactions
        ]);
    }

    public function show($id)
    {
        try {
            $transaction = RecurringTransaction::where('user_id', Auth::id())->findOrFail($id);
            return response()->json([
                'status' => true,
                'message' => 'Recurring transaction found',
                'data' => $transaction
            ]);
        } catch (ModelNotFoundException $e) {
            return response()->json([
                'status' => false,
                'message' => 'Transaction not found'
            ], 404);
        }
    }

    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'title' => 'required|string',
            'amount' => 'required|numeric',
            'type' => 'required|in:income,expense',
            'frequency' => 'required|in:daily,weekly,monthly,yearly',
            'start_date' => 'required|date',
            'end_date' => 'nullable|date|after_or_equal:start_date',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'status' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        $transaction = RecurringTransaction::create([
            'user_id' => Auth::id(),
            'title' => $request->title,
            'amount' => $request->amount,
            'type' => $request->type,
            'frequency' => $request->frequency,
            'start_date' => $request->start_date,
            'end_date' => $request->end_date,
        ]);

        return response()->json([
            'status' => true,
            'message' => 'Recurring transaction created successfully',
            'data' => $transaction
        ], 201);
    }

    public function update(Request $request, $id)
    {
        try {
            $transaction = RecurringTransaction::where('user_id', Auth::id())->findOrFail($id);

            $validator = Validator::make($request->all(), [
                'title' => 'required|string',
                'amount' => 'required|numeric',
                'type' => 'required|in:income,expense',
                'frequency' => 'required|in:daily,weekly,monthly,yearly',
                'start_date' => 'required|date',
                'end_date' => 'nullable|date|after_or_equal:start_date',
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'status' => false,
                    'message' => 'Validation failed',
                    'errors' => $validator->errors()
                ], 422);
            }

            $transaction->update($request->all());

            return response()->json([
                'status' => true,
                'message' => 'Recurring transaction updated successfully',
                'data' => $transaction
            ]);
        } catch (ModelNotFoundException $e) {
            return response()->json([
                'status' => false,
                'message' => 'Transaction not found'
            ], 404);
        }
    }

    public function destroy($id)
    {
        try {
            $transaction = RecurringTransaction::where('user_id', Auth::id())->findOrFail($id);
            $transaction->delete();

            return response()->json([
                'status' => true,
                'message' => 'Recurring transaction deleted'
            ]);
        } catch (ModelNotFoundException $e) {
            return response()->json([
                'status' => false,
                'message' => 'Transaction not found'
            ], 404);
        }
    }
}
