# AGENTS.md

This file provides guidance to Codex (Codex.ai/code) when working with code in this repository.

## Commands

```bash
pnpm dev             # Start dev server at localhost:3000
pnpm typecheck       # TypeScript validation
pnpm test            # Vitest unit tests
pnpm test:unit       # Explicit unit-test script
pnpm test:smoke      # Local D1/R2/auth smoke test with real dev server
pnpm build           # Production build
pnpm check           # Typecheck + tests + production build
pnpm db:generate     # Generate Drizzle SQL migrations into migrations/
pnpm db:migrate:local # Apply D1 migrations to local Miniflare D1
pnpm db:migrate:staging # Apply D1 migrations to staging D1
pnpm db:migrate:prod # Apply D1 migrations to production D1
pnpm preview         # Build + preview locally
pnpm deploy          # Build + deploy to Cloudflare Workers
pnpm deploy:staging  # Build with staging Cloudflare env + deploy
pnpm deploy:dry-run  # Build + validate Worker packaging without publishing
pnpm deploy:staging:dry-run # Build staging + validate without publishing
pnpm cf-typegen      # Regenerate Cloudflare bindings types
```

## Architecture

TanStack Start starter deployed to Cloudflare Workers, using:
- **TanStack Start + Router** for full-stack React with file-based routing
- **Cloudflare Workers** for edge deployment via Wrangler
- **Better Auth** for email/password auth, organization tenancy, and session cookies
- **Drizzle ORM + D1** for relational data
- **Private R2** for object storage through authenticated server routes
- **Tailwind v4 + shadcn/ui** (radix-nova style, lucide icon library, stone base color)
- **Vite** with Cloudflare plugin for builds

### Route Structure

- `src/routes/__root.tsx` — Root layout (html shell, devtools)
- `src/routes/index.tsx` — Landing page
- `src/routes/sign-in.tsx` / `src/routes/sign-up.tsx` — Better Auth entry points
- `src/routes/_protected.tsx` — Protected layout guard
- `src/routes/_protected/dashboard.tsx` — Authenticated starter dashboard
- `src/routes/api/health.ts` — Health check server route
- `src/routes/api/auth/$.ts` — Better Auth catch-all handler
- `src/routes/api/auth/session.ts` — Session smoke-test alias
- `src/routes/api/files.ts` and `src/routes/api/files/$fileId.ts` — Private R2 file routes
- `src/routes/*.tsx` — File-based routes (TanStack Router convention)

### Key Directories

- `src/components/ds.tsx` — Layout design system (Main, Container, Center, Section, Nav, Prose)
- `src/components/ui/` — shadcn/ui components
- `src/db/schema.ts` — Drizzle schema for Better Auth, orgs, and file metadata
- `src/db/client.ts` — Single D1/Drizzle access point
- `src/lib/auth.ts` — Better Auth server config
- `src/lib/auth-client.ts` — Browser auth client
- `src/lib/auth.functions.ts` — Server session helpers and route guards
- `src/lib/auth-routing.ts` — Pure auth redirect helpers
- `src/lib/files-api.ts` — Pure file API handlers for testable route behavior
- `src/lib/storage.ts` — Private R2 + D1 file metadata pattern
- `src/lib/storage-policy.ts` — Pure upload/download policy helpers
- `src/lib/email.ts` — Cloudflare Email scaffold with no-op fallback
- `src/lib/health.ts` — Health response payload
- `src/lib/security-headers.ts` — Baseline response security headers
- `src/lib/utils.ts` — Utility functions (cn)
- `src/start.ts` — Global TanStack Start request middleware
- `src/styles.css` — Global styles + theme variables (stone oklch palette)

### Design System (ds.tsx)

Use `@/components/ds` for layouts:

| Component   | Usage |
|-------------|-------|
| `Main`      | Main content area |
| `Container` | Centered content (`size="2xl"\|"3xl"\|"4xl"\|"5xl"`) |
| `Center`    | Full-screen centered (error pages) |
| `Section`   | Vertical section with padding |
| `Nav`       | Navigation with inner container |
| `Prose`     | Rich text styling (`isArticle`, `isSpaced` props) |

## Conventions

- Use `@/` path aliases
- Files: kebab-case (`settings-form.tsx`)
- Components: PascalCase (`SettingsForm`)
- shadcn components: add via `pnpm dlx shadcn@latest add <component>`
- Keep D1 access behind `src/db/client.ts`; do not instantiate Drizzle ad hoc in routes.
- Keep R2 private; expose objects only through authenticated server routes.
- Keep auth checks in `src/lib/auth.functions.ts` or small server-route helpers.
- Generate migrations with Drizzle and apply them with Wrangler D1 migrations.
- Use Better Auth organizations as the default tenant boundary.
- Keep unit-testable policy and handler logic in pure modules before wiring it to Cloudflare bindings.

## Testing

- Put focused unit tests beside the code they cover as `*.test.ts`.
- Test Cloudflare-adjacent behavior through pure service modules such as `src/lib/files-api.ts` and `src/lib/storage-policy.ts`.
- Run `pnpm test:smoke` after touching auth, protected routing, D1-backed handlers, R2 storage, or Wrangler bindings.
- If port `4177` is busy, run smoke with `SMOKE_PORT=4178 pnpm test:smoke`.

## Configuration

- `wrangler.jsonc` — Cloudflare Workers config (bindings, env vars, placement)
- `vite.config.ts` — Vite plugins (cloudflare, tanstack, tailwind, devtools)
- `components.json` — shadcn/ui configuration

### Cloudflare Resources

- Account: `WIP` / `4976e8a5df6887f41b287a83e6b5c18f`
- Production D1: `vibe-cf-prod-db` bound as `DB`
- Staging D1: `vibe-cf-staging-db` bound as `DB`
- Production R2: `vibe-cf-prod-objects` bound as `OBJECTS`
- Staging R2: `vibe-cf-staging-objects` bound as `OBJECTS`

### How To Add A Feature

1. Add UI routes under `src/routes`.
2. Add server routes under `src/routes/api`.
3. Add shared service logic under `src/lib`.
4. Add tables/columns in `src/db/schema.ts`.
5. Run `pnpm db:generate` and review the SQL in `migrations/`.
6. Apply local migrations with `pnpm db:migrate:local`.
7. Protect app surfaces with `getSession`/`ensureSession`.
8. Add focused unit tests beside the changed module.
9. Run `pnpm test:smoke` for auth, D1, R2, or protected-route changes.
10. Run `pnpm check`, then the relevant Wrangler dry-run.
