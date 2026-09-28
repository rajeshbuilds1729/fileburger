import React, { JSX } from 'react'

/**
 * Progress is clamped and the fill turns from bun to lettuce on completion, so
 * "done" is readable at a glance.
 */
export default function ProgressBar({
  value,
  max,
}: {
  value: number
  max: number
}): JSX.Element {
  const percentage = max > 0 ? (value / max) * 100 : 0
  const clamped = Math.max(0, Math.min(100, percentage))
  const isComplete = max > 0 && value >= max

  return (
    <div
      id="progress-bar"
      className="w-full h-12 bg-stone-200 dark:bg-stone-700 rounded-md overflow-hidden relative shadow-sm"
    >
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-black font-bold">{Math.round(clamped)}%</span>
      </div>
      <div
        id="progress-bar-fill"
        className={`h-full ${
          isComplete
            ? 'bg-linear-to-b from-lettuce-400 to-lettuce-600'
            : 'bg-linear-to-b from-bun-400 to-bun-600'
        } transition-all duration-300 ease-in-out`}
        style={{ width: `${clamped}%` }}
      />
      <div className="absolute inset-0 flex items-center justify-center">
        <span
          id="progress-percentage"
          className="text-white font-bold text-shadow"
        >
          {Math.round(clamped)}%
        </span>
      </div>
    </div>
  )
}
