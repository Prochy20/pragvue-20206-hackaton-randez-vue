# Fáze 5 – Živá zeď: intent

## Cíl

Veřejná stránka `/e/<slug>/wall` pro projektor. Bez kola ukazuje mřížku lidí s AI tituly, po kole skupiny s důvodem a icebreakerem. Obnovuje se pollingem, nové kolo má divadelní odhalení.

## Scope

- Veřejný `GET /api/events/<slug>/wall` (jen data bezpečná pro projektor).
- Stránka zdi: hlavička, join panel s QR, mřížka, párový režim se stránkováním a pruhem nováčků, mezititulek nového kola (včetně „probíhá matching“), prázdný / 404 / reconnecting stav.
- Vizuál z tokenů účastnického FE, zvětšený pro projektor.

## Ne-scope

Ovládání zdi z adminu, přepínání režimů ručně, zvuky, historie kol, zobrazení diffu nebo „spot me by“, responsivita pro mobil (zeď je pro 16:9 projektor, na menším displeji jen nesmí být rozbitá).

## Hotovo když

- Zeď s 0, 12 a 50 lidmi se vejde na 1920×1080 bez scrollu.
- Registrace se na zdi objeví do ~4 s s fade-in.
- Spuštění kola v adminu → zeď ukáže `installing friends…` → po dokončení mezititulek → skupiny abecedně, stránkované při > 8.
- Endpoint nevrací tokeny, id, odpovědi, tagline ani diff. Lint + typecheck čisté.
