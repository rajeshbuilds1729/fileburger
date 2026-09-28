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

  // Deliberately unauthenticated: anyone holding the slug may destroy it. That
  // is what lets a terms-violation reporter call off an order after the fact.
  try {
    await getOrCreateChannelRepo().destroyChannel(slug)
    return NextResponse.json({ success: true }, { status: 200 })
  } catch (error) {
    console.error(error)
    return NextResponse.json(
      { error: 'Failed to destroy channel' },
      { status: 500 },
    )
  }
}
