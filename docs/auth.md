# Auth

Better Auth is configured in `src/lib/auth.ts` and mounted at `src/routes/api/auth/$.ts`.

Enabled by default:

- Email/password auth
- Organization tenancy
- TanStack Start cookie handling
- Optional GitHub/Google OAuth slots
- Cloudflare Email-compatible auth email adapter

Client code should import `authClient` from `src/lib/auth-client.ts`.

Server code should use:

- `getSession` for route guards and route context
- `ensureSession` for server functions that must be authenticated
- `getSessionForRequest` inside API route handlers

The protected starter surface is `src/routes/_protected.tsx`, with the dashboard at `/dashboard`.
