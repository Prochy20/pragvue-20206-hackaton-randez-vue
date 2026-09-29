import { desc, eq } from 'drizzle-orm'
import { participants } from '~~/server/db/schema'

export default defineEventHandler(async (event): Promise<AdminParticipant[]> => {
  const row = await requireAdminEvent(event)

  const rows = await useDb().select({
    id: participants.id,
    name: participants.name,
    role: participants.role,
    company: participants.company,
    title: participants.title,
    tagline: participants.tagline,
    emoji: participants.emoji,
    aiStatus: participants.aiStatus,
    answers: participants.answers,
    createdAt: participants.createdAt
  }).from(participants)
    .where(eq(participants.eventId, row.id))
    .orderBy(desc(participants.createdAt))

  return rows.map(p => ({ ...p, createdAt: p.createdAt.toISOString() }))
})
