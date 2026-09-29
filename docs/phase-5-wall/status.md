# Fáze 5 – Živá zeď: status

**Stav:** postaveno 2026-09-29 (paralelně třemi agenty nad sdíleným kontraktem). API a SSR všech režimů ověřené curlem, lint + typecheck čisté. **UI čeká na ruční proklik uživatelem** (T5).

## Úkoly

- [x] T0 – docs + kontrakt
- [x] T1 – API
- [x] T2 – stránka + mřížka
- [x] T3 – skupiny + mezititulek
- [x] T4 – ověření, HANDOFF
- [ ] T5 – ruční proklik uživatelem

## Ověření (curl)

| Kritérium | Výsledek |
|---|---|
| API: pořadí, `inLatestRound`, skupiny abecedně, 404 | ✅ |
| SSR: prázdný stav, mřížka, skupiny, pruh nováčků, 404 | ✅ |
| Během kola `matching: true`, souběžné kolo 409, po kole round na zdi | ✅ |
| Mezititulek, fade-in, stránkování, rotace, reconnecting, vejde se na 1080p | ⚠️ jen v prohlížeči (uživatel) |

## Testovací data

Event `pragvue-2026` (uživatelův): přidáno 12 fiktivních účastníků (Klára Nováková … Tomáš Beneš), všichni s titulem. Tokeny: Klára `30Q5_9L5A1ctOuL9qNtMvwpL8vyR_rvO`, Ondřej `-MWaT9PhoBlBRt4o_egqn4a-iNFyfyfU`, Martin `JniRTz3nTKH6rVTXCeUduetqvkWk4Ejc`, Tomáš `kfjl8FWpp8WOWqax3KkqIon1AP0d1cPL`.
Event `pragvue-2026` má kolo 1 (6 skupin, všech 13 lidí).
Pod testovacím organizátorem `t1-match-test@example.com` / `testtest123`:
- `t1-match-test`: 8 lidí, kolo 2. Race1–3 Test jsou nováčci po kole (pruh `$ git stash`).
- `wall-grid-test`: 2 lidé, 1 kolo.

Pro mezititulek stačí v adminu spustit kolo a mít otevřenou zeď. Testovacího organizátora po fázi smazat (cascade).
