# Fáze 2 – Event + admin: specifikace

Viz [intent](intent.md) a [rozhodnutí](decisions.md). Sloupec „Soubory“ určuje vlastnictví pro paralelní agenty.

## Úkoly

| ID | Úkol | Závisí na | Soubory (vlastní) | Commit |
|---|---|---|---|---|
| T0 | Dokumentace fáze | – | `docs/phase-2-event-admin/*`, `docs/README.md` | `docs: add phase 2 docs` |
| T1 | Kontrakt: zod, schémata, typy, výchozí sada | T0 | `package.json`, `shared/**` | `feat(shared): add questionnaire schema and default set` |
| T2 | Server: utils + API | T1 | `server/utils/slug.ts`, `server/utils/admin.ts`, `server/api/events/**` | `feat(api): add event and admin endpoints` |
| T3 | Create event na `/` | T1 | `app/pages/index.vue`, `app/composables/useAdminKeys.ts` | `feat(ui): add create event form` |
| T4 | Admin stránka | T1 | `app/pages/e/[slug]/admin.vue`, `app/components/admin/**`, `app/composables/useAdminApi.ts` | `feat(ui): add admin page` (klidně víc commitů) |
| T5 | Ruční ověření + status | T2–T4 | `docs/phase-2-event-admin/status.md` | – |

T2, T3, T4 jsou po T1 nezávislé (nesdílí soubory). T4 dělá subagent, T2+T3 hlavní session.

## Konvence

- Nuxt 4 `shared/`: `shared/utils/*` a `shared/types/*` se auto-importují na klientu i serveru.
- DB vždy `await useDb()`, `` db.sql`…${x}` `` → `{ rows }`. ID `crypto.randomUUID()`, čas ISO string, JSON sloupce `JSON.stringify` / `JSON.parse`.
- ESLint stylistic: bez středníků, single quotes, bez trailing commas.
- UI texty anglicky.

## T1 – Kontrakt

`pnpm add zod` (v4).

### `shared/utils/questionnaire.ts`

```ts
import { z } from 'zod'

export const MAX_QUESTIONS = 15

export const questionSchema = z.object({
  id: z.string().min(1),
  type: z.enum(['text', 'choice']),
  label: z.string().trim().min(3).max(200),
  options: z.array(z.string().trim().min(1).max(60)).min(2).max(6).optional(),
  required: z.boolean(),
  placeholder: z.string().trim().max(100).optional(),
  recognizeMe: z.boolean().optional()
}).superRefine(...)  // choice ⇒ options povinné; text ⇒ options zakázané; recognizeMe jen u text

export const questionnaireSchema = z.array(questionSchema).min(1).max(MAX_QUESTIONS)
  .superRefine(...)  // max 1× recognizeMe, unikátní id

export const createEventSchema = z.object({ name: z.string().trim().min(3).max(80) })

export type Question = z.infer<typeof questionSchema>
export type Questionnaire = z.infer<typeof questionnaireSchema>
```

### `shared/utils/default-questionnaire.ts`

`createDefaultQuestionnaire(): Questionnaire` – nová UUID při každém volání.

| # | label | type | options / placeholder | required | recognizeMe |
|---|---|---|---|---|---|
| 1 | What do you do? | text | „Frontend dev at Acme, Vue + TypeScript“ | ✅ | |
| 2 | What are you excited about lately? | text | „Signals, Rust, my sourdough starter…“ | | |
| 3 | Tabs or spaces? | choice | Tabs / Spaces / Whatever the linter says | | |
| 4 | Your worst production incident, in one sentence | text | „Dropped the users table on a Friday“ | | |
| 5 | Dark mode or light mode? | choice | Dark / Light / Depends on my mood | | |
| 6 | A framework you love but would never use at work? | text | „jQuery, for the nostalgia“ | | |
| 7 | Coffee, tea, or energy drinks? | choice | Coffee / Tea / Energy drinks / Pure willpower | | |
| 8 | How will people recognize you today? | text | „Red hoodie, probably near the coffee“ | ✅ | ✅ |

