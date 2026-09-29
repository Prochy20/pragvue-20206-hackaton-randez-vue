# Handoff

Přepisuje se na konci každé fáze. Vstupní bod pro novou session.

**Poslední update:** 2026-09-29, fáze 4 postavená, čeká na ruční proklik UI.

## Kde jsme

- Fáze 1 ✅, 2 ✅, 3 ✅, **4 postavená** (admin spouští kolo → jeden AI call → dvojice / trojice s `reason`, `diff`, icebreakerem; účastník přes polling vidí `✓ match found` → obrazovky 07 → 08 na `/e/<slug>/p/<token>/match`; admin tab Rounds). Detaily v [phase-4-matching/status.md](phase-4-matching/status.md).
- Otevřené: **T5 – uživatel prokliká UI** (admin Rounds: Run matching round, výpis kol; profil účastníka: match found / next round; `/match`: 07 jen poprvé, 08 pár i trojice, removed člen, commit blok). Testovací event a tokeny ve `status.md`. Nálezy opravit, zapsat do `decisions.md`.
- Z fáze 3 opraveno po prokliku: dlouhé A/B možnosti se zalamují, plynulejší swipe (decisions #48–#49).
- Další: **fáze 5 – živá zeď** (`/e/<slug>/wall`, polling, tituly → páry, tmavé téma). Zatím nevygrilovaná.

## Co musí nová session vědět

- Čti `CLAUDE.md` → `intent.md` → `docs/README.md` → `phase-4-matching/` (`spec.md`, `decisions.md` #1–#18, `status.md`).
- Profil stránka je teď `app/pages/e/[slug]/p/[token]/index.vue` (sourozenec `match.vue`). Polling účastníka `useVisiblePolling`, admin `usePolling`.
- Po vytvoření nových `.vue` souborů za běhu dev serveru: když UI vypadá rozbitě, restart `pnpm dev` + smazat `node_modules/.cache/vite` + tvrdý reload (fáze 3 #47). Po fázi 4 už restartováno.
- Běh: `docker compose up -d` → `pnpm db:push` → `pnpm dev --port 3000` (držet běžící). `.env`: `NUXT_DATABASE_URL`, `NUXT_SESSION_PASSWORD`, `NUXT_ANTHROPIC_API_KEY` (vyplněno).
- AI: `claude-sonnet-5-5` **neumí vynucený `tool_choice`** → structured outputs (`client.beta.messages.parse` + `betaZodOutputFormat`), vzory `server/utils/ai-profile.ts` a `ai-match.ts`.
- Paralelní agenti fungují dobře: nejdřív sdílený kontrakt (typy + schéma) commitnout, pak agenti s oddělenými soubory, bez commitů; commituje hlavní session.
- **Kód píše Claude celý.** **Žádné klikání v prohlížeči** – ověřovat curl / lint / typecheck, UI kontroluje uživatel. Do eventu `pragvue-2026` (uživatelův) se smí registrovat testovací účastníci.
- Commity: conventional, anglicky, malé, **bez zmínky o AI/Claude**. Větev `master`.

## Prompt pro novou session

```
Pokračujeme na Icebreakeru (Rendez-Vue). Přečti docs/HANDOFF.md. Nejdřív dořešíme nálezy z prokliku fáze 4 (napíšu je), pak spusť /grilling pro fázi 5 (Živá zeď).
```
