import { JSX } from 'react'

/**
 * The FileBurger logotype.
 *
 * Rather than shipping a binary logo, the wordmark is built from a small
 * geometric glyph set on a 100-unit cap height with a 26-unit stem. Every
 * glyph is emitted as plain shapes, so it inherits `currentColor` and inverts
 * cleanly in dark mode.
 */

const TRACKING = 14

type Shape =
  | { kind: 'rect'; x: number; y: number; w: number; h: number }
  | { kind: 'path'; d: string; evenOdd?: boolean }

type Glyph = { width: number; shapes: Shape[] }

const GLYPHS: Record<string, Glyph> = {
  F: {
    width: 62,
    shapes: [
      { kind: 'rect', x: 0, y: 0, w: 26, h: 100 },
      { kind: 'rect', x: 0, y: 0, w: 62, h: 26 },
      { kind: 'rect', x: 0, y: 37, w: 56, h: 26 },
    ],
  },
  I: {
    width: 26,
    shapes: [{ kind: 'rect', x: 0, y: 0, w: 26, h: 100 }],
  },
  L: {
    width: 56,
    shapes: [
      { kind: 'rect', x: 0, y: 0, w: 26, h: 100 },
      { kind: 'rect', x: 0, y: 74, w: 56, h: 26 },
    ],
  },
  E: {
    width: 58,
    shapes: [
      { kind: 'rect', x: 0, y: 0, w: 26, h: 100 },
      { kind: 'rect', x: 0, y: 0, w: 58, h: 26 },
      { kind: 'rect', x: 0, y: 37, w: 54, h: 26 },
      { kind: 'rect', x: 0, y: 74, w: 58, h: 26 },
    ],
  },
  B: {
    width: 62,
    shapes: [
      {
        kind: 'path',
        evenOdd: true,
        d: 'M0 0 H30 C48 0 60 11 60 26 C60 36 55 43 47 47 C57 51 62 60 62 71 C62 87 50 100 30 100 H0 Z M26 25 H32 A8 8 0 0 1 32 41 H26 Z M26 58 H32 A9 9 0 0 1 32 76 H26 Z',
      },
    ],
  },
  U: {
    width: 70,
    shapes: [
      {
        kind: 'path',
        d: 'M0 0 H26 V64 A9 9 0 0 0 44 64 V0 H70 V64 A35 35 0 0 1 0 64 Z',
      },
    ],
  },
  R: {
    width: 64,
    shapes: [
      {
        kind: 'path',
        evenOdd: true,
        d: 'M0 0 H30 C48 0 60 11 60 26 C60 41 47 52 30 52 H26 V100 H0 Z M26 52 H50 L64 100 H38 Z M26 25 H32 A8 8 0 0 1 32 41 H26 Z',
      },
    ],
  },
  G: {
    width: 66,
    shapes: [
      // Ring with a gap on the right. The upper terminal runs all the way down
      // to the crossbar so the counter never looks like a floating hole.
      {
        kind: 'path',
        d: 'M71.2 39.6 A36 50 0 1 0 65.5 78.7 L44.2 63.8 A10 24 0 1 1 45.8 45 Z',
      },
      // Crossbar. Drawn as its own shape so the union never punches a hole.
      { kind: 'rect', x: 41, y: 45, w: 25, h: 25 },
    ],
  },
}

const WORD = 'FILEBURGER'

function renderShape(shape: Shape, offsetX: number, key: string): JSX.Element {
  if (shape.kind === 'rect') {
    return (
      <rect
        key={key}
        x={shape.x + offsetX}
        y={shape.y}
        width={shape.w}
        height={shape.h}
      />
    )
  }

  return (
    <path
      key={key}
      d={shape.d}
      transform={`translate(${offsetX} 0)`}
      fillRule={shape.evenOdd ? 'evenodd' : 'nonzero'}
    />
  )
}

export default function Wordmark(): JSX.Element {
  let cursor = 0

  const nodes = WORD.split('').flatMap((char, index) => {
    const glyph = GLYPHS[char]
    if (!glyph) {
      return []
    }
    const offsetX = cursor
    cursor += glyph.width + TRACKING
    return glyph.shapes.map((shape, shapeIndex) =>
      renderShape(shape, offsetX, `${index}-${shapeIndex}`),
    )
  })

  const width = cursor - TRACKING

  return (
    <svg
      viewBox={`0 0 ${width} 100`}
      width={width}
      height={100}
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
      className="h-10 w-auto sm:h-12 text-bun-600 dark:brightness-0 dark:invert"
      role="img"
      aria-label="FileBurger logo"
    >
      {nodes}
    </svg>
  )
}
