import type { H3Event } from 'h3'
import type { z } from 'zod'

// Like readValidatedBody, but a 400 carries the first human-readable issue as statusMessage.
export async function readBodyWith<T extends z.ZodType>(event: H3Event, schema: T): Promise<z.infer<T>> {
  const result = schema.safeParse(await readBody(event))
  if (!result.success) {
    const issue = result.error.issues[0]
    throw createError({ statusCode: 400, statusMessage: issue?.message ?? 'Invalid request', data: result.error.issues })
  }
  return result.data
}
