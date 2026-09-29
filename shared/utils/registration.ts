import { z } from 'zod'

export const NAME_MAX = 60
export const ANSWER_MAX = 140
export const HERE_FOR_OPTIONS = ['talks', 'new people', 'hiring', 'free coffee'] as const

const shortText = (label: string) => z.string().trim().max(NAME_MAX, `${label} can have at most ${NAME_MAX} characters`)

export const registrationSchema = z.object({
  name: shortText('Name').min(1, 'Tell us your name'),
  role: shortText('Role').min(1, 'Tell us what you do'),
  company: shortText('Company').optional(),
  hereFor: z.array(z.enum(HERE_FOR_OPTIONS)).max(HERE_FOR_OPTIONS.length).default([]),
  // questionId -> answer; choice answers are the option text.
  answers: z.record(z.string(), z.string().trim().max(ANSWER_MAX, `Answers can have at most ${ANSWER_MAX} characters`))
})

export type HereFor = typeof HERE_FOR_OPTIONS[number]
export type RegistrationInput = z.input<typeof registrationSchema>
