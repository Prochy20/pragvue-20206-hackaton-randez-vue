# Fáze 6 – Seed + doladění stavů: status

**Stav:** postaveno 2026-09-29, proklik přes Playwright hotový a nálezy opravené (decisions #14–#17). **Zbývá deploy na Coolify uživatelem** (T7) + 2 ruční kontroly níže.

## Úkoly

- [x] T0 – docs
- [x] T1 – migrace (baseline `0000_baseline`, plugin `server/plugins/migrate.ts`, lokální DB označená)
- [x] T2 – `NUXT_PUBLIC_SITE_URL` (`useSiteOrigin`)
- [x] T3 – seed (`pnpm seed`, `pnpm seed:profiles`)
- [x] T4 – sweep stavů (10 bodů)
- [x] T5 – produkční build nad prázdnou DB
- [x] T6 – README, intent.md, HANDOFF
- [ ] T7 – proklik + deploy uživatelem

## Ověření

| Kritérium | Výsledek |
|---|---|
| `pnpm seed` 2× po sobě, 15 lidí s tituly, bez kola, login demo účtu | ✅ curl |
| Prod build nad prázdnou DB: tabulky + 1 migrace, signup, event; restart bez chyb | ✅ |
| QR na zdi bere `NUXT_PUBLIC_SITE_URL` | ✅ curl SSR |
| `/foo`, `/e/x/p/y/extra` → themed 404 | ✅ curl |
| Admin bez loginu → `/login?redirect=…` | ✅ curl |
| Registrace se starým dotazníkem → 400 `QUESTIONNAIRE_CHANGED` | ✅ curl |
| Klientské chování (reset kvízu, stale token, refresh hláška, zeď 404, logout, error page tlačítko) | ✅ Playwright (2 kola) |
| Prod build nad prázdnou DB z worktree (migrace, signup, event, registrace s AI, 404, QR, restart) | ✅ |
| `/api/health` = 503 při selhané migraci | ✅ prod build |
| Hláška „questions changed“ zmizí po 1. otázce (#17) | ⚠️ ručně (Playwrightu blokovaný zápis dotazníku) |
| `/api/events` odhlášeně v prohlížeči → „Permission denied.“ | ⚠️ ručně (curl ✅) |

## Proklik (T7)

- `pnpm seed` → login `demo@rendez-vue.dev` / `demo1234` → `/e/pragvue-2026-demo/admin`, spustit kolo s otevřenou zdí.
- Odhlášení → otevřít admin link → po loginu zpět na admin.
- Registrace rozpracovaná v jednom tabu, v adminu změnit dotazník, odeslat → kvíz od začátku s hláškou.
- Smazat účastníka v adminu → jeho profil = 404 → landing už nenabízí „welcome back“.
- Zastavit `docker compose stop postgres` na chvíli → admin ukáže „Couldn't refresh, retrying…“, zeď `● reconnecting`.
- `/cokoliv` → themed 404, `cd ~ →`.
- Deploy na Coolify podle README, `NUXT_PUBLIC_SITE_URL` nastavit.
