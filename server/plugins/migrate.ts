import { resolve } from 'node:path'
import { drizzle } from 'drizzle-orm/node-postgres'
import { migrate } from 'drizzle-orm/node-postgres/migrator'

// Applies pending SQL migrations on startup (locally and in production); /api/health reports the outcome.
export default defineNitroPlugin(() => {
  const url = useRuntimeConfig().databaseUrl
  if (!url) {
    console.warn('[db] NUXT_DATABASE_URL is not set, skipping migrations')
    return
  }
  trackMigrations(runMigrations(url))
})

async function runMigrations(url: string) {
  const db = drizzle(url)
  try {
    await migrate(db, { migrationsFolder: resolve(process.cwd(), 'server/db/migrations') })
  } finally {
    await db.$client.end()
  }
}
