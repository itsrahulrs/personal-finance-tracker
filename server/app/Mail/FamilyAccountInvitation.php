<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class FamilyAccountInvitation extends Mailable
{
    use Queueable, SerializesModels;

    public $inviter;
    public $invitationUrl;

    /**
     * Create a new message instance.
     */
    public function __construct($inviter, $invitationUrl)
    {
        $this->inviter = $inviter;
        $this->invitationUrl = $invitationUrl;
    }

    /**
     * Get the message envelope.
     */
    public function envelope(): Envelope
    {
        return new Envelope(
            subject: 'Family Account Invitation',
        );
    }

    /**
     * Get the message content definition.
     */
    public function content(): Content
    {
        return new Content(
            view: 'view.name',
        );
    }

    /**
     * Get the attachments for the message.
     *
     * @return array<int, \Illuminate\Mail\Mailables\Attachment>
     */
    public function attachments(): array
    {
        return [];
    }

    public function build()
    {
        return $this->subject('You’ve Been Invited to Join a Family Account')
                    ->markdown('emails.family.invitation');
    }

}
