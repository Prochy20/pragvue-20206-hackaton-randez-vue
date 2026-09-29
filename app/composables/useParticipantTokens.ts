const STORAGE_KEY = 'icebreaker:participants'

interface StoredParticipant {
  token: string
  name: string
}

// Remembers who registered on this device, per event slug. Storage errors are ignored.
export function useParticipantTokens() {
  function read(): Record<string, StoredParticipant> {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '{}')
    } catch {
      return {}
    }
  }

  function write(value: Record<string, StoredParticipant>) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(value))
    } catch { /* private mode or full storage */ }
  }

  return {
    get: (slug: string): StoredParticipant | undefined => read()[slug],
    save: (slug: string, participant: StoredParticipant) => write({ ...read(), [slug]: participant }),
    remove: (slug: string) => {
      const { [slug]: _, ...rest } = read()
      write(rest)
    }
  }
}
