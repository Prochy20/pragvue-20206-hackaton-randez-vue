# Fáze 6 – Seed + doladění stavů: intent

## Cíl

Appka připravená na demo na Coolify: lokální seed pro testování, migrace schématu při startu, dotažené loading / empty / error stavy napříč appkou a anglické README pro porotu.

## Scope

- `pnpm seed` (jen lokálně): demo organizátor + event `pragvue-2026-demo` s 15 účastníky s předpečenými profily, bez kola.
- `scripts/generate-seed-profiles.ts`: jednorázově vygeneruje profily skutečným `generateProfile` do statického JSONu.
- Migrace: `drizzle-kit generate` + Nitro plugin, který je aplikuje při startu (lokálně i na produkci). Konec `db:push`.
- Nasazení na Coolify přes Docker Compose (`docker-compose.prod.yml` + `Dockerfile`, decisions #18; původně Nixpacks), `NUXT_PUBLIC_SITE_URL` pro odkazy a QR.
- Sweep stavů: 10 mezer z auditu (viz `decisions.md` #6).
- Anglické README: pitch, jak to funguje, AI, stack, lokální běh, deploy, demo scénář, ne-scope, místa na screenshoty.

## Ne-scope

Seed na produkci, Dockerfile, záchranné předpečené kolo, CI, nové funkce.

## Hotovo když

- `pnpm seed` lokálně opakovaně projde a event má 15 lidí s tituly.
- Produkční build nastartuje nad prázdnou DB a sám aplikuje migrace; lokální DB migrace při startu přeskočí.
- Opravené stavy ověřené curlem, lint + typecheck čisté.
- Uživatel prokliká UI a nasadí na Coolify.
