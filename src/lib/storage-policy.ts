export const MAX_UPLOAD_BYTES = 10 * 1024 * 1024

export class UploadValidationError extends Error {
  constructor(
    message: string,
    readonly status: number
  ) {
    super(message)
    this.name = 'UploadValidationError'
  }
}

export function validateUploadFile(file: { size: number }) {
  if (file.size <= 0) {
    throw new UploadValidationError(
      'Upload must include a non-empty file.',
      400
    )
  }

  if (file.size > MAX_UPLOAD_BYTES) {
    throw new UploadValidationError(
      'Upload exceeds the 10 MB starter limit.',
      413
    )
  }
}

export function sanitizeFileName(name: string) {
  const sanitized = name
    .replace(/[/\\?%*:|"<>]/g, '-')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 120)

  return sanitized.length > 0 ? sanitized : 'upload'
}

export function createDownloadHeaders(record: {
  name: string
  contentType: string
}) {
  return {
    'content-type': record.contentType,
    'content-disposition': `attachment; filename="${record.name.replace(/"/g, '')}"`,
  }
}
