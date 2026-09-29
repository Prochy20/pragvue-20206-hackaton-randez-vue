# Dokumentace vývoje

Zdroj pravdy pro celý projekt je [`/intent.md`](../intent.md). Každá fáze z něj má vlastní složku `docs/phase-N-<slug>/`, která se založí při grillování fáze (`/grilling`) a slouží jako handoff pro další session nebo paralelní agenty.

## Konvence složky fáze

| Soubor | Role | Kdy se mění |
|---|---|---|
| `intent.md` | Cíl fáze, scope, ne-scope, kritéria hotovosti. | Jen při grillování. |
| `decisions.md` | Log rozhodnutí: co, proč, zamítnuté alternativy. Append-only. | Při grillování a když se během stavby něco rozhodne jinak. |
| `spec.md` | Přesné zadání pro stavbu: soubory, config, SQL, úkoly se závislostmi a vlastnictvím souborů. | Před stavbou; během stavby jen opravy. |
| `status.md` | Checklist úkolů, aktuální stav, handoff poznámky pro další session. | Průběžně. |

**Jak začít novou session:** přečti `/intent.md` → `docs/README.md` (tabulka fází) → `status.md` a `spec.md` aktuální fáze. `decisions.md` jen když potřebuješ důvod.

**Paralelní agenti:** berou úkoly ze `spec.md`, které nemají nesplněné závislosti a nesdílí soubory s jiným běžícím úkolem.

## Konvence pro celý projekt

- Commity: Conventional Commits, anglicky, se scopem když dává smysl (`feat(db): …`), víc menších commitů na fázi. Žádná zmínka o AI/Claude v commitech ani PR.
- Větev: `master`.
- Dev dokumentace česky, UI a AI výstupy anglicky, kód a komentáře anglicky.
- Žádné testy; ověřuje se ručně při `pnpm dev`.

## Fáze

| # | Fáze | Stav | Složka |
|---|---|---|---|
| 1 | Scaffold | ✅ hotovo | [phase-1-scaffold](phase-1-scaffold/) |
| 2 | Event + admin | ✅ hotovo (UI čeká na proklik) | [phase-2-event-admin](phase-2-event-admin/) |
| 3 | Registrace + AI titul | – | – |
| 4 | Matching round | – | – |
| 5 | Živá zeď | – | – |
| 6 | Seed + doladění stavů | – | – |
