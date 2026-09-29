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

## 2026-09-29 – design handoff (Rendez-Vue)

Handoff: [`docs/design_handoff_rendez_vue/`](../design_handoff_rendez_vue/README.md). Uživatel: „Design to ukazuje dobře, takže se mu přizpůsobme.“ Nahrazuje #24, #25 a části #13–#20.

32. **Značka Rendez-Vue všude** (účastník i admin). Admin zůstává na Nuxt UI, `primary: 'green'`, název v headeru a na loginu. Repo a interní názvy `icebreaker`.
33. **Fáze 3 = obrazovky 01–06** (landing, krok 1, kvíz swipe, kvíz free text, profil card / package.json). 07–08 fáze 4. 09 (druhý icebreaker, hodnocení) případně polish ve fázi 6, 10 (`npm ls`, ruční přidání, email) ne-scope.
34. **Dotazník podle designu.** Krok 1 „The boring part“ = pevná pole mimo konfiguraci: `name` (povinné), `role` (povinné), `company` (volitelné), `here for` chipy (multi-select, pevné možnosti talks / new people / hiring / free coffee). Krok 2 „The weird part“ = otázky z konfigurace, jedna karta na otázku v pořadí adminu: choice = A/B swipe karta, text = free-text karta. *Zamítnuto:* povinné otázky dotazníku jako krok 1, choice se 3+ možnostmi.
35. **Choice otázka má přesně 2 možnosti** (`MAX_OPTIONS = 2`), editor z fáze 2 přidávání / mazání možností skryje. Nepovinnou choice jde přeskočit (↑ skip), povinnou ne.
36. **Textová odpověď max 140 znaků** (místo 200). Jméno, role, company max 60.
37. **Nová výchozí sada: 8 A/B otázek + 2 free-text** (worst incident, how will people recognize you – `recognizeMe`, povinná).
38. **Sloupce `participants`: `role`, `company`, `here_for` (jsonb), `number` (pořadí registrace v eventu → `#042`), `special_move`, `weakness`, `peer_dependency`, `dependencies` (jsonb).** Emoji zůstává (zeď, admin).
39. **AI vrací `title`, `tagline` (= flavor text), `emoji`, `specialMove`, `weakness`, `peerDependency`, `dependencies` (2–4 kebab-case „balíčky“ z odpovědí).** `package.json` pohled se skládá na klientu: `name` = `@first/last`, `version` = `1.0.0-<role>`, `description` = tagline, `dependencies`, `peerDependencies`. Rarita (COMMON / RARE / LEGENDARY) deterministicky z tokenu. *Zamítnuto:* dependencies z odpovědí na klientu (odhalovalo by odpovědi, méně vtipné).
40. **Loading po odeslání v terminálovém stylu obrazovky 07** s vlastními řádky, min. ~2,5 s. Chyba terminálovým hlasem `npm ERR! …` + `npm i friends --retry` (= regenerate).
41. **CTA „find my match →“ se ve fázi 3 nahradí blokem „waiting for the next matching round…“.** Kola dál spouští admin; detaily fáze 4.
42. **`/e/<slug>` = jedna stránka se stavy** (landing → krok 1 → kvíz → loading), profil `/e/<slug>/p/<token>`. „Welcome back“ na landingu ve stejném stylu. Čísla v textech skutečná (`~/<slug>`, počet otázek).
43. **AI přes structured outputs (`client.beta.messages.parse` + `betaZodOutputFormat`), ne vynucený tool use.** – `claude-sonnet-5-5` vynucený `tool_choice` odmítá (400). Délky a emoji hlídá vlastní zod až po parsování (JSON Schema ve structured outputs `maxLength` neumí). `effort: 'low'` kvůli latenci, `fallbacks: 'default'` (beta `server-side-fallback-2026-07-01`) pro případ odmítnutí modelem. Nahrazuje #21 (tool use).
44. **Profilová stránka (subagent):** emoji malé v rohu růžového panelu s iniciálami; `copy` u package.json jako ghost tlačítko vedle textu (primární CTA tam už není); token se ukládá do localStorage při každém úspěšném načtení profilu (i ve stavu `failed`).
45. **Kvíz: index karty drží stránka (`v-model:index`)**, aby se po chybě odeslání vrátil na stejnou kartu. Když je poslední otázka A/B, po swipu se ukáže závěrečná karta „That's the weird part done.“ s CTA `$ npm i friends`. V hlavičce kvízu je navíc `← step 2/2` (zpět o kartu / na krok 1).
46. **Landing: počet otázek = dotazník + 2** (jméno a role), s výchozí sadou tedy „12“ jako v designu.
47. **Dev quirk: nové `.vue` soubory vytvořené za běhu `pnpm dev` nemusí dostat své Tailwind třídy do CSS v prohlížeči** (Vite přegeneruje jen `main.css?direct`). Projev: prvek bez výšky / pozadí. Řešení: restart dev serveru (+ smazat `node_modules/.cache/vite`) a tvrdý reload.
