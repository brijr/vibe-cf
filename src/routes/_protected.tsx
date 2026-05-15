import { createFileRoute, Outlet, redirect } from '@tanstack/react-router'

import { createSignInRedirectSearch } from '@/lib/auth-routing'
import { getSession } from '@/lib/auth.functions'

export const Route = createFileRoute('/_protected')({
  beforeLoad: async ({ location }) => {
    const session = await getSession()

    if (!session) {
      throw redirect({
        to: '/sign-in',
        search: createSignInRedirectSearch(location.href),
      })
    }

    return { session }
  },
  component: ProtectedLayout,
})

function ProtectedLayout() {
  return <Outlet />
}
