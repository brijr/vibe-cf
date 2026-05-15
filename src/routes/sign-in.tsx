import { useState } from 'react'
import { createFileRoute, Link, useNavigate } from '@tanstack/react-router'

import { Center } from '@/components/ds'
import { Button } from '@/components/ui/button'
import { authClient } from '@/lib/auth-client'

export const Route = createFileRoute('/sign-in')({
  validateSearch: (search: Record<string, unknown>): { redirect?: string } => {
    return typeof search.redirect === 'string'
      ? { redirect: search.redirect }
      : {}
  },
  component: SignIn,
})

function SignIn() {
  const navigate = useNavigate()
  const search = Route.useSearch()
  const [error, setError] = useState<string | null>(null)
  const [isPending, setIsPending] = useState(false)

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError(null)
    setIsPending(true)

    const form = new FormData(event.currentTarget)
    const result = await authClient.signIn.email({
      email: String(form.get('email') ?? ''),
      password: String(form.get('password') ?? ''),
    })

    setIsPending(false)

    if (result.error) {
      setError(result.error.message ?? 'Sign in failed.')
      return
    }

    if (search.redirect?.startsWith('/')) {
      window.location.href = search.redirect
      return
    }

    await navigate({ to: '/dashboard' })
  }

  return (
    <Center className="bg-background p-3 sm:p-4">
      <div className="w-full max-w-[360px] rounded-lg bg-card p-5">
        <h1 className="text-xl font-medium tracking-tight">Sign in</h1>

        <form className="mt-7 space-y-4" onSubmit={onSubmit}>
          <Field label="Email" name="email" type="email" autoComplete="email" />
          <Field
            label="Password"
            name="password"
            type="password"
            autoComplete="current-password"
          />

          {error ? (
            <p className="rounded-lg border border-destructive/25 bg-destructive/5 px-3 py-2 text-sm text-destructive">
              {error}
            </p>
          ) : null}

          <Button type="submit" className="w-full" disabled={isPending}>
            {isPending ? 'Signing in...' : 'Sign in'}
          </Button>
        </form>

        <p className="mt-7 text-sm text-muted-foreground">
          Need an account?{' '}
          <Link
            to="/sign-up"
            className="text-foreground underline underline-offset-4"
          >
            Sign up
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
    <label className="grid gap-1.5 text-sm">
      <span className="font-medium leading-none text-foreground">{label}</span>
      <input
        required
        name={name}
        type={type}
        autoComplete={autoComplete}
        className="h-9 w-full rounded-md border border-transparent bg-muted/80 px-3 text-sm outline-none transition placeholder:text-muted-foreground/70 focus-visible:border-ring focus-visible:bg-card focus-visible:ring-2 focus-visible:ring-ring/30"
      />
    </label>
  )
}
