# Cloudflare Resources

This starter targets the `WIP` Cloudflare account:

- Account ID: `4976e8a5df6887f41b287a83e6b5c18f`
- Production D1: `vibe-cf-prod-db`
- Staging D1: `vibe-cf-staging-db`
- Production R2: `vibe-cf-prod-objects`
- Staging R2: `vibe-cf-staging-objects`

All app code uses stable binding names:

- `DB` for D1
- `OBJECTS` for R2

The resources were created with the `wnam` location hint. R2 buckets are private by default and should stay private for SaaS user uploads.

## Environment Map

| Environment | D1 database | R2 bucket | Deploy command |
|-------------|-------------|-----------|----------------|
| Production | `vibe-cf-prod-db` | `vibe-cf-prod-objects` | `pnpm deploy` |
| Staging | `vibe-cf-staging-db` | `vibe-cf-staging-objects` | `pnpm deploy:staging` |

Run dry-runs before publishing:

```bash
pnpm deploy:dry-run
pnpm deploy:staging:dry-run
```

Custom domains and routes are intentionally not set yet. Add them to `wrangler.jsonc` only when the target domain is known.

## Secrets

Set production/staging secrets with Wrangler:

```bash
pnpm exec wrangler secret put BETTER_AUTH_SECRET
pnpm exec wrangler secret put BETTER_AUTH_URL
pnpm exec wrangler secret put GITHUB_CLIENT_ID
pnpm exec wrangler secret put GITHUB_CLIENT_SECRET
pnpm exec wrangler secret put GOOGLE_CLIENT_ID
pnpm exec wrangler secret put GOOGLE_CLIENT_SECRET
```

Use `--env staging` for staging secrets.

## Cloudflare Email

`src/lib/email.ts` is ready for a `SEND_EMAIL` binding from Cloudflare Email Routing. Keep it disabled until Email Routing is active on a verified domain.

When ready, add a `send_email` binding to `wrangler.jsonc`, set `AUTH_EMAIL_FROM` to a verified sender on that domain, regenerate types, and run a staging dry-run.

Until then, do not enable auth flows that depend on successful email delivery. Email/password sign-up works locally because verification is not required by default.
