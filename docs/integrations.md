# Firekworks Stats Integrations

Stats keeps external provider access inside server-side Next.js Route Handlers and Vercel Cron jobs. Tokens are never exposed to the browser.

## Environment

Use the variable names in `.env.example`. Keep all secrets server-only unless they start with `NEXT_PUBLIC_`.

Generate `ENCRYPTION_KEY` with:

```bash
openssl rand -base64 32
```

Required for live Meta OAuth and sync:

```bash
NEXT_PUBLIC_APP_URL=
SUPABASE_URL=
SUPABASE_SERVICE_ROLE_KEY=
ENCRYPTION_KEY=
CRON_SECRET=
META_APP_ID=
META_APP_SECRET=
META_GRAPH_VERSION=
META_BUSINESS_ID=
META_WEBHOOK_VERIFY_TOKEN=
```

Google and WhatsApp placeholders use:

```bash
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
GOOGLE_REDIRECT_URI=
WHATSAPP_WEBHOOK_VERIFY_TOKEN=
```

## Database

Migration `20260605_integration_api_foundation.sql` adds:

- encrypted token fields on `integrations`
- `connected_assets`
- `oauth_states`
- `webhook_events`
- `lead_events`
- external IDs and sync metadata on campaigns/content metric tables
- RLS and authenticated grants for the new exposed tables

Client-facing dashboards must not read `lead_events` or raw `webhook_events`.

## Meta

Routes:

- `GET /api/integrations/meta/start?clientId=...`
- `GET /api/integrations/meta/callback`
- `GET /api/integrations/meta/assets?clientId=...`
- `POST /api/integrations/meta/assets`
- `POST /api/integrations/meta/sync`
- `POST /api/integrations/meta/disconnect`
- `GET /api/cron/meta-ads-sync`
- `GET /api/cron/meta-social-sync`
- `GET|POST /api/webhooks/meta`

The app requests read-oriented scopes only. Sync jobs import real data from selected connected assets. If no asset is selected, cron jobs do not import metrics.

## Google Business

Google OAuth is scaffolded so credentials and tokens can be stored safely. Metric sync is intentionally skipped until locations, available metrics and permissions are mapped against the real Google Business Profile account.

## WhatsApp

WhatsApp has webhook verification, event storage and manual asset registration. It does not fabricate message metrics; dashboards update only after real webhook events are mapped into client-owned records.

## Vercel Cron

`vercel.json` schedules:

- `/api/cron/meta-ads-sync`
- `/api/cron/meta-social-sync`
- `/api/cron/google-business-sync`
- `/api/cron/whatsapp-sync`

Every cron endpoint requires:

```http
Authorization: Bearer <CRON_SECRET>
```

## Feature Flags

Write or publishing capabilities remain off by default:

```bash
META_WRITE_ENABLED=false
CONTENT_PUBLISHING_ENABLED=false
ADS_MANAGEMENT_ENABLED=false
WHATSAPP_ENABLED=false
GOOGLE_BUSINESS_ENABLED=false
```

Do not enable these until the product explicitly needs write actions and the provider permissions have been reviewed.
