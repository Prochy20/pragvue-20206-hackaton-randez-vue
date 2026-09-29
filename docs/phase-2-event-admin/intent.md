# Fáze 2 – Event + admin: intent

## Cíl

Organizátor založí event na `/`, dostane admin stránku s tajným klíčem a na ní upraví dotazník (text / výběr, předvyplněná výchozí sada), vidí účastníky (a může je smazat) a historii kol. Registrace účastníků a matching zatím neexistují – admin na ně jen připraví místo.

## Scope

- `zod` + sdílená schémata a typy v `shared/`.
- Výchozí sada 8 otázek v `shared/`.
- API: založení eventu, admin detail eventu, uložení dotazníku, seznam účastníků, smazání účastníka, seznam kol s páry.
- Ověření admin klíče (header `x-admin-key`).
- `/` – formulář „Create event“ (jen název) → redirect na admin.
- `/e/<slug>/admin?key=…` – pruh s odkazy + taby Questionnaire / Participants / Rounds.

## Ne-scope

- Registrační stránka `/e/<slug>` (fáze 3) – admin na ni jen odkazuje.
- Spuštění kola (fáze 4) – tlačítko „Run matching round“ je vypnuté.
- Zeď (fáze 5) – admin na ni jen odkazuje.
- Přejmenování / smazání eventu, QR kód, drag & drop řazení.

## Hotovo, když

1. Na `/` založím event názvem → přesměruje mě na `/e/<slug>/admin?key=…`, klíč je i v localStorage.
2. Dva eventy se stejným názvem dostanou různé slugy.
3. Admin se špatným / chybějícím klíčem ukáže „Invalid admin link“; neexistující slug 404.
4. Dotazník je předvyplněný 8 otázkami; jde přidat, smazat, upravit, přehodit pořadí, přepnout typ, nastavit required / recognizeMe; Save uloží, refresh to zachová; nevalidní dotazník server odmítne a UI ukáže chybu.
5. Neuložené změny varují před opuštěním stránky.
6. Participants a Rounds ukazují empty stav; po ručním vložení řádků do DB se data objeví (polling 5 s), účastník jde smazat přes modal, smazaný člen páru se zobrazí jako „(removed)“.
7. `pnpm lint` a `pnpm typecheck` projdou.
