import { createFileRoute } from '@tanstack/react-router'

import { getSessionForRequest } from '@/lib/auth.functions'

export const Route = createFileRoute('/api/files/$fileId')({
  server: {
    handlers: {
      GET: async ({
        params,
        request,
      }: {
        params: { fileId: string }
        request: Request
      }) => {
        const session = await getSessionForRequest(request)

        if (!session) {
          return Response.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const {
          createDownloadHeaders,
          getFileRecord,
          getOrganizationForUser,
        } = await import('@/lib/storage')
        const organization = await getOrganizationForUser(session.user.id)

        if (!organization) {
          return Response.json({ error: 'No organization found.' }, { status: 409 })
        }

        const record = await getFileRecord(
          params.fileId,
          organization.organizationId
        )

        if (!record) {
          return Response.json({ error: 'File not found.' }, { status: 404 })
        }

        const { getRuntimeEnv } = await import('@/lib/runtime-env')
        const object = await getRuntimeEnv().OBJECTS.get(record.key)

        if (!object) {
          return Response.json({ error: 'Object not found.' }, { status: 404 })
        }

        const headers = new Headers(createDownloadHeaders(record))
        object.writeHttpMetadata(headers)
        headers.set('etag', object.httpEtag)

        return new Response(object.body, { headers })
      },
      DELETE: async ({
        params,
        request,
      }: {
        params: { fileId: string }
        request: Request
      }) => {
        const session = await getSessionForRequest(request)

        if (!session) {
          return Response.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const { deleteFileRecord, getOrganizationForUser } = await import(
          '@/lib/storage'
        )
        const organization = await getOrganizationForUser(session.user.id)

        if (!organization) {
          return Response.json({ error: 'No organization found.' }, { status: 409 })
        }

        const record = await deleteFileRecord(
          params.fileId,
          organization.organizationId
        )

        if (!record) {
          return Response.json({ error: 'File not found.' }, { status: 404 })
        }

        return Response.json({ ok: true })
      },
    },
  },
})
