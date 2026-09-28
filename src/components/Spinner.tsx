'use client'

import React, { JSX } from 'react'
import { useRotatingSpinner } from '../hooks/useRotatingSpinner'

/** Palette shared with the logotype and the drop zone. */
const CRUST = '#3A2415'
const BUN = '#E2A24E'
const BUN_HI = '#F0BC77'
const SEED = '#FBEBCB'
const LETTUCE = '#7CB342'
const TOMATO = '#D8402F'
const CHEESE = '#F5C242'
const PATTY = '#7A4526'

const SEEDS: Array<[number, number, number]> = [
  [104, 60, -28],
  [139, 47, 8],
  [177, 52, 22],
  [209, 70, 34],
  [86, 82, -40],
  [126, 76, -10],
  [166, 78, 12],
]

/**
 * The hero illustration. It idles still and starts turning slowly the moment
 * bytes are actually moving.
 */
function Burger({ isRotating }: { isRotating?: boolean }): JSX.Element {
  return (
    <svg
      viewBox="0 0 300 250"
      width="300"
      height="250"
      fill="none"
      className={isRotating ? 'animate-spin-slow' : ''}
      style={{ viewTransitionName: 'burger' }}
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label={isRotating ? 'Rotating burger' : 'Burger'}
    >
      {/* Top bun */}
      <path
        d="M60 93 C60 52 100 25 150 25 C200 25 240 52 240 93 Z"
        fill={BUN}
        stroke={CRUST}
        strokeWidth="6"
        strokeLinejoin="round"
      />
      <path
        d="M78 78 C86 58 104 46 124 40"
        stroke={BUN_HI}
        strokeWidth="7"
        strokeLinecap="round"
        opacity="0.7"
      />

      {/* Sesame seeds */}
      {SEEDS.map(([cx, cy, rot], i) => (
        <ellipse
          key={i}
          cx={cx}
          cy={cy}
          rx="5"
          ry="8.5"
          transform={`rotate(${rot} ${cx} ${cy})`}
          fill={SEED}
          stroke={CRUST}
          strokeWidth="2.5"
        />
      ))}

      {/* Lettuce */}
      <path
        d="M50 97 Q74 81 98 97 Q122 81 146 97 Q170 81 194 97 Q218 81 242 97 L242 113 Q218 129 194 113 Q170 129 146 113 Q122 129 98 113 Q74 129 50 113 Z"
        fill={LETTUCE}
        stroke={CRUST}
        strokeWidth="5"
        strokeLinejoin="round"
      />

      {/* Tomato */}
      <rect
        x="62"
        y="117"
        width="176"
        height="21"
        rx="10.5"
        fill={TOMATO}
        stroke={CRUST}
        strokeWidth="5"
      />

      {/* Cheese with drips */}
      <path
        d="M56 131 H244 V145 L226 145 L216 168 L200 145 H152 L144 164 L128 145 H56 Z"
        fill={CHEESE}
        stroke={CRUST}
        strokeWidth="5"
        strokeLinejoin="round"
      />

      {/* Patty */}
      <rect
        x="62"
        y="149"
        width="176"
        height="33"
        rx="16.5"
        fill={PATTY}
        stroke={CRUST}
        strokeWidth="5"
      />

      {/* Bottom bun */}
      <path
        d="M64 177 H236 V187 C236 203 218 215 198 215 H102 C82 215 64 203 64 187 Z"
        fill={BUN}
        stroke={CRUST}
        strokeWidth="6"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function Arrow({ direction }: { direction: 'up' | 'down' }): JSX.Element {
  return (
    <svg
      viewBox="0 0 100 150"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      height="88"
      className={
        direction === 'down'
          ? 'rotate-180 transition-transform duration-150'
          : 'transition-transform duration-150'
      }
      role="img"
      aria-label={`Arrow pointing ${direction}`}
      style={{ viewTransitionName: 'arrow-direction' }}
    >
      <path
        d="M50 12 L94 64 H70 V138 H30 V64 H6 Z"
        fill="white"
        stroke={CRUST}
        strokeWidth="6"
        strokeLinejoin="round"
      />
    </svg>
  )
}

export default function Spinner({
  direction,
}: {
  direction: 'up' | 'down'
}): JSX.Element {
  const isRotating = useRotatingSpinner()

  return (
    <div className="relative w-[300px] h-[250px] shrink-0">
      <Burger isRotating={isRotating} />
      <div className="absolute inset-0 flex items-center justify-center">
        <Arrow direction={direction} />
      </div>
    </div>
  )
}
