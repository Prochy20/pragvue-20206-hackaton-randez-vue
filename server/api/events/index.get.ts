import { count, desc, eq } from 'drizzle-orm'
import { events, participants } from '~~/server/db/schema'

export default defineEventHandler(async (event): Promise<OrganizerEvent[]> => {
  const { user } = await requireUserSession(event)

  const rows = await useDb().select({
    slug: events.slug,
    name: events.name,
    participantCount: count(participants.id),
    createdAt: events.createdAt
  }).from(events)
    .leftJoin(participants, eq(participants.eventId, events.id))
    .where(eq(events.ownerId, user.id))
    .groupBy(events.id)
    .orderBy(desc(events.createdAt))

  return rows.map(row => ({ ...row, createdAt: row.createdAt.toISOString() }))
})
