import { JSX } from 'react'

export function ErrorMessage({ message }: { message: string }): JSX.Element {
  return (
    <div
      className="bg-sauce-500/10 dark:bg-sauce-500/20 border border-sauce-400 dark:border-sauce-600 text-sauce-600 dark:text-sauce-400 px-4 py-3 rounded relative"
      role="alert"
    >
      <span className="block sm:inline">{message}</span>
    </div>
  )
}
