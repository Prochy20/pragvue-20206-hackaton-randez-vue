import { randomBytes } from 'node:crypto'
import { and, eq, isNotNull } from 'drizzle-orm'
import { events, participants } from '~~/server/db/schema'

type EventRow = typeof events.$inferSelect
type ParticipantRow = typeof participants.$inferSelect

export function generateParticipantToken() {
  return randomBytes(24).toString('base64url')
}

export async function requirePublicEvent(slug: string | undefined) {
  const row = slug ? await useDb().query.events.findFirst({ where: eq(events.slug, slug) }) : undefined
  if (!row) {
    throw createError({ statusCode: 404, statusMessage: 'Event not found' })
  }
  return row
}

export async function requireParticipant(event: EventRow, token: string | undefined) {
  const row = token
    ? await useDb().query.participants.findFirst({
        where: and(eq(participants.token, token), eq(participants.eventId, event.id))
      })
    : undefined
  if (!row) {
    throw createError({ statusCode: 404, statusMessage: 'Profile not found' })
  }
  return row
}

// Validates raw answers against the event's current questionnaire and snapshots the question text.
export function buildAnswers(questionnaire: Questionnaire, input: Record<string, string>): Answer[] {
  const answers: Answer[] = []
  for (const question of questionnaire) {
    const answer = input[question.id]?.trim() ?? ''
    if (!answer) {
      if (question.required) {
        const message = question.id in input
          ? `"${question.label}" is required`
          : 'The questionnaire changed, please reload'
        throw createError({ statusCode: 400, statusMessage: message })
      }
      continue
    }
    if (question.type === 'choice' && !question.options?.includes(answer)) {
      throw createError({ statusCode: 400, statusMessage: `Pick one of the options for "${question.label}"` })
    }
    answers.push({ questionId: question.id, question: question.label, type: question.type, answer })
  }
  return answers
}

export async function takenTitles(eventId: string, exceptId?: string) {
  const rows = await useDb().select({ id: participants.id, title: participants.title })
    .from(participants)
    .where(and(eq(participants.eventId, eventId), isNotNull(participants.title)))
  return rows.filter(row => row.id !== exceptId).map(row => row.title!)
}

// Maps a generated profile (or its absence) onto participant columns.
export function profileColumns(profile: GeneratedProfile | null) {
  return profile
    ? { ...profile, aiStatus: 'ok' as const }
    : { title: null, tagline: null, emoji: null, specialMove: null, weakness: null, peerDependency: null, dependencies: [], aiStatus: 'failed' as const }
}

// matchState comes from loadProfileMatch.
export function toPublicProfile(
  event: EventRow,
  row: ParticipantRow,
  matchState: Pick<PublicProfile, 'match' | 'latestRoundNumber'>
): PublicProfile {
  return {
    number: row.number,
    name: row.name,
    role: row.role,
    company: row.company,
    hereFor: row.hereFor,
    title: row.title,
    tagline: row.tagline,
    emoji: row.emoji,
    specialMove: row.specialMove,
    weakness: row.weakness,
    peerDependency: row.peerDependency,
    dependencies: row.dependencies,
    aiStatus: row.aiStatus,
    event: { slug: event.slug, name: event.name },
    ...matchState
  }
}
