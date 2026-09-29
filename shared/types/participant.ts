import type { HereFor } from '../utils/registration'
import type { Questionnaire } from '../utils/questionnaire'

export type AiStatus = 'ok' | 'failed'

export interface PublicEvent {
  slug: string
  name: string
  questionnaire: Questionnaire
}

export interface RegistrationResult {
  token: string
  aiStatus: AiStatus
}

export interface PublicProfile {
  number: number
  name: string
  role: string
  company: string | null
  hereFor: HereFor[]
  title: string | null
  tagline: string | null
  emoji: string | null
  specialMove: string | null
  weakness: string | null
  peerDependency: string | null
  dependencies: string[]
  aiStatus: AiStatus
  event: { slug: string, name: string }
  // Match from the latest successful round this participant is in.
  match: PublicMatch | null
  // Latest successful round of the event; set while match is null means "registered after it".
  latestRoundNumber: number | null
}

// One line of the `$ diff you tomas` block: + in common, - a friendly difference.
export interface DiffLine {
  sign: '+' | '-'
  text: string
}

// removed === true means the admin deleted this participant after the round; other fields are null.
export interface PublicMatchMember {
  removed: boolean
  name: string | null
  role: string | null
  title: string | null
  tagline: string | null
  emoji: string | null
  // Answer to the questionnaire's recognizeMe question, if any.
  recognizeMe: string | null
}

export interface PublicMatch {
  roundId: string
  roundNumber: number
  // Everyone in the group except the viewer: 1 for a pair, 2 for a trio.
  others: PublicMatchMember[]
  reason: string
  diff: DiffLine[]
  icebreaker: string
}
