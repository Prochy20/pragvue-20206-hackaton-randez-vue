import { eq, max, sql } from 'drizzle-orm'
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

  const token = generateParticipantToken()

  // Concurrent registrations to one event serialize on the lock, so numbers never repeat.
  // max() instead of count(), because deleted participants leave gaps.
  await useDb().transaction(async (tx) => {
    await tx.execute(sql`select pg_advisory_xact_lock(hashtext(${row.id}))`)
    const [last] = await tx.select({ number: max(participants.number) }).from(participants).where(eq(participants.eventId, row.id))

    await tx.insert(participants).values({
      eventId: row.id,
      token,
      number: (last?.number ?? 0) + 1,
      name: input.name,
      role: input.role,
      company,
      hereFor: input.hereFor,
      answers,
      ...profileColumns(profile)
    })
  })

  return { token, aiStatus: profile ? 'ok' : 'failed' }
})
