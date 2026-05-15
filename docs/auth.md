# Auth

Better Auth is configured in `src/lib/auth.ts` and mounted at `src/routes/api/auth/$.ts`.

Enabled by default:

- Email/password auth
- Organization tenancy
- TanStack Start cookie handling
- Optional GitHub/Google OAuth slots
- Cloudflare Email-compatible auth email adapter

## Local Setup

Create `.dev.vars` from `.dev.vars.example`, set `BETTER_AUTH_SECRET`, and keep `BETTER_AUTH_URL` pointed at the dev server URL:

```bash
cp .dev.vars.example .dev.vars
pnpm db:migrate:local
pnpm dev
```

The starter does not require real email delivery in local development. If `AUTH_EMAIL_FROM` or the Cloudflare Email binding is missing, auth emails are logged as no-ops by `src/lib/email.ts`.

## Client Pattern

Client code should import `authClient` from `src/lib/auth-client.ts`.

Use the existing sign-in and sign-up pages as the default browser-side pattern:

- `src/routes/sign-in.tsx`
- `src/routes/sign-up.tsx`

Sign-up creates a default Better Auth organization so SaaS features have a tenant immediately.

## Server Pattern

Server code should use:

- `getSession` for route guards and route context
- `ensureSession` for server functions that must be authenticated
- `getSessionForRequest` inside API route handlers

The protected starter surface is `src/routes/_protected.tsx`, with the dashboard at `/dashboard`.

For new protected app pages, put them under the `_protected` route group. For API routes, read the session from the incoming request and return `401` before touching D1 or R2.

## Production Secrets

Set these before deploying a real environment:

```bash
pnpm exec wrangler secret put BETTER_AUTH_SECRET
pnpm exec wrangler secret put BETTER_AUTH_URL
```

Use `--env staging` for staging secrets. Set OAuth client IDs and secrets only when a feature needs social login.
