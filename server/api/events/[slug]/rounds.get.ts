export default defineEventHandler(async (event): Promise<AdminRound[]> => {
  const row = await requireAdminEvent(event)
  return loadAdminRounds(row.id)
})
