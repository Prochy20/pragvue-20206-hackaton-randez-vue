# Fáze 5 – Živá zeď: rozhodnutí

Append-only.

## 2026-09-29 – grillování

1. **Vizuál = tokeny účastnického FE** (terminálové tmavé téma, zelená/růžová/žlutá, Space Grotesk + JetBrains Mono, avatary z iniciál), typografie zvětšená přes `clamp()` pro projektor. Zeď v designu není navržená.
2. **Veřejný `GET /api/events/<slug>/wall`**: účastník = jméno, emoji, titul, `aiStatus`; poslední `ok` kolo = skupiny (jména, emoji, tituly, reason, icebreaker). *Nevrací* tokeny, id, tagline, role, odpovědi, diff, „spot me by“. Smazaný člen = `(removed)`.
3. **Bez kola mřížka, po kole párový režim + pruh nováčků** (registrovaní po kole). *Zamítnuto:* automatické střídání režimů, ruční přepínání z adminu.
4. **Škála:** velikost karet v mřížce podle počtu (50 lidí na 1080p bez scrollu). Skupiny stránkované podle výšky viewportu, auto-rotace ~10 s s `page n/m`, při ≤ 8 skupinách bez rotace. *Zamítnuto:* auto-scroll, kompaktní karty bez reason.
5. **Stav `failed` = jméno a šedý `title 404`. Nejnovější nahoře, nové karty s fade-in.**
6. **Hlavička (název eventu, `$ npm i friends`, počet lidí) a join panel s QR (`uqr`, SVG) a krátkou URL v obou režimech.**
7. **Nové kolo → mezititulek ~3 s přes celou obrazovku (`$ git merge round-N` → `✓ K friends paired`), pak skupiny s postupným fade-in. Při prvním načtení se nepřehrává.**
8. **Prázdné a chybové stavy:** 0 lidí = velký QR + `waiting for first friend…`. Neznámý slug = terminálové `404 event not found`. Výpadek pollingu = poslední data + malý `● reconnecting`.
9. **Stavba paralelně třemi agenty** (server / stránka + mřížka / páry + mezititulek) nad sdíleným kontraktem.
10. **Skupiny abecedně podle křestního jména prvního člena, členové uvnitř skupiny také abecedně (smazaní na konec).** Lidé na projektoru hledají svoje jméno.
11. **Pruh nováčků: jeden řádek, nejnovějších ~8 kompaktních karet (emoji + jméno) + `+k more`, nadpis `$ git stash  # waiting for next round`.**

## 2026-09-29 – spec

12. **Stav `pending` neexistuje.** AI běží před INSERTem účastníka (fáze 3), na zdi se tedy člověk objeví až s hotovým titulem. Z bodu 5 zůstává jen `failed`.
13. **Zeď vidí běžící kolo:** in-memory zámek `running` se přesouvá z `rounds.post.ts` do `server/utils/match.ts` (`startRound` / `finishRound` / `isRoundRunning`), endpoint vrací `matching: boolean`. Mezititulek pak začne `installing friends…` už během AI callu a po dokončení přejde na `✓ K friends paired`. Na demu tím nevznikne 5–30 s ticha.
14. **Klíč účastníka na zdi = jeho `number`** (pořadí v eventu, veřejné už na profilové kartě), ne uuid.
15. **Polling 4 s přes nový lehký loop ve stránce** (bez `document.hidden` pauzy, projektor je vždy vidět; bez překryvu požadavků). `usePolling` z adminu nerozlišuje chybu, `useVisiblePolling` pauzuje skrytý tab – zeď potřebuje `reconnecting` stav.
