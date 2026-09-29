# Handoff

Přepisuje se na konci každé fáze. Vstupní bod pro novou session.

**Poslední update:** 2026-09-29, fáze 6 postavená, proklikaná přes Playwright (2 kola + dořešené kontroly), nálezy opravené, screenshoty hotové. Zbývá deploy na Coolify.

## Kde jsme

- Fáze 1–5 ✅, **6 postavená + proklikaná**:
  - `pnpm seed` (jen lokálně): `demo@rendez-vue.dev` / `demo1234`, event `pragvue-2026-demo`, 15 lidí s předpečenými profily, bez kola. `pnpm seed:profiles` je přegeneruje skutečným promptem.
  - Migrace místo `db:push`: `server/db/migrations/`, aplikuje je `server/plugins/migrate.ts` při startu, `/api/health` na ně čeká a při selhání vrací 503 (#16). Server se musí spouštět z kořene repa. Nová migrace: `pnpm db:generate <name>`.
  - `NUXT_PUBLIC_SITE_URL` pro odkazy a QR (`useSiteOrigin`).
  - AI profil: při překročení délkových limitů jeden retry, pak ořez na hranici slova (#14).
  - Nálezy z prokliku opravené, souhrn v `decisions.md` #15 a #17. Prod build nad prázdnou DB ověřený, README doplněné.
  - Anglické `README.md` pro porotu. Screenshoty v `docs/screenshots/` (`registration/profile/match/wall.png`) nafocené Playwrightem nad seedem po kole 1. QR na zdi ukazuje `localhost:3000`, po deployi je lze přefotit s prod URL.
- Otevřené (checklist v [phase-6-seed-polish/status.md](phase-6-seed-polish/status.md)):
  - **Deploy na Coolify uživatelem** podle README: build pack Docker Compose, soubor `/docker-compose.prod.yml`, ručně jen `NUXT_ANTHROPIC_API_KEY` (#18). Prod image ověřený lokálně.
- Na zdi se u trojic nezobrazuje AI titul pod jménem (#17), jinak se nevejde důvod.

## Co musí nová session vědět

- Čti `CLAUDE.md` → `intent.md` → `docs/README.md` → `phase-6-seed-polish/` (`spec.md`, `decisions.md`, `status.md`).
- Lokální DB vznikla přes `db:push`; baseline migrace je v ní ručně označená v `drizzle.__drizzle_migrations`. Na nové DB se aplikuje sama.
- Seed skripty jsou samostatné Node skripty (`--experimental-strip-types`), mimo Nitro: importy s `.ts` příponou, žádné auto-importy, typecheck je nepokrývá.
- `curl` na stránky posílat s `-H 'accept: text/html'`, jinak Nuxt vrátí chybu jako JSON.
- Po vytvoření nových `.vue` souborů za běhu dev serveru: restart `pnpm dev` + smazat `node_modules/.cache/vite` (fáze 3 #47). Po fázi 6 restartováno.
- Běh: `docker compose up -d` → `pnpm dev --port 3000` (držet běžící). `.env`: `NUXT_DATABASE_URL`, `NUXT_SESSION_PASSWORD`, `NUXT_ANTHROPIC_API_KEY` (vyplněno), volitelně `NUXT_PUBLIC_SITE_URL`.
- AI: `claude-sonnet-5-5` **neumí vynucený `tool_choice`** → structured outputs (`client.beta.messages.parse` + `betaZodOutputFormat`), vzory `server/utils/ai-profile.ts` a `ai-match.ts`.
- **Kód píše Claude celý.** Browser jen přes Playwright MCP, když to uživatel povolí (výstup `.playwright-mcp/` je v `.gitignore`). Jinak ověřovat curl / lint / typecheck.
- Commity: conventional, anglicky, malé, **bez zmínky o AI/Claude**. Větev `master`.

## Prompt pro novou session

```
Pokračujeme na Icebreakeru (Rendez-Vue). Přečti docs/HANDOFF.md. Pomoz mi s deployem na Coolify podle README.
```
