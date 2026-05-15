# vibe-cf

Minimal TanStack Start starter for Cloudflare Workers.

## Commands

```bash
pnpm install --frozen-lockfile
pnpm dev
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
- Global request middleware applies baseline security headers.
- Wrangler has production defaults, staging config, source maps, and Workers observability enabled.

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
