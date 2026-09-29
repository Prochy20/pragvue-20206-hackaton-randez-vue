import type { AdminEvent, AdminParticipant, AdminRound } from '#shared/types/admin'
import type { Questionnaire } from '#shared/utils/questionnaire'

// Thin wrapper over the admin endpoints; every call carries the `x-admin-key` header.
export function useAdminApi(slug: MaybeRefOrGetter<string>, key: MaybeRefOrGetter<string | undefined>) {
  function request<T>(path: string, options: { method?: 'GET' | 'PUT' | 'DELETE', body?: Record<string, unknown> } = {}) {
    return $fetch<T>(`/api/events/${encodeURIComponent(toValue(slug))}${path}`, {
      ...options,
      headers: { 'x-admin-key': toValue(key) ?? '' }
    })
  }

  return {
    getEvent: () => request<AdminEvent>('/admin'),
    saveQuestionnaire: (questionnaire: Questionnaire) =>
      request<{ questionnaire: Questionnaire }>('/questionnaire', { method: 'PUT', body: { questionnaire } }),
    getParticipants: () => request<AdminParticipant[]>('/participants'),
    deleteParticipant: (id: string) => request<null>(`/participants/${encodeURIComponent(id)}`, { method: 'DELETE' }),
    getRounds: () => request<AdminRound[]>('/rounds')
  }
}

interface FetchErrorLike {
  statusCode?: number
  status?: number
  statusMessage?: string
  data?: { statusMessage?: string, message?: string }
}

export function apiErrorStatus(error: unknown): number | undefined {
  const e = error as FetchErrorLike | undefined
  return e?.statusCode ?? e?.status
}

export function apiErrorMessage(error: unknown, fallback = 'Something went wrong'): string {
  const e = error as FetchErrorLike | undefined
  return e?.data?.statusMessage || e?.statusMessage || e?.data?.message || fallback
}

// Runs `fn` now and every `ms` while the calling component is mounted.
export function usePolling(fn: () => unknown, ms = 5000) {
  let timer: ReturnType<typeof setInterval> | undefined
  onMounted(() => {
    fn()
    timer = setInterval(fn, ms)
  })
  onBeforeUnmount(() => clearInterval(timer))
}

const relativeFormat = new Intl.RelativeTimeFormat('en', { numeric: 'auto' })
const units: [Intl.RelativeTimeFormatUnit, number][] = [
  ['day', 86400],
  ['hour', 3600],
  ['minute', 60],
  ['second', 1]
]

export function formatRelativeTime(iso: string): string {
  const seconds = Math.round((new Date(iso).getTime() - Date.now()) / 1000)
  if (Math.abs(seconds) < 10) {
    return 'just now'
  }
  for (const [unit, size] of units) {
    if (Math.abs(seconds) >= size) {
      return relativeFormat.format(Math.round(seconds / size), unit)
    }
  }
  return 'just now'
}