### `shared/types/admin.ts`

```ts
export interface Answer { questionId: string, question: string, type: 'text' | 'choice', answer: string }

export interface CreatedEvent { slug: string, adminKey: string }

export interface AdminEvent {
  id: string, slug: string, name: string
  questionnaire: Questionnaire
  participantCount: number
  createdAt: string
}

export interface AdminParticipant {
  id: string, name: string
  title: string | null, tagline: string | null, emoji: string | null
  aiStatus: 'ok' | 'failed'
  answers: Answer[]
  createdAt: string
}

export interface AdminPairMember { id: string, name: string | null, title: string | null, emoji: string | null } // name null = removed

export interface AdminPair { id: string, members: AdminPairMember[], reason: string, icebreaker: string }

export interface AdminRound { id: string, number: number, status: 'ok' | 'failed', createdAt: string, pairs: AdminPair[] }
```

(`Questionnaire` importovat z `../utils/questionnaire`.)

## T2 – Server

### `server/utils/slug.ts`

- `slugify(name)`: NFKD, odstranit diakritiku, lowercase, ne-`[a-z0-9]` → `-`, sloučit/oříznout `-`, max 40 znaků. Prázdný výsledek → `'event'`.
- `uniqueSlug(name)`: když `slugify` existuje v `events`, přidat `-` + 4 znaky `[a-z0-9]` (opakovat do volného).

### `server/utils/admin.ts`

`requireAdminEvent(event: H3Event)` → řádek eventu (`id, slug, name, admin_key, questionnaire, created_at`). Slug z `getRouterParam`, klíč z `getHeader(event, 'x-admin-key')`. Neexistuje → 404 `Event not found`; špatný / chybějící klíč → 403 `Invalid admin key`.

Admin klíč: `randomBytes(24).toString('base64url')`.

### Endpointy

| Metoda | Cesta | Auth | Body | Odpověď |
|---|---|---|---|---|
| POST | `/api/events` | – | `{ name }` (`createEventSchema`) | `CreatedEvent` |
| GET | `/api/events/[slug]/admin` | key | – | `AdminEvent` |
| PUT | `/api/events/[slug]/questionnaire` | key | `{ questionnaire }` (`questionnaireSchema`) | `{ questionnaire }` (normalizovaný) |
| GET | `/api/events/[slug]/participants` | key | – | `AdminParticipant[]` (nejnovější první) |
| DELETE | `/api/events/[slug]/participants/[id]` | key | – | `204`; cizí/neexistující id → 404 |
| GET | `/api/events/[slug]/rounds` | key | – | `AdminRound[]` (nejvyšší `number` první, páry se jmény; smazaný člen → `name/title/emoji: null`) |

Validace přes `readValidatedBody(event, schema.parse)` → 400 s zod chybou. POST ukládá `createDefaultQuestionnaire()`.

## T3 – Create event (`/`)

- `UForm` se `createEventSchema`, jedno pole „Event name“ (placeholder „PragVue 2026“), tlačítko „Create event“ s loading.
- Úspěch: `useAdminKeys().save(slug, adminKey)` → `navigateTo('/e/<slug>/admin?key=<adminKey>')`.
- Chyba: `UAlert` color error pod formulářem (nebo toast).
- `useAdminKeys()`: `save(slug, key)`, `get(slug)` nad localStorage klíčem `icebreaker:admin-keys` (objekt), vše v try/catch.
- Pitch nad formulářem zůstává.

## T4 – Admin (`/e/[slug]/admin`)

### Načtení

- `key` z `route.query.key`; když chybí, fallback `useAdminKeys().get(slug)` a doplnit do URL (`router.replace`).
- `useAdminApi(slug, key)` – obal nad `$fetch` / `useFetch` s headerem `x-admin-key`.
- `GET /admin`: loading skeleton; 403 / chybí klíč → error stav „Invalid admin link“ (ikona, text „Check the link you got when creating the event.“, odkaz na `/`); 404 → „Event not found“.
- Po úspěchu uložit klíč přes `useAdminKeys().save`.

