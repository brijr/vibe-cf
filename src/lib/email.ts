import '@tanstack/react-start/server-only'

import { getRuntimeEnv } from './runtime-env'

type SendAuthEmailInput = {
  to: string
  subject: string
  text: string
}

export async function sendAuthEmail({
  to,
  subject,
  text,
}: SendAuthEmailInput) {
  const env = getRuntimeEnv()
  const from = env.AUTH_EMAIL_FROM?.trim()

  if (!from || !env.SEND_EMAIL) {
    console.info('[email:no-op]', { to, subject })
    return { delivered: false, reason: 'email-not-configured' as const }
  }

  const raw = [
    `From: ${from}`,
    `To: ${to}`,
    `Subject: ${subject}`,
    'MIME-Version: 1.0',
    'Content-Type: text/plain; charset=UTF-8',
    '',
    text,
  ].join('\r\n')

  const emailModule = 'cloudflare:email'
  const { EmailMessage } = (await import(/* @vite-ignore */ emailModule)) as {
    EmailMessage: new (
      from: string,
      to: string,
      raw: ReadableStream | string
    ) => EmailMessage
  }

  await env.SEND_EMAIL.send(new EmailMessage(from, to, raw))
  return { delivered: true as const }
}
