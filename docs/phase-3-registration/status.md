# Fáze 3 – Registrace + AI titul: status

**Stav:** postaveno 2026-09-29 (vč. design handoffu Rendez-Vue, obrazovky 01–06). API ověřené curlem, lint + typecheck čisté. UI proklikané uživatelem bez nálezů (T9). **Fáze hotová.**

## Úkoly

- [x] T0 – `docs: add phase 3 docs`
- [x] T1 – `chore(db): switch to postgres with drizzle`
- [x] T2 – `feat(auth): add organizer accounts`
- [x] T3 – `refactor(admin): authorize by session instead of admin key`
- [x] T4 – `feat(ui): list organizer events` + `fix(ui): add noopener noreferrer to external links`
- [x] T5 – `feat(shared): add registration contract and a/b questionnaire`
- [x] T6 – `feat(ai): generate participant profile`
- [x] T7 – `feat(api): add participant registration endpoints`
- [x] T8 – `style: rebrand to Rendez-Vue and add design tokens` + `feat(ui): add participant registration flow` + `feat(ui): add participant profile page` (profil postavil subagent)
- [x] T9 – ruční proklik UI uživatelem, bez nálezů

## Ověření

| Kritérium (intent) | Výsledek |
|---|---|
| 1. Postgres, žádné SQLite | ✅ |
| 2. Signup / login / logout, chyby | ✅ API (curl); UI: proklik |
| 3. Nepřihlášený → `/login`, cizí event 404 | ✅ API 401/404, `/` → 302 `/login` |
| 4. Create event, Your events | ✅ API; UI: proklik |
| 5. Admin z fáze 2 beze změny | ✅ API; editor A/B: proklik |
| 6. `/e/<slug>` formulář, neexistující slug | ✅ SSR (landing, „No event at this address“) |
| 7. Registrace → profil s AI | ✅ API s reálným klíčem („Options API Tab Purist ☕“); UI: proklik |
| 8. Chyba AI + Try again | ✅ API regenerate (failed → ok, pak 409); UI: proklik |
| 9. Validace | ✅ API (chybějící povinná, reload, neplatná možnost, role, 140 znaků) |
| 10. Welcome back | UI: proklik |
| 11. Admin vidí účastníky | ✅ API (role/company navíc) |
| 12. Lint, typecheck | ✅ |

## Testovací data

- Účty: `test@example.com` / `password123` (eventy `owner-test`, `second-event`, `pragvue-2026-jljm`), `other@example.com` / `password123`. Uživatelův účet vlastní `pragvue-2026` (smí se do něj testovat).
- `pragvue-2026`: účastník „Page Tester“ ve stavu `failed` → `/e/pragvue-2026/p/GkJP1XJE9hcpuen0uLdaYYLNSEp6B6jv` pro proklik retry.
- Eventy `owner-test` a `second-event` mají **starý dotazník** (choice se 3–4 možnostmi) – uložení v editoru spadne na validaci A/B. Klidně smazat.

## Handoff poznámky pro další session / fázi 4

- DB: `useDb()` = drizzle singleton, schéma `server/db/schema.ts`, `pnpm db:push --force`. Změny, které vypadají jako rename sloupce, dělat ručně přes `docker compose exec -T postgres psql -U icebreaker` (decisions #30).
- Auth: `requireUserSession(event)`, admin přes `requireAdminEvent(event)` (vlastník, jinak 404).
- Účastník: `server/utils/registration.ts` (`requirePublicEvent`, `requireParticipant`, `buildAnswers`, `toPublicProfile`), AI v `server/utils/ai-profile.ts` (structured outputs, Sonnet 5.5, fallbacks). Fáze 4 matching by měl jít stejnou cestou (`client.beta.messages.parse` + zod, žádný vynucený `tool_choice`).
- UI účastníka: `app/components/rv/*`, tokeny v `app/assets/css/main.css` (`bg-rv-*`, `font-grotesk`, `font-mono-rv`), helpery `app/utils/rendez-vue.ts`. Obrazovky 07 (loading matchingu) a 08 (match) z designu jsou fáze 4; `RvWaiting` na profilu je místo pro ně.
- Design handoff: `docs/design_handoff_rendez_vue/` (README + HTML). 09 případně polish ve fázi 6, 10 ne-scope.
- `pnpm typecheck` při běžícím dev serveru tentokrát prošel bez zaseknutí; když se zasekne (503 „Restarting Nuxt…“), zabít všechny `nuxt dev` procesy a spustit `pnpm dev --port 3000` znovu.
