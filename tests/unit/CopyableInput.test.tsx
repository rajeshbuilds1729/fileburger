import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { CopyableInput } from '../../src/components/CopyableInput'

describe('CopyableInput', () => {
  it('shows the value and is read only', () => {
    render(<CopyableInput label="Short URL" value="https://x.test/abcd" />)

    const input = screen.getByDisplayValue('https://x.test/abcd')
    expect(input).toHaveAttribute('readonly')
  })

  it('derives a stable id from the label', () => {
    render(<CopyableInput label="Long URL" value="v" />)
    expect(document.getElementById('copyable-input-long-url')).not.toBeNull()
  })

  it('copies to the clipboard and confirms', async () => {
    // userEvent.setup() installs its own clipboard stub, so spy after it.
    const user = userEvent.setup()
    const writeText = vi
      .spyOn(navigator.clipboard, 'writeText')
      .mockResolvedValue(undefined)

    render(<CopyableInput label="Short URL" value="https://x.test/abcd" />)

    await user.click(screen.getByRole('button', { name: 'Copy' }))

    expect(writeText).toHaveBeenCalledWith('https://x.test/abcd')
    await waitFor(() =>
      expect(
        screen.getByRole('button', { name: 'Copied' }),
      ).toBeInTheDocument(),
    )
  })
})
