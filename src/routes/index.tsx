import { createFileRoute, Link } from '@tanstack/react-router'

import { Container, Main } from '@/components/ds'
import { Button } from '@/components/ui/button'
import {
  APP_DESCRIPTION,
  APP_REPOSITORY_URL,
  APP_STACK,
  APP_TITLE,
} from '@/lib/app-info'

export const Route = createFileRoute('/')({ component: Home })

function Home() {
  return (
    <Main className="flex min-h-screen flex-col justify-center bg-background px-4 py-12">
      <Container size="2xl" className="p-0">
        <p className="font-mono text-xs uppercase tracking-wide text-muted-foreground">
          Cloudflare starter
        </p>
        <h1 className="mt-2 text-xl font-medium tracking-tight">
          {APP_TITLE}
        </h1>

        <p className="mt-6 max-w-md text-sm leading-6 text-muted-foreground">
          {APP_DESCRIPTION}
        </p>

        <ul className="mt-6 space-y-1 text-sm text-muted-foreground">
          {APP_STACK.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>

        <div className="mt-10 flex flex-wrap gap-2">
          <Button asChild>
            <Link to="/dashboard">Dashboard</Link>
          </Button>
          <Button asChild variant="outline">
            <Link to="/sign-in">Sign in</Link>
          </Button>
        </div>

        <div className="mt-8 flex gap-6 text-sm">
          <a
            href={APP_REPOSITORY_URL}
            className="text-foreground underline underline-offset-4 hover:no-underline"
          >
            GitHub
          </a>
        </div>
      </Container>
    </Main>
  )
}
