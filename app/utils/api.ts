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
