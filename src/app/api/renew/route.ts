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

  const slug = getBodyString(body, 'slug')
  if (!slug) {
    return NextResponse.json({ error: 'Slug is required' }, { status: 400 })
  }

  if (typeof body.secret !== 'string' || !body.secret) {
    return NextResponse.json({ error: 'Secret is required' }, { status: 400 })
  }

  const success = await getOrCreateChannelRepo().renewChannel(slug, body.secret)
  return NextResponse.json({ success })
}
