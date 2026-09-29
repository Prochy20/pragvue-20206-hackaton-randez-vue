# Rendez-Vue

```
$ npm i friends
```

Conference icebreaker app built for the **PragVue Hackathon 2026**. Attendees answer a short, slightly unhinged questionnaire. AI turns their answers into a playful profile (title, tagline, emoji), then matches everyone into pairs with a reason and a question to break the ice. The organizer runs the rounds and projects a live wall.

The humor is gentle teasing, never a roast, and every joke comes only from what the person wrote about themselves.

<!-- Screenshots: drop PNGs into docs/screenshots/ with these names. -->
| Registration | Your title | Your match | Live wall |
|---|---|---|---|
| ![Registration](docs/screenshots/registration.png) | ![Profile](docs/screenshots/profile.png) | ![Match](docs/screenshots/match.png) | ![Wall](docs/screenshots/wall.png) |

## How it works

**Attendee** (no account, mobile first)
1. Scans the QR code on the wall and opens `/e/<slug>`.
2. Answers the questionnaire: swipe-style A/B cards (tabs or spaces, Friday deploys…) plus a couple of free-text questions.
3. Watches a fake `npm install` while the AI writes their profile card: title, tagline, emoji, "special move", "weakness" and an npm-style `package.json`.
4. Waits for the next round, then gets their match: who, why, how to spot them, and an icebreaker question.

Their identity is a random token in the URL (`/e/<slug>/p/<token>`), also remembered in `localStorage`.

**Organizer** (email + password)
- Creates an event, which starts with a default questionnaire, and edits the questions (text or single choice) at any time.
- Sees participants as they register and can remove anyone.
- Clicks **Run matching round**. Each round avoids pairs from earlier rounds.

**Live wall** (`/e/<slug>/wall`, public, built for a 1080p projector)
- Before the first round: a grid of everyone's emoji, name and AI title, plus a QR code to join.
- During a round: a full-screen `installing friends…` interstitial, then `git merge round-N`.
- After the round: all groups with their reason and icebreaker, paged when they don't fit on one screen. A strip at the bottom shows people who arrived after the round.

## AI

The app uses the Claude API with `claude-sonnet-5-5` for two jobs:

| | Profile | Matching |
|---|---|---|
| When | During registration, synchronously (3–8 s) | When the organizer runs a round |
| Input | One attendee's answers + titles already taken at the event | Compact profiles of everyone + previous pairs |
| Output | title, tagline, emoji, special move, weakness, npm-style dependencies | Pairs (one trio for an odd count) with a reason, a `diff` of what they share, and an icebreaker |

- **Structured outputs only.** Responses come back as JSON that matches a Zod schema (`betaZodOutputFormat`). Free text is never parsed.
- **Validated on the server.** Profiles are checked for length, word count and single-emoji rules. Matching must place every attendee in exactly one group; if it doesn't, the round retries once and is then saved as `failed` for the organizer to run again. There is no silent fallback.
- **Guardrails in the prompt.** Gentle tone, only the attendee's own words, English only, and attendee text is treated as data, never as instructions.
- **Failure is a first-class state.** If profile generation fails, the attendee is still registered and sees a "Try again" button.
- The API key stays on the server (`runtimeConfig`) and never reaches the browser.

## Stack

Nuxt 4 · Nuxt UI v4 (Tailwind v4) · TypeScript · Nitro server routes · Postgres 17 + Drizzle ORM · nuxt-auth-utils · Anthropic SDK · uqr (QR codes). Updates are polling-based: the wall polls every 4 s and the admin every 5 s.

## Run locally

Requires Node ≥ 22.13, pnpm and Docker.

```bash
pnpm install
cp .env.example .env        # fill in NUXT_SESSION_PASSWORD (32+ chars) and NUXT_ANTHROPIC_API_KEY
docker compose up -d        # Postgres on :5432
pnpm dev                    # http://localhost:3000, applies database migrations on start
pnpm seed                   # optional: demo event with 15 attendees (while the dev server has created the schema)
```

`pnpm seed` (local only) creates the organizer `demo@rendez-vue.dev` / `demo1234` and the event **PragVue 2026 (demo)** at `/e/pragvue-2026-demo`, with 15 fictional attendees and no rounds yet. Running it again resets that event. Their profiles were generated once by the real profile prompt (`pnpm seed:profiles`) and are stored in `scripts/seed-data/`, so seeding is instant and free.

Other commands: `pnpm lint`, `pnpm typecheck`, `pnpm db:generate <name>` (create a new migration after changing `server/db/schema.ts`).

## Deploy (Coolify)

No Dockerfile is needed. Coolify builds the repo with Nixpacks.

1. Add a **PostgreSQL** resource in Coolify and copy its internal connection URL.
2. Add the app from the Git repository (build pack: Nixpacks).
   - Build command: `pnpm build`
   - Start command: `node .output/server/index.mjs`
   - Port: `3000`, health check path: `/api/health`
3. Set environment variables:

| Variable | Required | |
|---|---|---|
| `NUXT_DATABASE_URL` | yes | Postgres connection URL |
| `NUXT_SESSION_PASSWORD` | yes | at least 32 random characters |
| `NUXT_ANTHROPIC_API_KEY` | yes | Claude API key |
| `NUXT_PUBLIC_SITE_URL` | recommended | public URL, e.g. `https://rendez-vue.example.com`, used for share links and the wall QR code (the request origin can be wrong behind a proxy) |
| `NIXPACKS_NODE_VERSION` | if needed | `22` |

Migrations in `server/db/migrations` run automatically when the server starts, so deploying is enough. Don't run `pnpm seed` against production.

If the Nixpacks build fails to install pnpm (the repo pins `pnpm@12` in `packageManager`), set the install command to `npm i -g pnpm@12 && pnpm install --frozen-lockfile`.

## Demo script

1. Put the event's **Live wall** on the projector. It shows a big QR code and `waiting for first friend…`.
2. The audience scans the QR code and registers. Cards fade into the wall within seconds, each with its AI title.
3. Show an attendee's profile card on a phone, including the `package.json` view.
4. In the admin, click **Run matching round**. The wall switches to `installing friends…`, then `git merge round-1`, then the groups.
5. Attendees open their match on the phone and go find each other.
6. Anyone who registers now lands in the wall's `git stash` strip, waiting for round 2.

## Out of scope

This is a hackathon prototype. Tests, attendee accounts, email verification and password reset, closing registration, deleting events, WebSockets, groups larger than three, and localization are all out of scope.
