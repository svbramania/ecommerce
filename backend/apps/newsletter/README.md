# Newsletter

A real, persisted email-capture list — the first concrete step of
executing `docs/marketing-plan-strategy.md`'s 365-day calendar, which
assumed an audience to send to. Before this service, no such list existed
anywhere in this stack; the storefront footer's `NewsletterSignupForm`
writes into it.

## Endpoints

```
POST /subscribe     (no auth) body {email} -> subscribe (idempotent — resubscribing un-does a prior unsubscribe)
POST /unsubscribe   (no auth) body {email} -> real, honored opt-out
GET  /subscribers   (Authorization: Bearer <NEWSLETTER_ADMIN_TOKEN>) export the real, current list
```

## Exporting the list to actually send a campaign

```bash
curl -H "Authorization: Bearer $NEWSLETTER_ADMIN_TOKEN" http://localhost:8096/subscribers
```

`NEWSLETTER_ADMIN_TOKEN` is set in `docker-compose.yml`'s environment for
this service — treat it like any other credential (not committed anywhere
readable, rotated if it leaks).

## Not built

- Double opt-in confirmation email — no templating/send queue exists for
  it yet in this stack; a real, disclosed gap, not silently skipped.
- An actual send mechanism. This is the list; sending a real campaign to
  it still needs a real ESP account (Mailchimp, SES, etc.), which this
  project doesn't have.
- Segmentation, click/open tracking, bounce handling.
