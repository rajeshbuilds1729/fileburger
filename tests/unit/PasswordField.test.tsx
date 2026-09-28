import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import PasswordField from '../../src/components/PasswordField'

describe('PasswordField', () => {
  it('labels the field as optional by default', () => {
    render(<PasswordField value="" onChange={vi.fn()} />)
    expect(screen.getByText('Password (optional)')).toBeInTheDocument()
  })

  it('drops "optional" when a password is required', () => {
    render(<PasswordField value="" onChange={vi.fn()} isRequired />)
    expect(screen.getByText('Password')).toBeInTheDocument()
  })

  it('forwards typed characters', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    render(<PasswordField value="" onChange={onChange} />)

    await user.type(screen.getByPlaceholderText(/secret sauce/i), 'x')

    expect(onChange).toHaveBeenCalledWith('x')
  })

  it('masks the input', () => {
    render(<PasswordField value="hunter2" onChange={vi.fn()} />)
    expect(screen.getByDisplayValue('hunter2')).toHaveAttribute(
      'type',
      'password',
    )
  })

  it('highlights the error state', () => {
    render(<PasswordField value="" onChange={vi.fn()} isInvalid />)
    expect(screen.getByText('Password (optional)').className).toContain(
      'text-sauce-500',
    )
  })
})
