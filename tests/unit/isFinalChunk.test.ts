import { describe, expect, it } from 'vitest'
import {
  MAX_CHUNK_SIZE,
  isFinalChunk,
} from '../../src/hooks/useUploaderConnections'

describe('isFinalChunk', () => {
  it('is false while more than one chunk remains', () => {
    expect(isFinalChunk(0, MAX_CHUNK_SIZE * 4)).toBe(false)
  })

  it('is true when this chunk reaches the end of the file', () => {
    expect(isFinalChunk(MAX_CHUNK_SIZE * 3, MAX_CHUNK_SIZE * 4)).toBe(true)
  })

  it('is true for a file smaller than a single chunk', () => {
    expect(isFinalChunk(0, 10)).toBe(true)
  })

  it('is true at exactly the file size', () => {
    expect(isFinalChunk(MAX_CHUNK_SIZE, MAX_CHUNK_SIZE)).toBe(true)
  })
})
