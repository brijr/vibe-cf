import { createServerFn } from '@tanstack/react-start'
import { getRequestHeaders } from '@tanstack/react-start/server'

export const getSession = createServerFn({ method: 'GET' }).handler(
  async () => {
    const { auth } = await import('@/lib/auth')

    return auth.api.getSession({
      headers: getRequestHeaders(),
    })
  }
)

export const ensureSession = createServerFn({ method: 'GET' }).handler(
  async () => {
    const { auth } = await import('@/lib/auth')
    const session = await auth.api.getSession({
      headers: getRequestHeaders(),
    })

    if (!session) {
      throw new Error('Unauthorized')
    }

    return session
  }
)

export async function getSessionForRequest(request: Request) {
  const { auth } = await import('@/lib/auth')

  return auth.api.getSession({
    headers: request.headers,
  })
}
