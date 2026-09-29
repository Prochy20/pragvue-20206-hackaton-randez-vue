import { and, eq } from 'drizzle-orm'
import type { H3Event } from 'h3'
import { events } from '~~/server/db/schema'

// requireUserSession's 401 carries no statusMessage, so clients would read "Server Error".
export function requireOrganizer(event: H3Event) {
  return requireUserSession(event).catch(() => {
    throw createError({ statusCode: 401, statusMessage: 'You are not logged in' })
  })
}

// Loads the event from the [slug] route param; only its owner gets it, anyone else a 404.
export async function requireAdminEvent(event: H3Event) {
  const { user } = await requireOrganizer(event)
  const slug = getRouterParam(event, 'slug') ?? ''
  const row = await useDb().query.events.findFirst({
    where: and(eq(events.slug, slug), eq(events.ownerId, user.id))
  })
  if (!row) {
    throw createError({ statusCode: 404, statusMessage: 'Event not found' })
  }
  return row
}
