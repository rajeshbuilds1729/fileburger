import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import AddFilesButton from '../../src/components/AddFilesButton'
import CancelButton from '../../src/components/CancelButton'
import DownloadButton from '../../src/components/DownloadButton'
import StartButton from '../../src/components/StartButton'
import StopButton from '../../src/components/StopButton'
import UnlockButton from '../../src/components/UnlockButton'

describe('StartButton', () => {
  it('starts the upload', async () => {
    const user = userEvent.setup()
    const onClick = vi.fn()
    render(<StartButton onClick={onClick} />)

    await user.click(screen.getByRole('button', { name: 'Start serving' }))

    expect(onClick).toHaveBeenCalledOnce()
  })
})

describe('CancelButton', () => {
  it('defaults to "Cancel" and accepts an override', async () => {
    const user = userEvent.setup()
    const onClick = vi.fn()
    const { rerender } = render(<CancelButton onClick={onClick} />)

    await user.click(screen.getByRole('button', { name: 'Cancel' }))
    expect(onClick).toHaveBeenCalledOnce()

    rerender(<CancelButton onClick={onClick} text="Got it!" />)
    await user.click(screen.getByRole('button', { name: 'Got it!' }))
    expect(onClick).toHaveBeenCalledTimes(2)
  })
})

describe('DownloadButton', () => {
  it('starts the download', async () => {
    const user = userEvent.setup()
    const onClick = vi.fn()
    render(<DownloadButton onClick={onClick} />)

    await user.click(screen.getByRole('button', { name: 'Eat now' }))

    expect(onClick).toHaveBeenCalledOnce()
  })
})

describe('UnlockButton', () => {
  it('submits the password', async () => {
    const user = userEvent.setup()
    const onClick = vi.fn()
    render(<UnlockButton onClick={onClick} />)

    await user.click(screen.getByRole('button', { name: 'Unlock' }))

    expect(onClick).toHaveBeenCalledOnce()
  })
})

describe('StopButton', () => {
  it('says it stops the upload by default', () => {
    render(<StopButton onClick={vi.fn()} />)
    expect(screen.getByRole('button')).toHaveTextContent('Stop Serving')
  })

  it('says it stops the download when downloading', () => {
    render(<StopButton onClick={vi.fn()} isDownloading />)
    expect(screen.getByRole('button')).toHaveTextContent('Stop Download')
  })
})

describe('AddFilesButton', () => {
  it('adds newly chosen files and resets the input', async () => {
    const onAdd = vi.fn()
    render(<AddFilesButton onAdd={onAdd} />)

    const input = document.getElementById(
      'add-files-input',
    ) as HTMLInputElement
    const file = new File(['x'], 'extra.txt')
    Object.defineProperty(input, 'files', { value: [file], configurable: true })

    input.dispatchEvent(new Event('change', { bubbles: true }))

    expect(onAdd).toHaveBeenCalledWith([file])
    expect(input.value).toBe('')
  })
})
