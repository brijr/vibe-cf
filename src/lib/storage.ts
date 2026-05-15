import '@tanstack/react-start/server-only'

import { and, desc, eq } from 'drizzle-orm'

import { getDb } from '@/db/client'
import { fileObject, member } from '@/db/schema'
import { getRuntimeEnv } from '@/lib/runtime-env'
import {
  createDownloadHeaders,
  sanitizeFileName,
  UploadValidationError,
  validateUploadFile,
} from '@/lib/storage-policy'

export { createDownloadHeaders, sanitizeFileName, validateUploadFile }

export type OrganizationContext = {
  organizationId: string
  role: string
}

export async function getOrganizationForUser(
  userId: string,
  organizationId?: string
) {
  const db = getDb()

  if (organizationId) {
    const [membership] = await db
      .select()
      .from(member)
      .where(
        and(
          eq(member.organizationId, organizationId),
          eq(member.userId, userId)
        )
      )
      .limit(1)

    if (membership) {
      return {
        organizationId: membership.organizationId,
        role: membership.role,
      }
    }

    return null
  }

  const [membership] = await db
    .select()
    .from(member)
    .where(eq(member.userId, userId))
    .limit(1)

  if (!membership) {
    return null
  }

  return {
    organizationId: membership.organizationId,
    role: membership.role,
  }
}

export async function listFilesForOrganization(organizationId: string) {
  return getDb()
    .select({
      id: fileObject.id,
      name: fileObject.name,
      contentType: fileObject.contentType,
      size: fileObject.size,
      createdAt: fileObject.createdAt,
    })
    .from(fileObject)
    .where(eq(fileObject.organizationId, organizationId))
    .orderBy(desc(fileObject.createdAt))
    .limit(50)
}

export async function createFileObject({
  file,
  organizationId,
  userId,
}: {
  file: File
  organizationId: string
  userId: string
}) {
  try {
    validateUploadFile(file)
  } catch (error) {
    if (error instanceof UploadValidationError) {
      throw new Response(error.message, { status: error.status })
    }

    throw error
  }

  const now = new Date()
  const id = crypto.randomUUID()
  const name = sanitizeFileName(file.name || 'upload')
  const contentType = file.type || 'application/octet-stream'
  const key = `org/${organizationId}/${id}/${name}`
  const env = getRuntimeEnv()

  await env.OBJECTS.put(key, await file.arrayBuffer(), {
    httpMetadata: {
      contentType,
    },
    customMetadata: {
      organizationId,
      userId,
      originalName: name,
    },
  })

  const [record] = await getDb()
    .insert(fileObject)
    .values({
      id,
      key,
      bucket: 'OBJECTS',
      name,
      contentType,
      size: file.size,
      organizationId,
      userId,
      createdAt: now,
      updatedAt: now,
    })
    .returning()

  return record
}

export async function getFileRecord(fileId: string, organizationId: string) {
  const [record] = await getDb()
    .select()
    .from(fileObject)
    .where(eq(fileObject.id, fileId))
    .limit(1)

  if (!record || record.organizationId !== organizationId) {
    return null
  }

  return record
}

export async function deleteFileRecord(fileId: string, organizationId: string) {
  const record = await getFileRecord(fileId, organizationId)

  if (!record) {
    return null
  }

  await getRuntimeEnv().OBJECTS.delete(record.key)
  await getDb().delete(fileObject).where(eq(fileObject.id, fileId))

  return record
}
