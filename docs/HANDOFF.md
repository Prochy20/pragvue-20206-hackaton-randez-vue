# Handoff

Přepisuje se na konci každé fáze. Vstupní bod pro novou session.

**Poslední update:** 2026-09-29, fáze 6 postavená, čeká na proklik UI a deploy na Coolify.

## Kde jsme

- Fáze 1–5 ✅ (proklik zdi bez nálezů), **6 postavená**:
  - `pnpm seed` (jen lokálně): `demo@rendez-vue.dev` / `demo1234`, event `pragvue-2026-demo`, 15 lidí s předpečenými profily, bez kola. `pnpm seed:profiles` je přegeneruje skutečným promptem.
  - Migrace místo `db:push`: `server/db/migrations/`, aplikuje je `server/plugins/migrate.ts` při startu. Nová migrace: `pnpm db:generate <name>`.
  - `NUXT_PUBLIC_SITE_URL` pro odkazy a QR (`useSiteOrigin`).
  - Sweep stavů: `app/error.vue`, `?redirect=` po loginu, admin „couldn't refresh“ + 401 → login, prázdný seznam eventů, reset kvízu při změněném dotazníku, mazání mrtvého tokenu, 5xx text skrytý účastníkům, zeď 404, logout.
  - Anglické `README.md` pro porotu (deploy na Coolify, demo scénář). Screenshoty dodá uživatel do `docs/screenshots/` (`registration/profile/match/wall.png`).
- Otevřené: **T7 – uživatel prokliká a nasadí na Coolify**, checklist v [phase-6-seed-polish/status.md](phase-6-seed-polish/status.md). Nálezy opravit, zapsat do `decisions.md`.
- Známé riziko: AI profil občas neprojde validací (`weakness` > 30 znaků) → účastník vidí `failed` + „Try again“ (fáze 6 #13). Neřešeno.

## Co musí nová session vědět

- Čti `CLAUDE.md` → `intent.md` → `docs/README.md` → `phase-6-seed-polish/` (`spec.md`, `decisions.md`, `status.md`).
- Lokální DB vznikla přes `db:push`; baseline migrace je v ní ručně označená v `drizzle.__drizzle_migrations`. Na nové DB se aplikuje sama.
- Seed skripty jsou samostatné Node skripty (`--experimental-strip-types`), mimo Nitro: importy s `.ts` příponou, žádné auto-importy, typecheck je nepokrývá.
- `curl` na stránky posílat s `-H 'accept: text/html'`, jinak Nuxt vrátí chybu jako JSON.
- Po vytvoření nových `.vue` souborů za běhu dev serveru: restart `pnpm dev` + smazat `node_modules/.cache/vite` (fáze 3 #47). Po fázi 6 restartováno.
- Běh: `docker compose up -d` → `pnpm dev --port 3000` (držet běžící). `.env`: `NUXT_DATABASE_URL`, `NUXT_SESSION_PASSWORD`, `NUXT_ANTHROPIC_API_KEY` (vyplněno), volitelně `NUXT_PUBLIC_SITE_URL`.
- AI: `claude-sonnet-5-5` **neumí vynucený `tool_choice`** → structured outputs (`client.beta.messages.parse` + `betaZodOutputFormat`), vzory `server/utils/ai-profile.ts` a `ai-match.ts`.
- **Kód píše Claude celý.** **Žádné klikání v prohlížeči** – ověřovat curl / lint / typecheck, UI kontroluje uživatel.
- Commity: conventional, anglicky, malé, **bez zmínky o AI/Claude**. Větev `master`.

## Prompt pro novou session

```
Pokračujeme na Icebreakeru (Rendez-Vue). Přečti docs/HANDOFF.md. Dořešíme nálezy z prokliku a deploye fáze 6 (napíšu je).
```
