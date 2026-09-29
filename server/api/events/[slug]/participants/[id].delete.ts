import { and, eq } from 'drizzle-orm'
import { participants } from '~~/server/db/schema'

export default defineEventHandler(async (event) => {
  const row = await requireAdminEvent(event)
  const id = getRouterParam(event, 'id')
  if (!isUuid(id)) {
    throw createError({ statusCode: 404, statusMessage: 'Participant not found' })
  }

  // Pairs are kept on purpose: past rounds show the member as "(removed)".
  const deleted = await useDb().delete(participants)
    .where(and(eq(participants.id, id), eq(participants.eventId, row.id)))
    .returning({ id: participants.id })
  if (!deleted.length) {
    throw createError({ statusCode: 404, statusMessage: 'Participant not found' })
  }

  setResponseStatus(event, 204)
  return null
})
