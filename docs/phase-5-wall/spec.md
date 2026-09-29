# Fáze 5 – Živá zeď: spec

Kontrakt (T0, hotový před stavbou): `shared/types/wall.ts`, závislost `uqr`, kostra `app/pages/e/[slug]/wall.vue`.

## API – `GET /api/events/<slug>/wall` → `WallData`

- Veřejné, `requirePublicEvent` (404 „Event not found“).
- `participants`: všichni účastníci eventu, **nejnovější první** (`number` desc). `inLatestRound` = je v některé skupině posledního `ok` kola.
- `round`: poslední kolo `status = ok` nebo `null`. Skupiny seřazené abecedně (`localeCompare`, `en`) podle jména prvního člena; členové uvnitř abecedně, smazaní na konec. Smazaný člen `{ removed: true, name/title/emoji: null }`.
- `matching`: `isRoundRunning(event.id)` ze `server/utils/match.ts`. Zámek (`Set`) se přesouvá z `rounds.post.ts`: `startRound(id)` (false když už běží → 409), `finishRound(id)` ve `finally`.
- Nic dalšího (žádné tokeny, uuid, tagline, role, odpovědi, diff).

## Stránka `/e/<slug>/wall` (`layout: 'bare'`, `h-dvh overflow-hidden`, `bg-rv-bg`)

- Data: `useFetch` na SSR, pak klientský polling 4 s (bez překryvu). Chyba pollingu → ponechat data, `● reconnecting` v rohu, dokud další tick neprojde. 404 při prvním načtení → terminálové `404 event not found`.
- Hlavička: název eventu (Rende**z-Vue** styl: „Vue“ zeleně jen v logu), `$ npm i friends` s kurzorem (`RvCursor`), počet lidí `N friends installed`.
- Join panel (pravý horní roh / sloupec): QR (`renderSVG` z `uqr`, URL `${origin}/e/<slug>`), pod ním URL bez protokolu. Barvy QR: tmavé moduly na `--rv-text` pozadí (musí jít naskenovat).
- Režim **grid** (`round === null`): 0 lidí → velký QR + `waiting for first friend…` + kurzor. Jinak mřížka karet (avatar s emoji, nebo iniciály když emoji chybí; jméno; titul, u `failed` šedě `title 404`). Počet sloupců/velikost písma podle počtu (např. ≤ 12 velké, ≤ 30 střední, jinak malé), 50 karet na 1920×1080 bez scrollu. Nové karty (number, které předtím nebylo) s `animate-rv-card-in`.
- Režim **pairs** (`round !== null`): `WallGroups` zabírá zbytek výšky; pod ním `WallNewcomers`, když existují účastníci s `inLatestRound = false` (nejnovějších 8 + `+k more`, nadpis `$ git stash  # waiting for next round`).
- **Mezititulek** (`WallRoundIntro`, fixed overlay přes celou obrazovku):
  - `matching === true` → fáze `matching` (`$ npm install friends…`, spinner/kurzor, `pairing N people`), dokud matching běží.
  - Nové `round.number` oproti předchozímu ticku (ne první načtení) → fáze `merged` (`$ git merge round-N` → `✓ K friends paired`) na 3 s, pak zmizí a skupiny naběhnou s postupným fade-in.
  - Když matching skončí bez nového kola (failed) → overlay prostě zmizí.

## Komponenty (`app/components/wall/`, auto-import jako `Wall*`)

- `WallGroups` – props `{ groups: WallGroup[], roundNumber: number }`. Vyplní výšku rodiče (`flex-1 min-h-0`). Karta skupiny: 2–3 členové (avatar, jméno, titul; `(removed)`), reason, icebreaker (pink karta jako na 08). Stránkování podle výšky: počet na stránku z `ResizeObserver` (min. 1), ≤ 8 skupin a vejdou-li se → bez rotace; jinak rotace 10 s, `page n/m` + `round N` v mono patičce. Při změně `groups` / `roundNumber` zpět na stránku 1. Postupný fade-in karet (stagger).
- `WallRoundIntro` – props `{ phase: 'matching' | 'merged', roundNumber: number | null, groupCount: number, participantCount: number }`. Jen vzhled, časování řídí stránka.
- `WallCard`, `WallGrid`, `WallNewcomers`, `WallJoinPanel`, `WallHeader` – vlastní agent B, API volné.

## Úkoly

| # | Úkol | Soubory (vlastnictví) | Závisí |
|---|---|---|---|
| T0 | `docs: add phase 5 docs` + `feat(shared): add wall contract` | docs, `shared/types/wall.ts`, `package.json`, kostra `wall.vue` | – |
| T1 | `feat(api): serve live wall data` | `server/api/events/[slug]/wall.get.ts`, `server/utils/match.ts`, `server/api/events/[slug]/rounds.post.ts` | T0 |
| T2 | `feat(wall): show live participant grid` | `app/pages/e/[slug]/wall.vue`, `app/components/wall/{Card,Grid,Newcomers,JoinPanel,Header}.vue` | T0 |
| T3 | `feat(wall): show matched groups` | `app/components/wall/{Groups,RoundIntro}.vue` | T0 |
| T4 | curl, lint, typecheck, HANDOFF; uživatel prokliká | – | T1–T3 |
