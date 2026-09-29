import { eq } from 'drizzle-orm'
import { z } from 'zod'
import { events } from '~~/server/db/schema'

const bodySchema = z.object({ questionnaire: questionnaireSchema })

export default defineEventHandler(async (event) => {
  const row = await requireAdminEvent(event)
  const { questionnaire } = await readBodyWith(event, bodySchema)

  await useDb().update(events).set({ questionnaire }).where(eq(events.id, row.id))

  return { questionnaire }
})
