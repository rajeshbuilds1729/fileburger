// `server-only` intentionally throws when it is imported outside a React
// Server Component graph. Vitest runs in plain node, so alias it to this
// no-op instead (see vitest.config.ts).
export {}
