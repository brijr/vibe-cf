import { describe, expect, it } from 'vitest'

import { applySecurityHeaders } from '@/lib/security-headers'

describe('security headers', () => {
  it('sets baseline response hardening headers', () => {
    const response = applySecurityHeaders(
      new Response('ok'),
      'http://localhost:3000',
    )

    expect(response.headers.get('x-content-type-options')).toBe('nosniff')
    expect(response.headers.get('x-frame-options')).toBe('DENY')
    expect(response.headers.get('referrer-policy')).toBe(
      'strict-origin-when-cross-origin',
    )
    expect(response.headers.get('permissions-policy')).toBe(
      'camera=(), microphone=(), geolocation=()',
    )
    expect(response.headers.get('strict-transport-security')).toBeNull()
  })

  it('sets HSTS for HTTPS requests only', () => {
    const response = applySecurityHeaders(
      new Response('ok'),
      'https://example.com',
    )

    expect(response.headers.get('strict-transport-security')).toBe(
      'max-age=63072000; includeSubDomains; preload',
    )
  })
})
