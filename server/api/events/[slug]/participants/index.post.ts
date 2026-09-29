import { count, eq } from 'drizzle-orm'
import { participants } from '~~/server/db/schema'

export default defineEventHandler(async (event): Promise<RegistrationResult> => {
  const row = await requirePublicEvent(getRouterParam(event, 'slug'))
  const input = await readBodyWith(event, registrationSchema)
  const answers = buildAnswers(row.questionnaire, input.answers)
  const company = input.company || null

  // AI runs before the insert, so a participant row always has its final ai_status.
  const profile = await generateProfile({
    eventName: row.name,
    name: input.name,
    role: input.role,
    company,
    hereFor: input.hereFor,
    answers,
    takenTitles: await takenTitles(row.id)
  })

  const db = useDb()
  const [registered] = await db.select({ count: count() }).from(participants).where(eq(participants.eventId, row.id))
  const token = generateParticipantToken()

  await db.insert(participants).values({
    eventId: row.id,
    token,
    number: (registered?.count ?? 0) + 1,
    name: input.name,
    role: input.role,
    company,
    hereFor: input.hereFor,
    answers,
    ...profileColumns(profile)
  })

  return { token, aiStatus: profile ? 'ok' : 'failed' }
})
