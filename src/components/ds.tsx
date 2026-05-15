import type { CSSProperties, ReactNode } from 'react'
import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

type DSProps = {
  className?: string
  children?: ReactNode
  id?: string
  style?: CSSProperties
}

export type ContainerSize = '2xl' | '3xl' | '4xl' | '5xl'

const containerSizes: Record<ContainerSize, string> = {
  '2xl': 'max-w-2xl',
  '3xl': 'max-w-3xl',
  '4xl': 'max-w-4xl',
  '5xl': 'max-w-5xl',
}

type ContainerProps = DSProps & {
  size?: ContainerSize
}

type NavProps = ContainerProps & {
  containerClassName?: string
}

type ProseProps = DSProps & {
  dangerouslySetInnerHTML?: { __html: string }
  isArticle?: boolean
  isSpaced?: boolean
}

// Layout primitives

export const Main = ({ children, className, id, style }: DSProps) => (
  <main className={cn(className)} id={id} style={style}>
    {children}
  </main>
)

export const Section = ({ children, className, id, style }: DSProps) => (
  <section className={cn('py-2 sm:py-4', className)} id={id} style={style}>
    {children}
  </section>
)

export const Container = ({
  children,
  className,
  id,
  style,
  size = '5xl',
}: ContainerProps) => (
  <div
    className={cn(containerSizes[size], 'mx-auto w-full p-4 sm:p-6', className)}
    id={id}
    style={style}
  >
    {children}
  </div>
)

export const Center = ({ children, className, id, style }: DSProps) => (
  <div
    className={cn(
      'flex min-h-screen flex-col items-center justify-center gap-4 p-4',
      className
    )}
    id={id}
    style={style}
  >
    {children}
  </div>
)

export const Nav = ({
  children,
  className,
  containerClassName,
  id,
  size = '5xl',
  style,
}: NavProps) => (
  <nav className={cn(className)} id={id} style={style}>
    <div
      className={cn(
        containerSizes[size],
        'mx-auto w-full px-4 py-2 sm:px-6',
        containerClassName
      )}
    >
      {children}
    </div>
  </nav>
)

// Content typography

