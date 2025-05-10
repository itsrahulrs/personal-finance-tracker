<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use App\Models\Transaction;
use Carbon\Carbon;

class ReportController extends Controller
{
    public function index(Request $request)
    {
        $userId = Auth::id();

        // Determine the filter type: yearly, monthly, weekly, daily
        $filter = $request->query('filter', 'monthly');

        // Default start and end dates based on the filter
        switch ($filter) {
            case 'yearly':
                $startDate = Carbon::now()->startOfYear()->toDateString();
                $endDate = Carbon::now()->endOfYear()->toDateString();
                break;
            case 'weekly':
                $startDate = Carbon::now()->startOfWeek()->toDateString();
                $endDate = Carbon::now()->endOfWeek()->toDateString();
                break;
            case 'daily':
                $startDate = Carbon::now()->startOfDay()->toDateTimeString();
                $endDate = Carbon::now()->endOfDay()->toDateTimeString();
                break;
            case 'custom':
                $startDate = $request->query('start_date');
                $endDate = $request->query('end_date');
                break;
            case 'monthly':
            default:
                $startDate = Carbon::now()->startOfMonth()->toDateString();
                $endDate = Carbon::now()->endOfMonth()->toDateString();
        }

        // Base query
        $query = Transaction::where('user_id', $userId)
            ->whereBetween('transaction_date', [$startDate, $endDate]);

        // Amount filters (e.g., amount_gt=1000, amount_lt=500)
        if ($request->has('amount_gt')) {
            $query->where('amount', '>', $request->query('amount_gt'));
        }

        if ($request->has('amount_lt')) {
            $query->where('amount', '<', $request->query('amount_lt'));
        }

        if ($request->has('type') && in_array($request->query('type'), ['income', 'expense'])) {
            $query->where('type', $request->query('type'));
        }

        $transactions = $query->get();

        $income = $transactions->where('type', 'income')->sum('amount');
        $expense = $transactions->where('type', 'expense')->sum('amount');
        $savings = $income - $expense;

        return response()->json([
            'status' => true,
            'message' => 'Report generated successfully',
            'data' => [
                'filter' => $filter,
                'start_date' => $startDate,
                'end_date' => $endDate,
                'total_income' => $income,
                'total_expense' => $expense,
                'net_savings' => $savings,
                'transactions' => $transactions
            ]
        ]);
    }
}
