import '@tanstack/react-start/server-only'

import { env } from 'cloudflare:workers'

export type AppEnv = Env & {
  DB: D1Database
  OBJECTS: R2Bucket
  AUTH_EMAIL_FROM?: string
  BETTER_AUTH_SECRET?: string
  BETTER_AUTH_URL?: string
  GITHUB_CLIENT_ID?: string
  GITHUB_CLIENT_SECRET?: string
  GOOGLE_CLIENT_ID?: string
  GOOGLE_CLIENT_SECRET?: string
  SEND_EMAIL?: SendEmail
}

export function getRuntimeEnv() {
  return env as AppEnv
}

export function getOptionalEnv(name: keyof AppEnv) {
  const value = getRuntimeEnv()[name]

  if (typeof value === 'string' && value.length > 0) {
    return value
  }

  const processValue = process.env[String(name)]
  return typeof processValue === 'string' && processValue.length > 0
    ? processValue
    : undefined
}
