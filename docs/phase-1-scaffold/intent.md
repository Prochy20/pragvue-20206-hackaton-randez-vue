# Fáze 1 – Scaffold: intent

## Cíl

Běžící prázdný Nuxt 4 projekt s Nuxt UI v4, SQLite databází se schématem pro celou appku, runtime configem pro Anthropic klíč a základními layouty. Žádná business logika.

## Scope

- Nuxt 4 + Nuxt UI v4 ze šablony `ui`, vyčištěné od demo obsahu.
- Nitro experimental database, connector `node-sqlite`, soubor `.data/db.sqlite`.
- Všechny 4 tabulky (`events`, `participants`, `rounds`, `pairs`) vytvořené pluginem při startu.
- `GET /api/health` jako smoke test DB.
- `runtimeConfig.anthropicApiKey` + `.env.example`.
- Layouty `default` (admin) a `bare` (účastník, zeď), placeholder `/`.
- Primární barva `violet`.

## Ne-scope

- `@anthropic-ai/sdk` (fáze 3).
- Formulář „Create event“ a jakékoli API kromě health (fáze 2).
- Vizuál účastnické části a zdi (fáze 3, 5).
- CI, renovate, Docker, testy.

## Hotovo, když

1. `pnpm dev` naběhne bez chyb (ExperimentalWarning od `node:sqlite` je OK).
2. `/` vykreslí placeholder v Nuxt UI s violet akcentem, přepínač color mode funguje.
3. `GET /api/health` vrátí `{ ok: true, tables: ["events", "pairs", "participants", "rounds"] }`.
4. Existuje `.data/db.sqlite`.
5. `pnpm typecheck` a `pnpm lint` projdou.
6. Appka naběhne i **bez** `NUXT_ANTHROPIC_API_KEY`.
