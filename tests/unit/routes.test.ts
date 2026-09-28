import { describe, expect, it } from 'vitest'
import config from '../../src/config'
import { getBodyString, readJSONBody } from '../../src/routes'

const requestWith = (body: unknown, raw?: string): Request =>
  raw !== undefined
    ? new Request('https://x.test', { method: 'POST', body: raw })
    : new Request('https://x.test', {
        method: 'POST',
        body: JSON.stringify(body),
      })

describe('readJSONBody', () => {
  it('parses a JSON object', async () => {
    await expect(readJSONBody(requestWith({ a: 1 }))).resolves.toEqual({ a: 1 })
  })

  it('rejects a malformed body instead of throwing', async () => {
    await expect(readJSONBody(requestWith({}, 'not json'))).resolves.toBeNull()
  })

  it('rejects an empty body', async () => {
    await expect(readJSONBody(requestWith({}, ''))).resolves.toBeNull()
  })

  it('rejects a JSON array or scalar', async () => {
    await expect(readJSONBody(requestWith([1, 2]))).resolves.toBeNull()
    await expect(readJSONBody(requestWith('hi'))).resolves.toBeNull()
    await expect(readJSONBody(requestWith(null))).resolves.toBeNull()
  })
})

describe('getBodyString', () => {
  const { min, max } = config.bodyKeys.uploaderPeerID

  it('accepts a string within bounds', () => {
    expect(getBodyString({ uploaderPeerID: 'peer-1' }, 'uploaderPeerID')).toBe(
      'peer-1',
    )
  })

  it('rejects a non-string', () => {
    for (const bad of [42, null, undefined, {}, ['a']]) {
      expect(
        getBodyString({ uploaderPeerID: bad }, 'uploaderPeerID'),
      ).toBeNull()
    }
  })

  it('rejects strings outside the configured bounds', () => {
    expect(
      getBodyString({ uploaderPeerID: 'a'.repeat(min - 1) }, 'uploaderPeerID'),
    ).toBeNull()
    expect(
      getBodyString({ uploaderPeerID: 'a'.repeat(max + 1) }, 'uploaderPeerID'),
    ).toBeNull()
  })
})
