import React, { JSX, useCallback } from 'react'
import InputLabel from './InputLabel'

export default function PasswordField({
  value,
  onChange,
  isRequired = false,
  isInvalid = false,
}: {
  value: string
  onChange: (v: string) => void
  isRequired?: boolean
  isInvalid?: boolean
}): JSX.Element {
  const handleChange = useCallback(
    function (e: React.ChangeEvent<HTMLInputElement>): void {
      onChange(e.target.value)
    },
    [onChange],
  )

  return (
    <div className="flex flex-col w-full">
      <InputLabel
        hasError={isInvalid}
        tooltip="The downloader must provide this password to start downloading. If you leave it blank, anyone with the link can download. It is not used to encrypt the file — WebRTC's DTLS already does that."
      >
        {isRequired ? 'Password' : 'Password (optional)'}
      </InputLabel>
      <input
        autoFocus
        type="password"
        className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-bun-400 dark:focus:ring-bun-500 ${
          isInvalid
            ? 'border-sauce-500 dark:border-sauce-600'
            : 'border-stone-300 dark:border-stone-600'
        } bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100`}
        placeholder="Enter a secret sauce for this burger..."
        value={value}
        onChange={handleChange}
      />
    </div>
  )
}
