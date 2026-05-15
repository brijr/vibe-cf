import '@tanstack/react-start/server-only'

import { env } from 'cloudflare:workers'
import { drizzle } from 'drizzle-orm/d1'

import * as schema from './schema'

export type AppDatabase = ReturnType<typeof createDb>

export function createDb(database: D1Database) {
  return drizzle(database, { schema })
}

export function getDb() {
  return createDb(env.DB)
}
