import { act, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'
import Spinner from '../../src/components/Spinner'
import { setRotating } from '../../src/hooks/useRotatingSpinner'

describe('Spinner', () => {
  afterEach(() => setRotating(false))

  it('shows an idle burger when nothing is transferring', () => {
    render(<Spinner direction="up" />)
    expect(screen.getByRole('img', { name: 'Burger' })).toBeInTheDocument()
  })

  it('points the arrow up while serving', () => {
    render(<Spinner direction="up" />)
    expect(
      screen.getByRole('img', { name: 'Arrow pointing up' }),
    ).toBeInTheDocument()
  })

  it('points the arrow down while downloading', () => {
    render(<Spinner direction="down" />)
    expect(
      screen.getByRole('img', { name: 'Arrow pointing down' }),
    ).toBeInTheDocument()
  })

  it('spins the burger only while bytes are moving', () => {
    const { container } = render(<Spinner direction="up" />)
    const svg = container.querySelector('svg[aria-label="Burger"]')!

    expect(svg.getAttribute('class') ?? '').not.toContain('animate-spin-slow')

    act(() => setRotating(true))
    expect(svg.getAttribute('class')).toContain('animate-spin-slow')

    act(() => setRotating(false))
    expect(svg.getAttribute('class') ?? '').not.toContain('animate-spin-slow')
  })
})
