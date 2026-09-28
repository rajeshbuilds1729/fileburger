'use client'

import { JSX, useCallback, useState } from 'react'
import { useMutation } from '@tanstack/react-query'
import { useWebRTCPeer } from './WebRTCProvider'
import CancelButton from './CancelButton'

export default function ReportTermsViolationButton({
  uploaderPeerID,
  slug,
}: {
  uploaderPeerID: string
  slug: string
}): JSX.Element {
  const { peer } = useWebRTCPeer()
  const [showModal, setShowModal] = useState(false)
  const [isReporting, setIsReporting] = useState(false)

  const reportMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch('/api/destroy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slug }),
      })
      if (!response.ok) {
        throw new Error('Failed to report violation')
      }
      return response.json()
    },
  })

  const handleReport = useCallback(() => {
    try {
      setIsReporting(true)
      // Destroy the channel so no further downloads can start.
      reportMutation.mutate()

      // Tell the uploader over a dedicated connection. They broadcast to every
      // connected downloader, so the whole order gets called off.
      const conn = peer.connect(uploaderPeerID, {
        metadata: { type: 'report' },
      })

      // Redirect even if the connection never opens.
      const timeout = setTimeout(() => {
        conn.close()
        window.location.href = '/reported'
      }, 2000)

      conn.on('open', () => {
        clearTimeout(timeout)
        conn.close()
        window.location.href = '/reported'
      })
    } catch (error) {
      console.error('Failed to report violation', error)
      setIsReporting(false)
    }
  }, [peer, uploaderPeerID, slug, reportMutation])

  return (
    <>
      <div className="flex justify-center">
        <button
          onClick={() => setShowModal(true)}
          className="text-sm text-sauce-500 dark:text-sauce-400 hover:underline transition-colors duration-200"
          aria-label="Report a suspicious order"
        >
          Report a suspicious order
        </button>
      </div>

      {showModal && (
        <div
          className="fixed inset-0 bg-crust-900/60 flex items-center justify-center p-4 z-50"
          role="dialog"
          aria-modal="true"
          aria-labelledby="report-title"
          onClick={() => setShowModal(false)}
        >
          <div
            className="bg-bun-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-700 rounded-lg p-8 max-w-md w-full shadow-lg max-h-[85dvh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <h2
              id="report-title"
              className="text-xl font-bold mb-4 text-stone-900 dark:text-stone-50"
            >
              Something off with this order?
            </h2>

            <div className="space-y-4 text-stone-700 dark:text-stone-300">
              <p>Before you report, our kitchen policy:</p>

              <ul className="list-none space-y-3">
                <li className="flex items-start gap-3 px-4 py-2 rounded-lg bg-white dark:bg-stone-800">
                  <span className="text-base">⚖️</span>
                  <span className="text-sm">
                    Only upload files you have the right to share
                  </span>
                </li>
                <li className="flex items-start gap-3 px-4 py-2 rounded-lg bg-white dark:bg-stone-800">
                  <span className="text-base">🔗</span>
                  <span className="text-sm">
                    Share download links only with known recipients
                  </span>
                </li>
                <li className="flex items-start gap-3 px-4 py-2 rounded-lg bg-white dark:bg-stone-800">
                  <span className="text-base">🚫</span>
                  <span className="text-sm">
                    No illegal or harmful content allowed
                  </span>
                </li>
              </ul>

              <p>
                If this order breaks those rules, hit Report and we will call
                off the delivery.
              </p>
            </div>

            <div className="mt-6 flex justify-end space-x-4">
              <CancelButton onClick={() => setShowModal(false)} />
              <button
                disabled={isReporting}
                onClick={handleReport}
                className="px-4 py-2 bg-linear-to-b from-sauce-400 to-sauce-600 text-white rounded-md border border-sauce-600 shadow-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed enabled:hover:from-sauce-500 enabled:hover:to-sauce-700 transition-all duration-200"
              >
                {isReporting ? 'Reporting...' : 'Report'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
