# Fáze 3 – log rozhodnutí

Append-only. Formát: **rozhodnutí** – proč. *Zamítnuto:* alternativy.

## 2026-09-29 – grillování

### Infrastruktura (odchylka od `intent.md`)

1. **Postgres místo SQLite, v `docker-compose.yml` (jen služba `postgres:17-alpine`, port 5432, named volume, healthcheck).** Appka dál běží lokálně `pnpm dev`. – Přání uživatele. *Zamítnuto:* app služba + Dockerfile teď (případně fáze 6).
2. **Drizzle ORM + `pg`.** Schéma v `server/db/schema.ts` (uuid, `jsonb`, `timestamptz`), `useDb()` vrací drizzle singleton; `nitro.experimental.database` pryč. – Typované dotazy a JSON bez ručního parse pro fáze 3–6. *Zamítnuto:* jen přepnout db0 connector na `postgresql` (bez typů), Prisma (generovaný klient, režie).
3. **Schéma přes `drizzle-kit push` (`pnpm db:push`), žádné migrační soubory.** – Hackathon. *Zamítnuto:* `generate` + migrace při startu.
4. **Migrace je krok 0 fáze 3, stávající SQLite data se zahodí.** Samostatné commity. – Nové endpointy se píšou rovnou v Drizzle. *Zamítnuto:* samostatná fáze 2.5.

### Organizátoři

5. **Organizátorské účty v DB (`users`: email + scrypt hash) přes `nuxt-auth-utils`.** Session v zapečetěné cookie (`NUXT_SESSION_PASSWORD`). – Uživatel chce eventy v DB a nemuset ukládat linky; „žádný login“ z `intent.md` pro organizátory padá. *Zamítnuto:* seznam z localStorage, veřejný seznam všech eventů (admin pro kohokoli), jedno sdílené heslo v `.env`, Better Auth (těžší), ruční sessions.
6. **Otevřený `/signup`, bez ověření emailu a resetu hesla.** Email lowercase + trim, heslo min. 8 znaků. – Porota si flow vyzkouší sama; každý vidí jen svoje eventy. *Zamítnuto:* účty jen přes seed/CLI.
7. **`admin_key` zrušen; admin = přihlášený vlastník (`events.owner_id`). Cizí nebo neexistující event → 404.** `useAdminKeys`, `?key=` a header `x-admin-key` pryč. – Jeden přístupový mechanismus; řeší security nálezy (klíč v URL / Referer / localStorage). *Zamítnuto:* nechat klíč jako link pro spoluorganizátora.
8. **Routy: `/login`, `/signup` (`UAuthForm`); `/` a `/e/<slug>/admin` za route middleware `auth`.** Nepřihlášený → `/login` (s krátkým pitchem). Header `default` layoutu: email + „Log out“. Účastnická část a zeď bez loginu.
9. **`/` po přihlášení: „Create event“ + „Your events“ z DB** (od nejnovějšího: název, počet účastníků, odkaz do adminu; prázdný seznam → sekce se skryje). V adminu odkaz „← All events“. *Zamítnuto:* „Forget“ z localStorage (už nedává smysl).
10. **`rel="noopener noreferrer"` u všech `target="_blank"` odkazů.** – Security nález z fáze 2.
11. **Pořadí commitů: compose + Drizzle → auth → admin ze session → Your events + rel fix → registrace a AI.** – Kroky samostatně použitelné, i když se AI část zasekne.
12. **Po grillování upravit `intent.md` (stack, datový model, přístup, ne-scope).**

### Registrace účastníka

