# Fáze 4 – Matching round: spec

Kontrakt (hotový před stavbou, T0): `shared/types/participant.ts` (`DiffLine`, `PublicMatchMember`, `PublicMatch`, `PublicProfile.match` + `latestRoundNumber`), `shared/types/admin.ts` (`AdminPair.diff`), `server/db/schema.ts` (`pairs.diff jsonb default []`, pushnuto). `toPublicProfile` zatím vrací `match: null`, `latestRoundNumber: null`.

## API

- `POST /api/events/<slug>/rounds` (vlastník eventu, `requireAdminEvent`) → `AdminRound` (i když `status = failed`; 200). `400` při < 2 účastnících („Need at least 2 participants“), `409` když na eventu už kolo běží.
  - Čísla kol: `max(number) + 1` (failed kola číslo spotřebují).
  - Retry: 1× při výjimce API nebo nevalidním výstupu. Po 2. selhání INSERT `rounds` se `status = failed`, bez `pairs`, warning do logu.
  - `ok`: INSERT `rounds` + `pairs` v transakci.
- `GET /api/events/<slug>/p/<token>` a `POST …/regenerate` → `PublicProfile` s `match` a `latestRoundNumber` (poslední kolo `ok` eventu; `match` = skupina z něj, kde je účastník, jinak `null`).
  - `others`: členové skupiny kromě účastníka; smazaný → `{ removed: true, ostatní null }`. `recognizeMe` = odpověď na otázku, jejíž `questionId` má v aktuálním dotazníku `recognizeMe: true` (fallback: `null`).

## AI (`server/utils/ai-match.ts`)

- Vzor `server/utils/ai-profile.ts`: `client.beta.messages.parse` + `betaZodOutputFormat`, `claude-sonnet-5-5`, timeout 60 s, `maxRetries: 0`, `effort: 'medium'`, `fallbacks: 'default'`.
- Vstup: event name, účastníci jako `p1…pN` (jméno, role, `hereFor`, titul nebo null, odpovědi otázka → odpověď) v `<attendees>` bloku označeném jako data; `<previous_pairs>` jako dvojice `pX–pY` (trojice rozepsat na dvojice) s pokynem „avoid if at all possible“.
- Výstup: `{ groups: { members: string[], reason: string, diff: { sign: '+' | '-', text: string }[], icebreaker: string }[] }`.
- Validace po parsování (zod + vlastní): reason ≤ 160, diff 2–4 řádky, text ≤ 80, aspoň jeden `+`, icebreaker ≤ 160 a končí `?`; každé id známé a právě jednou; skupiny 2–3; trojice max. 1 a jen při lichém N (N = 3 → jedna trojice).
- Guardrails jako u profilu: jemné špičkování, jen z odpovědí, žádný roast, angličtina, terminál/npm humor.

## Účastnické UI

- `app/pages/e/[slug]/p/[token].vue` → přesunout na `app/pages/e/[slug]/p/[token]/index.vue` (jinak by se z něj stal parent route) a přidat `…/[token]/match.vue`.
- Profil: polling 5 s (jen při viditelné stránce), blok místo `RvWaiting`:
  - `match` null + `latestRoundNumber` null → stávající waiting.
  - `match` null + `latestRoundNumber` → „You'll be matched in the next round“.
  - `match` → `✓ match found` (round N) + CTA `npm install friend →` → `/match`.
- `/match`: když kolo ještě není v localStorage `seen` → obrazovka 07 (`RvInstallLog`, řádky z designu, min. 2,5 s), pak uložit a ukázat 08. Jinak rovnou 08. Bez matche → redirect na profil.
- 08 podle `docs/design_handoff_rendez_vue/README.md`: `✓ installed friend@1.0.0`, H1 „You + Tomáš compile cleanly.“ (trojice „You + A + B“), mini karty (2 nebo 3 sloupce, uživatel pink avatar, protějšek green + green border), `$ diff you tomas` (křestní jména lowercase bez diakritiky), `+` zeleně, `-` růžově, reason, icebreaker karta (pink bg), „spot them by: …“ u každého protějšku, `(removed)` stav, ghost CTA `git commit -m "met tomáš"` → toast `[main 4f2a9c1] met tomáš`, odkaz zpět na profil.

## Admin UI

- `useAdminApi`: `runRound()` → `POST …/rounds`.
- `AdminRoundsList`: tlačítko aktivní (disabled + tooltip při < 2 účastnících – počet z `GET …/admin` nebo participants), loading, chyby 400/409 jako toast; po dokončení refresh. Kolo: badge `ok`/`failed`, failed = hláška „Matching failed. Run a new round.“; skupiny: členové (emoji, jméno, titul, `(removed)`), reason, diff (`+`/`-` barevně, mono), icebreaker.

## Úkoly

| # | Úkol | Soubory (vlastnictví) | Závisí |
|---|---|---|---|
| T0 | `docs: add phase 4 docs` + `feat(shared): add match contract` | docs, shared/types, schema | – |
| T1 | `feat(ai): generate matching round` + `feat(api): run matching rounds` + `feat(api): include match in participant profile` | `server/utils/ai-match.ts`, `server/utils/match.ts`, `server/utils/registration.ts`, `server/api/events/[slug]/rounds.post.ts`, `server/api/events/[slug]/p/**` | T0 |
| T2 | `feat(ui): show participant match` | `app/pages/e/[slug]/p/**`, `app/components/rv/*` (nové + `Waiting.vue`), `app/composables/useParticipantTokens.ts` | T0 |
| T3 | `feat(admin): run matching rounds` | `app/components/admin/RoundsList.vue`, `app/composables/useAdminApi.ts` | T0 |
| T4 | Ověření curlem (kolo s živou AI), lint, typecheck, HANDOFF | – | T1–T3 |
