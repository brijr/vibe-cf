import { useEffect, useState } from 'react'
import {
  createFileRoute,
  getRouteApi,
  Link,
  useNavigate,
} from '@tanstack/react-router'
import { Download, LogOut, RefreshCw, Trash2, Upload } from 'lucide-react'

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
    <Main className="min-h-screen bg-background p-3 sm:p-4">
      <div className="mx-auto min-h-[calc(100vh-1.5rem)] max-w-5xl rounded-lg bg-card sm:min-h-[calc(100vh-2rem)]">
        <Nav
          className="border-b border-border/60 bg-card"
          containerClassName="px-4 py-3 sm:px-5"
        >
          <div className="flex items-center justify-between gap-4">
            <Link to="/" className="font-mono text-sm tracking-tight">
              vibe-cf
            </Link>
            <Button
              type="button"
              variant="ghost"
              className="px-2"
              onClick={onSignOut}
            >
              <LogOut aria-hidden="true" />
              Sign out
            </Button>
          </div>
        </Nav>

        <Container className="p-4 sm:p-5">
          <section className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_280px]">
            <div className="min-w-0">
              <div>
                <p className="max-w-full truncate text-xs text-muted-foreground">
                  {session.user.email}
                </p>
                <h1 className="mt-1 text-xl font-medium tracking-tight">
                  Dashboard
                </h1>
              </div>

              <div className="mt-8">
                <div className="grid grid-cols-[minmax(0,1fr)_5rem_6rem] border-b border-border/60 pb-2 text-right font-mono text-[0.68rem] uppercase tracking-wide text-muted-foreground">
                  <span className="text-left">File</span>
                  <span>Type</span>
                  <span>Size</span>
                </div>

                {isLoading ? (
                  <p className="py-6 text-sm text-muted-foreground">
                    Loading files...
                  </p>
                ) : files.length === 0 ? (
                  <div className="mt-3 rounded-lg bg-muted/80 p-4">
                    <p className="text-sm font-medium">No files yet.</p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      Upload through the private R2 route to create object
                      metadata in D1.
                    </p>
                  </div>
                ) : (
                  <ul className="divide-y divide-border/60">
                    {files.map((file) => (
                      <li
                        key={file.id}
                        className="grid grid-cols-[minmax(0,1fr)_5rem_6rem] items-center gap-3 py-3 text-right transition-colors hover:bg-muted/45"
                      >
                        <div className="min-w-0 text-left">
                          <p className="truncate text-sm font-medium">
                            {file.name}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(file.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                        <p className="truncate text-xs text-muted-foreground">
                          {file.contentType || 'file'}
                        </p>
                        <div className="flex items-center justify-end gap-1">
                          <span className="mr-1 text-xs text-muted-foreground">
                            {formatBytes(file.size)}
                          </span>
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
            </div>

            <aside className="border-t border-border/60 pt-6 lg:border-l lg:border-t-0 lg:pl-8 lg:pt-12">
              <div className="space-y-2">
                <DashboardAction onClick={() => void loadFiles()}>
                  <RefreshCw aria-hidden="true" className="size-4" />
                  Refresh files
                </DashboardAction>
                <a
                  href="/api/files"
                  className="flex h-9 items-center gap-3 text-sm transition-colors hover:text-muted-foreground"
                >
                  <Download aria-hidden="true" className="size-4" />
                  Files API
                </a>
                <DashboardAction onClick={onSignOut}>
                  <LogOut aria-hidden="true" className="size-4" />
                  Sign out
                </DashboardAction>
              </div>

              <div className="my-7 border-t border-dashed border-border/70" />

              <form className="rounded-lg bg-muted/80 p-4" onSubmit={onUpload}>
                <label className="block space-y-1.5 text-sm">
                  <span className="font-medium">Upload file</span>
                  <input
                    required
                    name="file"
                    type="file"
                    className="block w-full rounded-md border border-transparent bg-card text-sm file:mr-3 file:h-9 file:border-0 file:bg-card file:px-3 file:text-sm file:font-medium"
                  />
                </label>
                <Button type="submit" className="mt-4 w-full">
                  <Upload aria-hidden="true" />
                  Upload
                </Button>
              </form>

              <div className="mt-7">
                <p className="font-mono text-[0.68rem] uppercase tracking-wide text-muted-foreground">
                  Activity
                </p>
                <ol className="mt-4 space-y-4 border-l border-border/70 pl-4">
                  <ActivityItem
                    title="Session active"
                    detail={session.user.email}
                  />
                  <ActivityItem
                    title={status ?? 'Storage ready'}
                    detail={`${files.length} private ${files.length === 1 ? 'object' : 'objects'}`}
                  />
                </ol>
              </div>
            </aside>
          </section>
        </Container>
      </div>
    </Main>
  )
}

function DashboardAction({
  children,
  onClick,
}: {
  children: React.ReactNode
  onClick: () => void | Promise<void>
}) {
  return (
    <button
      type="button"
      className="flex h-9 w-full items-center gap-3 text-sm transition-colors hover:text-muted-foreground"
      onClick={() => void onClick()}
    >
      {children}
    </button>
  )
}

function ActivityItem({ detail, title }: { detail: string; title: string }) {
  return (
    <li className="relative min-w-0">
      <span className="absolute -left-[1.1875rem] top-1.5 size-2 rounded-full bg-border ring-4 ring-card" />
      <p className="truncate text-sm leading-none">{title}</p>
      <p className="mt-1 truncate text-xs text-muted-foreground">{detail}</p>
    </li>
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
