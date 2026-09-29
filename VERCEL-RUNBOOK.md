# Finishing the Vercel deploy

Live URL: **https://fileburger-zeta.vercel.app**

Project: `wants-to-learns-projects/fileburger` (linked to
`github.com/rajeshbuilds1729/fileburger`, region `iad1`, public, no
deployment protection).

## Current state

| | |
| --- | --- |
| App, UI, all routes | working, public, 200 |
| `/sw.js`, `/stream.html` | 200 — streaming downloads will write to disk |
| API validation | 400 on malformed bodies, as designed |
| **Share links** | **broken — 404** |
| **TURN** | **STUN only** |

## One thing left, and it is not a code problem

`/api/create` succeeds and returns a slug, but `/download/<slug>` returns 404
every time. The channel lives in process memory, and two serverless instances
cannot see each other's memory.

The app detects this and says so in the Vercel logs:

```
[ChannelRepo] Using in-memory storage
##############################################################
# FileBurger: using IN-MEMORY channel storage on a serverless #
# platform. Share links will 404 at random.                   #
##############################################################
```

### Step 1 — accept the Upstash marketplace terms (you have to do this)

<https://vercel.com/wants-to-learns-projects/~/integrations/accept-terms/upstash?source=cli>

Vercel will not let the CLI accept a legal agreement on your behalf, and
neither should it. The free plan needs no payment method.

### Step 2 — install Redis and redeploy

```bash
export VERCEL_TOKEN=vcp_...
cd "D:/File burger"
vercel integration add upstash/upstash-kv \
  --name fileburger-channels --plan free \
  -m primaryRegion=iad1 -e production -e preview --non-interactive
vercel deploy --prod --yes
```

This injects the connection details as environment variables. Verify the app
picked up a TCP `REDIS_URL` (it may inject REST credentials instead — see
below), then re-run the round trip:

```bash
u=https://fileburger-zeta.vercel.app
for i in 1 2 3 4 5; do
  s=$(curl -s -X POST $u/api/create -H 'content-type: application/json' \
      -d '{"uploaderPeerID":"check"}' | sed 's/.*"shortSlug":"\([^"]*\)".*/\1/')
  echo "$s -> $(curl -s -o /dev/null -w '%{http_code}' $u/download/$s)"
done
```

All five should be `200`. Anything else means `REDIS_URL` was not injected.

### If Upstash injects REST credentials instead of `REDIS_URL`

The Upstash Marketplace integration often injects
`UPSTASH_REDIS_REST_URL` / `UPSTASH_REDIS_REST_TOKEN` rather than a TCP
connection string. `ioredis` cannot speak those. Either grab the TCP
`rediss://` string from the Upstash console and set `REDIS_URL` to it, or use
Redis Cloud instead (`vercel integration add redis`) which injects `REDIS_URL`
directly.

## Still outstanding: TURN

`/api/ice` currently returns only a `stun:` entry. The transfer will work on
some networks and fail on symmetric NAT — typically mobile data and corporate
networks. A hosted TURN provider (Metered, Cloudflare Calls, or Twilio) is the
only option on Vercel; coturn cannot run there. Create one, then set:

```
COTURN_ENABLED=true
TURN_HOST=<your-turn-host>
TURN_REALM=file.burger
```

and confirm:

```bash
curl -s -X POST https://fileburger-zeta.vercel.app/api/ice
# want a "turn:" entry with username/credential
```

## Do not deploy to the `file-burger` project

There is a **separate** Vercel project also called `file-burger`
(`wants-to-learns-projects/file-burger`). It is GitHub-connected to a
different repository and already serves a different app in production. It is
untouched by this work. Always deploy from this directory, which is linked to
`fileburger`.
