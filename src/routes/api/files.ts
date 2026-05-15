import { createFileRoute } from '@tanstack/react-router'

import { getSessionForRequest } from '@/lib/auth.functions'

export const Route = createFileRoute('/api/files')({
  server: {
    handlers: {
      GET: async ({ request }: { request: Request }) => {
        const session = await getSessionForRequest(request)

        if (!session) {
          return Response.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const url = new URL(request.url)
        const { getOrganizationForUser, listFilesForOrganization } =
          await import('@/lib/storage')
        const organization = await getOrganizationForUser(
          session.user.id,
          url.searchParams.get('organizationId') ?? undefined
        )

        if (!organization) {
          return Response.json(
            { files: [], organization: null, error: 'No organization found.' },
            { status: 409 }
          )
        }

        const files = await listFilesForOrganization(
          organization.organizationId
        )

        return Response.json({ files, organization })
      },
      POST: async ({ request }: { request: Request }) => {
        const session = await getSessionForRequest(request)

        if (!session) {
          return Response.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const form = await request.formData()
        const upload = form.get('file')
        const { createFileObject, getOrganizationForUser } = await import(
          '@/lib/storage'
        )
        const organization = await getOrganizationForUser(
          session.user.id,
          stringValue(form.get('organizationId'))
        )

        if (!organization) {
          return Response.json(
            { error: 'Create or select an organization before uploading.' },
            { status: 409 }
          )
        }

        if (!(upload instanceof File)) {
          return Response.json({ error: 'Missing file upload.' }, { status: 400 })
        }

        try {
          const file = await createFileObject({
            file: upload,
            organizationId: organization.organizationId,
            userId: session.user.id,
          })

          return Response.json({ file }, { status: 201 })
        } catch (error) {
          if (error instanceof Response) {
            return error
          }

          throw error
        }
      },
    },
  },
})

function stringValue(value: FormDataEntryValue | null) {
  return typeof value === 'string' && value.length > 0 ? value : undefined
}
