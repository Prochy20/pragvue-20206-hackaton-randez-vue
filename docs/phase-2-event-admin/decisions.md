# Fáze 2 – log rozhodnutí

Append-only. Formát: **rozhodnutí** – proč. *Zamítnuto:* alternativy.

## 2026-09-29 – grillování

1. **Formulář „Create event“ má jen název; slug z názvu, při kolizi krátký náhodný suffix.** – Nejrychlejší cesta k demu, žádná chyba pro uživatele. *Zamítnuto:* vlastní slug, datum/popis, chyba při kolizi.
2. **Po založení rovnou redirect na admin; nahoře alert „Bookmark this page“ s copy; `{slug: adminKey}` záloha v localStorage.** – Žádný mezikrok, ale link se neztratí. *Zamítnuto:* mezistránka „Save your admin link“.
3. **Admin klíč v headeru `x-admin-key`, helper `requireAdminEvent()`, porovnání `===`, chyba 403 → stránka „Invalid admin link“.** – Jednoduché; timing útoky na hackathonu neřešíme. *Zamítnuto:* klíč v query API volání, `timingSafeEqual`.
4. **Tvar otázky `{ id, type: 'text'|'choice', label, options?, required, placeholder?, recognizeMe? }`.** `recognizeMe` je flag (max 1 otázka, jen text), ne pevné id – fáze 4 ho zobrazí u matche; když chybí, nic se nezobrazí. *Zamítnuto:* pevné id otázky, bez `required`.
5. **Výchozí sada 8 otázek v `shared/`** (i pro seed ve fázi 6), znění viz spec.
6. **Participants a Rounds se staví reálně (GET + DELETE účastníka), s empty stavy; „Run matching round“ vypnuté.** Ověření vložením řádků přes `sqlite3`. – Triviální a fáze 3/4 to hned využijí. *Zamítnuto:* jen placeholdery.
7. **Smazání účastníka nemaže páry; smazaný člen se v kole zobrazí jako „(removed)“.** Potvrzení přes `UModal`. – Kolo zůstává historicky pravdivé (navazuje na fáze 1 #5). *Zamítnuto:* kaskáda, `confirm()`.
8. **Admin layout: pruh s názvem a odkazy (registrace, zeď, admin, s copy) + `UTabs` Questionnaire / Participants / Rounds, aktivní tab v `?tab=`.** *Zamítnuto:* jedna dlouhá stránka, dashboard sidebar.
9. **Dotazník se ukládá explicitním „Save“ (PUT celého pole), dirty stav, varování při opuštění.** *Zamítnuto:* autosave.
10. **`zod`, schémata v `shared/` pro `UForm` i `readValidatedBody`.** *Zamítnuto:* ruční validace.
11. **Registrace bude na `/e/<slug>`.** QR kód případně až ve fázi 5. *Zamítnuto:* `/e/<slug>/join`.
12. **Tlačítko „Run matching round“ vypnuté (ne skryté).** – Layout tabu Rounds je hotový, fáze 4 jen napojí.
13. **Editor: inline `UCard` na otázku, řazení ↑/↓.** Přepnutí na choice předvyplní 2 prázdné možnosti, label zůstává. *Zamítnuto:* modal na otázku, drag & drop (nová závislost).
14. **Participants: `UTable` (emoji, name, title, AI status, registered, delete) s rozbalením na tagline + odpovědi.**
15. **Rounds: seznam od nejnovějšího, `UAccordion` s páry (jména, reason, icebreaker); jeden GET vrací kola rovnou s páry a jmény.**
16. **Polling 5 s na Participants / Rounds jen když je daný tab aktivní.** Editor dotazníku se nepolluje.
17. **Info alert v editoru, když už jsou registrace** („X people already registered, their answers keep the old wording“). Nic neblokuje.
18. **Event nejde přejmenovat ani smazat.**
19. **Limity: 1–15 otázek, label 3–200, choice 2–6 možností po 1–60 znacích, placeholder max 100, vše trim.** – 15 otázek hlídá i velikost matching promptu.
20. **Stavba: server sám, admin UI paralelní subagent po zafixování kontraktu (typy + endpointy) ve specu.**
21. **Žádný learning mode – všechen kód píše Claude.** – Volba uživatele.

## 2026-09-29 – stavba

22. **`readBodyWith(event, schema)` v `server/utils/validation.ts` místo `readValidatedBody`.** – h3 při zod chybě vrací jako `message` syrový JSON issues; náš helper dá první čitelnou zprávu do `statusMessage` (issues v `data`). UI ji ukazuje v toastu / alertu.
23. **`@types/node` (v22) jako devDependency.** – `node:crypto` v `server/utils/admin.ts` jinak neprojde typecheckem.
24. **`pnpm typecheck` nepouštět souběžně s běžícím `pnpm dev`, nebo počítat s restartem.** – Během stavby se dev server zasekl na „Restarting Nuxt…“ (503), nejspíš kvůli souběžné regeneraci `.nuxt`; pomohl restart.
25. **Admin UI – drobnosti navíc (subagent):** `ParticipantsTable` emituje `count` a stránka tím aktualizuje `participantCount` (badge tabu + alert v editoru); editor je `v-show` (neuložené změny přežijí přepnutí tabu), Participants/Rounds `v-if` (polling běží jen namountované); nejde smazat poslední otázku ani jít pod 2 možnosti; nevalidní karta dostane červený ring; accordion kol `type="multiple"` s počtem párů v hlavičce. Helpery `apiErrorStatus`, `apiErrorMessage`, `usePolling`, `formatRelativeTime` v `app/composables/useAdminApi.ts`.
26. **Uživatel nechce browser automatizaci** – ověřuje se curl / lint / typecheck, UI prokliká uživatel sám.
