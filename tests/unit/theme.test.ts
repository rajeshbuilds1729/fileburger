import { readFileSync, readdirSync, statSync } from 'node:fs'
import path from 'node:path'
import { describe, expect, it } from 'vitest'

const root = path.resolve(__dirname, '../..')
const srcDir = path.join(root, 'src')

function walk(dir: string): string[] {
  return readdirSync(dir).flatMap((entry) => {
    const full = path.join(dir, entry)
    return statSync(full).isDirectory()
      ? walk(full)
      : /\.(ts|tsx)$/.test(entry)
        ? [full]
        : []
  })
}

const STOCK_TAILWIND =
  /^(slate|gray|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose|black|white)$/

const SHADE = '(?:50|100|200|300|400|500|600|700|800|900|950)'
// A Tailwind utility is `<prefix>-<palette>-<shade>`, optionally with an
// opacity modifier such as `bg-crust-900/60`.
const UTILITY = new RegExp(
  String.raw`\b(?:bg|text|border|from|to|via|ring|fill|stroke|decoration|outline|shadow|accent|caret|divide|placeholder|decoration)-(([a-z]+)-${SHADE})(?:/\d+)?\b`,
  'g',
)

describe('theme colours', () => {
  it('defines every custom colour the components reach for', () => {
    const defined = new Set(
      [
        ...readFileSync(path.join(srcDir, 'styles.css'), 'utf8').matchAll(
          /--color-([a-z]+-\d+):/g,
        ),
      ].map((m) => m[1]),
    )

    const used = new Set<string>()
    const files = walk(srcDir)

    for (const file of files) {
      for (const [, token, palette] of readFileSync(file, 'utf8').matchAll(
        UTILITY,
      )) {
        if (!STOCK_TAILWIND.test(palette)) {
          used.add(token)
        }
      }
    }

    // Fails loudly if a class such as `bg-crust-900/60` is used but
    // `--color-crust-900` is missing from the `@theme` block: Tailwind drops
    // the rule silently and the element renders unstyled.
    expect([...used].filter((token) => !defined.has(token)).sort()).toEqual([])
    expect(used.size).toBeGreaterThan(0)
  })
})
