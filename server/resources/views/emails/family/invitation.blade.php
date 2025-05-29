@component('mail::message')
# You're Invited!

{{ $inviter }} has invited you to join their family account on **Personal Finance Tracker**.

Click the button below to accept the invitation:

@component('mail::button', ['url' => $invitationUrl])
Accept Invitation
@endcomponent

If you did not expect this invitation, you can safely ignore this email.

Thanks,<br>
{{ config('app.name') }}
@endcomponent
