import { resolve } from 'node:path'
import { drizzle } from 'drizzle-orm/node-postgres'
import { migrate } from 'drizzle-orm/node-postgres/migrator'

// Applies pending SQL migrations before the server takes traffic (locally and in production).
export default defineNitroPlugin(async () => {
  const url = useRuntimeConfig().databaseUrl
  if (!url) {
    console.warn('[db] NUXT_DATABASE_URL is not set, skipping migrations')
    return
  }
  const db = drizzle(url)
  try {
    await migrate(db, { migrationsFolder: resolve(process.cwd(), 'server/db/migrations') })
  } finally {
    await db.$client.end()
  }
})
