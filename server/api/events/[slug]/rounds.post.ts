import { asc, eq, max } from 'drizzle-orm'
import { pairs, participants, rounds } from '~~/server/db/schema'

// Events with a round in progress; a single server process is enough for the prototype.
const running = new Set<string>()

async function generateWithRetry(input: MatchInput) {
  for (let attempt = 1; attempt <= 2; attempt++) {
    try {
      return await generateMatch(input)
    } catch (error) {
      console.warn(`[ai] match attempt ${attempt} failed`, error instanceof Error ? error.message : error)
    }
  }
  return null
}

export default defineEventHandler(async (event): Promise<AdminRound> => {
  const row = await requireAdminEvent(event)
  if (running.has(row.id)) {
    throw createError({ statusCode: 409, statusMessage: 'A round is already running' })
  }
  running.add(row.id)

  try {
    const db = useDb()
    const attendees = await db.select().from(participants)
      .where(eq(participants.eventId, row.id))
      .orderBy(asc(participants.number))
    if (attendees.length < 2) {
      throw createError({ statusCode: 400, statusMessage: 'Need at least 2 participants' })
    }

    const groups = await generateWithRetry({
      eventName: row.name,
      attendees: attendees.map(a => ({ id: a.id, name: a.name, role: a.role, hereFor: a.hereFor, title: a.title, answers: a.answers })),
      previousPairs: await previousPairs(row.id)
    })
    if (!groups) {
      console.warn(`[ai] matching round failed for event ${row.slug}`)
    }

    // Failed rounds use up their number too.
    const roundId = await db.transaction(async (tx) => {
      const [last] = await tx.select({ number: max(rounds.number) }).from(rounds).where(eq(rounds.eventId, row.id))
      const [round] = await tx.insert(rounds)
        .values({ eventId: row.id, number: (last?.number ?? 0) + 1, status: groups ? 'ok' : 'failed' })
        .returning({ id: rounds.id })
      if (groups) {
        await tx.insert(pairs).values(groups.map(group => ({ roundId: round!.id, ...group })))
      }
      return round!.id
    })

    const [result] = await loadAdminRounds(row.id, roundId)
    return result!
  } finally {
    running.delete(row.id)
  }
})
