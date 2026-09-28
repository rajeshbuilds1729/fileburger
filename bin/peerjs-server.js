#!/usr/bin/env node
/**
 * Self-hosted PeerJS signalling server.
 *
 * The public cloud at 0.peerjs.com works for development, but for production
 * you want your own: it removes a shared third party from the critical path
 * and gives you control over uptime.
 *
 * On start it prints the exact PEERJS_HOST / PEERJS_PATH pair to give the app,
 * because the URL the browser dials is `<host>/<path>` and it is easy to get
 * the two halves out of step.
 *
 *   PEERJS_PORT   port to listen on          (default 9000)
 *   PEERJS_MOUNT  express mount point        (default /peerjs)
 *   PEERJS_PATH   path within the mount      (default /fileburger)
 *   PEERJS_KEY    key clients must present   (default fileburger)
 */
const http = require('http')
const express = require('express')
const { ExpressPeerServer } = require('peer')

const PORT = Number(process.env.PEERJS_PORT) || 9000
const MOUNT = process.env.PEERJS_MOUNT || '/peerjs'
const PATH = process.env.PEERJS_PATH || '/fileburger'
const KEY = process.env.PEERJS_KEY || 'fileburger'

const app = express()
const server = http.createServer(app)

const peerServer = ExpressPeerServer(server, { path: PATH, key: KEY })
app.use(MOUNT, peerServer)

server.listen(PORT, () => {
  const base = MOUNT === '/' ? '' : MOUNT
  console.log(`PeerJS signalling listening on http://localhost:${PORT}${base}${PATH}`)
  console.log('')
  console.log('Point the FileBurger app at it with:')
  console.log(`  PEERJS_HOST=<signalling host, no scheme>${PORT === 80 || PORT === 443 ? '' : `:${PORT}`}`)
  console.log(`  PEERJS_PATH=${base}${PATH}`)
  console.log('')
  console.log('It must be reachable over HTTPS (wss://) from the browser.')
})
