interface RoundRow {
  id: string
  number: number
  status: 'ok' | 'failed'
  created_at: string
}

interface PairRow {
  id: string
  round_id: string
  participant_ids: string
  reason: string
  icebreaker: string
}

interface MemberRow {
  id: string
  name: string
  title: string | null
  emoji: string | null
}

export default defineEventHandler(async (event): Promise<AdminRound[]> => {
  const row = await requireAdminEvent(event)
  const db = await useDb()

  const rounds = (await db.sql`SELECT id, number, status, created_at FROM rounds
    WHERE event_id = ${row.id} ORDER BY number DESC`).rows as RoundRow[] | undefined ?? []
  const pairs = (await db.sql`SELECT p.id, p.round_id, p.participant_ids, p.reason, p.icebreaker
    FROM pairs p JOIN rounds r ON r.id = p.round_id WHERE r.event_id = ${row.id}`).rows as PairRow[] | undefined ?? []
  const members = (await db.sql`SELECT id, name, title, emoji FROM participants
    WHERE event_id = ${row.id}`).rows as MemberRow[] | undefined ?? []

  const memberById = new Map(members.map(m => [m.id, m]))

  return rounds.map(round => ({
    id: round.id,
    number: round.number,
    status: round.status,
    createdAt: round.created_at,
    pairs: pairs
      .filter(pair => pair.round_id === round.id)
      .map(pair => ({
        id: pair.id,
        reason: pair.reason,
        icebreaker: pair.icebreaker,
        members: (JSON.parse(pair.participant_ids) as string[]).map((id) => {
          const member = memberById.get(id)
          return { id, name: member?.name ?? null, title: member?.title ?? null, emoji: member?.emoji ?? null }
        })
      }))
  }))
})
