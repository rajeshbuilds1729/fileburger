import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import Downloader, {
  ConnectingToUploader,
  DownloadComplete,
  DownloadInProgress,
  PasswordEntry,
  ReadyToDownload,
} from '../../src/components/Downloader'

const useDownloaderMock = vi.fn()

vi.mock('../../src/hooks/useDownloader', () => ({
  useDownloader: () => useDownloaderMock(),
}))

const FILES = [
  { fileName: 'fries.png', size: 1000, type: 'image/png' },
  { fileName: 'shake.txt', size: 1000, type: 'text/plain' },
]

const baseResult = {
  filesInfo: null,
  isConnected: false,
  isPasswordRequired: false,
  isDownloading: false,
  isDone: false,
  errorMessage: null,
  submitPassword: vi.fn(),
  startDownload: vi.fn(),
  stopDownload: vi.fn(),
  totalSize: 0,
  bytesDownloaded: 0,
}

describe('Downloader states', () => {
  beforeEach(() => {
    useDownloaderMock.mockReset()
    useDownloaderMock.mockReturnValue({ ...baseResult })
  })

  it('shows the connecting state before anything is known', () => {
    render(<Downloader uploaderPeerID="peer-1" />)
    expect(screen.getByText('Connecting to the kitchen...')).toBeInTheDocument()
  })

  it('shows the password prompt when a password is required', () => {
    useDownloaderMock.mockReturnValue({
      ...baseResult,
      isPasswordRequired: true,
    })
    render(<Downloader uploaderPeerID="peer-1" />)
    expect(
      screen.getByText('This order needs the secret sauce.'),
    ).toBeInTheDocument()
  })

  it('prefers the error message over everything else', () => {
    useDownloaderMock.mockReturnValue({
      ...baseResult,
      errorMessage: 'Could not connect to the uploader.',
    })
    render(<Downloader uploaderPeerID="peer-1" />)
    expect(
      screen.getByText('Could not connect to the uploader.'),
    ).toBeInTheDocument()
  })

  it('offers the download once the file list arrives', async () => {
    const user = userEvent.setup()
    const startDownload = vi.fn()
    useDownloaderMock.mockReturnValue({
      ...baseResult,
      filesInfo: FILES,
      isConnected: true,
      startDownload,
    })
    render(<Downloader uploaderPeerID="peer-1" />)

    expect(
      screen.getByText('You are about to receive 2 files.'),
    ).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Eat now' }))
    expect(startDownload).toHaveBeenCalledOnce()
  })

  it('shows progress while transferring and can be stopped', async () => {
    const user = userEvent.setup()
    const stopDownload = vi.fn()
    useDownloaderMock.mockReturnValue({
      ...baseResult,
      filesInfo: FILES,
      isConnected: true,
      isDownloading: true,
      bytesDownloaded: 1000,
      totalSize: 2000,
      stopDownload,
    })
    render(<Downloader uploaderPeerID="peer-1" />)

    expect(screen.getAllByText('50%')).toHaveLength(2)

    await user.click(screen.getByRole('button', { name: /Stop Download/ }))
    expect(stopDownload).toHaveBeenCalledOnce()
  })

  it('celebrates a completed transfer', () => {
    useDownloaderMock.mockReturnValue({
      ...baseResult,
      filesInfo: FILES,
      isConnected: true,
      isDone: true,
      bytesDownloaded: 2000,
      totalSize: 2000,
    })
    render(<Downloader uploaderPeerID="peer-1" />)
    expect(screen.getByText('Enjoy! You received 2 files.')).toBeInTheDocument()
  })
})

describe('ConnectingToUploader', () => {
  it('reveals troubleshooting only after the delay', async () => {
    vi.useFakeTimers()
    try {
      const { rerender } = render(
        <ConnectingToUploader showTroubleshootingAfter={1000} />,
      )
      expect(
        screen.queryByText('Order taking a while?'),
      ).not.toBeInTheDocument()

      await vi.advanceTimersByTimeAsync(1000)
      rerender(<ConnectingToUploader showTroubleshootingAfter={1000} />)
      expect(screen.getByText('Order taking a while?')).toBeInTheDocument()
    } finally {
      vi.useRealTimers()
    }
  })
})

describe('PasswordEntry', () => {
  it('submits the typed password', async () => {
    const user = userEvent.setup()
    const onSubmit = vi.fn()
    render(<PasswordEntry onSubmit={onSubmit} errorMessage={null} />)

    await user.type(screen.getByPlaceholderText(/secret sauce/i), 'hot')
    await user.click(screen.getByRole('button', { name: 'Unlock' }))

    expect(onSubmit).toHaveBeenCalledWith('hot')
  })

  it('surfaces a rejected password', () => {
    render(<PasswordEntry onSubmit={vi.fn()} errorMessage="Invalid password" />)
    expect(screen.getByText('Invalid password')).toBeInTheDocument()
  })
})

describe('subcomponent copy', () => {
  it('pluralises the file count', () => {
    const { rerender } = render(
      <ReadyToDownload filesInfo={[FILES[0]]} onStart={vi.fn()} />,
    )
    expect(
      screen.getByText('You are about to receive 1 file.'),
    ).toBeInTheDocument()

    rerender(
      <DownloadInProgress
        filesInfo={FILES}
        bytesDownloaded={0}
        totalSize={2000}
        onStop={vi.fn()}
      />,
    )
    expect(screen.getByText('Digging into 2 files.')).toBeInTheDocument()
  })

  it('confirms what was received', () => {
    render(
      <DownloadComplete
        filesInfo={FILES}
        bytesDownloaded={2000}
        totalSize={2000}
      />,
    )
    expect(screen.getByText('Enjoy! You received 2 files.')).toBeInTheDocument()
  })
})
