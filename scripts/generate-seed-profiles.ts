// Generates seed profiles once with the real AI prompt: pnpm seed:profiles
import { readFile, writeFile } from 'node:fs/promises'
import { generateProfile, type GeneratedProfile } from '../server/utils/ai-profile.ts'
import { createDefaultQuestionnaire } from '../shared/utils/default-questionnaire.ts'
import { loadEnv, personaAnswers, personasUrl, profilesUrl, type Persona } from './seed-lib.ts'

loadEnv()
const apiKey = process.env.NUXT_ANTHROPIC_API_KEY
if (!apiKey) {
  console.error('NUXT_ANTHROPIC_API_KEY is not set')
  process.exit(1)
}

const personas: Persona[] = JSON.parse(await readFile(personasUrl, 'utf8'))
const questionnaire = createDefaultQuestionnaire()
const profiles: GeneratedProfile[] = []

// Sequential, so each profile sees the titles taken before it, like live registrations.
for (const persona of personas) {
  const input = {
    eventName: 'PragVue 2026 (demo)',
    name: persona.name,
    role: persona.role,
    company: persona.company,
    hereFor: persona.hereFor,
    answers: personaAnswers(questionnaire, persona),
    takenTitles: profiles.map(p => p.title)
  }
  let profile: GeneratedProfile | null = null
  for (let attempt = 0; attempt < 4 && !profile; attempt++) {
    profile = await generateProfile(input, apiKey)
  }
  if (!profile) {
    console.error(`Profile generation failed for ${persona.name}`)
    process.exit(1)
  }
  console.log(`${profile.emoji}  ${persona.name}: ${profile.title}`)
  profiles.push(profile)
}

await writeFile(profilesUrl, `${JSON.stringify(profiles, null, 2)}\n`)
console.log(`Wrote ${profiles.length} profiles`)
