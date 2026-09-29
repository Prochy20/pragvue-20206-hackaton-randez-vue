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

// For attendee screens: 4xx messages are written for users, 5xx ones (e.g. "Database is not configured") aren't.
export function userErrorMessage(error: unknown, fallback: string): string {
  const status = apiErrorStatus(error)
  return status && status >= 400 && status < 500 ? apiErrorMessage(error, fallback) : fallback
}
