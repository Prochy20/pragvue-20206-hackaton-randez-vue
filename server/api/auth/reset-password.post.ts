import { timingSafeEqual } from 'node:crypto'
import { eq } from 'drizzle-orm'
import { users } from '~~/server/db/schema'

// Sets a new password for an existing organizer. There is no email in this prototype, so the
// caller proves they are the admin with NUXT_PASSWORD_RESET_KEY instead; unset key = feature off.
export default defineEventHandler(async (event) => {
  const expectedKey = useRuntimeConfig(event).passwordResetKey
  if (!expectedKey) {
    throw createError({ statusCode: 404, statusMessage: 'Password reset is not enabled on this server' })
  }

  const { email, password, resetKey } = await readBodyWith(event, passwordResetSchema)
  const db = useDb()
  const user = await db.query.users.findFirst({ columns: { id: true, email: true }, where: eq(users.email, email) })

  // One message for both failures, so the key can't be used to probe which emails exist.
  if (!user || !safeEqual(resetKey, expectedKey)) {
    throw createError({ statusCode: 401, statusMessage: 'Invalid reset key or email' })
  }

  await db.update(users).set({ passwordHash: await hashPassword(password) }).where(eq(users.id, user.id))
  await setUserSession(event, { user })
  return { ok: true }
})

function safeEqual(a: string, b: string) {
  const left = Buffer.from(a)
  const right = Buffer.from(b)
  return left.length === right.length && timingSafeEqual(left, right)
}
