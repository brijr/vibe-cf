import { createFileRoute } from '@tanstack/react-router'
import { Main, Container } from '../components/ds'

export const Route = createFileRoute('/')({ component: Home })

function Home() {
  return (
    <Main className="flex min-h-screen flex-col justify-center px-6 py-16">
      <Container size="2xl" className="p-0">
        <h1 className="font-mono text-sm tracking-tight">brijr/vibe-cf</h1>

        <p className="text-muted-foreground mt-8 max-w-md text-sm leading-relaxed">
          A minimal TanStack Start starter. Server functions, file-based
          routing, and edge deployment. Nothing more.
        </p>

        <ul className="text-muted-foreground mt-8 space-y-1 text-sm">
          <li>TanStack Start</li>
          <li>Cloudflare Workers</li>
          <li>Tailwind v4</li>
          <li>shadcn/ui</li>
        </ul>

        <div className="mt-12 flex gap-6 text-sm">
          <a
            href="https://github.com/brijr/vibe-cf"
            className="text-foreground underline underline-offset-4 hover:no-underline"
          >
            GitHub
          </a>
        </div>
      </Container>
    </Main>
  )
}
