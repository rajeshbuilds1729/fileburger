# Stage 1: Dependencies
FROM node:lts-alpine AS deps
RUN apk add --no-cache pnpm
WORKDIR /app
COPY package.json pnpm-lock.yaml* ./
RUN pnpm install --frozen-lockfile || pnpm install

# Stage 2: Builder
FROM node:lts-alpine AS builder
RUN apk add --no-cache pnpm
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN pnpm build

# Fail here rather than at container start if the standalone bundle is wrong.
RUN test -f .next/standalone/server.js \
 && test -d .next/standalone/public \
 && test -d .next/standalone/.next/static \
 && echo "standalone bundle looks complete"

# Stage 3: Runner
FROM node:lts-alpine AS runner
WORKDIR /app

ENV NODE_ENV production
ENV PORT 3000
# Docker sets HOSTNAME to the container ID, which is not a resolvable address.
# Next's standalone server binds to HOSTNAME, so it must be pinned to 0.0.0.0
# or the container crash-loops with getaddrinfo ENOTFOUND.
ENV HOSTNAME 0.0.0.0

# The standalone output already bundles public/ and .next/static; `pnpm build`
# copies both in via scripts/copy-standalone.mjs.
COPY --from=builder /app/.next/standalone ./

USER node
EXPOSE 3000
CMD ["node", "server.js"]
