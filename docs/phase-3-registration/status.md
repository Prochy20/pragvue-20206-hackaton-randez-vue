# Fáze 3 – Registrace + AI titul: status

**Stav:** vygrilováno 2026-09-29, stavba nezačala. Vizuál účastnického FE čeká na handoff z Claude Design.

## Úkoly

- [x] T0 – `docs: add phase 3 docs`
- [ ] T1 – Postgres + Drizzle, přepis stávajících dotazů
- [ ] T2 – auth (signup / login / logout)
- [ ] T3 – admin ze session místo klíče
- [ ] T4 – „Your events“, „← All events“, `rel` fix
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
