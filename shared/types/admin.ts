import type { Questionnaire } from '../utils/questionnaire'

export interface Answer {
  questionId: string
  question: string
  type: 'text' | 'choice'
  answer: string
}

export interface CreatedEvent {
  slug: string
}

export interface AdminEvent {
  id: string
  slug: string
  name: string
  questionnaire: Questionnaire
  participantCount: number
  createdAt: string
}

export interface AdminParticipant {
  id: string
  name: string
  role: string
  company: string | null
  title: string | null
  tagline: string | null
  emoji: string | null
  aiStatus: 'ok' | 'failed'
  answers: Answer[]
  createdAt: string
}

// name === null means the participant was removed after the round.
export interface AdminPairMember {
  id: string
  name: string | null
  title: string | null
  emoji: string | null
}

export interface AdminPair {
  id: string
  members: AdminPairMember[]
  reason: string
  icebreaker: string
}

export interface AdminRound {
  id: string
  number: number
  status: 'ok' | 'failed'
  createdAt: string
  pairs: AdminPair[]
}

export interface OrganizerEvent {
  slug: string
  name: string
  participantCount: number
  createdAt: string
}
