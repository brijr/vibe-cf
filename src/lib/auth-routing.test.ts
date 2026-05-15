import { describe, expect, it } from 'vitest'

import { createSignInRedirectSearch } from '@/lib/auth-routing'

describe('auth routing', () => {
  it('preserves the originally requested protected URL for sign-in redirects', () => {
    expect(createSignInRedirectSearch('/dashboard?tab=files')).toEqual({
      redirect: '/dashboard?tab=files',
    })
  })
})
