import type { ReactNode } from 'react'
import {
  HeadContent,
  Link,
  Scripts,
  createRootRoute,
  type ErrorComponentProps,
  type NotFoundRouteProps,
} from '@tanstack/react-router'
import { TanStackRouterDevtoolsPanel } from '@tanstack/react-router-devtools'
import { TanStackDevtools } from '@tanstack/react-devtools'

import { Center } from '@/components/ds'
import { Button } from '@/components/ui/button'
import { APP_DESCRIPTION, APP_TITLE } from '@/lib/app-info'
import appCss from '../styles.css?url'

export const Route = createRootRoute({
  head: () => ({
    meta: [
      {
        charSet: 'utf-8',
      },
      {
        name: 'viewport',
        content: 'width=device-width, initial-scale=1',
      },
      {
        title: APP_TITLE,
      },
      {
        name: 'description',
        content: APP_DESCRIPTION,
      },
    ],
    links: [
      {
        rel: 'stylesheet',
        href: appCss,
      },
    ],
  }),
  errorComponent: AppError,
  notFoundComponent: AppNotFound,
  shellComponent: RootDocument,
})

function AppError({ reset }: ErrorComponentProps) {
  return (
    <Center className="px-6 text-center">
      <div className="max-w-sm space-y-6">
        <div className="space-y-2">
          <p className="font-mono text-xs uppercase tracking-wide text-muted-foreground">
            Error
          </p>
          <h1 className="text-2xl font-medium tracking-tight">
            Something went wrong
          </h1>
          <p className="text-sm leading-relaxed text-muted-foreground">
            The request failed before the page could finish rendering.
          </p>
        </div>
        <div className="flex justify-center gap-2">
          <Button type="button" variant="outline" onClick={reset}>
            Retry
          </Button>
          <Button asChild>
            <Link to="/">Home</Link>
          </Button>
        </div>
      </div>
    </Center>
  )
}

function AppNotFound(_props: NotFoundRouteProps) {
  return (
    <Center className="px-6 text-center">
      <div className="max-w-sm space-y-6">
        <div className="space-y-2">
          <p className="font-mono text-xs uppercase tracking-wide text-muted-foreground">
            404
          </p>
          <h1 className="text-2xl font-medium tracking-tight">
            Page not found
          </h1>
          <p className="text-sm leading-relaxed text-muted-foreground">
            There is no route for this URL.
          </p>
        </div>
        <Button asChild>
          <Link to="/">Home</Link>
        </Button>
      </div>
    </Center>
  )
}

function RootDocument({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className="scroll-smooth antialiased focus:scroll-auto">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <TanStackDevtools
          config={{
            position: 'bottom-right',
          }}
          plugins={[
            {
              name: 'Tanstack Router',
              render: <TanStackRouterDevtoolsPanel />,
            },
          ]}
        />
        <Scripts />
      </body>
    </html>
  )
}
