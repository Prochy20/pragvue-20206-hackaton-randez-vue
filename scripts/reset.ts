// Local testing reset: pnpm db:reset. Wipes every row (schema and migrations stay), then pnpm seed runs.
import { getTableName, sql } from 'drizzle-orm'
import { drizzle } from 'drizzle-orm/node-postgres'
import { events, pairs, participants, rounds, users } from '../server/db/schema.ts'
import { loadEnv } from './seed-lib.ts'

const LOCAL_HOSTS = ['localhost', '127.0.0.1', '::1', '[::1]']

loadEnv()
const url = process.env.NUXT_DATABASE_URL
if (!url) {
  console.error('NUXT_DATABASE_URL is not set')
  process.exit(1)
}
// Refuse anything that isn't the local docker-compose database, so a production URL in .env can't be wiped.
const host = new URL(url).hostname
if (!LOCAL_HOSTS.includes(host)) {
  console.error(`Refusing to reset a non-local database (${host})`)
  process.exit(1)
}

const tables = [pairs, rounds, participants, events, users].map(table => `"${getTableName(table)}"`)
const db = drizzle(url)

try {
  await db.execute(sql.raw(`TRUNCATE ${tables.join(', ')} RESTART IDENTITY CASCADE`))
} finally {
  await db.$client.end()
}

console.log(`Wiped ${tables.join(', ')}.`)
