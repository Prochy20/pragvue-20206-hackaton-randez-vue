# Fáze 1 – Scaffold: specifikace

Viz [intent](intent.md) a [rozhodnutí](decisions.md). Úkoly jsou v pořadí commitů; sloupec „Soubory“ určuje vlastnictví pro paralelní agenty.

## Úkoly

| ID | Úkol | Závisí na | Soubory (vlastní) | Commit |
|---|---|---|---|---|
| T1 | Scaffold šablony | – | vše generované | `chore: scaffold Nuxt UI starter` |
| T2 | Úklid šablony + package.json | T1 | `app/pages/*`, `app/components/*`, `.github/`, `renovate.json`, `package.json` | `chore: remove template demo content and CI` |
| T3 | DB: config, schéma, health | T2 | `server/plugins/database.ts`, `server/api/health.get.ts`, `nuxt.config.ts` (blok `nitro`) | `feat(db): add SQLite schema plugin and health endpoint` |
| T4 | UI: layouty, barva, placeholder | T2 | `app/app.vue`, `app/app.config.ts`, `app/layouts/*`, `app/pages/index.vue` | `feat(ui): add base layouts and landing placeholder` |
| T5 | Env + runtimeConfig | T2 | `.env.example`, `nuxt.config.ts` (blok `runtimeConfig`) | `chore: add env example and runtime config` |

T3, T4, T5 jsou nezávislé, ale **T3 a T5 sdílí `nuxt.config.ts`** – paralelně jen pokud každý edituje výhradně svůj blok, jinak sériově. Fáze je malá; paralelizace se nevyplatí, doporučeno sériově.

## T1 – Scaffold

```sh
cd <scratchpad>
pnpm create nuxt@latest icebreaker -t ui --packageManager pnpm --gitInit false
```

Zkopírovat obsah (včetně dotfiles) do rootu repa, **kromě** `.gitignore` a `README.md`. `.gitignore` sloučit: ponechat náš a doplnit chybějící řádky ze šablony. `pnpm install` v repu. Ověřit, že `pnpm dev` naběhne, a commitnout **beze změn** šablony.

## T2 – Úklid

- Smazat demo stránky a komponenty (ponechat jen to, co vyžaduje `app.vue`).
- Smazat `.github/`, `renovate.json` (pokud existují).
- `package.json`: `"name": "icebreaker"`, `"packageManager": "pnpm@11.5.2"`, `"engines": { "node": ">=22.13" }`. Ponechat skripty `dev`, `build`, `preview`, `lint`, `typecheck` (doplnit, pokud chybí: `"typecheck": "nuxt typecheck"`).
- ESLint config ponechat.

## T3 – Databáze

`nuxt.config.ts`:

```ts
nitro: {
  experimental: { database: true },
  database: {
    default: {
      connector: 'node-sqlite',
      options: { path: '.data/db.sqlite' },
    },
  },
},
```

> Ověřit při stavbě přesný tvar `options` connectoru `node-sqlite` v db0 (Context7). Fallback: `better-sqlite3`.

`server/plugins/database.ts` – při startu `useDatabase()` a pro každou tabulku `await db.exec(...)`:

```sql
CREATE TABLE IF NOT EXISTS events (
  id TEXT PRIMARY KEY,
  slug TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  admin_key TEXT NOT NULL,
  questionnaire TEXT NOT NULL,      -- JSON
  created_at TEXT NOT NULL          -- ISO 8601
);

CREATE TABLE IF NOT EXISTS participants (
  id TEXT PRIMARY KEY,
  event_id TEXT NOT NULL,
  token TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  answers TEXT NOT NULL,            -- JSON: [{ questionId, question, type, answer }]
  title TEXT,                       -- NULL when ai_status = 'failed'
  tagline TEXT,
  emoji TEXT,
  ai_status TEXT NOT NULL,          -- 'ok' | 'failed'
  created_at TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS participants_event_id ON participants (event_id);

CREATE TABLE IF NOT EXISTS rounds (
  id TEXT PRIMARY KEY,
  event_id TEXT NOT NULL,
  number INTEGER NOT NULL,
  status TEXT NOT NULL,             -- 'ok' | 'failed'
  created_at TEXT NOT NULL,
  UNIQUE (event_id, number)
);

CREATE TABLE IF NOT EXISTS pairs (
  id TEXT PRIMARY KEY,
  round_id TEXT NOT NULL,
  participant_ids TEXT NOT NULL,    -- JSON array, 2 or 3 ids
  reason TEXT NOT NULL,
  icebreaker TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS pairs_round_id ON pairs (round_id);
```

Žádné FK, žádné pragmy, žádné defaulty – ID (`crypto.randomUUID()`) a `created_at` (`new Date().toISOString()`) generuje aplikace.

`server/api/health.get.ts` – vrací `{ ok: true, tables: string[] }` z `SELECT name FROM sqlite_master WHERE type = 'table' ORDER BY name`. Při chybě DB nechat vybublat (500).

## T4 – UI

- `app/app.config.ts`: `ui: { colors: { primary: 'violet', neutral: <ponechat default šablony> } }`.
- `app/app.vue`: `<UApp><NuxtLayout><NuxtPage /></NuxtLayout></UApp>` (+ případné `useHead` / `useSeoMeta` s titulem „Icebreaker“).
- `app/layouts/default.vue`: `UHeader` (název „Icebreaker“, vpravo `UColorModeButton`), `UMain` se slotem.
- `app/layouts/bare.vue`: jen `<slot />` v `div` na plnou výšku. Používají ho stránky přes `definePageMeta({ layout: 'bare' })`.
- `app/pages/index.vue`: layout `default`, krátký pitch (1–2 věty, anglicky) + nadpis „Create event“ + text „Coming in phase 2“ nebo disabled tlačítko.

## T5 – Env

- `nuxt.config.ts`: `runtimeConfig: { anthropicApiKey: '' }` (plní `NUXT_ANTHROPIC_API_KEY`).
- `.env.example`: `NUXT_ANTHROPIC_API_KEY=` s komentářem.
- Nic klíč při startu nevaliduje.

## Ověření (na konci)

Projít body „Hotovo, když“ z [intent.md](intent.md). Výsledek zapsat do [status.md](status.md).
