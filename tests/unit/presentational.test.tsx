import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import { ErrorMessage } from '../../src/components/ErrorMessage'
import Footer from '../../src/components/Footer'
import InputLabel from '../../src/components/InputLabel'
import Loading from '../../src/components/Loading'
import ReturnHome from '../../src/components/ReturnHome'
import SubtitleText from '../../src/components/SubtitleText'
import TermsAcceptance from '../../src/components/TermsAcceptance'
import TitleText from '../../src/components/TitleText'
import TypeBadge from '../../src/components/TypeBadge'

describe('ErrorMessage', () => {
  it('is announced as an alert', () => {
    render(<ErrorMessage message="Could not connect" />)
    expect(screen.getByRole('alert')).toHaveTextContent('Could not connect')
  })
})

describe('Loading', () => {
  it('renders the status text', () => {
    render(<Loading text="Connecting to the kitchen..." />)
    expect(screen.getByText('Connecting to the kitchen...')).toBeInTheDocument()
  })
})

describe('TitleText / SubtitleText', () => {
  it('renders their children', () => {
    const { rerender } = render(<TitleText>Big</TitleText>)
    expect(screen.getByText('Big')).toBeInTheDocument()

    rerender(<SubtitleText>Small</SubtitleText>)
    expect(screen.getByText('Small')).toBeInTheDocument()
  })
})

describe('ReturnHome', () => {
  it('links back to the home page', () => {
    render(<ReturnHome />)
    expect(screen.getByRole('link')).toHaveAttribute('href', '/')
  })
})

describe('TypeBadge', () => {
  it('labels the mime type', () => {
    render(<TypeBadge type="image/png" />)
    expect(screen.getByText('image/png')).toBeInTheDocument()
  })

  it('handles an empty type without rendering nothing', () => {
    render(<TypeBadge type="" />)
    expect(screen.getByText('unknown')).toBeInTheDocument()
  })
})

describe('InputLabel', () => {
  it('renders children only when there is no tooltip', () => {
    render(<InputLabel>Password</InputLabel>)
    expect(screen.queryByRole('button')).not.toBeInTheDocument()
  })

  it('adds a tooltip trigger when given one', () => {
    render(<InputLabel tooltip="Extra info">Password</InputLabel>)
    expect(screen.getByRole('button', { name: 'Show tooltip' })).toBeInTheDocument()
    expect(screen.getByText('Extra info')).toBeInTheDocument()
  })
})

describe('TermsAcceptance', () => {
  it('opens and dismisses the policy dialog', async () => {
    const user = userEvent.setup()
    render(<TermsAcceptance />)

    await user.click(screen.getByRole('button', { name: /our terms/i }))
    const dialog = screen.getByRole('dialog')
    expect(dialog).toHaveTextContent('FileBurger Kitchen Policy')

    await user.click(screen.getByRole('button', { name: 'Got it!' }))
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })
})

describe('Footer', () => {
  it('credits the project it is based on', () => {
    render(<Footer />)
    expect(
      screen.getByRole('link', { name: 'FilePizza' }),
    ).toHaveAttribute('href', 'https://github.com/kern/filepizza')
  })
})
