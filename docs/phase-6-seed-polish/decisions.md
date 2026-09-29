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

## 2026-09-29 – stavba

13. **Odchylky ze stavby:**
    - Seed firmy jsou fiktivní (Crumb Grocery, Old Town Bank…), aby si vymyšlené incidenty nepřipisovaly skutečné značky.
    - `generate-seed-profiles.ts` zkouší každý profil až 4× – validace občas shodí `weakness` > 30 znaků (u Evy dvakrát za sebou). **Totéž hrozí živé registraci** (→ `failed` + „Try again“), zatím neřešeno.
    - Migrační Nitro plugin je async a Nitro na něj nečeká; první request hned po startu teoreticky předběhne migraci. Na Coolify ho kryje health check.
    - Token se po 404 profilu maže jen když v localStorage je právě tenhle token (cizí mrtvý odkaz nesmaže vlastní profil).
    - `?redirect=` pouští jen cesty `/…` (ne `//` ani `/\`), odkaz login ↔ signup ho nese dál.
    - Hláška „questionnaire changed“ je sdílená konstanta `QUESTIONNAIRE_CHANGED`; klient podle ní znovu načte event a začne kvíz od první otázky (chyba se ukáže i na ní).
    - Admin prázdný stav eventů: „No events yet. Create your first one to get started.“ (formulář je na desktopu vedle, ne nad).

## 2026-09-29 – po stavbě

14. **Délkové limity AI profilu: jeden retry, pak ořez (volba uživatele).** Příčina `failed` z #13: model u `specialMove` / `weakness` míří těsně na 30 znaků a občas je přetáhne. Structured outputs délku vynutit neumí, takže validaci neprošel celý profil. Teď `generateProfile` při neúspěšné validaci zkusí generovat ještě jednou. Když neprojde ani druhý pokus, `repairLengths` ořízne délkové limity na serveru na hranici slova s `…` (title max 6 slov / 50 znaků, tagline 120, specialMove / weakness 30), kebab balíčky na hranici `-` (40) a `dependencies` na 4. Profil pak neskončí `failed` jen kvůli délce. Chyby API a refusal se neopakují, účastník by čekal dvakrát na totéž. Prompt teď u obou polí zdůrazňuje tvrdý limit. *Zamítnuto:* povolit v limitech rezervu (uživatel chce limity zachovat). Ověřeno živě: u Evy prošel druhý pokus až po ořezu (`debugger; and a calm cup of…`). Smyčka se 4 pokusy v `generate-seed-profiles.ts` zůstává, teď je jen pojistka navíc.

15. **Nálezy z prokliku (Playwright, 2026-09-29) – opraveno vše (volba uživatele):**
    - **Kvíz:** chyba `npm ERR!` se ukazuje i na A/B kartě (dřív jen u textové otázky / na konci, takže hláška po resetu na otázce 1 chyběla). Tlačítka zůstávají jen u textových otázek a na konci.
    - **Změněná A/B možnost během registrace** → server vrací `QUESTIONNAIRE_CHANGED` místo „Pick one of the options“ (účastník se zasekl se starými možnostmi). Server nerozliší zastaralou odpověď od podvržené; obě odmítne dřív, než se dostanou do DB nebo k AI. Změna jen textu otázky dál projde potichu.
    - **Landing ověřuje uložený token** (`GET …/p/{token}`), než nabídne „Welcome back“ (jméno bere ze serveru); 404 → smazat token. Během ověřování se úvod a tlačítka skryjí, ale místo v layoutu zůstane. Při síťové chybě se „welcome back“ nabídne dál podle uloženého tokenu. SSR vždy renderuje verzi pro nového návštěvníka (token je jen v prohlížeči).
    - **Počty otázek** na landingu a v install logu = `questionnaire.length`, stejně jako počítadlo kvízu. Jméno a role jsou „step 1“, nejsou to otázky.
    - **Odhlášení v jiném tabu:** `redirectIfLoggedOut` nejdřív `useUserSession().fetch()` (ne `clear()`), pak `/login?redirect=`. Admin `load()` a `EventList` ho používají při 401. Login a signup na klientu session přenačtou, než přesměrují na `/`.
    - **401 status text:** nový `requireOrganizer()` (`server/utils/admin.ts`) obaluje `requireUserSession` a vrací `401 You are not logged in` místo „Server Error“.
    - **Počet účastníků v adminu** se aktualizuje na všech tabech. Na tabu Rounds ho emituje `RoundsList`, na tabu Questionnaire polluje `admin.vue` každých 5 s (editor o pollingu neví).
    - **Formulář eventu** validuje na `input` / `change`, ne na blur. Nedotčené prázdné pole nehlásí chybu, submit ano.
    - **`?redirect=`** se nemění: vue-router už kóduje `&` a `#`, `encodeURIComponent` by kódoval dvakrát.
    - **404 `cd ~ →`** vede pod `/e/<slug>/…` na landing eventu, jinak na `/`.
    - **Admin na mobilu:** pod `sm` krátké popisky tabů (Questions / People / Rounds) bez ikon, editor otázky ve dvou řádcích na plnou šířku, save bar se zalamuje.
    - **Emoji** mají vlastní font stack (`--font-emoji`), JetBrains Mono kreslilo ☕ černobíle. Avatar ve skupinách: mono jen pro iniciály.
    - **Uvozovky u icebreakerů** jsou „“ “. Tlačítko `git commit -m "…"` má rovné uvozovky (shell).
    - **Zeď:** jména se zalamují na 2 řádky. Důvod párování dostane volnou výšku karty: `ResizeObserver` spočítá počet řádků pro line-clamp, SSR fallback jsou 3 řádky. Na hustých kartách má přednost icebreaker a důvod může spadnout na 1 řádek.
    - `.playwright-mcp/` a `.claude/worktrees/` jsou v `.gitignore`.

16. **Health check hlásí selhané migrace.** Nitro pluginy neawaituje, takže chyba migrace (např. server spuštěný mimo kořen repa → `Can't find meta/_journal.json`) byla jen unhandledRejection a `/api/health` dál vracel 200 nad DB bez tabulek. Plugin teď předá běh migrací do `server/utils/migrations.ts`, chybu zaloguje jako `[db] migration failed: …` a `/api/health` na výsledek počká: 200 až po úspěšných migracích a `select 1`, jinak 503. Tím odpadá i závod z #13 (health zelený před doběhnutím migrací). Bez `NUXT_DATABASE_URL` se migrace dál jen přeskočí. Ostatní endpointy na migrace nečekají. Ověřeno prod buildem: špatné cwd → 503, kořen repa → 200.

17. **Ověřovací proklik (Playwright) – druhé kolo oprav:**
    - **Line-clamp důvodů** se dřív aplikoval jen na poslední kartu stránky: ref callback prořezával odpojené elementy dřív, než se nové karty připojily. Teď `trackReason` jen volá `observe` a odpojené elementy odebírá až callback observeru. Když se nevejde ani jeden řádek, důvod se skryje.
    - **Trojice na zdi:** avatar nad jménem, jméno se zalamuje jen mezi slovy (max 2 řádky). **AI titul pod jménem se u trojic nezobrazuje:** s titulem nezbylo na 1600/1920 místo na důvod a titul se stejně ořezával. Dvojice beze změny.
    - **Hláška „questions changed“** zmizí po přechodu za první otázku (`watch(quizIndex)`), jiné chyby odeslání zůstávají.
    - **`error.vue` pro 401/403:** 401 → „Permission denied.“ + `npm login →` (`?redirect=` jen u stránek, ne u `/api/*`), 403 → „Access denied.“. SSR stránka 401 nevyhodí, stránka se ukáže jen při otevření chráněného `/api/*` v prohlížeči.
    - Avatary na stránce matche zůstávají s iniciálami (záměr, beze změny).
18. **Deploy přes Docker Compose místo Nixpacks (mění #7, doplňuje #12)** – přání uživatele. `Dockerfile` (multi-stage, `node:22-alpine`, pnpm 12) + `docker-compose.prod.yml` (app + Postgres 17, volume `pgdata-prod`). `docker-compose.yml` zůstává jen pro lokální vývoj.
    - Tajemství generuje Coolify přes magic proměnné (`SERVICE_USER/PASSWORD_POSTGRES`, `SERVICE_PASSWORD_64_SESSION`), `NUXT_PUBLIC_SITE_URL` = `SERVICE_URL_APP_3000`. Ručně jen `NUXT_ANTHROPIC_API_KEY` (`${…:?}` blokuje deploy, když chybí).
    - App má jen `expose: 3000`, žádné `ports:` – na serveru už port 3000 něco používá a Coolify proxy jde přes interní síť.
    - Migrace se kopírují do image do `/app/server/db/migrations`, `WORKDIR /app` → #12 platí beze změny. Healthcheck `wget /api/health`.
    - Ověřeno lokálně (`-p rendez-vue-prodtest`, port override 3100): build, healthy, 5 tabulek z migrace, signup, event, QR s `NUXT_PUBLIC_SITE_URL`, themed 404.
    - **Po prvním deployi:** u ručně zadané domény Coolify `SERVICE_URL_APP_3000` nevyplnil, `siteUrl` byl v produkci prázdný. Compose teď bere `${NUXT_PUBLIC_SITE_URL:-${SERVICE_URL_APP_3000}}`, u vlastní domény se nastaví ručně.
    - **Certifikát:** Let's Encrypt selhával, protože wildcard CNAME na apex `prochazka.vip` dědil AAAA na jiný hosting (Váš Hosting). Uživatel AAAA u apexu smazal, po restartu proxy se certifikát vydal.
