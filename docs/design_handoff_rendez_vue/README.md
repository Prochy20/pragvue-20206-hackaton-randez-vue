# Handoff: Rendez-Vue: participant flow

> `$ npm i friends`

## Overview
Rendez-Vue is a mobile-first web app for conferences (built for PragVue Hackathon 2026). When an attendee registers, they fill in a playful questionnaire: basic info plus fun A/B questions ("tabs vs. spaces") and short free-text questions ("worst production incident"). An AI generates a funny title and profile, then pairs them with **one** attendee and adds a funny reason for the match and an icebreaker question.

Humor should be gentle teasing, never a roast. **Every joke must come only from what the person wrote themselves.**

This handoff covers the **participant flow** (10 screens). The organizer side (creating an event, a live projected wall) is not designed yet.

## About the Design Files
`Rendez-Vue.dc.html` is a **design reference built in HTML**. It is a static mockup of the intended look and copy, not production code. Rebuild it in the target codebase. The team is at a Vue hackathon, so **Vue 3 + Vite** (single-file components, `<script setup>`) is the expected stack. If there's no codebase yet, start from Vite's Vue template. The HTML uses inline styles only. In Vue, pull the values into CSS variables or scoped styles.

## Fidelity
**High-fidelity.** Colors, type, spacing, radii and copy are final for the demo. Match them closely. Everything is designed on a **360 × 740** mobile canvas. In the real app, use `max-width: 420px; margin: 0 auto; min-height: 100dvh` and let content flow. Each screen has 28px top padding, 22px side padding, and its CTA pinned to the bottom (`margin-top: auto` inside a flex column).

## Branding rules
- Name: **Rendez-Vue**. "Vue" is always in the accent green.
- The terminal joke runs through the whole app. These exact strings are required:
  - Landing, under the logo: `$ npm i friends` (`$` in pink, then a blinking green block cursor 10×20px)
  - Final registration CTA: `npm i friends` (instead of "Register")
  - After the questionnaire: `+ added 3 friends in 1.2s`
  - Loading while matching: `installing friend@latest…`
- Style: a friendly grotesk for human copy, monospace for anything "system". Dark terminal background, neon green primary, pink secondary.

## Design Tokens
The canonical values are the oklch ones (as used in the file). Hex values are sRGB approximations.

| Token | oklch | ≈ hex | Use |
|---|---|---|---|
| `--bg` | `oklch(0.17 0.012 150)` | `#0f1510` | screen background, text on accents |
| `--surface` | `oklch(0.21 0.014 150)` | `#171e18` | cards, list rows |
| `--surface-2` | `oklch(0.22 0.014 150)` | `#1a201b` | inputs, segmented control track |
| `--surface-3` | `oklch(0.26 0.016 150)` | `#222a23` | stat chips inside cards |
| `--code` | `oklch(0.13 0.01 150)` | `#090d0a` | terminal/code blocks |
| `--border` | `oklch(0.33 0.02 150)` | `#2f382f` | input borders, card borders |
| `--border-2` | `oklch(0.40 0.02 150)` | `#3f4940` | ghost buttons, dashed add-row, unselected chips |
| `--text` | `oklch(0.95 0.01 150)` | `#eef3ee` | primary text; also the light quiz-card background |
| `--text-2` | `oklch(0.82 0.015 150)` | `#c4ccc4` | body copy |
| `--muted` | `oklch(0.70 0.02 150)` | `#9ba59b` | labels, meta, prompts |
| `--green` (primary) | `oklch(0.86 0.19 150)` | `#74f29a` | primary CTA, "Vue", success lines, focus border |
| `--pink` (secondary) | `oklch(0.78 0.17 350)` | `#f98bc0` | `$` prompt, icebreaker card, user's avatar, "tabs" choice |
| `--yellow` | `oklch(0.85 0.15 85)` | `#f3c65a` | npm WARN, third avatar color |
| `--card-light-2` | `oklch(0.90 0.012 150)` | `#dde3dd` | textarea inside the light card |
| `--card-light-3` | `oklch(0.88 0.02 150)` | `#d3dcd3` | "spaces" choice tile |

**Fonts (Google Fonts)**
- `Space Grotesk` 400/500/600/700 for headlines, body and names
- `JetBrains Mono` 400/500/700/800 for prompts, labels, buttons, code, initials

