import { NextApiRequest, NextApiResponse } from 'next'
import config from './config'

export type APIError = Error & { statusCode?: number }

export type BodyKey = keyof typeof config.bodyKeys

/**
 * Reads a JSON object body without letting a malformed request surface as an
 * unhandled 500 (which would return an HTML error page and log a stack trace).
 * Returns null for anything that is not a JSON object.
 */
export async function readJSONBody(
  request: Request,
): Promise<Record<string, unknown> | null> {
  try {
    const body = await request.json()
    if (body === null || typeof body !== 'object' || Array.isArray(body)) {
      return null
    }
    return body as Record<string, unknown>
  } catch {
    return null
  }
}

/** Returns the trimmed value if it is a string within the configured bounds. */
export function getBodyString(
  body: Record<string, unknown>,
  key: BodyKey,
): string | null {
  const { min, max } = config.bodyKeys[key]
  const val = body[key]

  if (typeof val !== 'string') {
    return null
  }
  if (val.length < min || val.length > max) {
    return null
  }
  return val
}

export function throwAPIError(message: string, statusCode = 500): void {
  const err = new Error(message) as APIError
  err.statusCode = statusCode
  throw err
}

export function routeHandler<T>(
  fn: (req: NextApiRequest, res: NextApiResponse) => Promise<T>,
): (req: NextApiRequest, res: NextApiResponse) => Promise<void> {
  return async (req: NextApiRequest, res: NextApiResponse): Promise<void> => {
    if (req.method !== 'POST') {
      res.statusCode = 405
      res.json({ error: 'method not allowed' })
      return
    }

    try {
      const result = await fn(req, res)
      res.statusCode = 200
      res.json(result)
    } catch (err) {
      res.statusCode = err.statusCode || 500
      res.json({ error: err.message })
    }
  }
}

export function getBodyKey(req: NextApiRequest, key: BodyKey): string {
  const { min, max } = config.bodyKeys[key]

  const val = req.body[key]

  if (typeof val !== 'string') {
    throwAPIError(`${key} must be a string`)
  }

  if (val.length < min) {
    throwAPIError(`${key} must be at least ${min} chars`)
  }

  if (val.length > max) {
    throwAPIError(`${key} must be at most ${max} chars`)
  }

  return val
}
