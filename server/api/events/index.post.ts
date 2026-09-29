import { events } from '~~/server/db/schema'

export default defineEventHandler(async (event): Promise<CreatedEvent> => {
  const { user } = await requireUserSession(event)
  const { name } = await readBodyWith(event, createEventSchema)
  const slug = await uniqueSlug(name)

  await useDb().insert(events).values({ slug, name, ownerId: user.id, questionnaire: createDefaultQuestionnaire() })

  return { slug }
})
