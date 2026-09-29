# Fáze 1 – log rozhodnutí

Append-only. Formát: **rozhodnutí** – proč. *Zamítnuto:* alternativy.

## 2026-09-29 – grillování

1. **Scaffold ze šablony Nuxt UI** (`pnpm create nuxt -t ui`) vygenerované do temp složky a přesunuté do repa. – Nuxt UI setup (CSS importy, `<UApp>`) je zaručeně správně; `nuxi init` nechce do neprázdné složky a `--force` by přepsal `.gitignore`. *Zamítnuto:* `-t minimal` + `nuxt module add ui` (ruční drátování CSS a UApp).
2. **Větev zůstává `master`.** – Volba uživatele. *Zamítnuto:* přejmenování na `main`.
3. **Conventional Commits, anglicky, se scopem když dává smysl, víc menších commitů na fázi, žádná zmínka o AI/Claude.** – Volba uživatele; čitelná historie. *Zamítnuto:* jeden commit na fázi.
4. **ID jako `TEXT` z `crypto.randomUUID()`, `created_at` jako ISO `TEXT`, obojí generuje aplikace.** – Přenositelné na Postgres beze změny schématu, nula závislostí. *Zamítnuto:* `INTEGER PRIMARY KEY AUTOINCREMENT` + `DEFAULT CURRENT_TIMESTAMP` (SQLite-specifické).
5. **Žádné cizí klíče ani `PRAGMA foreign_keys`; mazání řeší kód.** – `pairs.participant_ids` je JSON, FK tam stejně nejde; jediné mazání je účastník v adminu; staré páry se smazaným člověkem UI vykreslí jako „(removed)“. *Zamítnuto:* deklarované FK + pragma.
6. **Všechny 4 tabulky už ve fázi 1.** – Datový model v `/intent.md` je hotový, `CREATE TABLE IF NOT EXISTS` je levné. *Zamítnuto:* přidávat tabulky postupně.
7. **Appka naběhne bez API klíče; klíč se kontroluje až při AI callu. SDK až ve fázi 3.** – Klíč zatím není k dispozici; fáze 1 na něm nesmí záviset.
8. **Primární barva `violet`.** – Hravá, kontrastní vůči tmavé zdi, není to default zelená.
9. **Layout: `app.vue` (UApp + NuxtLayout), `layouts/default.vue` (admin: UHeader + color mode), `layouts/bare.vue` (prázdný obal), placeholder `pages/index.vue`.** – Minimum; vizuál účastnické části až ve fázi 3.
10. **Z šablony pryč demo obsah, `.github/`, renovate. ESLint a `typecheck` zůstávají. Doplnit `packageManager` a `engines.node >= 22.13`.** – ESLint drží kód čistý bez brzdění; CI na hackathonu netřeba. `node:sqlite` je bez flagu od 22.13.
11. **`GET /api/health` zůstává i do dalších fází** jako smoke test. Používá `sqlite_master` (jediné SQLite-specifické SQL, vědomě).
