# Fáze 3 – Registrace + AI titul: intent

## Cíl

Účastník otevře `/e/<slug>`, vyplní jméno a dotazník z konfigurace eventu, počká na AI a dostane profil (titul + tagline + emoji) na `/e/<slug>/p/<token>`. Když AI selže, vidí error stav a „Try again“.

Před tím fáze přestaví základ: **SQLite → Postgres (docker-compose) + Drizzle** a **organizátorské účty** (email + heslo) místo admin klíče v URL. Organizátor vidí na `/` svoje eventy z DB.

## Scope

**Krok 0 – infrastruktura a organizátoři** (odchylka od původního `intent.md`, viz decisions #1–#12)
- `docker-compose.yml` s Postgresem, Drizzle ORM + `pg`, schéma v TS, `pnpm db:push`.
- Přepis všech stávajících endpointů z raw SQL na Drizzle.
- `nuxt-auth-utils`: `/signup`, `/login`, logout, tabulka `users`, `events.owner_id`.
- Admin chráněný session + vlastnictvím eventu; `admin_key`, `?key=` a `useAdminKeys` zrušeny.
- `/` = „Create event“ + „Your events“ z DB; v adminu „← All events“; header s emailem a „Log out“.
- `rel="noopener noreferrer"` u `target="_blank"` odkazů.

**Registrace + AI**
- Veřejné API: detail eventu (název + dotazník), registrace, profil podle tokenu, regenerace profilu.
- AI profil přes `@anthropic-ai/sdk` (tool use, validace výstupu).
- `/e/<slug>`: formulář, loading, „Welcome back“ pro už zaregistrované, 404 stav.
- `/e/<slug>/p/<token>`: profil, error + „Try again“, „Copy link“, placeholder čekání na kolo.
- **Funkční holé UI** na Nuxt UI; vizuál dodá handoff z Claude Design (decisions #24, #25).

## Ne-scope

- Finální vizuál účastnického FE (přijde handoff z designu).
- Reroll úspěšného titulu, zobrazení odpovědí na profilu.
- Ověření emailu, reset hesla, OAuth, sdílení adminu s dalším organizátorem.
- Smazání / přejmenování eventu.
- Dockerfile a app služba v compose (případně fáze 6).
- Migrační soubory (jen `drizzle-kit push`).
- Matching a stav „matched“ na profilu (fáze 4), zeď (fáze 5), seed (fáze 6).

## Hotovo, když

1. `docker compose up -d && pnpm db:push && pnpm dev` nastartuje appku nad Postgresem; SQLite ani `nitro.experimental.database` v projektu nejsou.
2. Signup (email + heslo ≥ 8) přihlásí a přesměruje na `/`; stejný email podruhé → chyba; login se špatným heslem → „Invalid email or password“; logout funguje.
3. Nepřihlášený na `/` nebo `/e/<slug>/admin` → `/login`. Cizí event v adminu → 404.
4. Na `/` založím event → admin `/e/<slug>/admin` (bez `?key=`); „Your events“ ukazuje moje eventy s počtem účastníků, cizí ne.
5. Admin z fáze 2 (dotazník, účastníci, kola) funguje beze změny chování.
6. `/e/<slug>` ukáže formulář podle aktuálního dotazníku; neexistující slug → „Event not found“.
7. Odeslání: loading → přesměrování na profil s titulem, taglinem a emoji (s API klíčem). Titul se v eventu neopakuje.
8. Bez API klíče / při chybě AI: profil v error stavu, „Try again“ po doplnění klíče profil vygeneruje.
9. Validace: chybí povinná odpověď, moc dlouhý text, neplatná možnost → čitelná chyba; server odmítne i obejitý klient.
10. Po registraci znovu `/e/<slug>` → „Welcome back, <name>“ + odkaz na profil + „Register someone else“.
11. Admin v Participants vidí nové účastníky s tituly / stavem `failed`.
12. `pnpm lint` a `pnpm typecheck` projdou.
