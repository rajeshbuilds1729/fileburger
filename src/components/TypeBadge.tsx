import React, { JSX } from 'react'

function getTypeColor(fileType: string): string {
  if (fileType.startsWith('image/'))
    return 'bg-bun-100 dark:bg-bun-900/40 text-bun-800 dark:text-bun-200'
  if (fileType.startsWith('text/'))
    return 'bg-lettuce-500/15 dark:bg-lettuce-500/20 text-lettuce-600 dark:text-lettuce-400'
  if (fileType.startsWith('audio/'))
    return 'bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200'
  if (fileType.startsWith('video/'))
    return 'bg-sauce-500/15 dark:bg-sauce-500/20 text-sauce-600 dark:text-sauce-400'
  return 'bg-stone-100 dark:bg-stone-900 text-stone-800 dark:text-stone-200'
}

export default function TypeBadge({ type }: { type: string }): JSX.Element {
  return (
    <div
      className={`px-2 py-1 text-[10px] font-semibold rounded ${getTypeColor(
        type,
      )} transition-all duration-300`}
    >
      {type || 'unknown'}
    </div>
  )
}
