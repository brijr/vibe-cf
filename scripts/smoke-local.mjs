import { spawn } from 'node:child_process'
import { setTimeout as delay } from 'node:timers/promises'

const port = Number(process.env.SMOKE_PORT ?? 4177)
const baseUrl = `http://127.0.0.1:${port}`
const timeoutMs = Number(process.env.SMOKE_TIMEOUT_MS ?? 45_000)

const env = {
  ...process.env,
  APP_ENV: 'test',
  BETTER_AUTH_SECRET:
    process.env.BETTER_AUTH_SECRET ?? 'local-smoke-test-secret-at-least-32-chars',
  BETTER_AUTH_URL: baseUrl,
}

async function main() {
  await run('pnpm', ['db:migrate:local'])

  const server = spawn(
    'pnpm',
    [
      'exec',
      'vite',
      'dev',
      '--host',
      '127.0.0.1',
      '--port',
      String(port),
      '--strictPort',
    ],
    {
      env,
      stdio: ['ignore', 'pipe', 'pipe'],
    }
  )

  let serverOutput = ''
  server.stdout.on('data', (chunk) => {
    serverOutput += chunk.toString()
  })
  server.stderr.on('data', (chunk) => {
    serverOutput += chunk.toString()
  })

  try {
    await waitForServer(server, () => serverOutput)

    const client = new SmokeClient(baseUrl)

    await assertStatus(await client.get('/'), 200, 'home route')
    await assertStatus(await client.get('/api/health'), 200, 'health route')

    const anonymousSession = await client.get('/api/auth/session')
    await assertStatus(anonymousSession, 200, 'anonymous session route')
    assertEqual(await anonymousSession.json(), null, 'anonymous session')

    const dashboard = await client.get('/dashboard', { redirect: 'manual' })
    assertRedirectToSignIn(dashboard)

    const email = `smoke-${Date.now()}@example.com`
    await assertOk(
      await client.postJson('/api/auth/sign-up/email', {
        name: 'Smoke Tester',
        email,
        password: 'password-1234',
      }),
      'sign up'
    )

    await assertOk(
      await client.postJson('/api/auth/organization/create', {
        name: 'Smoke Workspace',
        slug: `smoke-${Date.now()}`,
      }),
      'organization create'
    )

    const fileForm = new FormData()
    fileForm.set(
      'file',
      new Blob(['hello smoke'], { type: 'text/plain' }),
      'smoke.txt'
    )

    const upload = await client.fetch('/api/files', {
      method: 'POST',
      body: fileForm,
    })
    await assertStatus(upload, 201, 'file upload')
    const uploadBody = await upload.json()
    const fileId = uploadBody.file?.id

    if (!fileId) {
      throw new Error('file upload did not return a file id')
    }

    const list = await client.get('/api/files')
    await assertStatus(list, 200, 'file list')
    const listBody = await list.json()
    if (!listBody.files?.some((file) => file.id === fileId)) {
      throw new Error('uploaded file was not returned by /api/files')
    }

    const download = await client.get(`/api/files/${fileId}`)
    await assertStatus(download, 200, 'file download')
    assertEqual(await download.text(), 'hello smoke', 'download body')

    await assertOk(
      await client.fetch(`/api/files/${fileId}`, { method: 'DELETE' }),
      'file delete'
    )

    const afterDelete = await client.get('/api/files')
    await assertStatus(afterDelete, 200, 'file list after delete')
    const afterDeleteBody = await afterDelete.json()
    if (afterDeleteBody.files?.some((file) => file.id === fileId)) {
      throw new Error('deleted file was still returned by /api/files')
    }

    console.log('local smoke passed')
  } finally {
    server.kill('SIGTERM')
    await waitForExit(server)
  }
}

class SmokeClient {
  #cookies = new Map()

  constructor(baseUrl) {
    this.baseUrl = baseUrl
  }

  get(path, init = {}) {
    return this.fetch(path, { ...init, method: 'GET' })
  }

  postJson(path, body) {
    return this.fetch(path, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
      },
      body: JSON.stringify(body),
    })
  }

  async fetch(path, init = {}) {
    const headers = new Headers(init.headers)
    headers.set('origin', this.baseUrl)

    const cookie = this.#cookieHeader()
    if (cookie) {
      headers.set('cookie', cookie)
    }

    const response = await fetch(new URL(path, this.baseUrl), {
      ...init,
      headers,
    })

    this.#captureCookies(response.headers)
    return response
  }

  #cookieHeader() {
    return Array.from(this.#cookies.entries())
      .map(([name, value]) => `${name}=${value}`)
      .join('; ')
  }

  #captureCookies(headers) {
    const setCookies =
      typeof headers.getSetCookie === 'function'
        ? headers.getSetCookie()
        : splitSetCookie(headers.get('set-cookie'))

    for (const header of setCookies) {
      const [pair, ...attributes] = header.split(';')
      const [name, value] = pair.split('=')

      if (!name) {
        continue
      }

      const expiresImmediately = attributes.some((attribute) =>
        attribute.trim().toLowerCase().startsWith('max-age=0')
      )

      if (expiresImmediately) {
        this.#cookies.delete(name)
      } else {
        this.#cookies.set(name, value)
      }
    }
  }
}

async function waitForServer(server, readOutput) {
  const startedAt = Date.now()

  while (Date.now() - startedAt < timeoutMs) {
    if (server.exitCode !== null) {
      throw new Error(`dev server exited early:\n${readOutput()}`)
    }

    try {
      const response = await fetch(baseUrl)
      if (response.status < 500) {
        return
      }
    } catch {}

    await delay(500)
  }

  throw new Error(`dev server did not start within ${timeoutMs}ms:\n${readOutput()}`)
}

async function run(command, args) {
  const child = spawn(command, args, {
    env,
    stdio: 'inherit',
  })

  const exitCode = await waitForExit(child)

  if (exitCode !== 0) {
    throw new Error(`${command} ${args.join(' ')} failed with ${exitCode}`)
  }
}

function waitForExit(child) {
  if (child.exitCode !== null) {
    return Promise.resolve(child.exitCode)
  }

  return new Promise((resolve) => {
    child.once('exit', (code) => resolve(code ?? 0))
  })
}

async function assertOk(response, label) {
  if (!response.ok) {
    throw new Error(`${label} failed: ${response.status} ${await response.text()}`)
  }
}

async function assertStatus(response, expected, label) {
  if (response.status !== expected) {
    throw new Error(
      `${label} expected ${expected}, got ${response.status}: ${await response.text()}`
    )
  }
}

function assertRedirectToSignIn(response) {
  if (response.status < 300 || response.status > 399) {
    throw new Error(`dashboard expected redirect, got ${response.status}`)
  }

  const location = response.headers.get('location')
  if (!location?.includes('/sign-in')) {
    throw new Error(`dashboard redirect did not target sign-in: ${location}`)
  }
}

function assertEqual(actual, expected, label) {
  if (actual !== expected) {
    throw new Error(
      `${label} expected ${JSON.stringify(expected)}, got ${JSON.stringify(actual)}`
    )
  }
}

function splitSetCookie(header) {
  if (!header) {
    return []
  }

  const cookies = []
  let start = 0

  for (let index = 0; index < header.length; index += 1) {
    if (header[index] !== ',') {
      continue
    }

    const rest = header.slice(index + 1)
    if (/^\s*[^=;,]+=/.test(rest)) {
      cookies.push(header.slice(start, index).trim())
      start = index + 1
    }
  }

  cookies.push(header.slice(start).trim())
  return cookies.filter(Boolean)
}

await main()
