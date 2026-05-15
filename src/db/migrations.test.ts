import { readFileSync } from 'node:fs'

import { getTableName } from 'drizzle-orm'
import { describe, expect, it } from 'vitest'

import {
  account,
  fileObject,
  invitation,
  member,
  organization,
  session,
  user,
  verification,
} from '@/db/schema'

const migrationSql = readFileSync(
  new URL('../../migrations/0000_grey_captain_america.sql', import.meta.url),
  'utf8'
)

describe('D1 migrations', () => {
  it('creates every first-party table declared in the Drizzle schema', () => {
    const tables = [
      user,
      session,
      account,
      verification,
      organization,
      member,
      invitation,
      fileObject,
    ].map((table) => getTableName(table))

    for (const table of tables) {
      expect(migrationSql).toContain(`CREATE TABLE \`${table}\``)
    }
  })
})
