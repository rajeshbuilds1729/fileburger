// Derived from https://github.com/jimmywarting/StreamSaver.js/blob/master/sw.js
// Intercepts the synthetic download request and answers it with a stream fed
// by the MessageChannel port, so files land on disk as they arrive.

/* global self ReadableStream Response Headers */

self.addEventListener('install', () => {
  self.skipWaiting()
})

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim())
})

const map = new Map()

// Called once per download. Each event carries the port the data is piped
// through on.
self.onmessage = (event) => {
  // Heartbeat keeps the service worker alive between chunks.
  if (event.data === 'ping') {
    return
  }

  const data = event.data
  const downloadUrl =
    data.url ||
    self.registration.scope +
      Math.random() +
      '/' +
      (typeof data === 'string' ? data : data.filename)
  const port = event.ports[0]
  const metadata = new Array(3) // [stream, data, port]

  metadata[1] = data
  metadata[2] = port

  if (event.data.readableStream) {
    metadata[0] = event.data.readableStream
  } else if (event.data.transferringReadable) {
    port.onmessage = (evt) => {
      port.onmessage = null
      metadata[0] = evt.data.readableStream
    }
  } else {
    metadata[0] = createStream(port)
  }

  map.set(downloadUrl, metadata)
  port.postMessage({ download: downloadUrl })
}

function createStream(port) {
  return new ReadableStream({
    start(controller) {
      port.onmessage = ({ data }) => {
        if (data === 'end') {
          return controller.close()
        }

        if (data === 'abort') {
          controller.error('Aborted the download')
          return
        }

        controller.enqueue(data)
      }
    },
    cancel() {
      console.log('user aborted')
    },
  })
}

self.onfetch = (event) => {
  const url = event.request.url

  // Only used by Firefox to keep the worker alive.
  if (url.endsWith('/ping')) {
    return event.respondWith(new Response('pong'))
  }

  const hijacke = map.get(url)

  if (!hijacke) return null

  const [stream, data, port] = hijacke

  map.delete(url)

  // We do not let the page control every header; only length and disposition
  // are forwarded.
  const responseHeaders = new Headers({
    'Content-Type': 'application/octet-stream; charset=utf-8',
    'Content-Security-Policy': "default-src 'none'",
    'X-Content-Security-Policy': "default-src 'none'",
    'X-WebKit-CSP': "default-src 'none'",
    'X-XSS-Protection': '1; mode=block',
  })

  let headers = new Headers(data.headers || {})

  if (headers.has('Content-Length')) {
    responseHeaders.set('Content-Length', headers.get('Content-Length'))
  }

  if (headers.has('Content-Disposition')) {
    responseHeaders.set(
      'Content-Disposition',
      headers.get('Content-Disposition'),
    )
  }

  if (data.size) {
    responseHeaders.set('Content-Length', data.size)
  }

  event.respondWith(new Response(stream, { headers: responseHeaders }))

  port.postMessage({ debug: 'Download started' })
}
