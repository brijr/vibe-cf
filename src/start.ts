import { createMiddleware, createStart } from '@tanstack/react-start'

import { applySecurityHeaders } from '@/lib/security-headers'

const securityHeadersMiddleware = createMiddleware().server(
  async ({ request, next }) => {
    const result = await next()
    applySecurityHeaders(result.response, request.url)

    return result
  },
)

export const startInstance = createStart(() => ({
  requestMiddleware: [securityHeadersMiddleware],
}))
