import path from 'node:path'
import { fileURLToPath } from 'node:url'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vitest/config'

const root = path.dirname(fileURLToPath(import.meta.url))

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: [
      // `server-only` throws outside RSC, which is exactly what vitest is.
      {
        find: /^server-only$/,
        replacement: path.resolve(root, 'tests/stubs/server-only.ts'),
      },
      // View-transition wrappers need a mounted App Router, which unit tests
      // do not have. The stub renders the same markup.
      {
        find: /^next-view-transitions$/,
        replacement: path.resolve(
          root,
          'tests/stubs/next-view-transitions.tsx',
        ),
      },
    ],
  },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: './vitest.setup.ts',
    exclude: ['tests/e2e/**', '**/node_modules/**'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html'],
    },
  },
})
