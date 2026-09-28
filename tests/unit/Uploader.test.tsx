import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { beforeEach, describe, expect, it, vi } from 'vitest'

const fetchMock = vi.fn()
const peerConnect = vi.fn()

vi.stubGlobal('fetch', fetchMock)

const useUploaderConnectionsMock = vi.fn(() => [] as never[])

vi.mock('../../src/hooks/useUploaderChannel', () => ({
  useUploaderChannel: () => ({
    isLoading: false,
    error: null,
    longSlug: 'bacon/lettuce/tomato/mustard',
    shortSlug: 'abcd1234',
    longURL: 'https://fb.test/download/bacon/lettuce/tomato/mustard',
    shortURL: 'https://fb.test/download/abcd1234',
  }),
}))

vi.mock('../../src/hooks/useUploaderConnections', () => ({
  MAX_CHUNK_SIZE: 256 * 1024,
  isFinalChunk: () => true,
  useUploaderConnections: () => useUploaderConnectionsMock(),
}))

vi.mock('../../src/hooks/useRotatingSpinner', () => ({
  setRotating: vi.fn(),
  useRotatingSpinner: () => false,
  getRotating: () => false,
  addRotationListener: vi.fn(),
  removeRotationListener: vi.fn(),
}))

const stop = vi.fn()
const peer = { id: 'peer-1', connect: peerConnect }

vi.mock('../../src/components/WebRTCProvider', () => ({
  default: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  useWebRTCPeer: () => ({ peer, stop }),
}))

import Uploader from '../../src/components/Uploader'
import ReportTermsViolationButton from '../../src/components/ReportTermsViolationButton'

const withQueryClient = (ui: React.ReactNode) => (
  <QueryClientProvider
    client={new QueryClient({ defaultOptions: { mutations: { retry: false } } })}
  >
    {ui}
  </QueryClientProvider>
)

describe('Uploader', () => {
  beforeEach(() => {
    useUploaderConnectionsMock.mockReset()
    useUploaderConnectionsMock.mockReturnValue([])
    stop.mockReset()
  })

  it('shows both share links', () => {
    render(<Uploader files={[]} password="" onStop={vi.fn()} />)

    expect(
      screen.getByDisplayValue('https://fb.test/download/abcd1234'),
    ).toBeInTheDocument()
    expect(
      screen.getByDisplayValue(
        'https://fb.test/download/bacon/lettuce/tomato/mustard',
      ),
    ).toBeInTheDocument()
  })

  it('tears the peer down when the upload is stopped', async () => {
    const user = userEvent.setup()
    const onStop = vi.fn()
    render(<Uploader files={[]} password="" onStop={onStop} />)

    await user.click(screen.getByRole('button', { name: /Stop Serving/ }))

    expect(stop).toHaveBeenCalledOnce()
    expect(onStop).toHaveBeenCalledOnce()
  })

  it('renders one row per connected downloader', () => {
    useUploaderConnectionsMock.mockReturnValue([
      {
        status: 'UPLOADING',
        dataConnection: {},
        browserName: 'Safari',
        browserVersion: '17',
        completedFiles: 1,
        totalFiles: 3,
        currentFileProgress: 0.5,
        uploadingFileName: 'menu.pdf',
      },
    ] as never[])

    render(<Uploader files={[]} password="" onStop={vi.fn()} />)

    expect(screen.getByText('1 Eating, 1 Total')).toBeInTheDocument()
    expect(screen.getByText('Completed: 1 / 3 files')).toBeInTheDocument()
    expect(screen.getByText('Current file: 50%')).toBeInTheDocument()
  })
})

describe('ReportTermsViolationButton', () => {
  beforeEach(() => {
    fetchMock.mockReset()
    fetchMock.mockResolvedValue({ ok: true, json: async () => ({}) })
    peerConnect.mockReset()
    delete (window as unknown as Record<string, unknown>).location
    ;(window as unknown as Record<string, unknown>).location = { href: '' }
  })

  it('destroys the channel and redirects after confirming', async () => {
    const user = userEvent.setup()
    const connection = { on: vi.fn(), close: vi.fn() }
    peerConnect.mockReturnValue(connection)

    render(
      withQueryClient(
        <ReportTermsViolationButton
          uploaderPeerID="peer-1"
          slug="abcd1234"
        />,
      ),
    )

    await user.click(
      screen.getByRole('button', { name: /suspicious order/i }),
    )
    await user.click(screen.getByRole('button', { name: 'Report' }))

    expect(fetchMock).toHaveBeenCalledWith(
      '/api/destroy',
      expect.objectContaining({ method: 'POST' }),
    )
    expect(peerConnect).toHaveBeenCalledWith('peer-1', {
      metadata: { type: 'report' },
    })

    // The uploader answers on `open`, which triggers the hard redirect.
    const openHandler = connection.on.mock.calls.find(
      ([event]) => event === 'open',
    )?.[1]
    expect(openHandler).toBeTypeOf('function')
    openHandler()
    expect(connection.close).toHaveBeenCalled()
    await waitFor(() => expect(window.location.href).toBe('/reported'))
  })

  it('only opens the dialog on the first click', async () => {
    const user = userEvent.setup()
    render(
      withQueryClient(
        <ReportTermsViolationButton
          uploaderPeerID="peer-1"
          slug="abcd1234"
        />,
      ),
    )

    await user.click(
      screen.getByRole('button', { name: /suspicious order/i }),
    )

    expect(screen.getByRole('dialog')).toBeInTheDocument()
    expect(fetchMock).not.toHaveBeenCalled()
  })
})
