# Fáze 6 – Seed + doladění stavů: rozhodnutí

Append-only.

## 2026-09-29 – grillování

1. **Seed je jen lokální, na testování.** Demo poběží na Coolify s reálným publikem přes QR, na produkci se neseeduje.
2. **`pnpm seed` je idempotentní:** smaže demo event (cascade) a založí znovu, organizátor `demo@rendez-vue.dev` / `demo1234` zůstane. Slug `pragvue-2026-demo`, výchozí dotazník, bez kola (matching živě). Lokální testovací data (`pragvue-2026`, `t1-match-test`) zůstávají.
3. **15 účastníků** (liché → trojice), pestré role. Odpovědi ručně, profily jednou vygeneruje skutečný `generateProfile` přes `scripts/generate-seed-profiles.ts` (zůstává v repu) do statického JSONu. *Zamítnuto:* ručně psané tituly.
4. **Bez záchranného kola** pro výpadek AI – error stav + „Run again“ stačí.
5. **Migrace místo `db:push`:** `drizzle-kit generate` → `server/db/migrations/`, Nitro plugin je aplikuje při startu (`migrate()` z `drizzle-orm`). Na produkci nic ručně, DB nemusí ven. Stávající lokální DB se jednorázově označí jako mající baseline. *Zamítnuto:* `db:push` z notebooku proti produkci (interaktivní truncate, vystavený port), hybrid.
6. **Sweep stavů – všech 10 mezer z auditu:** (1) `app/error.vue`; (2) při 404 profilu vyhodit token z localStorage; (3) 400 „questionnaire changed“ při registraci → znovu načíst dotazník a začít kvíz; (4) admin tabulky: selhaný refresh po prvním načtení → řádek `couldn't refresh, retrying…`, 401 → `/login`; (5) `?redirect=` po loginu; (6) prázdný stav seznamu eventů; (7) u 5xx na účastnických chybových obrazovkách neukazovat surový text serveru; (8) zeď po 404 → obrazovka 404 místo věčného reconnecting; (9) logout s loadingem a toastem při chybě; (10) po chybě mazání účastníka znovu načíst seznam.
7. **Deploy na Coolify přes Nixpacks** (`pnpm build`, `node .output/server/index.mjs`, Postgres jako Coolify resource). Dockerfile dál ne-scope. Návod anglicky v README.
8. **`NUXT_PUBLIC_SITE_URL`** (volitelné) má přednost před `useRequestURL().origin` pro odkazy v adminu a QR na zdi.
9. **README anglicky** podle návrhu, screenshoty dodá uživatel do `docs/screenshots/`.
10. **Proklik fáze 2 hotový** (tlačítko open-admin ověřeno).

## 2026-09-29 – spec

11. **Seed a generátor jsou samostatné Node skripty** (`node --experimental-strip-types`), ne Nitro tasky: tahle verze `nuxi` nemá `task run`. Heslo hashuje přímo `@adonisjs/hash` Scrypt s výchozími parametry, stejně jako `hashPassword` z `nuxt-auth-utils` (přidaná devDependency ve stejné verzi). `generateProfile` dostal volitelný `apiKey`, aby šel volat mimo Nitro.
12. **Migrace se hledají v `server/db/migrations` relativně k `process.cwd()`.** Nixpacks spouští server z kořene repa, zdrojáky tam jsou.
