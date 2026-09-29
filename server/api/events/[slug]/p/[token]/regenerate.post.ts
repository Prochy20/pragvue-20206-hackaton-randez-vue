import { eq } from 'drizzle-orm'
import { participants } from '~~/server/db/schema'

export default defineEventHandler(async (event): Promise<PublicProfile> => {
  const row = await requirePublicEvent(getRouterParam(event, 'slug'))
  const participant = await requireParticipant(row, getRouterParam(event, 'token'))
  if (participant.aiStatus === 'ok') {
    throw createError({ statusCode: 409, statusMessage: 'Profile already generated' })
  }

  const profile = await generateProfile({
    eventName: row.name,
    name: participant.name,
    role: participant.role,
    company: participant.company,
    hereFor: participant.hereFor,
    answers: participant.answers,
    takenTitles: await takenTitles(row.id, participant.id)
  })

  const [updated] = await useDb().update(participants)
    .set(profileColumns(profile))
    .where(eq(participants.id, participant.id))
    .returning()

  return toPublicProfile(row, updated!)
})
