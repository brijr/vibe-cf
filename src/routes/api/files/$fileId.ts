import { createFileRoute } from '@tanstack/react-router'

import { getSessionForRequest } from '@/lib/auth.functions'
import { handleDeleteFile, handleDownloadFile } from '@/lib/files-api'

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
        const { getFileRecord, getOrganizationForUser } = await import(
          '@/lib/storage'
        )
        const { getRuntimeEnv } = await import('@/lib/runtime-env')

        return handleDownloadFile({
          fileId: params.fileId,
          session,
          dependencies: {
            getOrganizationForUser,
            getFileRecord,
            getObject: (key) => getRuntimeEnv().OBJECTS.get(key),
          },
        })
      },
      DELETE: async ({
        params,
        request,
      }: {
        params: { fileId: string }
        request: Request
      }) => {
        const session = await getSessionForRequest(request)
        const { deleteFileRecord, getOrganizationForUser } = await import(
          '@/lib/storage'
        )

        return handleDeleteFile({
          fileId: params.fileId,
          session,
          dependencies: {
            getOrganizationForUser,
            deleteFileRecord,
          },
        })
      },
    },
  },
})
