# Lumina Learning

An interactive STEM learning platform inspired by Brilliant.org — built as a full-stack prototype with real quizzes, animated simulations, spaced-repetition review, a leaderboard, and a course completion certificate.

**Live demo:** http://localhost:5173 (run locally — see setup below)
> The API server runs on **port 3001** and the frontend dev server on **port 5173**.

---

## What's built

### Learning experience
- **Lesson player** — Duolingo-style quiz with animated answer cards (3D press effect, shake on wrong, bounce on correct), staggered option reveal, progress bar, and confetti on completion
- **Learning Center** — each lesson opens with an interactive simulation lab before the quiz (16 labs total across probability, CS, and physics)
- **Reading & Resources** — 9 curated articles (Concept / Guide / Deep Dive / Tutorial) that open in a slide-over reader, filtered by the learner's goal
- **Spaced repetition review** — `/review` surfaces previously missed challenges for reinforcement
- **Course completion certificate** — downloadable PNG generated via Canvas 2D, personalized with learner name and XP earned

### Simulations (labs)
| Topic | Lab |
|-------|-----|
| Probability | Marble Bag, Coin Flip, Area Model, Monty Hall, Monte Carlo π, Expected Value |
| Statistics | Distribution Explorer (μ/σ sliders), Scatter Plot / Correlation, Venn Diagram, Bayes Updating |
| CS | Big-O Growth, Binary Search, Recursion Call Tree, Truth Table, Sorting Visualizer |
| Physics | Pulley Forces, Spring Oscillation, Energy Conservation, Neural Network Explorer |

### Platform
- Personalized onboarding (goal, experience level, daily pace, name)
- Dashboard with XP, day streak, recent courses, and smart learning nudges
- Leaderboard with weekly/all-time toggle
- Profile page with badge shelf and progress stats
- PostgreSQL persistence via Drizzle ORM (progress, streaks, challenge attempts)

---

## Stack

| Layer | Tech |
|-------|------|
| Frontend | React 19, Vite, Wouter (routing), TanStack Query, Framer Motion, Tailwind CSS, shadcn/ui |
| Backend | Express 5, Drizzle ORM, PostgreSQL |
| Monorepo | pnpm workspaces |
| API contract | OpenAPI spec → generated Zod schemas + TanStack Query hooks |

---

## Running locally

**Prerequisites:** Node.js 20+, pnpm 9+, PostgreSQL 16+

```bash
# 1. Install dependencies
pnpm install

# 2. Create the database and seed it
createdb lumina_learning
DATABASE_URL=postgresql://localhost/lumina_learning pnpm --filter "@workspace/db" run push
DATABASE_URL=postgresql://localhost/lumina_learning pnpm --filter "@workspace/scripts" run seed

# 3. Build and start the API server (port 3001)
pnpm --filter "@workspace/api-server" run build
DATABASE_URL=postgresql://localhost/lumina_learning node --enable-source-maps artifacts/api-server/dist/index.mjs

# 4. Start the frontend in a second terminal (port 5173, hot-reloads)
pnpm --filter "@workspace/learning-platform" run dev
```

Open **http://localhost:5173**.

> The API server requires a rebuild after any backend source change (`pnpm --filter "@workspace/api-server" run build`). The frontend hot-reloads automatically.

---

## Project structure

```
artifacts/
  api-server/           Express 5 API — routes, Drizzle queries
  learning-platform/    React + Vite SPA
    src/
      components/
        labs/           16 interactive simulation components
        animations/     Pre-lesson animation components
        ui/             shadcn/ui primitives
      pages/            Route-level page components
lib/
  api-spec/             OpenAPI spec (source of truth)
  api-zod/              Generated Zod request/response schemas
  api-client-react/     Generated TanStack Query hooks
  db/                   Drizzle schema + client
scripts/
  src/seed.ts           DB seed (courses, lessons, challenges)
```

---

## Things that would be great to add

- **AI tutor** — a chat panel in the lesson player that answers questions about the current topic in context (Claude API, `/api/ai` route already scaffolded)
- **More content** — new courses and labs; the simulation framework is easy to extend
- **Auth** — currently demo-mode with a hardcoded `demo-user`; Clerk is already in the dependencies
- **Dark mode** — CSS variables for theming are wired; needs a theme toggle
- **Mobile polish** — responsive but not optimized for touch interactions on the labs
- **Offline / PWA** — service worker for lesson caching

---

## Notes

- No auth is active — all progress is saved under a single demo user. Clerk (`@clerk/react`) is installed for when auth is re-added.
- The seed script populates 3 courses (Probability, Computer Science, Physics) with ~22 lessons and ~100 challenges.
- The API follows a contract-first pattern: edit `lib/api-spec/`, then run `pnpm --filter "@workspace/api-zod" run generate` to regenerate the client hooks.
