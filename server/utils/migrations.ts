// Outcome of the startup migrations. Nitro doesn't await plugins, so the health check awaits this instead.
let migrations: Promise<boolean> = Promise.resolve(true)

export function trackMigrations(run: Promise<void>) {
  migrations = run.then(
    () => true,
    (error: unknown) => {
      console.error(`[db] migration failed: ${error instanceof Error ? error.message : error}`)
      return false
    }
  )
}

export function migrationsSucceeded() {
  return migrations
}
