import React, { JSX, useState, useCallback, useEffect, useRef } from 'react'
import { extractFileList } from '../fs'

export default function DropZone({
  onDrop,
}: {
  onDrop: (files: File[]) => void
}): JSX.Element {
  const [isDragging, setIsDragging] = useState(false)
  const [fileCount, setFileCount] = useState(0)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleDragEnter = useCallback((e: DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
    setFileCount(e.dataTransfer?.items.length || 0)
  }, [])

  const handleDragLeave = useCallback((e: DragEvent) => {
    e.preventDefault()

    const currentTarget =
      e.currentTarget === window ? window.document : e.currentTarget
    // Ignore the enter/leave storm as the pointer moves between children.
    if (
      e.relatedTarget &&
      currentTarget instanceof Node &&
      currentTarget.contains(e.relatedTarget as Node)
    ) {
      return
    }

    setIsDragging(false)
  }, [])

  const handleDragOver = useCallback((e: DragEvent) => {
    e.preventDefault()
    if (e.dataTransfer) {
      e.dataTransfer.dropEffect = 'copy'
    }
  }, [])

  const handleDrop = useCallback(
    async (e: DragEvent) => {
      e.preventDefault()
      setIsDragging(false)

      if (e.dataTransfer) {
        const files = await extractFileList(e)
        onDrop(files)
      }
    },
    [onDrop],
  )

  const handleClick = useCallback(() => {
    fileInputRef.current?.click()
  }, [])

  const handleFileInputChange = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files) {
        const files = Array.from(e.target.files)
        onDrop(files)
      }
    },
    [onDrop],
  )

  // Listeners live on window so a drop anywhere on the page is accepted.
  useEffect(() => {
    window.addEventListener('dragenter', handleDragEnter)
    window.addEventListener('dragleave', handleDragLeave)
    window.addEventListener('dragover', handleDragOver)
    window.addEventListener('drop', handleDrop)

    return () => {
      window.removeEventListener('dragenter', handleDragEnter)
      window.removeEventListener('dragleave', handleDragLeave)
      window.removeEventListener('dragover', handleDragOver)
      window.removeEventListener('drop', handleDrop)
    }
  }, [handleDragEnter, handleDragLeave, handleDragOver, handleDrop])

  return (
    <>
      <div
        className={`fixed inset-0 bg-crust-900/60 flex justify-center items-center text-2xl text-bun-50 transition-opacity duration-300 backdrop-blur-sm z-50 ${
          isDragging ? 'opacity-100 visible' : 'opacity-0 invisible'
        }`}
      >
        Drop to add {fileCount} item{fileCount !== 1 ? 's' : ''}
      </div>
      <input
        type="file"
        ref={fileInputRef}
        className="hidden"
        onChange={handleFileInputChange}
        multiple
      />
      <button
        id="drop-zone-button"
        className="block cursor-pointer relative py-4 px-8 text-base font-bold text-bun-900 dark:text-bun-100 bg-bun-200 dark:bg-bun-700 border-2 border-bun-600 dark:border-bun-500 rounded-lg transition-all duration-300 ease-in-out outline-none hover:bg-bun-300 dark:hover:bg-bun-600 hover:shadow-md active:shadow-inner focus:shadow-outline"
        onClick={handleClick}
      >
        <span className="text-center">Drop a file to get started</span>
      </button>
    </>
  )
}
