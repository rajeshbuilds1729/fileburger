import { describe, expect, it } from 'vitest'
import { formatSize, getFileName } from '../../src/fs'
import type { UploadedFile } from '../../src/types'

describe('formatSize', () => {
  it('reports zero bytes without a negative exponent', () => {
    expect(formatSize(0)).toBe('0 Bytes')
  })

  it('scales through the units', () => {
    expect(formatSize(1500)).toBe('1.50 KB')
    expect(formatSize(1_500_000)).toBe('1.50 MB')
    expect(formatSize(2_500_000_000)).toBe('2.50 GB')
  })
})

describe('getFileName', () => {
  it('prefers the plain file name', () => {
    const file = { name: 'report.pdf' } as UploadedFile
    expect(getFileName(file)).toBe('report.pdf')
  })

  it('falls back to the directory entry path', () => {
    const file = { entryFullPath: 'photos/beach.png' } as UploadedFile
    expect(getFileName(file)).toBe('photos/beach.png')
  })

  it('never returns undefined for a nameless file', () => {
    expect(getFileName({} as UploadedFile)).toBe('')
  })
})
