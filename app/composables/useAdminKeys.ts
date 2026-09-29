const STORAGE_KEY = 'icebreaker:admin-keys'

// Backup of admin keys per event slug, in case the organizer loses the admin link.
// Client-only; storage may be unavailable (private mode), so every access is guarded.
export function useAdminKeys() {
  function read(): Record<string, string> {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '{}')
    } catch {
      return {}
    }
  }

  function save(slug: string, key: string) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...read(), [slug]: key }))
    } catch {
      // Storage unavailable – the admin URL itself still works.
    }
  }

  function get(slug: string): string | undefined {
    return read()[slug]
  }

  return { save, get }
}
