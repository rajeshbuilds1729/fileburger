# FileBurger

### Peer-to-peer file transfers in your browser, with extra sauce.

Drop a file, get a link, send it. The file moves **straight from your browser
to theirs** over a WebRTC data channel — it never touches a FileBurger server,
so there is no upload step, no size limit, and nothing to delete afterwards.

> FileBurger is a burger-themed homage to
> [FilePizza](https://file.pizza) by [Alex Kern](http://kern.io) and
> [Neeraj Baid](https://github.com/neerajbaid). See
> [License](#license--acknowledgements).

## Features

- **No upload step.** The file is read from disk and pushed down the data
  channel as chunks arrive.
- **No server storage.** The server only ever knows that a peer ID maps to a
  slug, and that mapping expires after an hour.
- **Multiple files at once**, zipped on the fly into a single download.
- **Optional password** per order. (WebRTC already encrypts with DTLS; the
  password gates *access*, it is not what encrypts the bytes.)
- **QR code** for your order, so the person across the table can scan it.
- **Live progress**, per downloader, for the uploader.
- **Streaming writes to disk** via a Service Worker, so memory stays flat no
  matter how big the file is.
- **Light and dark mode**, burger-themed.

## Getting started

```bash
git clone <this repo> file-burger
cd file-burger
pnpm install
pnpm dev
```

Open <http://localhost:3000>.

## Commands

| Command | What it does |
| --- | --- |
| `pnpm dev` | Start the dev server |
| `pnpm build` | Production build (standalone output) |
| `pnpm start` | Serve the production build |
| `pnpm start:peerjs` | Self-hosted PeerJS signalling server on `:9000` |
| `pnpm test` | Unit tests (Vitest) |
| `pnpm test:watch` | Unit tests in watch mode |
| `pnpm type:check` | `tsc --noEmit` |
| `pnpm lint:check` / `lint:fix` | ESLint |
| `pnpm format` / `format:check` | Prettier |
| `pnpm verify` | Lint + format + types + tests + build |
| `pnpm docker:build` / `docker:up` / `docker:down` | Docker |

`pnpm verify` is the one to run before opening a PR.

## Docker

```bash
pnpm docker:build
pnpm docker:up      # app on :8080, redis, coturn
pnpm docker:logs
pnpm docker:down
```

The compose file runs Redis for channel storage and a coturn container for
peers behind symmetric NAT. The app itself is a standalone Node server.

## Configuration

All optional.

| Variable | Default | Purpose |
| --- | --- | --- |
| `REDIS_URL` | _(unset)_ | Channel storage. Unset ⇒ in-memory, single process only. |
| `CHANNEL_STORE` | _(unset)_ | `memory` silences the serverless warning; `redis` fails fast if `REDIS_URL` is unset. |
| `COTURN_ENABLED` | _(unset)_ | Set to `true` to hand out ephemeral TURN credentials. |
| `TURN_HOST` | `127.0.0.1` | Hostname/IP of the coturn server. |
| `TURN_REALM` | `file.burger` | Realm used when deriving TURN credentials. |
| `STUN_SERVER` | `stun:stun.l.google.com:19302` | Used when TURN is off. |
| `PEERJS_HOST` | `0.peerjs.com` | Signalling host. Point at your own with `start:peerjs`. |
| `PEERJS_PATH` | `/` | Signalling path. |
| `PORT` | `3000` | HTTP port. |
| `HOSTNAME` | `0.0.0.0` | Bind address. **Pin this in containers** — Docker sets it to the container ID and Next's standalone server will crash-loop. |
| `NEXT_PUBLIC_SITE_URL` | `https://file.burger` | Used for Open Graph URLs. Inlined at build time. |

If you change the slug alphabet or topping list, also update
`tests/unit/channel.test.ts`, which asserts the generated shapes.

## Architecture

```
uploader ──WebRTC data channel──> downloader
   │                                │
   └── POST /api/create ──> server <┘  (slug ⇄ peer ID, nothing else)
```

1. The uploader's browser asks `POST /api/create` for a channel and gets back a
   short slug (`a1b2c3d4`) and a long one (`bacon/lettuce/tomato/mustard`).
2. A downloader opens `/download/<slug>`; the server resolves the slug to the
   uploader's PeerJS ID and hands it to the client.
3. The two browsers connect directly and exchange the protocol described in
   [`docs/transfer-protocol.md`](docs/transfer-protocol.md).

The server is a directory, not a storage backend. It holds `slug → peer ID`
in Redis (or memory) with a one-hour TTL, and that is the whole of it.

### Layout

```
src/
├── app/            # Next.js App Router pages and API routes
│   ├── api/        # create, renew, destroy, ice
│   ├── download/   # /download/[...slug]
│   └── reported/   # order-called-off page
├── components/     # React components
├── hooks/          # useUploaderChannel, useUploaderConnections, useDownloader
├── utils/          # streaming download helpers
├── channel.ts      # channel repository (memory or Redis)
├── messages.ts     # zod schemas for the wire protocol
├── slugs.ts        # short + long slug generation
└── toppings.ts     # the burger topping word list
```

## How the transfer works

Files are sliced into 256 KiB chunks. The uploader sends a chunk, the
downloader acknowledges it, and the uploader sends the next one. Progress is
measured from acknowledgements, not sends, so the bar reflects bytes that have
actually landed.

Incoming chunks are pushed into a `ReadableStream` per file, which
[StreamSaver](https://github.com/jimmywarting/StreamSaver.js) writes straight
to disk through a Service Worker. Nothing is buffered in memory, so the only
real limit is the downloader's free disk space.

Pause, resume, multiple simultaneous downloaders, and password challenges are
all part of the protocol. `docs/transfer-protocol.md` has the details.

## Testing

```bash
pnpm test
```

95 unit tests covering the slug and channel repository, the wire-protocol
schemas, chunk-boundary maths, API input handling, and every component.
`tests/stubs/` holds the two modules that cannot load outside their normal
host: `server-only` (throws by design) and `next-view-transitions` (needs a
mounted App Router).

## Deploying

See [DEPLOY.md](DEPLOY.md) for Docker Compose, PaaS, Vercel, and plain-Node
options, the TURN and HTTPS requirements, and a troubleshooting table.

Two things to know before you pick a target:

- **HTTPS is mandatory.** Downloads are streamed to disk through a Service
  Worker, which will not register outside a secure context.
- **TURN is what makes it work for real users.** STUN alone fails for anyone
  behind symmetric NAT. Check `/api/ice` returns a `turn:` entry, not just
  `stun:`.

End-to-end tests were left out on purpose — they need two real browsers
negotiating a live WebRTC connection, which is a Playwright project to set up
rather than something to bolt on.

## FAQ

**How are my files sent?** Directly from your browser to the other browser, via
WebRTC. Your tab has to stay open until the transfer finishes.

**Can several people download at once?** Yes. Send the link to as many people
as you like; each gets their own connection and their own progress bar.

**How big can a file be?** As big as the downloader's browser and disk can
handle.

**What happens when I close my tab?** The links stop working. Anyone who
already finished can re-seed a download, but no new downloads can start.

**Are my files encrypted?** Yes. All WebRTC traffic is encrypted with DTLS
using public-key cryptography. The optional password adds an access check on
top; it is not what encrypts the data.

## License & acknowledgements

BSD 3-Clause. FileBurger is a derivative of
[FilePizza](https://github.com/kern/filepizza) (BSD 3-Clause, © Alex Kern and
Neeraj Baid) — the protocol, the channel design, and the streaming download
approach come from there. The burger theme, artwork, copy, and logotype are
original to this project.

Bundled third-party work: `StreamSaver.js` (MIT) for streaming downloads and
its `sw.js` / `mitm.html` service-worker shims in `public/`.
