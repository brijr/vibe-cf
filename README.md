# vibe-cf

Cloudflare-native SaaS starter for AI-assisted app builds.

## Commands

```bash
pnpm install --frozen-lockfile
pnpm dev
pnpm db:generate
pnpm db:migrate:local
pnpm check
pnpm deploy:dry-run
pnpm deploy:staging:dry-run
pnpm deploy
```

## Production Baseline

- `pnpm` is pinned through `packageManager`.
- Dependency install build scripts are explicitly approved in `pnpm-workspace.yaml`.
- `pnpm check` runs typecheck, tests, and production build.
- CI installs from the lockfile, runs the full check, and validates Worker packaging with Wrangler dry-run.
- CI validates both production and staging Worker packages.
- `/api/health` returns a no-store JSON health response.
- Better Auth is mounted at `/api/auth/$`, with `/api/auth/session` as a smoke-test alias.
- Auth is backed by Drizzle ORM on Cloudflare D1.
- Private R2 uploads are brokered through authenticated server routes.
- Global request middleware applies baseline security headers.
- Wrangler has WIP account bindings, production/staging resources, source maps, and Workers observability enabled.

## Cloudflare Environments

The top-level Wrangler config is production and deploys with:

```bash
pnpm deploy
```

The staging environment is selected at build time for the Cloudflare Vite plugin:

```bash
pnpm deploy:staging
```

Validate the staging package without publishing:

```bash
pnpm deploy:staging:dry-run
```

Set custom domains or routes in `wrangler.jsonc` before attaching this starter to a public production domain.

## Cloudflare Resources

This repo is pinned to the WIP account:

- Account ID: `4976e8a5df6887f41b287a83e6b5c18f`
- Production D1: `vibe-cf-prod-db`
- Staging D1: `vibe-cf-staging-db`
- Production R2: `vibe-cf-prod-objects`
- Staging R2: `vibe-cf-staging-objects`
- Binding names in code: `DB` and `OBJECTS`

The buckets are private. Do not add an R2 public bucket domain unless a feature explicitly needs public assets.

Detailed operational notes live in:

- `docs/cloudflare-resources.md`
- `docs/auth.md`
- `docs/data-and-storage.md`

## Auth And Data

Better Auth uses email/password plus the organization plugin. GitHub and Google OAuth are optional: add `GITHUB_CLIENT_ID`, `GITHUB_CLIENT_SECRET`, `GOOGLE_CLIENT_ID`, and `GOOGLE_CLIENT_SECRET` as Worker secrets when ready.

Required production secret:

```bash
pnpm exec wrangler secret put BETTER_AUTH_SECRET
```

Optional auth URL secret/var for deployed domains:

```bash
pnpm exec wrangler secret put BETTER_AUTH_URL
```

Cloudflare Email is scaffolded through `src/lib/email.ts`. Until `AUTH_EMAIL_FROM` and a `SEND_EMAIL` binding are configured, auth emails log as no-ops in local/dev contexts.

## Migrations

Schema lives in `src/db/schema.ts`; generated SQL lives in `migrations/`.

```bash
pnpm db:generate          # Generate SQL from Drizzle schema
pnpm db:migrate:local     # Apply to local D1
pnpm db:migrate:staging   # Apply to staging D1
pnpm db:migrate:prod      # Apply to production D1
pnpm cf-typegen           # Refresh DB/R2 binding types
```

## Feature Workflow

1. Add route UI under `src/routes`.
2. Put server handlers under `src/routes/api`.
3. Put shared auth, DB, and storage logic under `src/lib` or `src/db`.
4. Add schema changes to `src/db/schema.ts`.
5. Run `pnpm db:generate`, review SQL, then run the needed migration command.
6. Guard authenticated routes with `src/lib/auth.functions.ts`.
7. Access D1 only through `src/db/client.ts`; access R2 only through authenticated server routes.
8. Add focused tests for pure logic and run `pnpm check`.
