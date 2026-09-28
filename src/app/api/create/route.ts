import { NextResponse } from 'next/server'
import { getOrCreateChannelRepo } from '../../../channel'
import { getBodyString, readJSONBody } from '../../../routes'

export async function POST(request: Request): Promise<NextResponse> {
  const body = await readJSONBody(request)
  if (!body) {
    return NextResponse.json(
      { error: 'Request body must be a JSON object' },
      { status: 400 },
    )
  }

  const uploaderPeerID = getBodyString(body, 'uploaderPeerID')
  if (!uploaderPeerID) {
    return NextResponse.json(
      { error: 'Uploader peer ID is required' },
      { status: 400 },
    )
  }

  const channel = await getOrCreateChannelRepo().createChannel(uploaderPeerID)
  return NextResponse.json(channel)
}
