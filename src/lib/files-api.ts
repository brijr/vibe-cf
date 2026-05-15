import { createDownloadHeaders } from '@/lib/storage-policy'

type FileRecord = {
  id: string
  key: string
  bucket: string
  name: string
  contentType: string
  size: number
  organizationId: string
  userId: string
  createdAt: Date
  updatedAt: Date
}

type FileListItem = Pick<
  FileRecord,
  'id' | 'name' | 'contentType' | 'size' | 'createdAt'
>

type DownloadObject = {
  body: BodyInit | null
  httpEtag: string
  writeHttpMetadata(headers: Headers): void
}

type OrganizationContext = {
  organizationId: string
  role: string
}

export type FilesApiSession = {
  user: {
    id: string
  }
} | null

type BaseFilesApiDependencies = {
  getOrganizationForUser(
    userId: string,
    organizationId?: string
  ): Promise<OrganizationContext | null>
}

export type ListFilesDependencies = BaseFilesApiDependencies & {
  listFilesForOrganization(organizationId: string): Promise<Array<FileListItem>>
}

export type UploadFileDependencies = BaseFilesApiDependencies & {
  createFileObject(input: {
    file: File
    organizationId: string
    userId: string
  }): Promise<FileRecord>
}

export type DownloadFileDependencies = BaseFilesApiDependencies & {
  getFileRecord(
    fileId: string,
    organizationId: string
  ): Promise<FileRecord | null>
  getObject(key: string): Promise<DownloadObject | null>
}

export type DeleteFileDependencies = BaseFilesApiDependencies & {
  deleteFileRecord(
    fileId: string,
    organizationId: string
  ): Promise<FileRecord | null>
}

export type FilesApiDependencies = ListFilesDependencies &
  UploadFileDependencies &
  DownloadFileDependencies &
  DeleteFileDependencies

export async function handleListFiles({
  request,
  session,
  dependencies,
}: {
  request: Request
  session: FilesApiSession
  dependencies: ListFilesDependencies
}) {
  if (!session) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const url = new URL(request.url)
  const organization = await dependencies.getOrganizationForUser(
    session.user.id,
    url.searchParams.get('organizationId') ?? undefined
  )

  if (!organization) {
    return Response.json(
      { files: [], organization: null, error: 'No organization found.' },
      { status: 409 }
    )
  }

  const files = await dependencies.listFilesForOrganization(
    organization.organizationId
  )

  return Response.json({ files, organization })
}

export async function handleUploadFile({
  request,
  session,
  dependencies,
}: {
  request: Request
  session: FilesApiSession
  dependencies: UploadFileDependencies
}) {
  if (!session) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const form = await request.formData()
  const upload = form.get('file')
  const organization = await dependencies.getOrganizationForUser(
    session.user.id,
    stringValue(form.get('organizationId'))
  )

  if (!organization) {
    return Response.json(
      { error: 'Create or select an organization before uploading.' },
      { status: 409 }
    )
  }

  if (!(upload instanceof File)) {
    return Response.json({ error: 'Missing file upload.' }, { status: 400 })
  }

  try {
    const file = await dependencies.createFileObject({
      file: upload,
      organizationId: organization.organizationId,
      userId: session.user.id,
    })

    return Response.json({ file }, { status: 201 })
  } catch (error) {
    if (error instanceof Response) {
      return normalizeErrorResponse(error)
    }

    throw error
  }
}

export async function handleDownloadFile({
  fileId,
  session,
  dependencies,
}: {
  fileId: string
  session: FilesApiSession
  dependencies: DownloadFileDependencies
}) {
  if (!session) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const organization = await dependencies.getOrganizationForUser(session.user.id)

  if (!organization) {
    return Response.json({ error: 'No organization found.' }, { status: 409 })
  }

  const record = await dependencies.getFileRecord(
    fileId,
    organization.organizationId
  )

  if (!record) {
    return Response.json({ error: 'File not found.' }, { status: 404 })
  }

  const object = await dependencies.getObject(record.key)

  if (!object) {
    return Response.json({ error: 'Object not found.' }, { status: 404 })
  }

  const headers = new Headers(createDownloadHeaders(record))
  object.writeHttpMetadata(headers)
  headers.set('etag', object.httpEtag)

  return new Response(object.body, { headers })
}

export async function handleDeleteFile({
  fileId,
  session,
  dependencies,
}: {
  fileId: string
  session: FilesApiSession
  dependencies: DeleteFileDependencies
}) {
  if (!session) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const organization = await dependencies.getOrganizationForUser(session.user.id)

  if (!organization) {
    return Response.json({ error: 'No organization found.' }, { status: 409 })
  }

  const record = await dependencies.deleteFileRecord(
    fileId,
    organization.organizationId
  )

  if (!record) {
    return Response.json({ error: 'File not found.' }, { status: 404 })
  }

  return Response.json({ ok: true })
}

function stringValue(value: FormDataEntryValue | null) {
  return typeof value === 'string' && value.length > 0 ? value : undefined
}

async function normalizeErrorResponse(response: Response) {
  const contentType = response.headers.get('content-type') ?? ''

  if (contentType.includes('application/json')) {
    return response
  }

  const message = await response.text()

  return Response.json(
    { error: message || 'Upload failed.' },
    { status: response.status }
  )
}
