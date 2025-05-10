<?php

namespace App\Console\Commands;

use App\Models\RecurringTransaction;
use App\Models\Transaction;
use Carbon\Carbon;
use Illuminate\Console\Command;

class GenerateRecurringTransactions extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'generate:recurring-transactions';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Generate transactions from recurring entries if due today';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $today = Carbon::today();

        $recurrings = RecurringTransaction::where('is_active', true)
            ->whereDate('start_date', '<=', $today)
            ->where(function ($q) use ($today) {
                $q->whereNull('end_date')
                  ->orWhereDate('end_date', '>=', $today);
            })
            ->get();

        foreach ($recurrings as $recurring) {
            if ($this->isDueToday($recurring, $today)) {
                // Check if already created for today
                $exists = Transaction::where('user_id', $recurring->user_id)
                    ->where('title', $recurring->title)
                    ->whereDate('created_at', $today)
                    ->exists();

                if (!$exists) {
                    Transaction::create([
                        'user_id' => $recurring->user_id,
                        'title' => $recurring->title,
                        'amount' => $recurring->amount,
                        'type' => $recurring->type,
                        'created_at' => $today,
                        'updated_at' => $today,
                    ]);
                    $this->info("Transaction created for '{$recurring->title}'");
                }
            }
        }

        return Command::SUCCESS;
    }

    private function isDueToday($recurring, Carbon $today)
    {
        $start = Carbon::parse($recurring->start_date);

        switch ($recurring->frequency) {
            case 'daily':
                return true;
            case 'weekly':
                return $today->diffInWeeks($start) >= 0 &&
                       $today->dayOfWeek === $start->dayOfWeek;
            case 'monthly':
                return $start->day == $today->day;
            case 'yearly':
                return $start->isSameDay($today);
            default:
                return false;
        }
    }
}
