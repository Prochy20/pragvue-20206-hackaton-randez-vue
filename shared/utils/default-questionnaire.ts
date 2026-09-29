import type { Questionnaire } from './questionnaire'

// Fresh ids on every call so each event owns its questions.
// A/B cards first, free text last, as in the participant design.
export function createDefaultQuestionnaire(): Questionnaire {
  return [
    { type: 'choice', label: 'Indentation. Choose wisely.', options: ['Tabs', 'Spaces'], required: false },
    { type: 'choice', label: 'Your editor theme?', options: ['Dark mode', 'Light mode'], required: false },
    { type: 'choice', label: 'Vue, but which API?', options: ['Options API', 'Composition API'], required: false },
    { type: 'choice', label: 'Debugging weapon of choice?', options: ['console.log', 'debugger'], required: false },
    { type: 'choice', label: 'Deploy on a Friday?', options: ['Live dangerously', 'Never. Ever.'], required: false },
    { type: 'choice', label: 'One repo to rule them all?', options: ['Monorepo', 'Polyrepo'], required: false },
    { type: 'choice', label: 'Fuel of choice?', options: ['Coffee', 'Tea'], required: false },
    { type: 'choice', label: 'Semicolons?', options: ['Always;', 'Never'], required: false },
    { type: 'text', label: 'Worst production incident?', placeholder: 'DROP TABLE users; on a Friday at 16:58', required: false },
    { type: 'text', label: 'How will people recognize you today?', placeholder: 'Red hoodie, probably near the coffee', required: true, recognizeMe: true }
  ].map(question => ({ ...question, id: crypto.randomUUID() }) as Questionnaire[number])
}
