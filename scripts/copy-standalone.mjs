#!/usr/bin/env node
/**
 * Copies `public/` and the static build output into `.next/standalone` so the
 * standalone server can serve them. Written in Node so `pnpm build` works the
 * same on Windows, macOS and Linux.
 */
import { cp, mkdir, access } from 'node:fs/promises'
import { constants } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const standalone = path.join(root, '.next', 'standalone')

const exists = async (p) => {
  try {
    await access(p, constants.F_OK)
    return true
  } catch {
    return false
  }
}

if (!(await exists(standalone))) {
  console.error(
    'copy-standalone: .next/standalone not found. Did `next build` run?',
  )
  process.exit(1)
}

const copies = [
  [path.join(root, 'public'), path.join(standalone, 'public')],
  [
    path.join(root, '.next', 'static'),
    path.join(standalone, '.next', 'static'),
  ],
]

for (const [from, to] of copies) {
  if (!(await exists(from))) {
    console.warn(`copy-standalone: skipping missing ${path.relative(root, from)}`)
    continue
  }
  await mkdir(path.dirname(to), { recursive: true })
  await cp(from, to, { recursive: true })
  console.log(`copy-standalone: ${path.relative(root, from)} -> ${path.relative(root, to)}`)
}
