# Handoff

Přepisuje se na konci každé fáze. Vstupní bod pro novou session.

**Poslední update:** 2026-09-29, fáze 5 hotová (proklik bez nálezů), další je grilling fáze 6.

## Kde jsme

- Fáze 1–4 ✅, **5 postavená**. `/e/<slug>/wall`, veřejný `GET /api/events/<slug>/wall`, polling 4 s:
  - bez kola mřížka a QR panel;
  - po kole skupiny abecedně, stránkované, a pruh nováčků;
  - `installing friends…` během kola, pak mezititulek `git merge round-N`.
  - Detaily v [phase-5-wall/status.md](phase-5-wall/status.md).
- T5 (proklik zdi) hotovo bez nálezů.
- Opraveno navíc: čísla účastníků byla při souběžné registraci a po smazání duplicitní. Teď advisory lock + unikátní `(event_id, number)` (fáze 5 #16).
- Další: **fáze 6 – seed + doladění stavů** (seed skript, sweep empty/error/loading, anglické README). Zatím nevygrilovaná.

## Co musí nová session vědět

- Čti `CLAUDE.md` → `intent.md` → `docs/README.md` → `phase-5-wall/` (`spec.md`, `decisions.md` #1–#17, `status.md`).
- Zeď: stránka `app/pages/e/[slug]/wall.vue` drží stav (polling, mezititulek), komponenty `app/components/wall/*`, data `loadWall` a zámek kola (`startRound`/`finishRound`/`isRoundRunning`) v `server/utils/match.ts`.
- `drizzle-kit push` se neinteraktivně ptá na truncate při novém unique constraintu → constraint přidat SQL přes `docker compose exec -T postgres psql -U icebreaker -d icebreaker`, pak push.
- Profil stránka je teď `app/pages/e/[slug]/p/[token]/index.vue` (sourozenec `match.vue`). Polling účastníka `useVisiblePolling`, admin `usePolling`.
- Po vytvoření nových `.vue` souborů za běhu dev serveru: když UI vypadá rozbitě, restart `pnpm dev` + smazat `node_modules/.cache/vite` + tvrdý reload (fáze 3 #47). Po fázi 4 už restartováno.
- Běh: `docker compose up -d` → `pnpm db:push` → `pnpm dev --port 3000` (držet běžící). `.env`: `NUXT_DATABASE_URL`, `NUXT_SESSION_PASSWORD`, `NUXT_ANTHROPIC_API_KEY` (vyplněno).
- AI: `claude-sonnet-5-5` **neumí vynucený `tool_choice`** → structured outputs (`client.beta.messages.parse` + `betaZodOutputFormat`), vzory `server/utils/ai-profile.ts` a `ai-match.ts`.
- Paralelní agenti fungují dobře: nejdřív sdílený kontrakt (typy + schéma) commitnout, pak agenti s oddělenými soubory, bez commitů; commituje hlavní session.
- **Kód píše Claude celý.** **Žádné klikání v prohlížeči** – ověřovat curl / lint / typecheck, UI kontroluje uživatel. Do eventu `pragvue-2026` (uživatelův) se smí registrovat testovací účastníci.
- Commity: conventional, anglicky, malé, **bez zmínky o AI/Claude**. Větev `master`.

## Prompt pro novou session

```
Pokračujeme na Icebreakeru (Rendez-Vue). Přečti docs/HANDOFF.md. Nejdřív dořešíme nálezy z prokliku fáze 5 – živé zdi (napíšu je), pak spusť /grilling pro fázi 6 (Seed + doladění stavů).
```
