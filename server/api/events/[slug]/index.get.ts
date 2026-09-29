export default defineEventHandler(async (event): Promise<PublicEvent> => {
  const row = await requirePublicEvent(getRouterParam(event, 'slug'))
  return { slug: row.slug, name: row.name, questionnaire: row.questionnaire }
})
