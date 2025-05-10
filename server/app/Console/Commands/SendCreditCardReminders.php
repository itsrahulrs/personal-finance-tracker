<?php

namespace App\Console\Commands;

use App\Models\CreditCardReminder;
use Carbon\Carbon;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;

class SendCreditCardReminders extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'reminders:credit-card';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Send credit card payment due reminders';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $today = Carbon::today();
        $targetDate = $today->copy()->addDays(3); // send reminder 3 days before due

        $reminders = CreditCardReminder::where('reminder_sent', false)
            ->whereDate('due_date', $targetDate)
            ->with('user')
            ->get();

        foreach ($reminders as $reminder) {
            $user = $reminder->user;

            // Example: send email
            Mail::raw("Reminder: Your {$reminder->card_name} card bill of ₹{$reminder->due_amount} is due on {$reminder->due_date}.", function ($message) use ($user) {
                $message->to($user->email)
                        ->subject('Credit Card Due Reminder');
            });

            $reminder->reminder_sent = true;
            $reminder->save();

            Log::info("Reminder sent to {$user->email} for card {$reminder->card_name}");
        }

        $this->info("Processed " . $reminders->count() . " reminders.");
    }
}
