# Fáze 3 – Registrace + AI titul: status

**Stav:** vygrilováno 2026-09-29, stavba nezačala. Vizuál účastnického FE čeká na handoff z Claude Design.

## Úkoly

- [x] T0 – `docs: add phase 3 docs`
- [x] T1 – `chore(db): switch to postgres with drizzle`
- [x] T2 – `feat(auth): add organizer accounts`
- [x] T3 – `refactor(admin): authorize by session instead of admin key`
- [x] T4 – `feat(ui): list organizer events` + `fix(ui): add noopener noreferrer to external links`
- [ ] T5 – kontrakt účastníka
- [ ] T6 – AI profil
- [ ] T7 – veřejné API účastníka
- [ ] T8 – účastnické UI (holé)
- [ ] T9 – ruční ověření, status, HANDOFF
- [ ] Přestylování podle design handoffu (až dorazí)

## Handoff poznámky

- Před T1: Docker musí běžet (`docker compose up -d`). Port 5432 byl při grillování volný.
- `.env` potřebuje `NUXT_DATABASE_URL`, `NUXT_SESSION_PASSWORD` (vygenerovat) a `NUXT_ANTHROPIC_API_KEY` (uživatel doplní; bez něj všechny profily `failed`, což je záměrně testovatelné).
- Fáze 6 (seed) bude potřebovat demo uživatele organizátora.
