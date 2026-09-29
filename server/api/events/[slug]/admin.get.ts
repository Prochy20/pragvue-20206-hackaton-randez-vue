import { count, eq } from 'drizzle-orm'
import { participants } from '~~/server/db/schema'

export default defineEventHandler(async (event): Promise<AdminEvent> => {
  const row = await requireAdminEvent(event)
  const [result] = await useDb().select({ count: count() }).from(participants).where(eq(participants.eventId, row.id))

  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    questionnaire: row.questionnaire,
    participantCount: result?.count ?? 0,
    createdAt: row.createdAt.toISOString()
  }
})
