export default defineEventHandler(async (event): Promise<AdminEvent> => {
  const row = await requireAdminEvent(event)
  const db = await useDb()
  const { rows } = await db.sql`SELECT COUNT(*) AS count FROM participants WHERE event_id = ${row.id}`

  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    questionnaire: JSON.parse(row.questionnaire),
    participantCount: Number(rows?.[0]?.count ?? 0),
    createdAt: row.created_at
  }
})
