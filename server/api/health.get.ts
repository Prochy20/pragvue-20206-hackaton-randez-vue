import { sql } from 'drizzle-orm'

// 200 only once startup migrations succeeded and the database answers.
export default defineEventHandler(async () => {
  if (!await migrationsSucceeded()) {
    throw createError({ statusCode: 503, statusMessage: 'Database migrations failed' })
  }
  await useDb().execute(sql`select 1`)
  return { ok: true }
})
