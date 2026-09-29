# Handoff

Přepisuje se na konci každé fáze. Vstupní bod pro novou session.

**Poslední update:** 2026-09-29, fáze 3 postavená, čeká na ruční proklik UI.

## Kde jsme

- Fáze 1 ✅, 2 ✅, **3 postavená** (Postgres + Drizzle, účty organizátorů, registrace účastníka s AI profilem, UI podle design handoffu Rendez-Vue, obrazovky 01–06). Detaily a ověření v [phase-3-registration/status.md](phase-3-registration/status.md).
- Otevřené: **T9 – uživatel prokliká UI** (registrace už ověřena, že funguje) (registrace na `/e/pragvue-2026`, profil, retry, admin editor A/B, login/signup, Your events). Nálezy opravit, zapsat do `decisions.md`.
- Další: **fáze 4 – Matching round** (obrazovky 07–08 z designu, admin tlačítko „Run matching round“, páry/trojice, validace + retry). Zatím nevygrilovaná.

## Co musí nová session vědět

- Čti `CLAUDE.md` → `intent.md` → `docs/README.md` → `phase-3-registration/status.md` (handoff poznámky) → `decisions.md` #32–#46 (design handoff a odchylky).
- Po vytvoření nových `.vue` souborů za běhu dev serveru: když UI vypadá rozbitě (chybí styly), restartovat `pnpm dev` a tvrdý reload (decisions #47).
- Běh: `docker compose up -d` → `pnpm db:push` → `pnpm dev --port 3000` (držet běžící). `.env`: `NUXT_DATABASE_URL`, `NUXT_SESSION_PASSWORD`, `NUXT_ANTHROPIC_API_KEY` (vyplněno).
- Značka **Rendez-Vue** (terminál / npm vtipy). Design: `docs/design_handoff_rendez_vue/`.
- AI: `claude-sonnet-5-5` **neumí vynucený `tool_choice`** → structured outputs (`client.beta.messages.parse` + `betaZodOutputFormat`), vzor v `server/utils/ai-profile.ts`.
- **Kód píše Claude celý.** **Žádné klikání v prohlížeči** – ověřovat curl / lint / typecheck, UI kontroluje uživatel. Do eventu `pragvue-2026` (uživatelův) se smí registrovat testovací účastníci.
- Commity: conventional, anglicky, malé, **bez zmínky o AI/Claude**. Větev `master`.

## Prompt pro novou session

```
Pokračujeme na Icebreakeru (Rendez-Vue). Přečti docs/HANDOFF.md. Nejdřív dořešíme nálezy z prokliku fáze 3 (napíšu je), pak spusť /grilling pro fázi 4 (Matching round).
```
