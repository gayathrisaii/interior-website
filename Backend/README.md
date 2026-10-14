# Backend

This folder contains the standalone Express contact API. The Angular application is maintained separately in `Frontend`.

## Run locally

```bash
npm ci
npm start
```

The API listens on port `4000` by default. The Angular development server proxies `/api` requests to `http://localhost:4000`. The health check is available at `/health`.

## Contact email configuration

The API saves valid submissions to `data/contact-submissions.jsonl` and emails them to `CONTACT_TO` (default: `umaprasad@dream2decor.in`). Set `CONTACT_SUBMISSIONS_FILE` to override the storage path.

Brevo is used when `BREVO_API_KEY` is configured:

```text
BREVO_API_KEY=<your Brevo API key>
BREVO_FROM_EMAIL=umaprasad@dream2decor.in
BREVO_FROM_NAME=Dream2Decor Website
CONTACT_TO=umaprasad@dream2decor.in
```

Verify the sender address in Brevo. If `BREVO_API_KEY` is absent, the API falls back to GoDaddy SMTP; configure `EMAIL_USER` and `EMAIL_PASSWORD` and, if needed, `SMTP_HOST`, `SMTP_PORT`, `SMTP_FROM`, and `SMTP_SECURE`.

Keep API credentials in the hosting provider's environment settings, not in source code or frontend configuration. The submissions file may contain personal information; secure and back it up according to your privacy requirements.
