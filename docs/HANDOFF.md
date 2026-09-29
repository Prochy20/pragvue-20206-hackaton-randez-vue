# Handoff

Přepisuje se na konci každé fáze. Vstupní bod pro novou session.

**Poslední update:** 2026-09-29, po dokončení fáze 1.

## Kde jsme

- Fáze 1 (Scaffold) ✅ hotová, commitnutá na `master`. Detail: [phase-1-scaffold/status.md](phase-1-scaffold/status.md).
- Další: **fáze 2 – Event + admin** (založení eventu, editor dotazníku text/výběr s výchozí sadou, seznam účastníků, seznam kol, admin link). Zatím nevygrilovaná, složka neexistuje.

## Co musí nová session vědět

- Čti `CLAUDE.md` → `intent.md` → `docs/README.md` → handoff poznámky v `phase-1-scaffold/status.md`.
- DB vždy přes `await useDb()` (`server/utils/db.ts`), ID `crypto.randomUUID()`, čas ISO string, JSON sloupce přes `JSON.stringify`.
- Layouty: `default` (admin) a `bare` (účastník, zeď).
- Grillovat přes `/grilling` (ne grill-me), výstup do `docs/phase-2-<slug>/` (intent, decisions, spec, status).
- Commity: conventional, anglicky, malé, **bez zmínky o AI/Claude**. Větev `master`.
- Dev server: `pnpm dev` → http://localhost:3000 (uživatel se chce dívat, držet ho běžící).
- API klíč zatím není (`.env` neexistuje) – fáze 2 ho nepotřebuje.

## Prompt pro novou session

```
Pokračujeme na Icebreakeru. Přečti docs/HANDOFF.md a spusť /grilling pro fázi 2 (Event + admin).
```
