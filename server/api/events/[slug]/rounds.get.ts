import { desc, eq } from 'drizzle-orm'
import { pairs, participants, rounds } from '~~/server/db/schema'

export default defineEventHandler(async (event): Promise<AdminRound[]> => {
  const row = await requireAdminEvent(event)
  const db = useDb()

  const roundRows = await db.select().from(rounds)
    .where(eq(rounds.eventId, row.id))
    .orderBy(desc(rounds.number))
  const pairRows = await db.select({ pair: pairs }).from(pairs)
    .innerJoin(rounds, eq(rounds.id, pairs.roundId))
    .where(eq(rounds.eventId, row.id))
  const members = await db.select({ id: participants.id, name: participants.name, title: participants.title, emoji: participants.emoji })
    .from(participants)
    .where(eq(participants.eventId, row.id))

  const memberById = new Map(members.map(m => [m.id, m]))

  return roundRows.map(round => ({
    id: round.id,
    number: round.number,
    status: round.status,
    createdAt: round.createdAt.toISOString(),
    pairs: pairRows
      .map(({ pair }) => pair)
      .filter(pair => pair.roundId === round.id)
      .map(pair => ({
        id: pair.id,
        reason: pair.reason,
        diff: pair.diff,
        icebreaker: pair.icebreaker,
        members: pair.participantIds.map((id) => {
          const member = memberById.get(id)
          return { id, name: member?.name ?? null, title: member?.title ?? null, emoji: member?.emoji ?? null }
        })
      }))
  }))
})
