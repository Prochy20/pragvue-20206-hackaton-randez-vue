import { drizzle } from 'drizzle-orm/node-postgres'
import * as schema from '../db/schema'

function createDb() {
  const url = useRuntimeConfig().databaseUrl
  if (!url) {
    throw createError({ statusCode: 500, statusMessage: 'Database is not configured' })
  }
  return drizzle(url, { schema, casing: 'snake_case' })
}

let db: ReturnType<typeof createDb> | undefined

// Lazily created drizzle singleton over a pg pool.
export function useDb() {
  db ??= createDb()
  return db
}
