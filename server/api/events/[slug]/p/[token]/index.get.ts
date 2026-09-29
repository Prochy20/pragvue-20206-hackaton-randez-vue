export default defineEventHandler(async (event): Promise<PublicProfile> => {
  const row = await requirePublicEvent(getRouterParam(event, 'slug'))
  const participant = await requireParticipant(row, getRouterParam(event, 'token'))
  return toPublicProfile(row, participant)
})
