import { useEffect, useState } from 'react'
import { createFileRoute, getRouteApi, Link, useNavigate } from '@tanstack/react-router'
import { Download, LogOut, Trash2, Upload } from 'lucide-react'

import { Container, Main, Nav } from '@/components/ds'
import { Button } from '@/components/ui/button'
import { authClient } from '@/lib/auth-client'

type StoredFile = {
  id: string
  name: string
  contentType: string
  size: number
  createdAt: string
}

const protectedRoute = getRouteApi('/_protected')

export const Route = createFileRoute('/_protected/dashboard')({
  component: Dashboard,
})

function Dashboard() {
  const { session } = protectedRoute.useRouteContext()
  const navigate = useNavigate()
  const [files, setFiles] = useState<StoredFile[]>([])
  const [status, setStatus] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  async function loadFiles() {
    setIsLoading(true)
    const response = await fetch('/api/files')

    setIsLoading(false)

    if (!response.ok) {
      const body = (await response.json().catch(() => null)) as {
        error?: string
      } | null
      setStatus(body?.error ?? 'Files could not be loaded.')
      return
    }

    const body = (await response.json()) as { files: StoredFile[] }
    setFiles(body.files)
    setStatus(null)
  }

  useEffect(() => {
    void loadFiles()
  }, [])

  async function onUpload(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const form = event.currentTarget
    const data = new FormData(form)

    setStatus('Uploading...')

    const response = await fetch('/api/files', {
      method: 'POST',
      body: data,
    })

    if (!response.ok) {
      const body = (await response.json().catch(() => null)) as {
        error?: string
      } | null
      setStatus(body?.error ?? 'Upload failed.')
      return
    }

    form.reset()
    setStatus('Uploaded.')
    await loadFiles()
  }

  async function onDelete(fileId: string) {
    const response = await fetch(`/api/files/${fileId}`, {
      method: 'DELETE',
    })

    if (!response.ok) {
      setStatus('Delete failed.')
      return
    }

    await loadFiles()
  }

  async function onSignOut() {
    await authClient.signOut()
    await navigate({ to: '/' })
  }

  return (
    <Main className="min-h-screen bg-background">
      <Nav className="border-b">
        <div className="flex items-center justify-between gap-4">
          <Link to="/" className="font-mono text-sm">
            vibe-cf
          </Link>
          <Button type="button" variant="ghost" onClick={onSignOut}>
            <LogOut aria-hidden="true" />
            Sign out
          </Button>
        </div>
      </Nav>

      <Container className="space-y-8 py-8">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm text-muted-foreground">
              {session.user.email}
            </p>
            <h1 className="text-2xl font-medium tracking-tight">Dashboard</h1>
          </div>
        </div>

        <section className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
          <div className="rounded-lg border">
            <div className="border-b px-4 py-3">
              <h2 className="text-sm font-medium">Private files</h2>
            </div>

            {isLoading ? (
              <p className="px-4 py-6 text-sm text-muted-foreground">
                Loading files...
              </p>
            ) : files.length === 0 ? (
              <p className="px-4 py-6 text-sm text-muted-foreground">
                No files yet.
              </p>
            ) : (
              <ul className="divide-y">
                {files.map((file) => (
                  <li
                    key={file.id}
                    className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 px-4 py-3"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium">{file.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {formatBytes(file.size)} · {file.contentType}
                      </p>
                    </div>
                    <div className="flex gap-1">
                      <Button asChild size="icon" variant="ghost">
                        <a href={`/api/files/${file.id}`}>
                          <Download aria-label={`Download ${file.name}`} />
                        </a>
                      </Button>
                      <Button
                        type="button"
                        size="icon"
                        variant="ghost"
                        onClick={() => void onDelete(file.id)}
                      >
                        <Trash2 aria-label={`Delete ${file.name}`} />
                      </Button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <form className="h-fit rounded-lg border p-4" onSubmit={onUpload}>
            <label className="block space-y-2 text-sm">
              <span className="font-medium">Upload file</span>
              <input
                required
                name="file"
                type="file"
                className="block w-full rounded-md border border-input bg-background text-sm file:mr-3 file:h-9 file:border-0 file:bg-muted file:px-3 file:text-sm file:font-medium"
              />
            </label>
            <Button type="submit" className="mt-4 w-full">
              <Upload aria-hidden="true" />
              Upload
            </Button>
            {status ? (
              <p className="mt-3 text-sm text-muted-foreground">{status}</p>
            ) : null}
          </form>
        </section>
      </Container>
    </Main>
  )
}

function formatBytes(bytes: number) {
  if (bytes < 1024) {
    return `${bytes} B`
  }

  if (bytes < 1024 * 1024) {
    return `${(bytes / 1024).toFixed(1)} KB`
  }

  return `${(bytes / 1024 / 1024).toFixed(1)} MB`
}