**Type scale**
- Logo: Space Grotesk 700, 56px, line-height 0.95, letter-spacing −2px
- H1 (screen headline): Space Grotesk 700, 30–32px, lh 1.05, ls −1px
- Quiz question (A/B): Space Grotesk 700, 36px, lh 1, ls −1px
- Profile title: Space Grotesk 700, 26px, lh 1.05, ls −0.5px
- Body: Space Grotesk 400, 14–17px, lh 1.45–1.5, `text-wrap: pretty`
- Card name: Space Grotesk 600/700, 15px, lh 1.2
- Button: JetBrains Mono 700, 15–17px (final CTA 800, 19px)
- Label/meta: JetBrains Mono 500, 11–12px
- Code block: JetBrains Mono 400, 12–12.5px, lh 1.7

**Radii:** phone 28 · large card 22 · button/CTA 14 · card 14 · input 12 · avatar 11–12 (18 on the Met screen) · chip 999 · segmented 10 (thumb 7)
**Spacing:** screen padding 28/22; section gap 14–18; inner card padding 14–18; grid gap 8–10
**Shadows:** only the floating quiz card: `0 12px 30px rgba(0,0,0,.4)`

## Screens

### 01 Landing
- Top meta row (mono 11px, muted): `~/pragvue-2026` left, `● online` right in green.
- 120px down: logo `Rendez-` + `Vue` (green), then `$ npm i friends` (mono 500 18px; pink `$`; green block cursor that should blink at 1s steps).
- Body (17px, text-2): "Answer 12 slightly unhinged questions. Get a title. Meet one person at PragVue you'll actually want to talk to."
- Bottom: primary CTA, 56px tall, green, radius 14: `npx rendez-vue →`. Below it (mono 12, muted): `~3 min · gentle teasing, no roasts`.

### 02 Register (step 1/2)
- Prompt: `$ rendez-vue init` + green `step 1/2`.
- H1: "The boring part." / muted line "Quick, promise."
- Fields (mono 12 muted label + 50px input, surface-2, 1px border, radius 12, Space Grotesk 16): `name`, `role`, `company --optional` (placeholder "where you push to prod"). The focused field has a green border.
- `here for` multi-select chips (radius 999, 9×14 padding, 14px): talks · new people · hiring · free coffee. Selected: green fill with dark text. Unselected: 1px border-2.
- CTA: `next: the weird part →`

### 03 Quiz: A/B swipe card
- Header: `step 2/2` · `03 / 12`. Progress bar 4px (track surface, fill green).
- A stack of 3 cards: two ghost cards behind (rotated +3° and −2°) and a front light card (`--text` bg, dark text, radius 22, padding 24, 420px tall).
- Card content: `// question 03` (mono muted), question "Indentation. Choose wisely." Two 96px tiles at the bottom: left pink `← swipe` / `\t tabs`, right light `swipe →` / `␣␣ spaces` (mono 700 20px, nowrap).
- While dragging, the card rotates by drag distance (the mock shows −4° and −18px when dragging left). A stamp (`TABS` or `SPACES`) fades in: 3px pink border, mono 800 20px, rotated −12°.
- Footer hint: `↑ skip · both are fine (liar)`.

### 04 Quiz: free text (last question)
- Progress is full. A light card holds `// question 12 · free text`, H "Worst production incident?", sub "We'll only use it for good. Mostly.", a textarea (card-light-2, mono 15, min-height 130) and a counter `88 / 140`.
- **Final CTA:** 60px, green, `$ npm i friends` (the `$` at 55% opacity). Below: `generates your title · finds your match`.

### 05 Profile: trading card
- Success line (mono green): `+ added 3 friends in 1.2s`.
- Segmented control: `card` | `package.json` (thumb uses the `--text` bg).
- Trading card: 6px pink frame → surface inner card (radius 17, padding 18):
  - `PRAGVUE 2026 · #042` (pink) · `RARE`
  - 120px pink panel with initials `JN` (mono 800 54px)
  - Name (13 muted) + title "Tab Loyalist, First Class"
  - One-line AI flavor text: "Once restored prod in 32 minutes. Still thinks about the other 2."
  - Two stat chips: `special move: git reflog` · `weakness: Friday 16:58`
- CTA: `find my match →`

### 06 Profile: package.json
- The same profile rendered as a syntax-highlighted `package.json` (keys pink, values green, braces muted, on the code bg): name `@jana/novakova`, version `4.2.0-senior`, description, dependencies, and `peerDependencies: { "another-tab-person": "*" }`. The peerDependency is a hint at what the match looks for.
- Copy: "Same you, different format. Tap to copy and flex it on Slack."
- Buttons: ghost `copy` (1/3 width) and primary `find my match →` (2/3 width).

### 07 Loading
- `$ npm install` · H1 "Looking for your **peerDependency**…" (green word).
- Log box (1px border, mono 12, lh 1.8). Lines appear one by one:
  `WARN deprecated small-talk@1.0.0` (WARN in yellow) → `resolving 214 attendees…` → `checking peerDependencies… ok` → `installing friend@latest…`
