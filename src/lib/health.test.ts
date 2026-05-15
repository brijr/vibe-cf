import { describe, expect, it } from 'vitest'

import { buildHealthPayload, createHealthResponse } from '@/lib/health'

const fixedDate = new Date('2026-05-15T16:00:00.000Z')

describe('health payload', () => {
  it('returns stable service metadata', () => {
    expect(
      buildHealthPayload({ environment: 'test', now: fixedDate }),
    ).toEqual({
      ok: true,
      service: 'vibe-cf',
      environment: 'test',
      timestamp: '2026-05-15T16:00:00.000Z',
    })
  })

  it('returns a no-store JSON response', async () => {
    const response = createHealthResponse({
      environment: 'test',
      now: fixedDate,
    })

    expect(response.status).toBe(200)
    expect(response.headers.get('cache-control')).toBe('no-store')
    expect(await response.json()).toEqual({
      ok: true,
      service: 'vibe-cf',
      environment: 'test',
      timestamp: '2026-05-15T16:00:00.000Z',
    })
  })
})
