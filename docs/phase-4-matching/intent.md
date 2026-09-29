# Fáze 4 – Matching round: intent

## Cíl

Admin spustí kolo párování, AI jedním callem rozdělí všechny účastníky eventu do dvojic (při lichém počtu jedna trojice) s důvodem, `diff` blokem a icebreaker otázkou. Účastník to uvidí na profilu (polling) a otevře si obrazovky 07 (loading) → 08 (match) z designu Rendez-Vue.

## Scope

- `POST /api/events/<slug>/rounds` (admin): LLM call, validace, 1 retry, uložení `rounds` + `pairs`, stav `ok` / `failed`.
- Účastnický profil: polling 5 s, blok `✓ match found` + CTA, „next round“ stav.
- `/e/<slug>/p/<token>/match`: obrazovka 07 (jen poprvé pro kolo) → 08 (pár i trojice), toast u `git commit -m "met …"`.
- Admin tab Rounds: aktivní „Run matching round“, detail skupin (diff, reason, icebreaker), failed stav.

## Ne-scope

Obrazovka 09 (druhý icebreaker, hodnocení), 10 (`npm ls`, ruční přidání), zeď (fáze 5), seed (fáze 6), deterministický fallback párování, historie kol pro účastníka.

## Hotovo když

- Admin s ≥ 2 účastníky spustí kolo, v Rounds vidí skupiny; každý účastník je právě v jedné skupině.
- Chyba AI / nevalidní výstup 2× → kolo `failed`, admin vidí error a může spustit znovu.
- Účastník bez reloadu (do ~5 s) uvidí `match found`, přes 07 dojde na 08 s protějškem, diffem a icebreakerem.
- Další kolo se vyhne dřívějším párům (pokud to jde).
- `pnpm lint` + `pnpm typecheck` čisté.
