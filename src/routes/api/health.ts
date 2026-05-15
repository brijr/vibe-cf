import { createFileRoute } from '@tanstack/react-router'

import { createHealthResponse } from '@/lib/health'

export const Route = createFileRoute('/api/health')({
  server: {
    handlers: {
      GET: () =>
        createHealthResponse({
          environment: process.env.APP_ENV ?? import.meta.env.MODE,
        }),
    },
  },
})