### Pruh nahoře

- Název eventu (h1), `UAlert` (neutral/warning, zavíratelný) „Bookmark this page – it's the only way back to your admin.“ s copy admin URL.
- Tři odkazy s copy tlačítkem: **Registration** `/e/<slug>`, **Live wall** `/e/<slug>/wall`, **Admin** (aktuální URL s klíčem). Absolutní URL přes `useRequestURL().origin`. Copy přes `navigator.clipboard` + toast „Copied“.

### Taby (`UTabs`, `?tab=questionnaire|participants|rounds`, default questionnaire)

**Questionnaire** (`components/admin/QuestionnaireEditor.vue`, `QuestionCard.vue`)
- Lokální kopie (`structuredClone`) dotazníku z `AdminEvent`; dirty = JSON rozdíl proti uložené verzi.
- `participantCount > 0` → info `UAlert` „{n} people already registered – their answers keep the old wording.“
- Každá otázka `UCard`: číslo, `USelect` type (Short text / Single choice), `UInput` label, u text `UInput` placeholder a `USwitch` „Show with match (how to recognize me)“, u choice seznam `UInput` možností s delete + „Add option“ (max 6), `USwitch` Required, akce ↑ ↓ delete.
- Přepnutí na choice: `options = ['', '']`, smaže `placeholder`/`recognizeMe`; na text: smaže `options`.
- Zapnutí `recognizeMe` vypne ho u ostatních.
- Dole „Add question“ (nová text otázka, `crypto.randomUUID()`), skryté při 15.
- Sticky/spodní lišta: „Save questionnaire“ (disabled když není dirty, loading), „Discard changes“. Klientská validace `questionnaireSchema.safeParse` před odesláním; chyby ukázat (stačí první chyba v toastu/alertu + zvýraznit kartu). Úspěch → toast „Questionnaire saved“, nová uložená verze.
- Dirty → `beforeunload` + `onBeforeRouteLeave` confirm. (Výjimka z „žádné `confirm()`“ jen pro leave guard.)

**Participants** (`components/admin/ParticipantsTable.vue`)
- `GET /participants`, polling 5 s jen když je tab aktivní.
- Empty: ikona + „No one has registered yet. Share the registration link.“
- `UTable`: emoji, name, title (italic „—“ když null), AI status `UBadge` (ok success / failed error), registered (relativní čas, `Intl.RelativeTimeFormat`), delete `UButton` ghost error.
- Rozbalení řádku: tagline + seznam odpovědí (question → answer).
- Delete → `UModal` „Remove {name}? Their past matches stay in round history.“ → DELETE → refresh + toast.

**Rounds** (`components/admin/RoundsList.vue`)
- Nahoře vypnuté `UButton` „Run matching round“ s `UTooltip` „Coming soon“.
- `GET /rounds`, polling 5 s jen když je tab aktivní.
- Empty: „No matching rounds yet.“
- `UAccordion`: „Round {n}“ + status badge + čas; obsah = páry: členové (emoji + jméno + titul, `null` name → „(removed)“ šedě), reason, icebreaker (citace).

## T5 – Ruční ověření

Kritéria z [intent](intent.md). Testovací data:

```sh
sqlite3 .data/db.sqlite "INSERT INTO participants VALUES ('p1','<event_id>','t1','Ada','[{\"questionId\":\"x\",\"question\":\"Tabs or spaces?\",\"type\":\"choice\",\"answer\":\"Tabs\"}]','Chief Tab Evangelist','Indents with conviction.','🧭','ok','2026-09-29T10:00:00.000Z');"
```

(+ druhý účastník, kolo a pár; pak smazat jednoho a ověřit „(removed)“.)
