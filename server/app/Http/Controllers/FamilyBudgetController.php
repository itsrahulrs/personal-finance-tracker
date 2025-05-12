<?php

namespace App\Http\Controllers;

use App\Models\FamilyBudget;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class FamilyBudgetController extends Controller
{
    public function index()
    {
        return FamilyBudget::with(['familyAccount', 'category'])->get();
    }

    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'family_account_id' => 'required|exists:family_accounts,id',
            'category_id' => 'required|exists:categories,id',
            'budget_amount' => 'required|numeric|between:0,9999999.99',
            'spent_amount' => 'nullable|numeric|between:0,9999999.99',
            'month_year' => ['required', 'regex:/^\d{4}-(0[1-9]|1[0-2])$/']
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $budget = FamilyBudget::create($request->only([
            'family_account_id',
            'category_id',
            'budget_amount',
            'spent_amount',
            'month_year'
        ]));

        return response()->json(['message' => 'Budget created', 'data' => $budget]);
    }

    public function show($id)
    {
        $budget = FamilyBudget::with(['familyAccount', 'category'])->find($id);
        if (!$budget) {
            return response()->json(['message' => 'Not found'], 404);
        }

        return $budget;
    }

    public function update(Request $request, $id)
    {
        $budget = FamilyBudget::find($id);
        if (!$budget) {
            return response()->json(['message' => 'Not found'], 404);
        }

        $validator = Validator::make($request->all(), [
            'budget_amount' => 'nullable|numeric|between:0,9999999.99',
            'spent_amount' => 'nullable|numeric|between:0,9999999.99',
            'month_year' => ['required', 'regex:/^\d{4}-(0[1-9]|1[0-2])$/']
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $budget->update($request->only(['budget_amount', 'spent_amount', 'month_year']));

        return response()->json(['message' => 'Budget updated', 'data' => $budget]);
    }

    public function destroy($id)
    {
        $budget = FamilyBudget::find($id);
        if (!$budget) {
            return response()->json(['message' => 'Not found'], 404);
        }

        $budget->delete();

        return response()->json(['message' => 'Budget deleted']);
    }
}
