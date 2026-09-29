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
}
