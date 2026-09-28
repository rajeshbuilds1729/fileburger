import { NextResponse } from 'next/server'
import crypto from 'crypto'
import { setTurnCredentials } from '../../../coturn'

const turnHost = process.env.TURN_HOST || '127.0.0.1'
const stunServer = process.env.STUN_SERVER || 'stun:stun.l.google.com:19302'
const peerjsHost = process.env.PEERJS_HOST || '0.peerjs.com'
const peerjsPath = process.env.PEERJS_PATH || '/'

/** Hands the browser its signalling host plus a fresh set of ICE servers. */
export async function POST(): Promise<NextResponse> {
  if (!process.env.COTURN_ENABLED) {
    return NextResponse.json({
      host: peerjsHost,
      path: peerjsPath,
      iceServers: [{ urls: stunServer }],
    })
  }

  // Ephemeral TURN credentials, so the shared secret never reaches the client.
  const username = crypto.randomBytes(8).toString('hex')
  const password = crypto.randomBytes(8).toString('hex')
  const ttl = 86400 // 24 hours

  await setTurnCredentials(username, password, ttl)

  return NextResponse.json({
    host: peerjsHost,
    path: peerjsPath,
    iceServers: [
      { urls: stunServer },
      {
        urls: [`turn:${turnHost}:3478`, `turns:${turnHost}:5349`],
        username,
        credential: password,
      },
    ],
  })
}
