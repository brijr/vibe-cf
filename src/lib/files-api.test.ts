import { describe, expect, it } from 'vitest'

import {
  handleDeleteFile,
  handleDownloadFile,
  handleListFiles,
  handleUploadFile,
  type FilesApiDependencies,
  type FilesApiSession,
} from '@/lib/files-api'

const session: FilesApiSession = {
  user: {
    id: 'user_1',
  },
}

const organization = {
  organizationId: 'org_1',
  role: 'owner',
}

function createDependencies(
  overrides: Partial<FilesApiDependencies> = {}
): FilesApiDependencies {
  return {
    getOrganizationForUser: async () => organization,
    listFilesForOrganization: async () => [
      {
        id: 'file_1',
        name: 'brief.txt',
        contentType: 'text/plain',
        size: 5,
        createdAt: new Date('2026-05-15T16:00:00.000Z'),
      },
    ],
    createFileObject: async ({ file, organizationId, userId }) => ({
      id: 'file_1',
      key: `org/${organizationId}/file_1/${file.name}`,
      bucket: 'OBJECTS',
      name: file.name,
      contentType: file.type,
      size: file.size,
      organizationId,
      userId,
      createdAt: new Date('2026-05-15T16:00:00.000Z'),
      updatedAt: new Date('2026-05-15T16:00:00.000Z'),
    }),
    getFileRecord: async () => ({
      id: 'file_1',
      key: 'org/org_1/file_1/brief.txt',
      bucket: 'OBJECTS',
      name: 'brief.txt',
      contentType: 'text/plain',
      size: 5,
      organizationId: 'org_1',
      userId: 'user_1',
      createdAt: new Date('2026-05-15T16:00:00.000Z'),
      updatedAt: new Date('2026-05-15T16:00:00.000Z'),
    }),
    getObject: async () => ({
      body: 'hello',
      httpEtag: '"etag"',
      writeHttpMetadata(headers: Headers) {
        headers.set('content-type', 'text/plain')
      },
    }),
    deleteFileRecord: async () => ({
      id: 'file_1',
      key: 'org/org_1/file_1/brief.txt',
      bucket: 'OBJECTS',
      name: 'brief.txt',
      contentType: 'text/plain',
      size: 5,
      organizationId: 'org_1',
      userId: 'user_1',
      createdAt: new Date('2026-05-15T16:00:00.000Z'),
      updatedAt: new Date('2026-05-15T16:00:00.000Z'),
    }),
    ...overrides,
  }
}

describe('private files API handlers', () => {
  it('rejects anonymous list requests before touching storage', async () => {
    let touchedStorage = false

    const response = await handleListFiles({
      request: new Request('http://local.test/api/files'),
      session: null,
      dependencies: createDependencies({
        getOrganizationForUser: async () => {
          touchedStorage = true
          return organization
        },
      }),
    })

    expect(response.status).toBe(401)
    expect(await response.json()).toEqual({ error: 'Unauthorized' })
    expect(touchedStorage).toBe(false)
  })

  it('returns an org-aware file listing for authenticated users', async () => {
    const response = await handleListFiles({
      request: new Request('http://local.test/api/files'),
      session,
      dependencies: createDependencies(),
    })

    expect(response.status).toBe(200)
    await expect(response.json()).resolves.toEqual({
      files: [
        {
          id: 'file_1',
          name: 'brief.txt',
          contentType: 'text/plain',
          size: 5,
          createdAt: '2026-05-15T16:00:00.000Z',
        },
      ],
      organization,
    })
  })

  it('uploads files into the authenticated user organization', async () => {
    const form = new FormData()
    form.set('file', new Blob(['hello'], { type: 'text/plain' }), 'brief.txt')

    const response = await handleUploadFile({
      request: new Request('http://local.test/api/files', {
        method: 'POST',
        body: form,
      }),
      session,
      dependencies: createDependencies(),
    })

    expect(response.status).toBe(201)
    expect(await response.json()).toMatchObject({
      file: {
        id: 'file_1',
        name: 'brief.txt',
        organizationId: 'org_1',
        userId: 'user_1',
      },
    })
  })

  it('serves downloads only after organization ownership is checked', async () => {
    const response = await handleDownloadFile({
      fileId: 'file_1',
      session,
      dependencies: createDependencies(),
    })

    expect(response.status).toBe(200)
    expect(response.headers.get('content-disposition')).toBe(
      'attachment; filename="brief.txt"'
    )
    expect(await response.text()).toBe('hello')
  })

  it('deletes file metadata and private object for organization members', async () => {
    const response = await handleDeleteFile({
      fileId: 'file_1',
      session,
      dependencies: createDependencies(),
    })

    expect(response.status).toBe(200)
    expect(await response.json()).toEqual({ ok: true })
  })
})
