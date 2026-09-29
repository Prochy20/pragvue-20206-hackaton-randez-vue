export default defineEventHandler(async () => {
  const db = await useDb()
  // sqlite_master is SQLite-specific; acceptable for a smoke-test endpoint.
  const { rows = [] } = await db.sql`SELECT name FROM sqlite_master WHERE type = 'table' ORDER BY name`
  return { ok: true, tables: rows.map(row => row.name as string) }
})
