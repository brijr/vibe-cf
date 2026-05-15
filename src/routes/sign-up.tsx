import { useState } from 'react'
import { createFileRoute, Link, useNavigate } from '@tanstack/react-router'

import { Center } from '@/components/ds'
import { Button } from '@/components/ui/button'
import { authClient } from '@/lib/auth-client'

export const Route = createFileRoute('/sign-up')({
  component: SignUp,
})

function SignUp() {
  const navigate = useNavigate()
  const [error, setError] = useState<string | null>(null)
  const [isPending, setIsPending] = useState(false)

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError(null)
    setIsPending(true)

    const form = new FormData(event.currentTarget)
    const name = String(form.get('name') ?? '')
    const email = String(form.get('email') ?? '')

    const result = await authClient.signUp.email({
      name,
      email,
      password: String(form.get('password') ?? ''),
    })

    if (result.error) {
      setError(result.error.message ?? 'Sign up failed.')
      setIsPending(false)
      return
    }

    const orgName = `${name || email.split('@')[0]}'s workspace`
    const orgResult = await authClient.organization.create({
      name: orgName,
      slug: createSlug(orgName),
    })

    setIsPending(false)

    if (orgResult.error) {
      setError(orgResult.error.message ?? 'Account created, but org setup failed.')
      return
    }

    await navigate({ to: '/dashboard' })
  }

  return (
    <Center className="bg-background px-4">
      <div className="w-full max-w-[360px] space-y-7">
        <div className="space-y-2">
          <p className="font-mono text-xs uppercase tracking-wide text-muted-foreground">
            vibe-cf
          </p>
          <h1 className="text-xl font-medium tracking-tight">Create account</h1>
        </div>

        <form className="space-y-4" onSubmit={onSubmit}>
          <Field label="Name" name="name" type="text" autoComplete="name" />
          <Field label="Email" name="email" type="email" autoComplete="email" />
          <Field
            label="Password"
            name="password"
            type="password"
            autoComplete="new-password"
          />

          {error ? (
            <p className="rounded-lg border border-destructive/25 bg-destructive/5 px-3 py-2 text-sm text-destructive">
              {error}
            </p>
          ) : null}

          <Button type="submit" className="w-full" disabled={isPending}>
            {isPending ? 'Creating...' : 'Create account'}
          </Button>
        </form>

        <p className="text-sm text-muted-foreground">
          Already have an account?{' '}
          <Link
            to="/sign-in"
            className="text-foreground underline underline-offset-4"
          >
            Sign in
          </Link>
        </p>
      </div>
    </Center>
  )
}

function Field({
  label,
  name,
  type,
  autoComplete,
}: {
  label: string
  name: string
  type: string
  autoComplete: string
}) {
  return (
    <label className="block space-y-1.5 text-sm">
      <span className="font-medium text-foreground">{label}</span>
      <input
        required
        name={name}
        type={type}
        autoComplete={autoComplete}
        minLength={type === 'password' ? 8 : undefined}
        className="h-9 w-full rounded-lg border border-input bg-card px-3 text-sm outline-none transition placeholder:text-muted-foreground/70 focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/30"
      />
    </label>
  )
}

function createSlug(value: string) {
  const base = value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
    .slice(0, 42)

  return `${base || 'workspace'}-${crypto.randomUUID().slice(0, 8)}`
}
