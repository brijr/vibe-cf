import { createFileRoute, Link } from '@tanstack/react-router'
import type { LucideIcon } from 'lucide-react'
import {
  Activity,
  Database,
  Eye,
  ExternalLink,
  FileText,
  HardDrive,
  ShieldCheck,
} from 'lucide-react'

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
    <Main className="min-h-screen bg-background p-3 sm:p-6">
      <Container
        size="5xl"
        className="min-h-[calc(100vh-1.5rem)] rounded-lg bg-card p-4 sm:min-h-[calc(100vh-3rem)] sm:p-6"
      >
        <div className="grid min-h-[560px] gap-6 lg:grid-cols-[minmax(0,1fr)_280px]">
          <section className="flex flex-col justify-center">
            <p className="font-mono text-[0.68rem] uppercase tracking-wide text-muted-foreground">
              Cloudflare starter
            </p>
            <h1 className="mt-3 text-xl font-medium tracking-tight">
              {APP_TITLE}
            </h1>

            <p className="mt-6 max-w-md text-sm leading-6 text-muted-foreground">
              {APP_DESCRIPTION}
            </p>

            <div className="mt-9 grid max-w-xl gap-2 sm:grid-cols-2">
              <FeatureTile
                label="Auth"
                title="Better Auth"
                detail="Email/password, sessions, and organizations."
                icon={ShieldCheck}
              />
              <FeatureTile
                label="Data"
                title="D1 + Drizzle"
                detail="Typed schema and migrations for Cloudflare D1."
                icon={Database}
              />
              <FeatureTile
                label="Storage"
                title="Private R2"
                detail="Authenticated upload, download, and metadata."
                icon={HardDrive}
              />
              <FeatureTile
                label="Runtime"
                title="Workers"
                detail="TanStack Start deployed on Cloudflare Workers."
                icon={Activity}
              />
            </div>

            <div className="mt-8 border-t border-border/60 pt-5">
              <p className="font-mono text-[0.68rem] uppercase tracking-wide text-muted-foreground">
                Stack
              </p>
              <ul className="mt-3 grid gap-x-6 gap-y-1 text-sm text-muted-foreground sm:grid-cols-2">
                {APP_STACK.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
          </section>

          <aside className="border-t border-border/60 pt-6 lg:border-l lg:border-t-0 lg:pl-8 lg:pt-12">
            <div className="space-y-2">
              <ActionLink icon={Eye} label="View dashboard" to="/dashboard" />
              <ActionLink icon={ShieldCheck} label="Sign in" to="/sign-in" />
              <ActionAnchor
                icon={FileText}
                label="Health route"
                href="/api/health"
              />
              <ActionAnchor
                icon={ExternalLink}
                label="Repository"
                href={APP_REPOSITORY_URL}
              />
            </div>

            <div className="my-7 border-t border-dashed border-border/70" />

            <p className="font-mono text-[0.68rem] uppercase tracking-wide text-muted-foreground">
              Activity
            </p>
            <ol className="mt-4 space-y-4 border-l border-border/70 pl-4">
              <TimelineItem title="Starter shell" detail="Routes and layout" />
              <TimelineItem title="Auth ready" detail="Better Auth + orgs" />
              <TimelineItem
                title="Files ready"
                detail="D1 metadata + private R2"
              />
            </ol>
          </aside>
        </div>
      </Container>
    </Main>
  )
}

function FeatureTile({
  detail,
  icon: Icon,
  label,
  title,
}: {
  detail: string
  icon: LucideIcon
  label: string
  title: string
}) {
  return (
    <article className="rounded-lg bg-muted/80 p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="font-mono text-[0.68rem] uppercase tracking-wide text-muted-foreground">
            {label}
          </p>
          <h2 className="mt-3 text-sm font-medium">{title}</h2>
        </div>
        <Icon
          aria-hidden="true"
          className="mt-0.5 size-4 text-muted-foreground"
        />
      </div>
      <p className="mt-2 text-sm leading-5 text-muted-foreground">{detail}</p>
    </article>
  )
}

function ActionLink({
  icon: Icon,
  label,
  to,
}: {
  icon: LucideIcon
  label: string
  to: string
}) {
  return (
    <Link
      to={to}
      className="flex h-9 items-center gap-3 text-sm transition-colors hover:text-muted-foreground"
    >
      <Icon aria-hidden="true" className="size-4" />
      {label}
    </Link>
  )
}

function ActionAnchor({
  href,
  icon: Icon,
  label,
}: {
  href: string
  icon: LucideIcon
  label: string
}) {
  return (
    <a
      href={href}
      className="flex h-9 items-center gap-3 text-sm transition-colors hover:text-muted-foreground"
    >
      <Icon aria-hidden="true" className="size-4" />
      {label}
    </a>
  )
}

function TimelineItem({ detail, title }: { detail: string; title: string }) {
  return (
    <li className="relative">
      <span className="absolute -left-[1.1875rem] top-1.5 size-2 rounded-full bg-border ring-4 ring-card" />
      <p className="text-sm leading-none">{title}</p>
      <p className="mt-1 text-xs text-muted-foreground">{detail}</p>
    </li>
  )
}
