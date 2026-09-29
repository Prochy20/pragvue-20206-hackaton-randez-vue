# Icebreaker (pracovní název) – intent

## Co to je

Webová appka pro konference. Při registraci účastník vyplní hravý dotazník (věcné info + vtipné otázky typu „tabs vs. spaces“ nebo „nejhorší incident na produkci“). AI z toho udělá vtipný profil (titul + tagline + emoji) a na eventu ho spáruje s lidmi, se kterými si má co říct, i s vtipným zdůvodněním a otázkou na prolomení ledů.

- **Účastník:** vyplní dotazník → dostane vtipný titul → po kole párování dostane match s icebreakerem.
- **Organizátor:** založí event, nastaví dotazník, spouští kola párování a promítá živou zeď.

Humor je jemné špičkování, žádný roast. Vtipy jen z toho, co člověk sám napsal.

## Kontext: hackathon

Stavíme to na PragVue Hackathon 2026, sólo, pár hodin čistého času. Cílem je funkční prototyp na demo, ne produkční kód.

- **Žádné testy.** Nepíšeme unit, e2e ani jiné testy. Testuje se ručně v prohlížeči při běžícím `pnpm dev`.
- Rychlost > dokonalost, ale kód čistý a čitelný (TypeScript, Vue/Nuxt).
- Požadavek zadání: UI ve Vue, funkční user journey, loading / empty / success / error stavy, smysluplné využití AI.
- Jazyk UI i AI výstupů: **angličtina**. Dokumentace pro vývoj (tento soubor) česky, README pro porotu anglicky (až na konci).
- Škála: jeden event má max. 40–50 lidí.
- Provoz: `localhost` z notebooku, případně vlastní Coolify. Dockerfile zatím neřešíme.

## Rozhodnutí

### Stack

- **Nuxt 4** + **Nuxt UI v4** (Tailwind v4 uvnitř) + TypeScript, správce balíčků **pnpm**.
- Backend = Nitro server routes (`server/api/*`) ve stejném projektu. Žádný oddělený backend, žádné CORS.
- **Databáze:** Nitro experimental database (`nitro.experimental.database = true`, `useDatabase()`), **SQLite** přes connector `node-sqlite` (vestavěný `node:sqlite` z Node 22, nula závislostí). Soubor `.data/db.sqlite`. Schéma vytvoří `CREATE TABLE IF NOT EXISTS` v Nitro pluginu při startu. SQL držet dialektově nudné, aby šel později přepnout connector na Postgres (fallback pro `node-sqlite`: `better-sqlite3`).
- **AI:** Claude API, model `claude-sonnet-5-5` na generování profilu i matching. Strukturovaný výstup (tool use / JSON schema), nikdy parsování volného textu. API klíč v `.env` jako `NUXT_ANTHROPIC_API_KEY`, přes `runtimeConfig`, nikdy neopouští server.
- Node 22.15, pnpm 11.

### Datový model

- `events`: id, slug (z názvu), name, admin_key (náhodný tajný token), questionnaire (JSON), created_at.
- `participants`: id, event_id, token (náhodný, identita účastníka), name, answers (JSON: pole `{ questionId, question, type, answer }` – **snapshot textu otázky**), title, tagline, emoji, ai_status (`ok` | `failed`), created_at.
- `rounds`: id, event_id, number, status (`ok` | `failed`), created_at.
- `pairs`: id, round_id, participant_ids (JSON pole, 2 nebo 3 členové), reason, icebreaker.

Dotazník a odpovědi jsou JSON sloupce; otázky nenormalizujeme.

### Přístup a identita

- **Žádný login.**
- Organizátor: při založení eventu dostane admin URL `/e/<slug>/admin?key=<admin_key>`.
- Účastník: po registraci dostane token, uložený v localStorage a zároveň v URL (`/e/<slug>/p/<token>`), aby šel profil znovu otevřít.
- Zeď `/e/<slug>/wall` je veřejná bez klíče.
- `/` je rovnou organizátorská stránka „Create event“ s krátkým pitchem, bez samostatné landing page.

### Dotazník

- Nastavuje **admin** per event. Typy otázek: **krátký text** a **výběr z možností** (single choice). Nic dalšího.
- Při založení eventu je předvyplněný **výchozí sadou** (~8 otázek: role/stack, co tě teď baví, tabs vs spaces, nejhorší incident na produkci, „podle čeho mě poznáš“…), admin upravuje, maže, přidává.
- **Jméno** je pevné povinné pole mimo konfiguraci.
- Dotazník lze měnit **kdykoli**, i po registracích. Díky snapshotu otázky u odpovědi zůstávají staré profily čitelné pro AI i UI.

