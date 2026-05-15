import { describe, expect, it } from 'vitest'

import {
  createDownloadHeaders,
  sanitizeFileName,
  validateUploadFile,
} from '@/lib/storage-policy'

describe('storage upload policy', () => {
  it('normalizes unsafe filenames before they are used in R2 keys', () => {
    expect(sanitizeFileName(' ../client:intake?.pdf ')).toBe(
      '..-client-intake-.pdf'
    )
  })

  it('rejects empty and oversized uploads', () => {
    expect(() => validateUploadFile({ size: 0 })).toThrow(
      'Upload must include a non-empty file.'
    )

    expect(() => validateUploadFile({ size: 10 * 1024 * 1024 + 1 })).toThrow(
      'Upload exceeds the 10 MB starter limit.'
    )
  })

  it('keeps download headers attachment-only and quote-safe', () => {
    expect(
      createDownloadHeaders({
        name: 'client "brief".pdf',
        contentType: 'application/pdf',
      })
    ).toEqual({
      'content-type': 'application/pdf',
      'content-disposition': 'attachment; filename="client brief.pdf"',
    })
  })
})
