import { eq } from 'drizzle-orm'
import { users } from '~~/server/db/schema'

export default defineEventHandler(async (event) => {
  const { email, password } = await readBodyWith(event, credentialsSchema)
  const db = useDb()

  const existing = await db.query.users.findFirst({ columns: { id: true }, where: eq(users.email, email) })
  if (existing) {
    throw createError({ statusCode: 409, statusMessage: 'An account with this email already exists' })
  }

  const [user] = await db.insert(users)
    .values({ email, passwordHash: await hashPassword(password) })
    .returning({ id: users.id, email: users.email })

  await setUserSession(event, { user: user! })
  return { ok: true }
})
