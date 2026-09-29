import type { Questionnaire } from './questionnaire'

// Fresh ids on every call so each event owns its questions.
export function createDefaultQuestionnaire(): Questionnaire {
  return [
    { type: 'text', label: 'What do you do?', placeholder: 'Frontend dev at Acme, Vue + TypeScript', required: true },
    { type: 'text', label: 'What are you excited about lately?', placeholder: 'Signals, Rust, my sourdough starter…', required: false },
    { type: 'choice', label: 'Tabs or spaces?', options: ['Tabs', 'Spaces', 'Whatever the linter says'], required: false },
    { type: 'text', label: 'Your worst production incident, in one sentence', placeholder: 'Dropped the users table on a Friday', required: false },
    { type: 'choice', label: 'Dark mode or light mode?', options: ['Dark', 'Light', 'Depends on my mood'], required: false },
    { type: 'text', label: 'A framework you love but would never use at work?', placeholder: 'jQuery, for the nostalgia', required: false },
    { type: 'choice', label: 'Coffee, tea, or energy drinks?', options: ['Coffee', 'Tea', 'Energy drinks', 'Pure willpower'], required: false },
    { type: 'text', label: 'How will people recognize you today?', placeholder: 'Red hoodie, probably near the coffee', required: true, recognizeMe: true }
  ].map(question => ({ ...question, id: crypto.randomUUID() }) as Questionnaire[number])
}
