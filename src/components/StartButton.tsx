import React from 'react'

/** Primary action: fires the order. */
export default function StartButton({
  onClick,
}: {
  onClick: React.MouseEventHandler<HTMLButtonElement>
}): React.ReactElement {
  return (
    <button
      id="start-button"
      onClick={onClick}
      className="px-4 py-2 bg-linear-to-b from-bun-400 to-bun-600 text-white rounded-md hover:from-bun-400 hover:to-bun-700 transition-all duration-200 border border-bun-600 shadow-sm hover:shadow-md font-medium"
    >
      Start serving
    </button>
  )
}
