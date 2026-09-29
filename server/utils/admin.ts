import { randomBytes } from 'node:crypto'
import type { H3Event } from 'h3'

export interface EventRow {
  id: string
  slug: string
  name: string
  admin_key: string
  questionnaire: string
  created_at: string
}

export function generateAdminKey() {
  return randomBytes(24).toString('base64url')
}

// Loads the event from the [slug] route param and checks the x-admin-key header.
export async function requireAdminEvent(event: H3Event) {
  const slug = getRouterParam(event, 'slug')
  const db = await useDb()
  const { rows } = await db.sql`SELECT * FROM events WHERE slug = ${slug}`
  const row = rows?.[0] as EventRow | undefined
  if (!row) {
    throw createError({ statusCode: 404, statusMessage: 'Event not found' })
  }
  if (getHeader(event, 'x-admin-key') !== row.admin_key) {
    throw createError({ statusCode: 403, statusMessage: 'Invalid admin key' })
  }
  return row
}
