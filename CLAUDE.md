# Icebreaker

Hackathon prototype (PragVue 2026). Nuxt 4 + Nuxt UI v4 + Postgres (Drizzle, docker-compose) + Claude API.

## Start here
0. `docs/HANDOFF.md` – where we left off, what's next
1. `intent.md` – product + project-wide decisions (source of truth)
2. `docs/README.md` – phase table, doc conventions
3. Current phase: `docs/phase-N-*/status.md` + `spec.md`

## Rules
- No tests. Verify manually with `pnpm dev`.
- After finishing a phase: rewrite `docs/HANDOFF.md` and commit it.
- Don't build ahead of the current phase. Log deviations in the phase's `decisions.md`, keep `status.md` current.
- Commits: Conventional Commits, English, scope when useful, small commits. Never mention AI/Claude (no Co-Authored-By, no "Generated with").
- Branch: `master`. Package manager: pnpm. Node >= 22.13.
- UI + AI output: English. Dev docs: Czech. Code + comments: English.
- API key only via `runtimeConfig`, never leaves the server.

## Commands
`pnpm dev` · `pnpm lint` · `pnpm typecheck`
