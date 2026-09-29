export default defineEventHandler(async (event): Promise<WallData> => {
  const row = await requirePublicEvent(getRouterParam(event, 'slug'))
  return loadWall(row)
})
