# Newsletter

A real, persisted email-capture list with real double opt-in — the first
concrete step of executing `docs/marketing-plan-strategy.md`'s 365-day
calendar, which assumed an audience to send to. Before this service, no
such list existed anywhere in this stack; the storefront footer's
`NewsletterSignupForm` writes into it.

## Double opt-in

A new signup is stored right away but only counts as `confirmed` once the
real confirmation email (sent over SMTP to the same mailpit instance
`backend/backend.env`'s `EMAIL_URL` already configures for Saleor's own
account/order emails — visible at http://localhost:8025) is clicked. `GET
/subscribers` only ever returns confirmed rows. Resubmitting `/subscribe`
before confirming resends the email with a fresh token; resubmitting
after an address has already confirmed once (e.g. re-signing up post
unsubscribe) reactivates it without asking for a second confirmation.

## Endpoints

```
POST /subscribe     (no auth) body {email} -> subscribe + send confirmation email
POST /confirm       (no auth) body {email, token} -> completes double opt-in
POST /unsubscribe   (no auth) body {email} -> real, honored opt-out
GET  /subscribers   (Authorization: Bearer <NEWSLETTER_ADMIN_TOKEN>) export the real, confirmed list
```

## Exporting the list to actually send a campaign

```bash
curl -H "Authorization: Bearer $NEWSLETTER_ADMIN_TOKEN" http://localhost:8096/subscribers
```

`NEWSLETTER_ADMIN_TOKEN` lives in `backend/newsletter.env` (gitignored,
`.env.example` committed instead — same pattern as `backend/shipping.env`
etc.) — treat it like any other credential.

## Not built

- An actual campaign-send mechanism. This is the list; sending a real
  campaign to it still needs a real ESP account (Mailchimp, SES, etc.),
  which this project doesn't have — mailpit only catches mail locally,
  it never reaches a real inbox.
- Segmentation, click/open tracking, bounce handling.
