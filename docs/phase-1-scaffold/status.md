# Fáze 1 – Scaffold: status

**Stav:** hotovo 2026-09-29.

## Úkoly

- [x] T0 – `docs: add project intent, CLAUDE.md and phase 1 docs`
- [x] T1 – `chore: scaffold Nuxt UI starter`
- [x] T2 – `chore: remove template demo content and CI`
- [x] T3 – `feat(db): add SQLite schema plugin and health endpoint`
- [x] T4 – `feat(ui): add base layouts and landing placeholder` (dělal paralelní subagent)
- [x] T5 – `chore: add env example and runtime config`
- [x] Ověření kritérií hotovosti

## Ověření

| Kritérium | Výsledek |
|---|---|
| `pnpm dev` naběhne | ✅ (jen `ExperimentalWarning` od `node:sqlite`) |
| `/` vykreslí placeholder, violet | ✅ HTTP 200; color mode přepínač neověřen v prohlížeči |
| `/api/health` vrátí 4 tabulky | ✅ `events, pairs, participants, rounds` |
| `.data/db.sqlite` existuje | ✅ |
| `pnpm lint`, `pnpm typecheck` | ✅ oba exit 0 |
| Běží bez API klíče | ✅ žádný `.env` |

## Handoff poznámky pro fázi 2

- **DB přístup:** vždy `await useDb()` ze `server/utils/db.ts`, nikdy `useDatabase()` přímo (decisions #14). `` db.sql`…${x}` `` binduje parametry a vrací `{ rows }`.
- ID: `crypto.randomUUID()`, čas: `new Date().toISOString()`. JSON sloupce ukládat přes `JSON.stringify`.
- Layouty: `default` (admin, UHeader) a `bare` (`definePageMeta({ layout: 'bare' })`) pro účastníka a zeď.
- ESLint stylistic: bez středníků, single quotes, bez trailing commas.
- pnpm 12.6.0 (repo si ho vynutí přes `packageManager`), Nuxt 4.5.2, Nuxt UI 4.11.2, Nitro 2.
- Dev server: `pnpm dev` → http://localhost:3000.

## Odchylky od specu

Viz decisions #12–16: pnpm 12, `.gitignore` ze šablony, memoizovaná `ensureSchema()` kvůli race s Nitro pluginem, smazaná `LICENSE` a `routeRules`, T4 vlastní i `main.css`.
