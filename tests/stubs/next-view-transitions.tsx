/**
 * Test stub for `next-view-transitions`.
 *
 * The real package re-exports Next's `Link` and `ViewTransitions`, which need
 * the App Router mounted. Component tests do not have a router, so this stub
 * renders the same markup those wrappers would produce.
 */
import type { ReactNode } from 'react'

export function Link({
  href,
  children,
  ...rest
}: {
  href: string
  children?: ReactNode
} & Record<string, unknown>) {
  return (
    <a href={href} {...rest}>
      {children}
    </a>
  )
}

export function ViewTransitions({ children }: { children?: ReactNode }) {
  return <>{children}</>
}
