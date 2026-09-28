import React, { JSX } from 'react'

export default function DownloadButton({
  onClick,
}: {
  onClick?: React.MouseEventHandler
}): JSX.Element {
  return (
    <button
      id="download-button"
      onClick={onClick}
      className="h-12 px-6 bg-linear-to-b from-lettuce-400 to-lettuce-600 text-white rounded-md hover:from-lettuce-400 hover:to-lettuce-600 transition-all duration-200 border border-lettuce-600 shadow-sm hover:shadow-md font-semibold"
    >
      Eat now
    </button>
  )
}