export const Prose = ({
  children,
  className,
  dangerouslySetInnerHTML,
  id,
  isArticle = false,
  isSpaced = false,
  style,
}: ProseProps) => {
  const Component = isArticle ? 'article' : 'div'

  return (
    <Component
      className={cn(
        'text-base leading-7 antialiased',
        '[&_h1]:text-balance [&_h1]:text-4xl [&_h1]:font-medium [&_h1]:tracking-tight sm:[&_h1]:text-5xl',
        '[&_h2]:text-balance [&_h2]:text-3xl [&_h2]:font-medium [&_h2]:tracking-tight sm:[&_h2]:text-4xl',
        '[&_h3]:text-balance [&_h3]:text-2xl [&_h3]:font-medium [&_h3]:tracking-tight sm:[&_h3]:text-3xl',
        '[&_h4]:text-balance [&_h4]:text-xl [&_h4]:font-medium [&_h4]:tracking-tight sm:[&_h4]:text-2xl',
        '[&_h5]:text-balance [&_h5]:text-lg [&_h5]:font-medium [&_h5]:tracking-tight sm:[&_h5]:text-xl',
        '[&_h6]:text-balance [&_h6]:text-base [&_h6]:font-medium [&_h6]:tracking-tight sm:[&_h6]:text-lg',
        '[&_p]:text-pretty [&_p]:text-base',
        '[&_strong]:font-semibold [&_em]:italic [&_small]:text-sm [&_small]:leading-snug',
        '[&_a:not(h1_a,h2_a,h3_a,h4_a,h5_a,h6_a)]:text-primary [&_a:not(h1_a,h2_a,h3_a,h4_a,h5_a,h6_a)]:underline-offset-4 [&_a:not(h1_a,h2_a,h3_a,h4_a,h5_a,h6_a)]:transition [&_a:not(h1_a,h2_a,h3_a,h4_a,h5_a,h6_a)]:hover:underline [&_a:not(h1_a,h2_a,h3_a,h4_a,h5_a,h6_a)]:focus-visible:outline-none [&_a:not(h1_a,h2_a,h3_a,h4_a,h5_a,h6_a)]:focus-visible:ring-2 [&_a:not(h1_a,h2_a,h3_a,h4_a,h5_a,h6_a)]:focus-visible:ring-ring/50',
        '[&_ul]:list-none [&_ul]:space-y-1 [&_ul]:py-3 [&_ul]:pl-0',
        '[&_ul>li]:relative [&_ul>li]:pl-6',
        '[&_ul>li]:before:absolute [&_ul>li]:before:left-1 [&_ul>li]:before:top-[0.6875em] [&_ul>li]:before:size-1.5 [&_ul>li]:before:rounded-full [&_ul>li]:before:bg-foreground/80 [&_ul>li]:before:content-[\'\']',
        '[&_ol]:list-decimal [&_ol]:space-y-1 [&_ol]:py-3 [&_ol]:pl-6',
        '[&_li]:pl-2 [&_li]:marker:text-foreground/80',
        '[&_li>ol]:mb-0 [&_li>ol]:mt-2 [&_li>ul]:mb-0 [&_li>ul]:mt-2',
        '[&_code:not(pre_code)]:rounded [&_code:not(pre_code)]:border [&_code:not(pre_code)]:bg-muted/50 [&_code:not(pre_code)]:px-1 [&_code:not(pre_code)]:py-px [&_code:not(pre_code)]:font-mono [&_code:not(pre_code)]:text-sm [&_code:not(pre_code)]:font-medium',
        '[&_pre]:my-4 [&_pre]:overflow-x-auto [&_pre]:rounded-sm [&_pre]:border [&_pre]:bg-muted/50 [&_pre]:p-4',
        '[&_pre>code]:bg-transparent [&_pre>code]:p-0',
        '[&_blockquote]:my-4 [&_blockquote]:border-l-4 [&_blockquote]:border-border [&_blockquote]:bg-muted/30 [&_blockquote]:py-2 [&_blockquote]:pl-4 [&_blockquote]:text-muted-foreground',
        '[&_table]:my-4 [&_table]:w-full [&_table]:overflow-hidden [&_table]:rounded-sm [&_table]:border',
        '[&_thead]:bg-muted/50 [&_tr]:border-b [&_tr:nth-child(even)]:bg-muted/20',
        '[&_th]:border-r [&_th]:px-4 [&_th]:py-3 [&_th]:text-left [&_th]:font-semibold',
        '[&_td]:border-r [&_td]:px-4 [&_td]:py-2',
        '[&_img]:my-4 [&_img]:h-auto [&_img]:max-w-full [&_img]:rounded-sm [&_img]:border',
        '[&_video]:my-4 [&_video]:h-auto [&_video]:max-w-full [&_video]:rounded-sm [&_video]:border',
        '[&_hr]:my-8 [&_hr]:border-t-2 [&_hr]:border-border/50',
        isArticle && 'max-w-prose',
        isSpaced && 'space-y-6',
        isSpaced && '[&_h1:not(:first-child)]:mt-8 [&_h1]:mb-4',
        isSpaced && '[&_h2:not(:first-child)]:mt-8 [&_h2]:mb-4',
        isSpaced && '[&_h3:not(:first-child)]:mt-6 [&_h3]:mb-3',
        isSpaced && '[&_h4:not(:first-child)]:mt-6 [&_h4]:mb-3',
        isSpaced && '[&_h5:not(:first-child)]:mt-6 [&_h5]:mb-2',
        isSpaced && '[&_h6:not(:first-child)]:mt-4 [&_h6]:mb-2',
        className
      )}
      dangerouslySetInnerHTML={dangerouslySetInnerHTML}
      id={id}
      style={style}
    >
      {children}
    </Component>
  )
}
