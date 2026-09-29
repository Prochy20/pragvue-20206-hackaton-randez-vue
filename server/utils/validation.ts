import type { H3Event } from 'h3'
import type { z } from 'zod'

// Like readValidatedBody, but a 400 carries the first human-readable issue as statusMessage.
export async function readBodyWith<T extends z.ZodType>(event: H3Event, schema: T): Promise<z.infer<T>> {
  const result = schema.safeParse(await readBody(event))
  if (!result.success) {
    const issue = result.error.issues[0]
    throw createError({ statusCode: 400, statusMessage: issue?.message ?? 'Invalid request', data: result.error.issues })
  }
  return result.data
}

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

// Postgres rejects malformed uuids with an error; check first so lookups can 404 instead.
export function isUuid(value: string | undefined): value is string {
  return !!value && UUID_RE.test(value)
}
