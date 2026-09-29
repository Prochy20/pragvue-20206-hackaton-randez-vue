# Fáze 4 – Matching round: status

**Stav:** ✅ hotovo 2026-09-29 (paralelně třemi agenty nad sdíleným kontraktem). API ověřené curlem včetně dvou živých AI kol, lint + typecheck čisté, UI proklikané uživatelem bez nálezů.

## Úkoly

- [x] T0 – `docs: add phase 4 docs` + `feat(shared): add match contract`
- [x] T1 – `feat(ai): generate matching round` + `feat(api): run matching rounds` + `feat(api): include match in participant profile`
- [x] T2 – `feat(ui): show participant match`
- [x] T3 – `feat(admin): run matching rounds`
- [x] T4 – ověření curlem, restart dev serveru, HANDOFF
- [x] T5 – ruční proklik UI uživatelem (bez nálezů)

## Ověření (curl)

| Kritérium | Výsledek |
|---|---|
| < 2 účastníci → 400, anonym → 401, souběžné kolo → 409 | ✅ |
| Kolo s 5 lidmi: 1 dvojice + 1 trojice, každý právě jednou | ✅ (~5 s) |
| 2. kolo nezopakovalo žádný pár | ✅ |
| Profil vrací `match` s `recognizeMe`, smazaný člen `removed: true` | ✅ |
| Registrace po kole → `match: null`, `latestRoundNumber: 1` | ✅ |
| Chybějící API klíč / failed kolo | ⚠️ neověřeno (vyžaduje restart bez klíče), kód: catch → `failed` |
| 50 lidí v limitu 60 s | ⚠️ neověřeno |

## Testovací data

Organizátor `t1-match-test@example.com` / `testtest123`, event `t1-match-test` (5 účastníků, 2 kola). Tokeny: Jana `gvbZ--Yq0OcinDPMRytZo9A7maoyY_VE` (trojice), Tomáš `Ttpo3iiRVHoDMjVom3QxftSEPLuf3icm` (trojice se smazaným členem v 1. kole), Petr `rYxce-mz6fl_YoDz3ksDtqH5dodc2Ccr`, Lucie `SMs-CipIFlT_fGJnbIxD6dI6XWNeSNSa`. Nechat pro vývoj živé zdi (fáze 5), smazat až potom (uživatel, cascade).
