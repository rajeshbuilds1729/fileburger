import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import ProgressBar from '../../src/components/ProgressBar'

describe('ProgressBar', () => {
  it('renders the percentage over the fill', () => {
    render(<ProgressBar value={25} max={100} />)
    // Once in dark ink behind the fill, once in white on top of it.
    expect(screen.getAllByText('25%')).toHaveLength(2)
  })

  it('sizes the fill to the ratio', () => {
    render(<ProgressBar value={30} max={60} />)
    const fill = document.getElementById('progress-bar-fill')!
    expect(fill).toHaveStyle({ width: '50%' })
  })

  it('switches to the done colours at 100%', () => {
    const { rerender } = render(<ProgressBar value={99} max={100} />)
    expect(document.getElementById('progress-bar-fill')!.className).toContain(
      'from-bun-400',
    )

    rerender(<ProgressBar value={100} max={100} />)
    expect(document.getElementById('progress-bar-fill')!.className).toContain(
      'from-lettuce-400',
    )
  })

  it('clamps out-of-range values instead of overflowing', () => {
    render(<ProgressBar value={150} max={100} />)
    expect(document.getElementById('progress-bar-fill')!).toHaveStyle({
      width: '100%',
    })
  })

  it('does not divide by zero when the total is unknown', () => {
    render(<ProgressBar value={0} max={0} />)
    expect(screen.getAllByText('0%')).toHaveLength(2)
  })
})
