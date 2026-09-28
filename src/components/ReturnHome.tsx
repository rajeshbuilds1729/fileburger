import { Link } from 'next-view-transitions'
import { JSX } from 'react'

export default function ReturnHome(): JSX.Element {
  return (
    <div className="flex justify-center">
      <Link
        href="/"
        className="text-stone-500 dark:text-stone-300 hover:text-crust-500 dark:hover:text-bun-400 hover:underline"
      >
        Order a fresh burger &raquo;
      </Link>
    </div>
  )
}
