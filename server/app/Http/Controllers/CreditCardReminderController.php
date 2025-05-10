<?php

namespace App\Http\Controllers;

use App\Models\CreditCardReminder;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Validator;
use Illuminate\Database\Eloquent\ModelNotFoundException;

class CreditCardReminderController extends Controller
{
    public function index()
    {
        $reminders = CreditCardReminder::where('user_id', Auth::id())->get();
        return response()->json([
            'status' => true,
            'message' => 'Credit card reminders fetched successfully',
            'data' => $reminders
        ], 200);
    }

    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'card_name' => 'required|string|max:255',
            'bank_name' => 'nullable|string|max:255',
            'card_number' => 'nullable|string|max:255',
            'due_amount' => 'required|numeric|min:0',
            'due_date' => 'required|date'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'status' => false,
                'message' => 'Validation error',
                'errors' => $validator->errors()
            ], 422);
        }

        $reminder = CreditCardReminder::create([
            'user_id' => Auth::id(),
            'card_name' => $request->card_name,
            'bank_name' => $request->bank_name,
            'card_number' => $request->card_number,
            'due_amount' => $request->due_amount,
            'due_date' => $request->due_date
        ]);

        return response()->json([
            'status' => true,
            'message' => 'Credit card reminder created successfully',
            'data' => $reminder
        ], 201);
    }

    public function show($id)
    {
        try {
            $reminder = CreditCardReminder::where('user_id', Auth::id())->findOrFail($id);
            return response()->json([
                'status' => true,
                'message' => 'Credit card reminder found',
                'data' => $reminder
            ], 200);
        } catch (ModelNotFoundException $e) {
            return response()->json([
                'status' => false,
                'message' => 'Reminder not found',
            ], 404);
        }
    }

    public function update(Request $request, $id)
    {
        try {
            $validator = Validator::make($request->all(), [
                'card_name' => 'required|string|max:255',
                'bank_name' => 'nullable|string|max:255',
                'card_number' => 'nullable|string|max:255',
                'due_amount' => 'required|numeric|min:0',
                'due_date' => 'required|date'
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'status' => false,
                    'message' => 'Validation error',
                    'errors' => $validator->errors()
                ], 422);
            }

            $reminder = CreditCardReminder::where('user_id', Auth::id())->findOrFail($id);
            $reminder->update($request->all());

            return response()->json([
                'status' => true,
                'message' => 'Credit card reminder updated successfully',
                'data' => $reminder
            ], 200);
        } catch (ModelNotFoundException $e) {
            return response()->json([
                'status' => false,
                'message' => 'Reminder not found',
            ], 404);
        }
    }

    public function destroy($id)
    {
        try {
            $reminder = CreditCardReminder::where('user_id', Auth::id())->findOrFail($id);
            $reminder->delete();

            return response()->json([
                'status' => true,
                'message' => 'Credit card reminder deleted successfully'
            ], 200);
        } catch (ModelNotFoundException $e) {
            return response()->json([
                'status' => false,
                'message' => 'Reminder not found'
            ], 404);
        }
    }
}

