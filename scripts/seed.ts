// Local testing seed: pnpm seed. Recreates the demo event on every run; never run against production.
import { randomBytes } from 'node:crypto'
import { readFile } from 'node:fs/promises'
import { Hash } from '@adonisjs/hash'
import { Scrypt } from '@adonisjs/hash/drivers/scrypt'
import { eq } from 'drizzle-orm'
import { drizzle } from 'drizzle-orm/node-postgres'
import { events, participants, users } from '../server/db/schema.ts'
import type { GeneratedProfile } from '../server/utils/ai-profile.ts'
import { createDefaultQuestionnaire } from '../shared/utils/default-questionnaire.ts'
import { loadEnv, personaAnswers, personasUrl, profilesUrl, type Persona } from './seed-lib.ts'

const EMAIL = 'demo@rendez-vue.dev'
const PASSWORD = 'demo1234'
const SLUG = 'pragvue-2026-demo'
const NAME = 'PragVue 2026 (demo)'

loadEnv()
const url = process.env.NUXT_DATABASE_URL
if (!url) {
  console.error('NUXT_DATABASE_URL is not set')
  process.exit(1)
}

const personas: Persona[] = JSON.parse(await readFile(personasUrl, 'utf8'))
const profiles: GeneratedProfile[] = JSON.parse(await readFile(profilesUrl, 'utf8'))
if (profiles.length !== personas.length) {
  console.error('profiles.json is out of date, run pnpm seed:profiles')
  process.exit(1)
}

const db = drizzle(url, { casing: 'snake_case' })

try {
  await db.transaction(async (tx) => {
    // Same scrypt defaults as nuxt-auth-utils' hashPassword, so the demo login works.
    const passwordHash = await new Hash(new Scrypt({})).make(PASSWORD)
    const [owner] = await tx.insert(users)
      .values({ email: EMAIL, passwordHash })
      .onConflictDoUpdate({ target: users.email, set: { passwordHash } })
      .returning({ id: users.id })

    await tx.delete(events).where(eq(events.slug, SLUG))
    const questionnaire = createDefaultQuestionnaire()
    const [event] = await tx.insert(events)
      .values({ slug: SLUG, name: NAME, ownerId: owner!.id, questionnaire })
      .returning({ id: events.id })

    await tx.insert(participants).values(personas.map((persona, index) => ({
      eventId: event!.id,
      token: randomBytes(24).toString('base64url'),
      number: index + 1,
      name: persona.name,
      role: persona.role,
      company: persona.company,
      hereFor: persona.hereFor,
      answers: personaAnswers(questionnaire, persona),
      ...profiles[index]!,
      aiStatus: 'ok' as const
    })))
  })
} finally {
  await db.$client.end()
}

console.log(`Seeded "${NAME}" with ${personas.length} participants, no rounds yet.`)
console.log(`  login:  ${EMAIL} / ${PASSWORD}`)
console.log(`  admin:  /e/${SLUG}/admin`)
console.log(`  wall:   /e/${SLUG}/wall`)
