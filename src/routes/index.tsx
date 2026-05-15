import { createFileRoute } from '@tanstack/react-router'

import { Container, Main } from '@/components/ds'
import {
  APP_DESCRIPTION,
  APP_REPOSITORY_URL,
  APP_STACK,
  APP_TITLE,
} from '@/lib/app-info'

export const Route = createFileRoute('/')({ component: Home })

function Home() {
  return (
    <Main className="flex min-h-screen flex-col justify-center px-6 py-16">
      <Container size="2xl" className="p-0">
        <h1 className="font-mono text-sm tracking-tight">{APP_TITLE}</h1>

        <p className="text-muted-foreground mt-8 max-w-md text-sm leading-relaxed">
          {APP_DESCRIPTION}
        </p>

        <ul className="text-muted-foreground mt-8 space-y-1 text-sm">
          {APP_STACK.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>

        <div className="mt-12 flex gap-6 text-sm">
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
