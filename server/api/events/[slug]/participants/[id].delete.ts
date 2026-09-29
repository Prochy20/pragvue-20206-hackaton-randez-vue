export default defineEventHandler(async (event) => {
  const row = await requireAdminEvent(event)
  const id = getRouterParam(event, 'id')
  const db = await useDb()

  // Pairs are kept on purpose: past rounds show the member as "(removed)".
  const { rows } = await db.sql`SELECT id FROM participants WHERE id = ${id} AND event_id = ${row.id}`
  if (!rows?.length) {
    throw createError({ statusCode: 404, statusMessage: 'Participant not found' })
  }
  await db.sql`DELETE FROM participants WHERE id = ${id}`

  setResponseStatus(event, 204)
  return null
})
