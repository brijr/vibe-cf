# D1, Drizzle, And R2

## D1

Drizzle schema lives in `src/db/schema.ts`; generated SQL lives in `migrations/`.

```bash
pnpm db:generate
pnpm db:migrate:local
pnpm db:migrate:staging
pnpm db:migrate:prod
```

App code should import `getDb` from `src/db/client.ts`. This keeps D1 access obvious for future agents and avoids duplicating binding logic.

Migration workflow:

1. Edit `src/db/schema.ts`.
2. Run `pnpm db:generate`.
3. Review the generated SQL in `migrations/`.
4. Apply locally with `pnpm db:migrate:local`.
5. Run `pnpm check`.
6. Apply to staging before production.

Do not hand-edit production D1 state as a substitute for a migration. If a migration needs a data backfill, add an explicit script or documented one-off command.

## Auth Tables

Better Auth uses the `user`, `session`, `account`, and `verification` tables. The organization plugin uses `organization`, `member`, and `invitation`.

## File Metadata

`file_object` stores private R2 metadata:

- `organizationId` for tenant ownership
- `userId` for uploader ownership
- `key` for the private R2 object key
- `name`, `contentType`, and `size` for UI and download responses

Uploads, downloads, and deletes go through:

- `POST /api/files`
- `GET /api/files`
- `GET /api/files/$fileId`
- `DELETE /api/files/$fileId`

Do not expose the bucket publicly for user uploads.

Storage workflow:

1. Authenticate the request with `getSessionForRequest`.
2. Resolve the user's organization membership.
3. Write the private object to `OBJECTS`.
4. Write or update metadata in `file_object`.
5. Serve downloads through an authenticated route after checking organization ownership.

If a feature needs public files, add a separate table flag or route policy. Do not change the default bucket posture for user-owned SaaS uploads.
