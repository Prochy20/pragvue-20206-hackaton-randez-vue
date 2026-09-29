import { events } from '~~/server/db/schema'

export default defineEventHandler(async (event): Promise<CreatedEvent> => {
  const { name } = await readBodyWith(event, createEventSchema)
  const slug = await uniqueSlug(name)
  const adminKey = generateAdminKey()

  await useDb().insert(events).values({ slug, name, adminKey, questionnaire: createDefaultQuestionnaire() })

  return { slug, adminKey }
})
