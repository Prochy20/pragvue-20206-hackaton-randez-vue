interface ParticipantRow {
  id: string
  name: string
  title: string | null
  tagline: string | null
  emoji: string | null
  ai_status: 'ok' | 'failed'
  answers: string
  created_at: string
}

export default defineEventHandler(async (event): Promise<AdminParticipant[]> => {
  const row = await requireAdminEvent(event)
  const db = await useDb()
  const { rows } = await db.sql`SELECT id, name, title, tagline, emoji, ai_status, answers, created_at
    FROM participants WHERE event_id = ${row.id} ORDER BY created_at DESC`

  return (rows as ParticipantRow[] | undefined ?? []).map(p => ({
    id: p.id,
    name: p.name,
    title: p.title,
    tagline: p.tagline,
    emoji: p.emoji,
    aiStatus: p.ai_status,
    answers: JSON.parse(p.answers),
    createdAt: p.created_at
  }))
})
