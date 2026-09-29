import { z } from 'zod'

const bodySchema = z.object({ questionnaire: questionnaireSchema })

export default defineEventHandler(async (event) => {
  const row = await requireAdminEvent(event)
  const { questionnaire } = await readBodyWith(event, bodySchema)
  const db = await useDb()

  await db.sql`UPDATE events SET questionnaire = ${JSON.stringify(questionnaire)} WHERE id = ${row.id}`

  return { questionnaire }
})
