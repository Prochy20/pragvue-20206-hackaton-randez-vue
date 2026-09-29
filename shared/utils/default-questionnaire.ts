import type { Questionnaire } from './questionnaire'

// Fresh ids on every call so each event owns its questions.
// A/B cards first, free text last, as in the participant design.
export function createDefaultQuestionnaire(): Questionnaire {
  return [
    { type: 'choice', label: 'In a hackathon team you are…', options: ['The one who ships', 'The one who pitches'], required: false },
    { type: 'choice', label: 'AI wrote your code. You…', options: ['Vibe it, ship it', 'Review every line'], required: false },
    { type: 'choice', label: 'Your prototype needs…', options: ['A real backend', 'Just a pretty UI'], required: false },
    { type: 'choice', label: 'Deploy on a Friday?', options: ['Live dangerously', 'Never. Ever.'], required: false },
    { type: 'choice', label: 'Debugging weapon of choice?', options: ['console.log', 'debugger'], required: false },
    { type: 'choice', label: 'New library. You…', options: ['Read the docs first', 'Figure it out live'], required: false },
    { type: 'choice', label: 'Pint of choice?', options: ['Guinness', 'Kofola'], required: false },
    { type: 'choice', label: 'Nuxt or plain Vue?', options: ['Nuxt, obviously', 'Just Vue, thanks'], required: false },
    { type: 'text', label: 'Which npm package would you delete from the internet?', placeholder: 'left-pad, for old times\' sake', required: false },
    { type: 'text', label: 'How will people recognize you today?', placeholder: 'Red hoodie, probably near the Guinness', required: true, recognizeMe: true }
  ].map(question => ({ ...question, id: crypto.randomUUID() }) as Questionnaire[number])
}
