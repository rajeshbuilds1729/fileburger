import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import DropZone from '../../src/components/DropZone'

/** A DataTransfer stand-in whose items expose the legacy entry API. */
function dataTransfer(files: File[]) {
  return {
    items: files.map((file) => ({
      webkitGetAsEntry: () => ({
        isDirectory: false,
        fullPath: `/${file.name}`,
        file: (cb: (f: File) => void) => cb(file),
      }),
    })),
    files,
    dropEffect: 'none',
  }
}

describe('DropZone', () => {
  it('opens the picker when the button is pressed', async () => {
    const user = userEvent.setup()
    const clickSpy = vi.spyOn(HTMLInputElement.prototype, 'click')
    render(<DropZone onDrop={vi.fn()} />)

    await user.click(screen.getByRole('button'))

    expect(clickSpy).toHaveBeenCalled()
    clickSpy.mockRestore()
  })

  it('reveals the overlay while a drag is over the page', () => {
    const { container } = render(<DropZone onDrop={vi.fn()} />)
    const overlay = container.querySelector('.fixed')!

    expect(overlay.className).toContain('invisible')

    fireEvent.dragEnter(window, { dataTransfer: dataTransfer([]) })

    expect(overlay.className).toContain('visible')
    expect(overlay).toHaveTextContent('Drop to add 0 items')

    fireEvent.dragLeave(window, { dataTransfer: dataTransfer([]) })
    expect(overlay.className).toContain('invisible')
  })

  it('pluralises the drag counter', () => {
    const { container } = render(<DropZone onDrop={vi.fn()} />)
    fireEvent.dragEnter(window, {
      dataTransfer: dataTransfer([
        new File(['a'], 'a.txt'),
        new File(['b'], 'b.txt'),
      ]),
    })

    expect(container.querySelector('.fixed')).toHaveTextContent(
      'Drop to add 2 items',
    )
  })

  it('passes dropped files up to the caller', async () => {
    const onDrop = vi.fn()
    render(<DropZone onDrop={onDrop} />)
    const file = new File(['hello'], 'hello.txt')

    fireEvent.drop(window, { dataTransfer: dataTransfer([file]) })

    await waitFor(() => expect(onDrop).toHaveBeenCalled())
    expect(onDrop.mock.calls[0][0][0]).toBeInstanceOf(File)
  })

  it('prevents the browser from opening the dropped file', () => {
    render(<DropZone onDrop={vi.fn()} />)

    const drop = fireEvent.drop(window, { dataTransfer: dataTransfer([]) })

    expect(drop).toBe(false) // fireEvent returns false when preventDefault ran
  })

  it('accepts files chosen through the picker', async () => {
    const user = userEvent.setup()
    const onDrop = vi.fn()
    render(<DropZone onDrop={onDrop} />)

    const input = document.querySelector(
      'input[type="file"]',
    ) as HTMLInputElement
    await user.upload(input, new File(['x'], 'picked.txt'))

    expect(onDrop).toHaveBeenCalled()
    expect(onDrop.mock.calls[0][0][0].name).toBe('picked.txt')
  })
})
