# Fáze 6 – Seed + doladění stavů: spec

## Migrace

- `package.json`: `db:push` pryč, `db:generate` = `drizzle-kit generate`. `drizzle.config.ts` + `out: './server/db/migrations'`.
- Baseline `0000_*.sql` z aktuálního `schema.ts`.
- `server/plugins/migrate.ts`: při startu `migrate(drizzle(url), { migrationsFolder: resolve(process.cwd(), 'server/db/migrations') })`, při chybě log + `throw` (server bez schématu nemá smysl běžet). Bez `databaseUrl` jen warning.
- Lokální DB: jednorázově vložit hash baseline do `drizzle.__drizzle_migrations`.

## Seed

- `scripts/seed-data/participants.json`: 15 × `{ name, role, company, hereFor, answers: { [questionLabel]: answer } }` (odpovědi podle labelů výchozího dotazníku).
- `scripts/seed-data/profiles.json`: vygenerované profily ve stejném pořadí.
- `scripts/generate-seed-profiles.ts` (`pnpm seed:profiles`): přečte participants.json, zavolá `generateProfile` sekvenčně (taken titles narůstají), zapíše profiles.json.
- `scripts/seed.ts` (`pnpm seed`): načte `.env`, upsert organizátora, smaže event `pragvue-2026-demo`, vloží event s `createDefaultQuestionnaire()` a 15 účastníků (number 1–15, tokeny náhodné), vypíše přihlášení a URL.

## Site URL

- `runtimeConfig.public.siteUrl` (`NUXT_PUBLIC_SITE_URL`), composable `useSiteOrigin()` = `siteUrl` bez koncového `/` || `useRequestURL().origin`. Použít v `EventLinks.vue` a `wall.vue`.

## Sweep stavů

Viz `decisions.md` #6, body 1–10.

## README

`README.md` anglicky: pitch, How it works, AI, Stack, Run locally, Deploy (Coolify), Demo script, Out of scope, screenshoty z `docs/screenshots/`.

## Úkoly

| # | Úkol | Závisí |
|---|---|---|
| T0 | docs fáze 6 | – |
| T1 | migrace + plugin + baseline | T0 |
| T2 | site URL | T0 |
| T3 | seed data + generátor + seed | T1 |
| T4 | sweep stavů (10 bodů) | T0 |
| T5 | produkční build + start nad prázdnou DB | T1 |
| T6 | README, intent.md, HANDOFF | T1–T5 |
| T7 | proklik UI + deploy uživatelem | T6 |
