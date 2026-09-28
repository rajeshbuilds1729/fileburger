import { describe, expect, it } from 'vitest'
import { MessageType, decodeMessage } from '../../src/messages'

describe('decodeMessage', () => {
  it('parses a request-info message', () => {
    const message = decodeMessage({
      type: MessageType.RequestInfo,
      browserName: 'Chrome',
      browserVersion: '120',
      osName: 'macOS',
      osVersion: '14',
      mobileVendor: '',
      mobileModel: '',
    })
    expect(message.type).toBe(MessageType.RequestInfo)
  })

  it('parses a chunk with opaque bytes', () => {
    const bytes = new Uint8Array([1, 2, 3]).buffer
    const message = decodeMessage({
      type: MessageType.Chunk,
      fileName: 'a.bin',
      offset: 0,
      bytes,
      final: false,
    })
    expect(message.type).toBe(MessageType.Chunk)
  })

  it('allows an optional error message on PasswordRequired', () => {
    expect(decodeMessage({ type: MessageType.PasswordRequired }).type).toBe(
      MessageType.PasswordRequired,
    )
    expect(
      decodeMessage({
        type: MessageType.PasswordRequired,
        errorMessage: 'Invalid password',
      }),
    ).toEqual({
      type: MessageType.PasswordRequired,
      errorMessage: 'Invalid password',
    })
  })

  it('rejects unknown message types', () => {
    expect(() => decodeMessage({ type: 'Nope' })).toThrow()
  })

  it('rejects a chunk missing required fields', () => {
    expect(() =>
      decodeMessage({ type: MessageType.Chunk, fileName: 'a.bin' }),
    ).toThrow()
  })
})
