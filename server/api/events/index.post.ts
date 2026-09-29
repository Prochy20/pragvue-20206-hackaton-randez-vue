export default defineEventHandler(async (event): Promise<CreatedEvent> => {
  const { name } = await readBodyWith(event, createEventSchema)
  const db = await useDb()
  const slug = await uniqueSlug(name)
  const adminKey = generateAdminKey()
  const questionnaire = JSON.stringify(createDefaultQuestionnaire())

  await db.sql`INSERT INTO events (id, slug, name, admin_key, questionnaire, created_at)
    VALUES (${crypto.randomUUID()}, ${slug}, ${name}, ${adminKey}, ${questionnaire}, ${new Date().toISOString()})`

  return { slug, adminKey }
})