### AI profil

- Výstup: **titul** (např. „Chief Tab Evangelist“) + **tagline** (jedna věta) + **jedno emoji**.
- Generuje se **synchronně** v registračním POSTu. Uživatel vidí loading (3–8 s), pak success.
- Při chybě AI se profil uloží s `ai_status = failed`, uživatel vidí error stav a tlačítko **„Try again“**, které volá samostatný endpoint na regeneraci.
- Prompt guardrails: jemné špičkování, jen z vlastních odpovědí, žádný roast, angličtina.

### Matching

- Kolo spouští **admin tlačítkem** („Run matching round“). Účastník do té doby vidí svůj titul a stav „waiting for the next round“.
- Jedno kolo = **jeden LLM call** nad všemi profily eventu (kompaktní reprezentace), výstup: seznam skupin s důvodem a icebreaker otázkou.
- **1:1 páry**, při lichém počtu jedna **trojice**.
- Server **validuje**, že každý účastník je právě v jedné skupině. Když validace neprojde: **jeden retry**, pak kolo uloží jako `failed`, admin vidí error stav a „Run again“. Žádný deterministický fallback.
- Předchozí páry z dřívějších kol jdou do promptu jako „nepárovat znovu“.
- Kdo se registroval po kole, vidí „You'll be matched in the next round“.

### Co vidí účastník po kole

Jméno protějšku, jeho titul + tagline + emoji, důvod párování, icebreaker otázku, a odpověď na „podle čeho mě poznáš“ (pokud je v dotazníku). Zobrazuje se **jen poslední kolo**; historie kol je na adminu.

### Živá zeď

- `/e/<slug>/wall`, refresh **pollingem ~4 s**.
- Jedna obrazovka, přepíná se automaticky: **bez kola** mřížka karet (emoji, jméno, titul), nově příchozí nahoře s fade-in; **po kole** karty párů (dvě/tři jména, tituly, důvod, icebreaker).
- Tmavé téma, velké písmo, čitelné na projektoru.

### Admin

Založení eventu, editor dotazníku, seznam účastníků (s tituly, možnost smazat), seznam kol, tlačítko „Run matching round“, odkazy na registraci a zeď. Nic víc.

### Vizuál

- **Admin:** Nuxt UI defaulty, jeden akcentový odstín.
- **Účastnický FE** (registrace, profil, match) a **zeď:** custom, hravé. Konkrétní podobu iterujeme ve fázi 3 a 5.

### Seed

`pnpm seed` založí event „PragVue 2026 (demo)“ s výchozím dotazníkem a ~15 vymyšlenými účastníky. Tituly, tagliny a emoji jsou **předpečené** ve statickém JSONu (okamžité, zadarmo). Matching při demu běží živě přes AI.

## Ne-scope

Testy, login/účty, uzavírání registrace, reset eventu, Dockerfile / docker-compose, čeština, embeddingy a vektorová DB, skupinky větší než 3, konfigurovatelné typy otázek nad rámec text + výběr, fotky účastníků, historie kol pro účastníka.

## Fáze

Každou fázi před stavbou znovu vygrilujeme (`/grilling`) a upřesníme. Výsledek grillování (intent fáze, log rozhodnutí, spec, status/handoff) žije v `docs/phase-N-<slug>/`, viz [`docs/README.md`](docs/README.md).

1. **Scaffold**: Nuxt 4, Nuxt UI, SQLite (Nitro database), `.env` + `runtimeConfig`, základní layout, git init.
2. **Event + admin**: založení eventu, editor dotazníku (text / výběr, výchozí sada), seznam účastníků, seznam kol, admin link.
3. **Registrace + AI titul**: hravý účastnický FE, dotazník z konfigurace, loading / success / error, „Try again“, stránka profilu.
4. **Matching round**: prompt, strukturovaný výstup, validace + retry, stránka účastníka s párem, stavy „waiting“.
5. **Živá zeď**: tituly → páry, polling, tmavé téma, fade-in.
6. **Seed + doladění stavů**: seed skript, sweep empty / error / loading stavů napříč appkou, anglické README pro porotu.
