import '@tanstack/react-start/server-only'

import { drizzleAdapter } from '@better-auth/drizzle-adapter'
import { betterAuth, type BetterAuthOptions } from 'better-auth'
import { organization } from 'better-auth/plugins'
import { tanstackStartCookies } from 'better-auth/tanstack-start'

import { getDb } from '@/db/client'
import * as schema from '@/db/schema'
import { sendAuthEmail } from '@/lib/email'
import { getOptionalEnv } from '@/lib/runtime-env'

const githubClientId = getOptionalEnv('GITHUB_CLIENT_ID')
const githubClientSecret = getOptionalEnv('GITHUB_CLIENT_SECRET')
const googleClientId = getOptionalEnv('GOOGLE_CLIENT_ID')
const googleClientSecret = getOptionalEnv('GOOGLE_CLIENT_SECRET')

const socialProviders: BetterAuthOptions['socialProviders'] = {
  ...(githubClientId && githubClientSecret
    ? {
        github: {
          clientId: githubClientId,
          clientSecret: githubClientSecret,
        },
      }
    : {}),
  ...(googleClientId && googleClientSecret
    ? {
        google: {
          clientId: googleClientId,
          clientSecret: googleClientSecret,
        },
      }
    : {}),
}

export const auth = betterAuth({
  appName: 'vibe-cf',
  secret: getOptionalEnv('BETTER_AUTH_SECRET'),
  baseURL: getOptionalEnv('BETTER_AUTH_URL'),
  database: drizzleAdapter(getDb(), {
    provider: 'sqlite',
    schema,
  }),
  emailAndPassword: {
    enabled: true,
    sendResetPassword: async ({ user, url }) => {
      await sendAuthEmail({
        to: user.email,
        subject: 'Reset your password',
        text: `Use this link to reset your password:\n\n${url}`,
      })
    },
  },
  emailVerification: {
    sendOnSignUp: false,
    sendVerificationEmail: async ({ user, url }) => {
      await sendAuthEmail({
        to: user.email,
        subject: 'Verify your email',
        text: `Use this link to verify your email:\n\n${url}`,
      })
    },
  },
  socialProviders,
  plugins: [
    organization({
      sendInvitationEmail: async ({ email, organization, id }) => {
        const baseURL = getOptionalEnv('BETTER_AUTH_URL') ?? ''
        const path = `/accept-invitation?id=${encodeURIComponent(id)}`

        await sendAuthEmail({
          to: email,
          subject: `Invitation to join ${organization.name}`,
          text: `You were invited to join ${organization.name}.\n\n${baseURL}${path}`,
        })
      },
    }),
    tanstackStartCookies(),
  ],
})

export type AuthSession = Awaited<ReturnType<typeof auth.api.getSession>>
