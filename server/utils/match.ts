import { and, desc, eq, inArray } from 'drizzle-orm'
import type { events } from '~~/server/db/schema'
import { pairs, participants, rounds } from '~~/server/db/schema'

type EventRow = typeof events.$inferSelect
type ParticipantRow = typeof participants.$inferSelect

// Rounds of an event (newest first) with their groups; pass roundId to load just one.
export async function loadAdminRounds(eventId: string, roundId?: string): Promise<AdminRound[]> {
  const db = useDb()
  const roundFilter = roundId ? and(eq(rounds.eventId, eventId), eq(rounds.id, roundId)) : eq(rounds.eventId, eventId)

  const roundRows = await db.select().from(rounds)
    .where(roundFilter)
    .orderBy(desc(rounds.number))
  const pairRows = await db.select({ pair: pairs }).from(pairs)
    .innerJoin(rounds, eq(rounds.id, pairs.roundId))
    .where(roundFilter)
  const members = await db.select({ id: participants.id, name: participants.name, title: participants.title, emoji: participants.emoji })
    .from(participants)
    .where(eq(participants.eventId, eventId))

  const memberById = new Map(members.map(m => [m.id, m]))

  return roundRows.map(round => ({
    id: round.id,
    number: round.number,
    status: round.status,
    createdAt: round.createdAt.toISOString(),
    pairs: pairRows
      .map(({ pair }) => pair)
      .filter(pair => pair.roundId === round.id)
      .map(pair => ({
        id: pair.id,
        reason: pair.reason,
        diff: pair.diff,
        icebreaker: pair.icebreaker,
        members: pair.participantIds.map((id) => {
          const member = memberById.get(id)
          return { id, name: member?.name ?? null, title: member?.title ?? null, emoji: member?.emoji ?? null }
        })
      }))
  }))
}

// Every pair of participants that already met in this event; trios count as three pairs.
export async function previousPairs(eventId: string): Promise<[string, string][]> {
  const rows = await useDb().select({ participantIds: pairs.participantIds }).from(pairs)
    .innerJoin(rounds, eq(rounds.id, pairs.roundId))
    .where(and(eq(rounds.eventId, eventId), eq(rounds.status, 'ok')))

  const result: [string, string][] = []
  for (const { participantIds: ids } of rows) {
    for (let i = 0; i < ids.length; i++) {
      for (let j = i + 1; j < ids.length; j++) {
        result.push([ids[i]!, ids[j]!])
      }
    }
  }
  return result
}

// The participant's group from the event's latest successful round, plus that round's number.
export async function loadProfileMatch(event: EventRow, participant: ParticipantRow) {
  const db = useDb()
  const [round] = await db.select().from(rounds)
    .where(and(eq(rounds.eventId, event.id), eq(rounds.status, 'ok')))
    .orderBy(desc(rounds.number))
    .limit(1)
  if (!round) {
    return { match: null, latestRoundNumber: null }
  }

  const groups = await db.select().from(pairs).where(eq(pairs.roundId, round.id))
  const group = groups.find(g => g.participantIds.includes(participant.id))
  if (!group) {
    return { match: null, latestRoundNumber: round.number }
  }

  const otherIds = group.participantIds.filter(id => id !== participant.id)
  const others = await db.select().from(participants)
    .where(and(eq(participants.eventId, event.id), inArray(participants.id, otherIds)))
  const otherById = new Map(others.map(o => [o.id, o]))
  const recognizeMeId = event.questionnaire.find(q => q.recognizeMe)?.id

  const match: PublicMatch = {
    roundId: round.id,
    roundNumber: round.number,
    others: otherIds.map((id): PublicMatchMember => {
      const other = otherById.get(id)
      if (!other) {
        return { removed: true, name: null, role: null, title: null, tagline: null, emoji: null, recognizeMe: null }
      }
      return {
        removed: false,
        name: other.name,
        role: other.role,
        title: other.title,
        tagline: other.tagline,
        emoji: other.emoji,
        recognizeMe: other.answers.find(a => a.questionId === recognizeMeId)?.answer ?? null
      }
    }),
    reason: group.reason,
    diff: group.diff,
    icebreaker: group.icebreaker
  }
  return { match, latestRoundNumber: round.number }
}

// Events with a round in progress; a single server process is enough for the prototype.
const runningRounds = new Set<string>()

// Claims the event's round lock; false when a round is already running.
export function startRound(eventId: string): boolean {
  if (runningRounds.has(eventId)) {
    return false
  }
  runningRounds.add(eventId)
  return true
}

export function finishRound(eventId: string) {
  runningRounds.delete(eventId)
}

export function isRoundRunning(eventId: string): boolean {
  return runningRounds.has(eventId)
}

const byName = (a: string, b: string) => a.localeCompare(b, 'en')

// Projector-safe snapshot: participants newest first plus the latest successful round.
export async function loadWall(event: EventRow): Promise<WallData> {
  const db = useDb()
  const people = await db.select({ id: participants.id, number: participants.number, name: participants.name, title: participants.title, emoji: participants.emoji, aiStatus: participants.aiStatus })
    .from(participants)
    .where(eq(participants.eventId, event.id))
    .orderBy(desc(participants.number))
  const [round] = await db.select({ id: rounds.id, number: rounds.number }).from(rounds)
    .where(and(eq(rounds.eventId, event.id), eq(rounds.status, 'ok')))
    .orderBy(desc(rounds.number))
    .limit(1)
  const groups = round ? await db.select().from(pairs).where(eq(pairs.roundId, round.id)) : []

  const personById = new Map(people.map(p => [p.id, p]))
  const inRound = new Set(groups.flatMap(g => g.participantIds))

  const wallGroups = groups.map((group): WallGroup => {
    const present = group.participantIds.flatMap(id => personById.get(id) ?? [])
      .sort((a, b) => byName(a.name, b.name))
    const removedCount = group.participantIds.length - present.length
    return {
      members: [
        ...present.map((p): WallMember => ({ removed: false, name: p.name, title: p.title, emoji: p.emoji })),
        ...Array.from({ length: removedCount }, (): WallMember => ({ removed: true, name: null, title: null, emoji: null }))
      ],
      reason: group.reason,
      icebreaker: group.icebreaker
    }
  }).sort((a, b) => byName(a.members[0]?.name ?? '', b.members[0]?.name ?? ''))

  return {
    event: { slug: event.slug, name: event.name },
    participants: people.map(p => ({
      number: p.number,
      name: p.name,
      title: p.title,
      emoji: p.emoji,
      aiStatus: p.aiStatus,
      inLatestRound: inRound.has(p.id)
    })),
    round: round ? { number: round.number, groups: wallGroups } : null,
    matching: isRoundRunning(event.id)
  }
}
