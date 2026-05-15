import { APP_NAME } from '@/lib/app-info'

type HealthOptions = {
  environment?: string
  now?: Date
}

export type HealthPayload = {
  ok: true
  service: typeof APP_NAME
  environment: string
  timestamp: string
}

export function buildHealthPayload({
  environment = 'unknown',
  now = new Date(),
}: HealthOptions = {}): HealthPayload {
  return {
    ok: true,
    service: APP_NAME,
    environment,
    timestamp: now.toISOString(),
  }
}

export function createHealthResponse(options?: HealthOptions) {
  return Response.json(buildHealthPayload(options), {
    status: 200,
    headers: {
      'Cache-Control': 'no-store',
    },
  })
}
