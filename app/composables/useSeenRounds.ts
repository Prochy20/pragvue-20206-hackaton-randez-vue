const STORAGE_KEY = 'icebreaker:seen-rounds'

// Round ids whose match reveal (install animation) already played on this device.
// Storage errors are ignored: worst case the animation plays again.
export function useSeenRounds() {
  function read(): string[] {
    try {
      const value: unknown = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]')
      return Array.isArray(value) ? value.filter((id): id is string => typeof id === 'string') : []
    } catch {
      return []
    }
  }

  return {
    has: (roundId: string) => read().includes(roundId),
    add: (roundId: string) => {
      const ids = read()
      if (ids.includes(roundId)) return
      try {
        // Keep the list short; only recent rounds matter.
        localStorage.setItem(STORAGE_KEY, JSON.stringify([...ids, roundId].slice(-50)))
      } catch { /* private mode or full storage */ }
    }
  }
}
