# Deploying FileBurger

FileBurger is unusual for a web app: **the server does almost nothing.** It
maps a slug to a PeerJS ID, hands that to the downloader's browser, and gets
out of the way. The file itself never touches it.

That means deployment is mostly about three external things — HTTPS, a
signalling server, and TURN — rather than about the app.

## The four things that actually matter

### 1. HTTPS is not optional

StreamSaver writes downloads to disk through a **Service Worker**, and service
workers refuse to register outside a secure context. On plain HTTP the download
button appears to work and then silently does nothing.

Every mainstream host gives you a certificate automatically. If you are on a
bare VM, terminate TLS at Caddy or nginx and proxy to the app.

### 2. TURN is what makes it work in the real world

With STUN only, a transfer succeeds when neither peer is behind symmetric NAT.
That is fine on a laptop and miserable on mobile data or a corporate network —
in practice a large fraction of real users simply cannot connect.

TURN relays the data when a direct path is impossible. **Do not skip it.** It is
the difference between a demo that works for you and a service that works for
everyone.

coturn relays on `49152-65535/udp`. Those ports do **not** need publishing in
Docker, but the host firewall and your cloud provider's security group must let
them through, or TURN will accept the request and then fail to relay.

### 3. Signalling

The default is the public PeerJS cloud at `0.peerjs.com`. Fine for
development. For production, self-host it — you remove a shared free third
party from the critical path of every transfer:

```bash
PEERJS_PORT=9000 pnpm start:peerjs
```

It prints the exact `PEERJS_HOST` / `PEERJS_PATH` pair to configure. The
browser dials `<host>/<path>`, so the two halves have to agree, and that URL
must be reachable over `wss://`.

### 4. Redis, if you run more than one instance

Without `REDIS_URL` the app keeps channels in process memory. That is fine on a
single box but means a channel created by one instance is invisible to another.
Any platform that runs more than one process or more than one container needs a
real Redis.

Vercel and other serverless platforms are in this category: two consecutive
requests can land in different processes, so a memory-backed store will 404.

## Option A — one VM with Docker Compose (recommended)

The closest thing to a one-command deploy, and the only option that gets you
app + Redis + coturn on one host.

```bash
git clone https://github.com/rajeshbuilds1729/fileburger.git
cd fileburger
```

Edit `docker-compose.yml` and set your real hostnames:

- `TURN_HOST` — the hostname coturn is reachable at
- `PEERJS_HOST` / `PEERJS_PATH` — from `pnpm start:peerjs`
- `NEXT_PUBLIC_SITE_URL` — your public URL

```bash
docker compose up -d --build
```

Then put Caddy in front for TLS and a real hostname. Caddy will get you HTTPS
with zero configuration:

```caddy
file.example.com {
    reverse_proxy localhost:8080
}

signal.example.com {
    reverse_proxy localhost:9000
}
```

Ports `8080` and `9000` need to be reachable for the reverse proxy; `3478` and
`5349` need to be open to the internet directly (UDP and TCP), and
`49152-65535/udp` open on the firewall.

## Option B — a PaaS that runs containers

Fly.io, Railway or Render all work. The app is just a Node server:

```bash
pnpm install
pnpm build
node .next/standalone/server.js
```

Requirements on the platform:

- `PORT` — set it to whatever the platform injects; the standalone server
  reads it.
- `HOSTNAME` — **pin it to `0.0.0.0`.** Docker and some PaaS builders set
  `HOSTNAME` to a container ID, and Next's standalone server binds to it, so it
  will crash-loop with `getaddrinfo ENOTFOUND`. The bundled Dockerfile already
  does this.
- `REDIS_URL` — attach a Redis instance.
- HTTPS — automatic on all three.

For TURN, run coturn as a second service or use a hosted provider (Metered,
Cloudflare Calls, Twilio Network Traversal). A hosted TURN provider is the
lowest-effort option and removes the firewall configuration entirely.

## Option C — Vercel

Works. Two things are mandatory and one is impossible.

**You must attach a Redis database.** This is not optional. Vercel's own
documentation is blunt about it: *"no two instances share memory… module-level
variables look correct in local development, where a single process serves
every client, but break as soon as production traffic spans two instances."*
Without Redis the app will create a channel in one function instance and look
it up in another, and your share links will 404 intermittently — which is a
 miserable thing to debug because it "works on my machine".

FileBurger detects this and shouts in the logs rather than failing quietly:

```
##############################################################
# FileBurger: using IN-MEMORY channel storage on a serverless #
# platform. Share links will 404 at random.                   #
##############################################################
```

