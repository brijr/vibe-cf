import { createFileRoute } from '@tanstack/react-router'

import { getSessionForRequest } from '@/lib/auth.functions'

export const Route = createFileRoute('/api/auth/session')({
  server: {
    handlers: {
      GET: async ({ request }: { request: Request }) => {
        const session = await getSessionForRequest(request)

        return Response.json(session)
      },
    },
  },
})
