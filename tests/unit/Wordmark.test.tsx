import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import Wordmark from '../../src/components/Wordmark'

describe('Wordmark', () => {
  it('is exposed to assistive tech as the FileBurger logo', () => {
    render(<Wordmark />)
    expect(
      screen.getByRole('img', { name: 'FileBurger logo' }),
    ).toBeInTheDocument()
  })

  it('draws on a 100-unit cap height', () => {
    const { container } = render(<Wordmark />)
    const [, , , height] = container
      .querySelector('svg')!
      .getAttribute('viewBox')!
      .split(' ')
      .map(Number)

    expect(height).toBe(100)
  })

  it('keeps every glyph inside the viewBox', () => {
    const { container } = render(<Wordmark />)
    const svg = container.querySelector('svg')!
    const width = Number(svg.getAttribute('viewBox')!.split(' ')[2])

    for (const rect of svg.querySelectorAll('rect')) {
      const x = Number(rect.getAttribute('x'))
      const w = Number(rect.getAttribute('width'))
      expect(x).toBeGreaterThanOrEqual(0)
      expect(x + w).toBeLessThanOrEqual(width)
    }
  })

  it('lays glyphs out left to right with no overlaps', () => {
    const { container } = render(<Wordmark />)
    const offsets = Array.from(
      container.querySelectorAll('path[transform]'),
      (p) => Number(p.getAttribute('transform')!.match(/-?\d+/)![0]),
    )

    // B, U, R, G and the trailing R are paths; the rest are rect runs.
    expect(offsets.length).toBe(5)
    for (let i = 1; i < offsets.length; i++) {
      expect(offsets[i]).toBeGreaterThan(offsets[i - 1])
    }
  })

  it('inherits the colour so it inverts in dark mode', () => {
    const { container } = render(<Wordmark />)
    const svg = container.querySelector('svg')!

    expect(svg.getAttribute('fill')).toBe('currentColor')
    expect(svg.getAttribute('class')).toContain('dark:invert')
  })
})
