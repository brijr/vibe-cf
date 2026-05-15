import { createFileRoute } from '@tanstack/react-router'

import { getSessionForRequest } from '@/lib/auth.functions'
import { handleListFiles, handleUploadFile } from '@/lib/files-api'

export const Route = createFileRoute('/api/files')({
  server: {
    handlers: {
      GET: async ({ request }: { request: Request }) => {
        const session = await getSessionForRequest(request)
        const { getOrganizationForUser, listFilesForOrganization } =
          await import('@/lib/storage')

        return handleListFiles({
          request,
          session,
          dependencies: {
            getOrganizationForUser,
            listFilesForOrganization,
          },
        })
      },
      POST: async ({ request }: { request: Request }) => {
        const session = await getSessionForRequest(request)
        const { createFileObject, getOrganizationForUser } = await import(
          '@/lib/storage'
        )

        return handleUploadFile({
          request,
          session,
          dependencies: {
            getOrganizationForUser,
            createFileObject,
          },
        })
      },
    },
  },
})
