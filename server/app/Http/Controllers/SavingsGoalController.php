<?php

namespace App\Http\Controllers;

use App\Models\SavingsGoal;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Validator;
use Illuminate\Database\Eloquent\ModelNotFoundException;

class SavingsGoalController extends Controller
{
    public function index()
    {
        $goals = SavingsGoal::where('user_id', Auth::id())->get();
        return response()->json([
            'status' => true,
            'message' => 'Savings goals fetched successfully',
            'data' => $goals
        ], 200);
    }

    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'goal_name' => 'required|string|max:255',
            'target_amount' => 'required|numeric',
            'deadline' => 'nullable|date'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'status' => false,
                'message' => 'Validation error',
                'errors' => $validator->errors()
            ], 422);
        }

        $goal = SavingsGoal::create([
            'user_id' => Auth::id(),
            'goal_name' => $request->goal_name,
            'target_amount' => $request->target_amount,
            'deadline' => $request->deadline,
        ]);

        return response()->json([
            'status' => true,
            'message' => 'Savings goal created successfully',
            'data' => $goal
        ], 201);
    }

    public function show($id)
    {
        try {
            $goal = SavingsGoal::where('user_id', Auth::id())->findOrFail($id);
            return response()->json([
                'status' => true,
                'message' => 'Savings goal found',
                'data' => $goal
            ], 200);
        } catch (ModelNotFoundException $e) {
            return response()->json([
                'status' => false,
                'message' => 'Savings goal not found',
            ], 404);
        }
    }

    public function update(Request $request, $id)
    {
        try {
            $validator = Validator::make($request->all(), [
                'goal_name' => 'required|string|max:255',
                'target_amount' => 'required|numeric',
                'current_amount' => 'nullable|numeric',
                'deadline' => 'nullable|date'
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'status' => false,
                    'message' => 'Validation error',
                    'errors' => $validator->errors()
                ], 422);
            }

            $goal = SavingsGoal::where('user_id', Auth::id())->findOrFail($id);
            $goal->update($request->only('goal_name', 'target_amount', 'current_amount', 'deadline'));

            return response()->json([
                'status' => true,
                'message' => 'Savings goal updated successfully',
                'data' => $goal
            ], 200);
        } catch (ModelNotFoundException $e) {
            return response()->json([
                'status' => false,
                'message' => 'Savings goal not found',
            ], 404);
        }
    }

    public function destroy($id)
    {
        try {
            $goal = SavingsGoal::where('user_id', Auth::id())->findOrFail($id);
            $goal->delete();

            return response()->json([
                'status' => true,
                'message' => 'Savings goal deleted successfully',
            ], 200);
        } catch (ModelNotFoundException $e) {
            return response()->json([
                'status' => false,
                'message' => 'Savings goal not found',
            ], 404);
        }
    }
}