- Segmented progress bar: 20 segments, 10px tall, 2px gap, filling green.
- Footer: `comparing 214 incident reports, respectfully`.
- Show this for at least ~2.5s even if the API is faster. The waiting is part of the joke.

### 08 Match
- `✓ installed friend@1.0.0` (green), H1 "You + Tomáš compile cleanly."
- 2-column grid of mini trading cards: avatar 44px (the user's is pink, the match's is green), title, name. The match's card has a green border.
- Diff block (code bg): `$ diff you tomas`, then `+` lines in green (things in common) and `-` lines in pink (a friendly difference).
- Icebreaker card (pink bg, dark text, radius 14): `// ICEBREAKER` + a quote (Space Grotesk 600 17px).
- Ghost CTA (green border and text): `git commit -m "met tomáš"`

### 09 Met ✓
- Terminal output: `[main 4f2a9c1] met tomáš` / `1 friend committed, 0 small talks deleted` (green).
- Two overlapping avatars (64px, radius 18, rotated −6° / +6°, −10px overlap).
- H1 "Merged without conflicts.", sub "Tomáš is now in your dependencies. Conversation running low?"
- A second icebreaker (pink 1px border): `// ICEBREAKER --retry` with a new question.
- CTA `npm ls →`, plus a small rating line: `rate the match: good match / meh`.

### 10 My dependencies (`npm ls`)
- `$ npm ls --depth=1`, H1 `jana@4.2.0-senior`, green line `3 dependencies · 0 vulnerabilities`.
- Tree-style section labels (mono 11, muted): `├── MATCH` and `└── ADDED ON THE WAY`.
- List row: surface, radius 14, padding 12. Avatar 40px, name, title, and meta on the right (`met 14:32`, `via tomáš`, `added 16:10`).
- Dashed add row: `+ npm i <someone you met>` opens a search of attendees and adds them manually.
- Footer card: "We'll email everyone's handles tomorrow. Consider it your `package-lock.json`."

## Interactions & Behavior
- Flow: 01 → 02 → 03 (×N A/B cards) → 04 (1–2 free-text cards) → submit → 05 ⇄ 06 (tabs) → 07 → 08 → 09 → 10.
- **Swipe cards:** use pointer events. Rotate and translate by drag X. Past a threshold of about 90px, fly the card off (200ms ease-out) and record the answer. Buttons/keys work too: ← = left option, → = right option, ↑ = skip. The next card scales up from the stack.
- Blinking cursor: `steps(1)` 1s infinite.
- Loading log lines stagger by about 400ms. The progress bar fills in steps.
- Buttons: pressed state `transform: scale(.98)`. Focus: 2px green outline.
- Validation: name and role are required. Free text is capped at 140 chars. A/B questions are skippable.
- Errors in terminal voice, for example `npm ERR! friend not found — retrying…` (in pink) if matching fails.

## State Management
- `attendee`: `{ id, name, role, company?, hereFor: string[], answers: Record<questionId, 'a'|'b'|'skip'|string> }`
- `profile` (from AI): `{ title, flavor, specialMove, weakness, packageJson: object }`
- `match` (from AI): `{ attendeeId, sharedDiff: {sign:'+'|'-', text}[], reason, icebreakers: string[] }`
- `dependencies`: `{ attendeeId, source: 'match'|'via'|'manual', viaId?, at }[]`
- `ui`: `step`, `quizIndex`, `profileTab: 'card'|'json'`, `loading`
- Keep it in one Pinia store for the hackathon. Suggested endpoints: `POST /attendees`, `POST /attendees/:id/profile`, `POST /events/:id/match/:attendeeId`, `POST /attendees/:id/met`, `POST /attendees/:id/dependencies`.
- **AI prompt constraint:** jokes may only reference the attendee's own answers. Keep the tone gentle, with no put-downs about looks, gender, seniority or employer.

## Sample Content
- Event: PragVue 2026, 214 attendees.
- User: Jana Nováková (JN), "Tab Loyalist, First Class".
- Match: Tomáš Dvořák (TD), "The Semicolon Whisperer".
- Others: Klára Svobodová (KS), "Keeper of the Monorepo". Marek Horák (MH), "Senior Stack Overflow Archaeologist".

## Assets
None. There are no images or icons. Avatars are initials on colored squares. Glyphs used: `→ ← ↑ ✓ ● ├── └── ␣ \t`.

## Files
- `Rendez-Vue.dc.html`: all 10 screens side by side, labeled 01–10. Open it in a browser.