Set `CHANNEL_STORE=memory` if you genuinely want to silence that and accept
the flakiness.

**How to get `REDIS_URL`:** install **Redis Cloud** from the Vercel
Marketplace. Vercel injects `REDIS_URL` automatically and nothing in the code
changes — FileBurger already speaks the Redis wire protocol over TCP via
`ioredis`.

Two alternatives, both fine:

- **Upstash**, also on the Marketplace. It exposes a standard TCP endpoint on
  6379 as well as an HTTP API, so `rediss://…` works with `ioredis` unchanged.
  Note the Upstash Marketplace integration primarily injects the *REST*
  variables (`UPSTASH_REDIS_REST_URL` / `_TOKEN`), which are HTTP credentials
  and will **not** work with `ioredis` — you need the TCP `rediss://` string
  from the Upstash console.
- **Self-host Redis** (or use a container) and set `REDIS_URL` yourself.

**You cannot run coturn on Vercel.** Use a hosted TURN provider — Metered,
Cloudflare Calls, or Twilio Network Traversal all work. Without TURN you are
shipping STUN-only and transfers will fail for anyone behind symmetric NAT.

```bash
# Verify it is actually on:
curl -sX POST https://your-app.vercel.app/api/ice
# Good: iceServers contains a turn: entry with username/credential
# Bad:  only a stun: entry
```

**Good news on timeouts.** The usual objection to serverless — "big file
transfers will time out" — does not apply here. The transfer runs over a WebRTC
data channel *between the two browsers*. Vercel only ever handles four tiny
requests: create, renew (every 60s per active uploader), destroy, and the
download page render. The longest one is a single Redis GET.

Notes:

- `output: 'standalone'` in `next.config.js` is ignored by Vercel; it builds
  and runs the app itself. Harmless.
- `NEXT_PUBLIC_SITE_URL` is inlined at **build** time, so changing it needs a
  redeploy, not just a restart.
- Pin your function region to match your Redis region (`regions` in
  `vercel.json`) or you pay the cross-region latency on every channel lookup.
- `vercel.json` is already set up with `framework: nextjs`, the build and
  install commands, and a region.

```bash
# Deploy
npx vercel            # preview
npx vercel --prod     # production
```

## Option D — any Node host

Anything that runs a long-lived Node process: a VPS, Fly.io, Railway, Render,
Heroku, or your own box.

```bash
pnpm install
pnpm build
node .next/standalone/server.js
```

This is the only option where the in-memory channel store is genuinely safe,
because one process serves every request. Redis is still worth adding if you
ever run more than one instance, or you want channels to survive a restart.

## Post-deploy checklist

```bash
# 1. App is up and serving
curl -sI https://file.example.com | head -1

# 2. ICE config — TURN_ENABLED must be true, or you are shipping STUN only
curl -sX POST https://file.example.com/api/ice

# 3. Service worker shims are served (needed for downloads to write to disk)
curl -sI https://file.example.com/sw.js | head -1
curl -sI https://file.example.com/stream.html | head -1

# 4. End to end: open the site, drop a file, scan the QR, confirm the bytes
#    arrive. Then try it from a phone on mobile data — that is the real TURN
#    test, and it is the one that matters.
```

`/api/ice` is the single most useful diagnostic. If it returns only a `stun:`
entry, TURN is off and transfers will be unreliable no matter what else is
right.

## Troubleshooting

| Symptom | Cause |
| --- | --- |
| Download button does nothing | No HTTPS, so the service worker never registered. |
| "Could not connect to the uploader" | Uploader closed their tab, or TURN is not working. Check `/api/ice`. |
| `/download/<slug>` 404s immediately | Channel expired (1h TTL) or Redis is not shared between instances. |
| Works on wifi, fails on mobile | TURN relay ports blocked, or TURN not enabled. |
| Container crash-loops with `ENOTFOUND` | `HOSTNAME` not pinned to `0.0.0.0`. |
| Signalling connects, transfer never starts | `PEERJS_HOST` / `PEERJS_PATH` mismatch, or signalling is not on `wss://`. |

## Scaling notes

There is almost nothing to scale. The bandwidth and CPU both live in the
browsers.

- The app's per-request work is one Redis GET. A small instance handles
  thousands of orders.
- Memory is flat regardless of file size — chunks stream to disk through the
  service worker rather than buffering in the server or the browser.
- The real scaling limits are the signalling server and TURN bandwidth, and
  TURN bandwidth is the expensive one. Consider a hosted TURN provider if
  relays start costing you.