13. **POST registrace je synchronní a vrací vždy 200 `{ token, aiStatus }`**, i když AI selže. Klient uloží token a přesměruje na profil; error a „Try again“ žijí jen na profilu. – Identita vznikne vždy, opakované odeslání formuláře nevytvoří duplicitu. *Zamítnuto:* 5xx a nechat formulář vyplněný.
14. **„Try again“ = `POST …/regenerate`, povolený jen pro `ai_status = failed` (jinak 409).** Žádný reroll úspěšného titulu. – Titul se nemění pod rukama zdi a matchingu. *Zamítnuto:* „Roll again 🎲“ (případně polish ve fázi 6).
15. **Bez API klíče se chová jako chyba AI:** `ai_status = failed`, varování v server logu. – Flow i error stav jdou testovat bez klíče. *Zamítnuto:* 500, dev fake generátor.
16. **Už zaregistrovaný (localStorage `slug → { token, name }`) vidí místo formuláře „Welcome back, <name>“ → profil + „Not you? Register someone else“** (smaže záznam a ukáže formulář). – Na demu se u jednoho zařízení registruje víc lidí. *Zamítnuto:* auto-redirect, ignorovat.
17. **Profil: emoji, titul, tagline, jméno, název eventu, „Copy link“, hint „saved on this device, bookmark this page“, placeholder „Waiting for the next matching round…“.** Odpovědi se nezobrazují. Profil je veřejný pro kohokoli s tokenem.
18. **Validace proti aktuálnímu dotazníku na serveru:** jméno 1–60, textová odpověď max 200, choice jen z aktuálních `options`, prázdné nepovinné se neukládají, odpovědi na zmizelé otázky se tiše zahodí, chybějící povinná → 400 („<label> is required“; když ji klient vůbec neznal, „The questionnaire changed, please reload“). Odpovědi se ukládají se snapshotem `question` + `type`.

### AI profil

19. **Existující tituly v eventu jdou do promptu jako „don't repeat or closely mimic“.** – 40–50 lidí s podobnými odpověďmi.
20. **Výstup: titul 2–6 slov / max 50 znaků, tagline jedna věta / max 120 znaků, přesně 1 emoji (`Intl.Segmenter`, 1 grapheme, `\p{Extended_Pictographic}`).** Nevalidní výstup = `failed`.
21. **`@anthropic-ai/sdk`, `claude-sonnet-5-5`, tool use s vynuceným `tool_choice`, timeout 20 s, `maxRetries: 0`.** Retry = uživatelovo „Try again“. – Loading nesmí trvat desítky sekund.
22. **Vstup promptu: název eventu, jméno, odpovědi (otázka + odpověď) v bloku označeném jako data, ne instrukce.** Guardrails z `intent.md` (jemné špičkování, jen z odpovědí, žádný roast, angličtina).
23. **AI se volá před INSERTem; řádek vznikne až s výsledkem (`ok` / `failed`).** – `ai_status` nepotřebuje `pending`.

### UI

24. **Vizuál účastnického FE dělá Claude Design, uživatel dodá handoff.** Otevřené do té doby: forma dotazníku (jedna stránka vs. wizard), podoba loadingu, rozložení profilu.
25. **Teď funkční holé UI na Nuxt UI.** Logika (fetch, localStorage, stavy) ve stránkách a composables, prezentace v `app/components/participant/*` → přestylování = výměna komponent. Předběžně: jedna stránka s otázkami, loading overlay s rotujícími hláškami (statický seznam na klientu). *Zamítnuto:* čekat na design s FE nebo s celou fází.

## 2026-09-29 – stavba

26. **Timestampy v Drizzle `mode: 'date'` (ne `'string'`), API vrací `.toISOString()`.** – `pg` v string módu vrací `2026-09-29 09:11:23.17+00`, ne ISO; klient to parsuje přes `new Date()`.
27. **`isUuid()` v `server/utils/validation.ts` před dotazy podle id.** – Postgres na nevalidní uuid hází chybu → 500; chceme 404.
28. **ESLint ignoruje `docs/**`.** – Design handoff obsahuje `support.js` (1500 lint chyb).
29. **`drizzle.config.ts` načítá `.env` přes `process.loadEnvFile()`.** – drizzle-kit `.env` sám nečte.
30. **Schéma změny, které drizzle-kit považuje za možné přejmenování (drop + add sloupce), dělat ručně přes `psql` + `pnpm db:push --force`.** – `drizzle-kit push` se jinak ptá interaktivně a bez TTY spadne.
31. **Admin EventLinks bez karty „Admin“ a bez alertu „Bookmark this page“.** – Admin URL už není tajemství ani jediná cesta zpět.
