# Santella Designs SaaS provisioning (SCRUM-270)

This site's inquiry form now POSTs to the Website Upgrader Pro SaaS endpoint
`POST https://www.websiteupgraderpro.com/api/v1/contact` instead of the retired
n8n webhook. That endpoint is authenticated and only accepts requests from a
provisioned tenant whose `allowedOrigins` include this site's domain.

Until the steps below are run **against prod by Louis**, the form will fail
closed (it shows the honest "email Noah directly" error, never a fake success).

All commands run through the Railway TCP proxy from a dev machine with the
`portfolio-showcase` repo checked out. Run them from the repo root. Only Louis
runs these (prod DB).

---

## Step 1 - Provision the tenant (creates Organization + API key + signup invite)

`provision-tenant` does everything in one transaction: it creates the
Organization, generates the tenant's API key (printed ONCE), and creates a
signup invitation. There is no separate "issue key" step for initial setup.

```bash
railway run --service Postgres bash -c '
  PROXY_HOST=$RAILWAY_TCP_PROXY_DOMAIN
  PROXY_PORT=$RAILWAY_TCP_PROXY_PORT
  PUB_URL=$(echo "$DATABASE_URL" | sed -E "s#@[^/]+/#@${PROXY_HOST}:${PROXY_PORT}/#")
  cd /path/to/portfolio-showcase
  DATABASE_URL="$PUB_URL" BETTER_AUTH_URL=https://www.websiteupgraderpro.com \
    npm run provision-tenant -- "Santella Designs" santella-designs noah@santelladesigns.com
'
```

- `"Santella Designs"` = tenant display name
- `santella-designs` = slug (dashboard lives at `/santella-designs`; validated,
  not a reserved slug)
- `noah@santelladesigns.com` = owner email (optional; triggers the welcome /
  set-password email if `RESEND_API_KEY` is set. The signup URL is printed
  regardless.)

Copy the printed `API key:` value (`wup_...`). It is shown ONCE - only its
SHA-256 hash is stored.

## Step 2 - Allowlist this site's origins (CORS)

The `/api/v1/*` wrapper rejects any request whose `Origin` is not in the
tenant's `allowedOrigins`. Set both the apex and www:

```bash
railway run --service Postgres bash -c '
  PROXY_HOST=$RAILWAY_TCP_PROXY_DOMAIN
  PROXY_PORT=$RAILWAY_TCP_PROXY_PORT
  PUB_URL=$(echo "$DATABASE_URL" | sed -E "s#@[^/]+/#@${PROXY_HOST}:${PROXY_PORT}/#")
  cd /path/to/portfolio-showcase
  DATABASE_URL="$PUB_URL" \
    npm run set-tenant-origins -- santella-designs https://santelladesigns.com https://www.santelladesigns.com
'
```

This REPLACES the origins array (does not append). Re-run with the full list to
change it.

## Step 3 - Put the API key into this site

Edit the inline `window.SANTELLA_SAAS` block in **both** `index.html` and
`about.html`, replacing the placeholder:

```js
window.SANTELLA_SAAS = {
  base: 'https://www.websiteupgraderpro.com',
  apiKey: 'REPLACE_WITH_SANTELLA_TENANT_KEY'   // <- paste the wup_... key from Step 1
};
```

Commit and deploy. Submit a test inquiry and confirm it lands under
`/santella-designs/contacts` on the dashboard.

---

## Regenerating the key later (only if the key leaks or is rotated)

`provision-tenant` already issued the first key. If you ever need a fresh one
for an existing tenant:

```bash
railway run --service Postgres bash -c '
  PROXY_HOST=$RAILWAY_TCP_PROXY_DOMAIN
  PROXY_PORT=$RAILWAY_TCP_PROXY_PORT
  PUB_URL=$(echo "$DATABASE_URL" | sed -E "s#@[^/]+/#@${PROXY_HOST}:${PROXY_PORT}/#")
  cd /path/to/portfolio-showcase
  DATABASE_URL="$PUB_URL" BETTER_AUTH_URL=https://www.websiteupgraderpro.com \
    npm run issue-api-key -- santella-designs
'
```

Then update the `apiKey` in this site (Step 3) and revoke the old key from the
admin UI.

## Field contract (for reference)

The site sends JSON with header `x-api-key: <SANTELLA_SAAS.apiKey>` and body:

| Field   | Required | Notes                                                      |
|---------|----------|------------------------------------------------------------|
| name    | yes      | 1-200 chars                                                |
| email   | yes      | valid email                                                |
| message | yes      | 1-10000 chars; the subject line is prepended to the body   |
| phone   | no       | modal (per-piece) inquiry only; omitted when blank         |

The honeypot (`botcheck`) is handled client-side and is never sent. Unknown
fields are stripped server-side by the Zod schema.
