import type { AiStatus } from './participant'

// Public, projector-safe data only: no tokens, ids, answers, taglines or diffs.
export interface WallParticipant {
  // Per-event registration number, the stable key on the wall.
  number: number
  name: string
  title: string | null
  emoji: string | null
  aiStatus: AiStatus
  // In a group of the latest successful round; false = registered after it.
  inLatestRound: boolean
}

// removed === true means the admin deleted this participant after the round; other fields are null.
export interface WallMember {
  removed: boolean
  name: string | null
  title: string | null
  emoji: string | null
}

export interface WallGroup {
  // Alphabetical by name, removed members last.
  members: WallMember[]
  reason: string
  icebreaker: string
}

export interface WallRound {
  number: number
  // Alphabetical by the first member's name.
  groups: WallGroup[]
}

export interface WallData {
  event: { slug: string, name: string }
  // Newest first.
  participants: WallParticipant[]
  // Latest successful round, null before the first one.
  round: WallRound | null
  // A matching round is running right now.
  matching: boolean
}
