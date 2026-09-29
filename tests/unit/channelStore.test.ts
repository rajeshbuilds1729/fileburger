import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('server-only', () => ({}))

const ENV_KEYS = [
  'REDIS_URL',
  'CHANNEL_STORE',
  'VERCEL',
  'AWS_LAMBDA_FUNCTION_NAME',
  'NETLIFY',
] as const

type GlobalScope = typeof globalThis & {
  __fileBurgerChannelRepo?: unknown
}

const scope = globalThis as GlobalScope

/** Fresh module graph so the memoised repo is rebuilt for each case. */
async function loadChannelModule() {
  vi.resetModules()
  return import('../../src/channel')
}

describe('channel store selection', () => {
  let saved: Record<string, string | undefined>

  beforeEach(() => {
    saved = {}
    for (const key of ENV_KEYS) {
      saved[key] = process.env[key]
      delete process.env[key]
    }
    scope.__fileBurgerChannelRepo = undefined
    vi.spyOn(console, 'log').mockImplementation(() => {})
    vi.spyOn(console, 'warn').mockImplementation(() => {})
  })

  afterEach(() => {
    for (const key of ENV_KEYS) {
      if (saved[key] === undefined) delete process.env[key]
      else process.env[key] = saved[key]
    }
    scope.__fileBurgerChannelRepo = undefined
    vi.restoreAllMocks()
  })

  it('memoises one repo per process', async () => {
    const { getOrCreateChannelRepo, MemoryChannelRepo } =
      await loadChannelModule()

    const first = getOrCreateChannelRepo()
    const second = getOrCreateChannelRepo()

    expect(first).toBe(second)
    expect(first).toBeInstanceOf(MemoryChannelRepo)
  })

  it('stays quiet about memory storage on a normal server', async () => {
    const { getOrCreateChannelRepo } = await loadChannelModule()
    getOrCreateChannelRepo()

    expect(console.warn).not.toHaveBeenCalled()
  })

  it('warns loudly on Vercel, where memory storage cannot work', async () => {
    process.env.VERCEL = '1'
    const { getOrCreateChannelRepo } = await loadChannelModule()
    getOrCreateChannelRepo()

    expect(console.warn).toHaveBeenCalledOnce()
    expect(vi.mocked(console.warn).mock.calls[0][0]).toMatch(
      /IN-MEMORY channel storage/,
    )
  })

  it('warns on Lambda and Netlify too', async () => {
    for (const key of ['AWS_LAMBDA_FUNCTION_NAME', 'NETLIFY'] as const) {
      scope.__fileBurgerChannelRepo = undefined
      vi.mocked(console.warn).mockClear()
      process.env[key] = 'x'
      const { getOrCreateChannelRepo } = await loadChannelModule()
      getOrCreateChannelRepo()
      expect(console.warn).toHaveBeenCalledOnce()
      delete process.env[key]
    }
  })

  it('CHANNEL_STORE=memory silences the warning', async () => {
    process.env.VERCEL = '1'
    process.env.CHANNEL_STORE = 'memory'
    const { getOrCreateChannelRepo } = await loadChannelModule()
    getOrCreateChannelRepo()

    expect(console.warn).not.toHaveBeenCalled()
  })

  it('fails fast when CHANNEL_STORE=redis but REDIS_URL is missing', async () => {
    process.env.CHANNEL_STORE = 'redis'
    const { getOrCreateChannelRepo } = await loadChannelModule()

    expect(() => getOrCreateChannelRepo()).toThrow(/REDIS_URL is not set/)
  })

  it('never returns a repo when CHANNEL_STORE=redis has no URL', async () => {
    process.env.CHANNEL_STORE = 'redis'
    const { getOrCreateChannelRepo } = await loadChannelModule()
    try {
      getOrCreateChannelRepo()
    } catch {
      // expected
    }
    expect(scope.__fileBurgerChannelRepo).toBeUndefined()
  })
})
