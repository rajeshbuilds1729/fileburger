'use client'

import { JSX, useState } from 'react'
import CancelButton from './CancelButton'

const RULES: Array<[string, string]> = [
  ['🔒', 'Files travel straight between browsers — no server storage.'],
  ['⚖️', 'Only share files you have the right to share.'],
  ['🔗', 'Send your links only to people you know.'],
  ['🚫', 'No illegal or harmful content.'],
]

export default function TermsAcceptance(): JSX.Element {
  const [showModal, setShowModal] = useState(false)

  return (
    <>
      <div className="flex justify-center">
        <span className="text-xs text-stone-500 dark:text-stone-400">
          By selecting a file, you agree to{' '}
          <button
            onClick={() => setShowModal(true)}
            className="underline hover:text-crust-500 dark:hover:text-bun-400 transition-colors duration-200"
            aria-label="View our terms"
          >
            our terms
          </button>
          .
        </span>
      </div>

      {showModal && (
        <div
          className="fixed inset-0 bg-crust-900/60 flex items-center justify-center p-4 z-50"
          role="dialog"
          aria-modal="true"
          aria-labelledby="terms-title"
          onClick={() => setShowModal(false)}
        >
          <div
            className="bg-bun-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-700 rounded-lg p-8 max-w-md w-full shadow-lg max-h-[85dvh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <h2
              id="terms-title"
              className="text-xl font-bold mb-4 text-stone-900 dark:text-stone-50"
            >
              FileBurger Kitchen Policy
            </h2>

            <div className="space-y-4 text-stone-700 dark:text-stone-300">
              <ul className="list-none space-y-3">
                {RULES.map(([icon, text]) => (
                  <li
                    key={text}
                    className="flex items-start gap-3 px-4 py-2 rounded-lg bg-white dark:bg-stone-800"
                  >
                    <span className="text-base">{icon}</span>
                    <span className="text-sm">{text}</span>
                  </li>
                ))}
              </ul>

              <p className="text-sm italic">
                By uploading a file you confirm that you understand and agree to
                these terms.
              </p>
            </div>

            <div className="mt-6 flex justify-end">
              <CancelButton
                text="Got it!"
                onClick={() => setShowModal(false)}
              />
            </div>
          </div>
        </div>
      )}
    </>
  )
}
