const baseSecurityHeaders = {
  'Cross-Origin-Opener-Policy': 'same-origin',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
}

export function applySecurityHeaders(response: Response, requestUrl: string) {
  for (const [name, value] of Object.entries(baseSecurityHeaders)) {
    response.headers.set(name, value)
  }

  if (new URL(requestUrl).protocol === 'https:') {
    response.headers.set(
      'Strict-Transport-Security',
      'max-age=63072000; includeSubDomains; preload',
    )
  }

  return response
}
