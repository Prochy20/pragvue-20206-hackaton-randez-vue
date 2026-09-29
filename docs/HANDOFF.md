# Handoff

Přepisuje se na konci každé fáze. Vstupní bod pro novou session.

**Poslední update:** 2026-09-29, po dokončení fáze 2.

## Kde jsme

- Fáze 1 (Scaffold) ✅, fáze 2 (Event + admin) ✅ postavená a commitnutá na `master`. API ověřené curlem; UI admina má uživatel proklikat ručně (T5 v [phase-2-event-admin/status.md](phase-2-event-admin/status.md)).
- Další: **fáze 3 – Registrace + AI titul** (hravý účastnický FE na `/e/<slug>`, dotazník z konfigurace, synchronní AI profil, loading / success / error, „Try again“, stránka profilu `/e/<slug>/p/<token>`). Zatím nevygrilovaná, složka neexistuje.

## Co musí nová session vědět

- Čti `CLAUDE.md` → `intent.md` → `docs/README.md` → handoff poznámky v `phase-2-event-admin/status.md`.
- DB vždy přes `await useDb()`, body přes `readBodyWith(event, zodSchema)`, admin endpointy přes `requireAdminEvent(event)`.
- Sdílená schémata a typy v `shared/` (zod v4), auto-import všude.
- Layouty: `default` (admin) a `bare` (účastník, zeď).
- Grillovat přes `/grilling`, výstup do `docs/phase-3-<slug>/` (intent, decisions, spec, status).
- **Kód píše Claude celý** (žádné learning-mode TODO pro uživatele). **Žádné klikání v prohlížeči** – ověřovat curl / lint / typecheck, UI kontroluje uživatel.
- Commity: conventional, anglicky, malé, **bez zmínky o AI/Claude**. Větev `master`.
- Dev server: `pnpm dev` → http://localhost:3000, držet běžící. `pnpm typecheck` ho umí zaseknout („Restarting Nuxt…“ 503) → restart.
- Fáze 3 potřebuje API klíč: `NUXT_ANTHROPIC_API_KEY` v `.env` (zatím neexistuje) a `@anthropic-ai/sdk`.

## Prompt pro novou session

```
Pokračujeme na Icebreakeru. Přečti docs/HANDOFF.md a spusť /grilling pro fázi 3 (Registrace + AI titul).
```
