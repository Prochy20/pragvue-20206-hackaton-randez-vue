import { eq } from 'drizzle-orm'
import { users } from '~~/server/db/schema'

export default defineEventHandler(async (event) => {
  const { email, password } = await readBodyWith(event, credentialsSchema)
  const user = await useDb().query.users.findFirst({ where: eq(users.email, email) })

  if (!user || !await verifyPassword(user.passwordHash, password)) {
    throw createError({ statusCode: 401, statusMessage: 'Invalid email or password' })
  }

  await setUserSession(event, { user: { id: user.id, email: user.email } })
  return { ok: true }
})
