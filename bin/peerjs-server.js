#!/usr/bin/env node
/**
 * Standalone PeerJS signalling server. Only needed if you want to self-host
 * signalling; point the app at it with PEERJS_HOST / PEERJS_PATH.
 */
const http = require('http')
const express = require('express')
const { ExpressPeerServer } = require('peer')

const PORT = process.env.PEERJS_PORT || 9000
const PATH = process.env.PEERJS_PATH || '/fileburger'

const app = express()
const server = http.createServer(app)
const peerServer = ExpressPeerServer(server, { path: PATH, key: 'fileburger' })

app.use('/peerjs', peerServer)
server.listen(PORT, () => {
  console.log(`PeerJS signalling listening on http://localhost:${PORT}/peerjs`)
})
