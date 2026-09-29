# Fáze 2 – Event + admin: status

**Stav:** postaveno 2026-09-29; API ověřené curlem, **UI čeká na ruční proklik uživatelem**.

## Úkoly

- [x] T0 – `docs: add phase 2 docs`
- [x] T1 – `feat(shared): add questionnaire schema and default set`
- [x] T2 – `feat(api): add event and admin endpoints`
- [x] T3 – `feat(ui): add create event form`
- [x] T4 – `feat(ui): add admin page with questionnaire editor, participants and rounds` (subagent) + `chore: add node types`
- [ ] T5 – ruční ověření UI v prohlížeči (uživatel)

## Ověření

| Kritérium | Výsledek |
|---|---|
| 1. Create event → redirect, klíč v localStorage | API ✅ (curl), UI: proklik |
| 2. Stejný název → jiný slug | ✅ `praha-ctvrtek` / `praha-ctvrtek-t8ac`; „🎉🎉🎉“ → `event` |
| 3. Špatný klíč 403, neexistující slug 404 | ✅ API; UI stavy: proklik |
| 4. Editor dotazníku, save, validace | API ✅ (PUT trimuje, nevalidní → 400 „Add at least 2 options“); UI: proklik |
| 5. Varování při neuložených změnách | proklik |
| 6. Participants / Rounds, delete, „(removed)“ | API ✅ s testovacími daty; UI: proklik |
| 7. `pnpm lint`, `pnpm typecheck` | ✅ |

**Testovací event v lokální DB:** `/e/praha-ctvrtek/admin?key=XpvNf_K2KyDBCeXQilCBzPRJ36D1Mepm` – 3 účastníci (Ada ok, Linus failed, Grace ok), kolo 1 s trojicí. Jeho dotazník byl při testu přepsán na 1 otázku. Pro ověření „(removed)“ smazat v adminu Linuse a otevřít tab Rounds.

## Handoff poznámky pro fázi 3

- Sdílené: `questionnaireSchema`, `Question`, `createDefaultQuestionnaire()` (`shared/utils/`), typy `Answer` atd. (`shared/types/admin.ts`) – auto-import na klientu i serveru.
- Server: `requireAdminEvent(event)`, `readBodyWith(event, schema)` (400 s čitelným `statusMessage`), `uniqueSlug`, `generateAdminKey`.
- Klient: `useAdminKeys()` (localStorage), `apiErrorMessage`, `apiErrorStatus`, `usePolling`, `formatRelativeTime` z `useAdminApi.ts`.
- Registrace bude na `/e/<slug>` (admin na ni už odkazuje), zeď na `/e/<slug>/wall`.
- `recognizeMe` flag označuje otázku „how will people recognize you“ (max 1, jen text) – fáze 4 ji zobrazí u matche.
- Odpověď ukládat se snapshotem `question` a `type` (viz `Answer`).
- Pozor na `pnpm typecheck` při běžícím dev serveru (decisions #24).
