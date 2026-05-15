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
