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
