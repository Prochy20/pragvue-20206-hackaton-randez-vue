# Fáze 4 – Matching round: rozhodnutí

Append-only.

## 2026-09-29 – grillování

1. **Kolo spouští admin, jeden LLM call nad všemi účastníky.** – Drží intent a fázi 3 #41; na demu divadelní moment, zeď (fáze 5) ukazuje páry. *Zamítnuto:* per-účastník „find my match“ z designu (rozbíjí páry A→B, B→C, trojice i validaci).
2. **Výstup AI na skupinu: `reason` (1 věta), `diff` (2–4 řádky `{ sign: '+' | '-', text }`, společné pro celou skupinu), `icebreaker` (1 otázka).** Nový sloupec `pairs.diff` (jsonb). „Spot them by“ = odpověď na otázku s `recognizeMe`, ne AI. *Zamítnuto:* druhý icebreaker (obrazovka 09), diff per dvojice uvnitř trojice.
3. **Párují se všichni účastníci, i `aiStatus = failed`.** AI stačí odpovědi.
4. **< 2 účastníci → tlačítko disabled (server 400). Jedno běžící kolo na event (in-memory zámek, jinak 409). `POST` synchronní, admin vidí loading.**
5. **AI: `messages.parse` + zod jako u profilu, timeout 60 s, `effort: 'medium'`, 1 retry při chybě / nevalidním výstupu, pak kolo `failed`.**
6. **Vstup promptu: krátká id `p1…pN` (server mapuje na uuid), jméno, role, `hereFor`, titul, odpovědi v bloku dat; dřívější páry jako „don't pair again“.**
7. **„Nepárovat znovu“ jen měkce v promptu.** Server tvrdě validuje: každý právě jednou, skupiny 2–3, trojice max. jedna a jen při lichém počtu, žádná neznámá id. – Malý event po pár kolech nemá nové kombinace.
8. **Účastník: polling `GET …/p/<token>` každých 5 s, odpověď má `match` (poslední úspěšné kolo s ním) a `latestRoundNumber`.** – 50 lidí, zanedbatelná zátěž.
9. **Nový match → `✓ match found` + CTA `npm install friend →` → 07 (min. 2,5 s, jen poprvé pro kolo, localStorage) → 08 na `/e/<slug>/p/<token>/match`.** Přímé otevření URL rovnou 08. *Zamítnuto:* auto-přehrání 07 po pollingu (telefon v kapse).
10. **Zobrazuje se poslední úspěšné kolo; failed kola ignorovat. Registrován po kole → „You'll be matched in the next round“. Smazaný protějšek → `(removed)` + „Your match left. Next round will fix that.“**
11. **Trojice na 08: tři mini karty ve 3 sloupcích, H1 „You + A + B compile cleanly.“, `$ diff you a b`.**
12. **`git commit -m "met …"` = jen toast `[main 4f2a9c1] met …`, nic se neukládá.**
13. **Admin Rounds: aktivní tlačítko s loadingem, kola od nejnovějšího, skupiny se jmény (`(removed)`), reason, diff, icebreaker; failed = červený badge + hláška, „Run again“ je stejné tlačítko.**
14. **Stavba paralelně třemi agenty** (server / účastnické UI / admin UI) nad sdíleným kontraktem (typy + schéma), který vznikl první.

## 2026-09-29 – stavba

15. **Admin Rounds bere počet účastníků z `getEvent()` při každém pollingu (5 s), ne jako prop z `admin.vue`.** – Stránka načte počet jen jednou, tlačítko by zůstalo disabled po registracích až do reloadu. V UI „groups“ místo „pairs“ (trojice).
16. **Profil a match stránka:** polling přes nový `useVisiblePolling` (jen viditelný tab, bez překryvu požadavků; `usePolling` už existuje v adminu), výsledek pollingu nahradí profil tiše a jen při `aiStatus = ok`. Viděná kola v localStorage `icebreaker:seen-rounds` (`useSeenRounds`, max. 50).
17. **Odchylky 08 od specu:** potvrzení commitu je inline terminálový blok s řádky obrazovky 09 (`[main <hash>] met tomáš` / `1 friend committed, 0 small talks deleted`), ne toast; hash deterministicky z `roundId + token`. Obrazovka 07 bez čísla „214“ (API nemá počet účastníků). „spot tomáš by: …“ s křestním jménem (kvůli trojici). Reason jako text pod mini kartami. Smazaní členové: karta `?` / `(removed)` / `uninstalled`, v diffu `removed`, když zmizeli všichni, H1 „Your match left.“ bez commit tlačítka. Titul na mini kartě fallback na roli.
18. **Server:** `generateMatch` v `server/utils/ai-match.ts` (vlastní klient, `max_tokens` 16000), `server/utils/match.ts` sdílí mapper kol (`loadAdminRounds`), `previousPairs` (trojice → 3 dvojice, jen z `ok` kol) a `loadProfileMatch`. `toPublicProfile` bere stav matche jako 3. argument. Číslo kola se počítá ve stejné transakci jako INSERT. Minimální délky navíc ke specu: reason a icebreaker ≥ 10 znaků, diff text ≥ 2. **Company se do matching promptu neposílá** (vtipy o zaměstnavateli). V promptu je explicitně počet dvojic / trojic. Zámek kola je in-memory per proces (jedna instance stačí).
