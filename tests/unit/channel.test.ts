import { beforeEach, describe, expect, it, vi } from 'vitest'

// `server-only` deliberately throws outside a React Server Component graph.
vi.mock('server-only', () => ({}))

import { MemoryChannelRepo } from '../../src/channel'
import { generateLongSlug, generateShortSlug } from '../../src/slugs'

describe('MemoryChannelRepo', () => {
  let repo: MemoryChannelRepo

  beforeEach(() => {
    repo = new MemoryChannelRepo()
  })

  it('creates a channel with a secret, a short slug and a long slug', async () => {
    const channel = await repo.createChannel('peer-1')

    expect(channel.uploaderPeerID).toBe('peer-1')
    expect(channel.secret).toBeTruthy()
    expect(channel.shortSlug).toHaveLength(8)
    expect(channel.longSlug.split('/')).toHaveLength(4)
  })

  it('resolves both the short and the long slug to the same channel', async () => {
    const created = await repo.createChannel('peer-1')

    expect(await repo.fetchChannel(created.shortSlug)).toEqual(created)
    expect(await repo.fetchChannel(created.longSlug)).toEqual(created)
  })

  it('returns null for an unknown slug', async () => {
    expect(await repo.fetchChannel('nothing-here')).toBeNull()
  })

  it('can scrub the secret when resolving a slug', async () => {
    const created = await repo.createChannel('peer-1')
    const fetched = await repo.fetchChannel(created.shortSlug, true)

    expect(fetched?.secret).toBeUndefined()
    expect(fetched?.uploaderPeerID).toBe('peer-1')
  })

  it('renews with the right secret and refuses the wrong one', async () => {
    const created = await repo.createChannel('peer-1')

    expect(await repo.renewChannel(created.shortSlug, 'not-the-secret')).toBe(
      false,
    )
    expect(await repo.renewChannel(created.shortSlug, created.secret!)).toBe(
      true,
    )
  })

  it('renews from the long slug too', async () => {
    const created = await repo.createChannel('peer-1')
    expect(await repo.renewChannel(created.longSlug, created.secret!)).toBe(
      true,
    )
  })

  it('destroys a channel from either slug, invalidating both', async () => {
    const created = await repo.createChannel('peer-1')

    await repo.destroyChannel(created.shortSlug)

    expect(await repo.fetchChannel(created.shortSlug)).toBeNull()
    expect(await repo.fetchChannel(created.longSlug)).toBeNull()
  })

  it('expires channels once the TTL elapses', async () => {
    vi.useFakeTimers()
    try {
      const created = await repo.createChannel('peer-1', 10)
      expect(await repo.fetchChannel(created.shortSlug)).not.toBeNull()

      vi.advanceTimersByTime(11_000)
      expect(await repo.fetchChannel(created.shortSlug)).toBeNull()
    } finally {
      vi.useRealTimers()
    }
  })
})

describe('slug generation', () => {
  it('builds short slugs from the configured alphabet', async () => {
    const slug = await generateShortSlug()
    expect(slug).toMatch(/^[0-9a-z]{8}$/)
  })

  it('builds long slugs of four toppings joined by slashes', async () => {
    const parts = (await generateLongSlug()).split('/')
    expect(parts).toHaveLength(4)
    for (const part of parts) {
      expect(part).toMatch(/^[a-z]+$/)
    }
  })
})
