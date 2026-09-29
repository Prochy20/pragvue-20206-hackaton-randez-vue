export default defineNitroPlugin(() => {
  ensureSchema().catch(error => console.error('[db] schema init failed', error))
})
