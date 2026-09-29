import type { Questionnaire } from '../shared/utils/questionnaire.ts'
import type { HereFor } from '../shared/utils/registration.ts'

export interface Persona {
  name: string
  role: string
  company: string | null
  hereFor: HereFor[]
  // Keyed by question label from the default questionnaire.
  answers: Record<string, string>
}

export const personasUrl = new URL('./seed-data/participants.json', import.meta.url)
export const profilesUrl = new URL('./seed-data/profiles.json', import.meta.url)

export function loadEnv() {
  try {
    process.loadEnvFile()
  } catch { /* no .env, rely on the real environment */ }
}

// Same shape registration snapshots: question text is stored next to the answer.
export function personaAnswers(questionnaire: Questionnaire, persona: Persona) {
  return questionnaire.flatMap((question) => {
    const answer = persona.answers[question.label]
    return answer ? [{ questionId: question.id, question: question.label, type: question.type, answer }] : []
  })
}
