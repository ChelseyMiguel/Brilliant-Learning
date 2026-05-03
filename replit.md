# Luminary — Interactive Learning Platform

## Overview

Luminary is a Brilliant.org-inspired interactive learning platform. Users sign up, browse courses, and complete interactive challenges (multiple choice, true/false, numeric input) to earn XP and build streaks. Courses feature SVG sequence animations alongside the challenge player.

pnpm workspace monorepo using TypeScript. Each package manages its own dependencies.

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Package manager**: pnpm
- **TypeScript version**: 5.9
- **Frontend**: React + Vite (artifact: `learning-platform`, previewPath `/`)
- **API framework**: Express 5 (artifact: `api-server`, path `/api`)
- **Auth**: Clerk (`@clerk/react` on frontend, `@clerk/express` on server)
- **Database**: PostgreSQL + Drizzle ORM (`lib/db`)
- **Validation**: Zod (`zod/v4`), `drizzle-zod`
- **API codegen**: Orval (from OpenAPI spec in `lib/api-spec`)
- **Routing (frontend)**: Wouter
- **State management**: TanStack Query
- **Animations**: Framer Motion
- **Icons**: Lucide React
- **Build**: esbuild (server), Vite (frontend)

## Architecture

```
artifacts/
  api-server/         Express 5 API, Clerk auth, Drizzle queries
  learning-platform/  React+Vite SPA, Clerk Provider, Wouter routing
  mockup-sandbox/     Canvas component preview server
lib/
  api-spec/           OpenAPI spec (openapi.yaml)
  api-zod/            Generated Zod schemas (from codegen)
  api-client-react/   Generated TanStack Query hooks (from codegen)
  db/                 Drizzle schema + client
```

## Key Commands

- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from OpenAPI spec (note: after codegen, `lib/api-zod/src/index.ts` may need fixing to only `export * from "./generated/api"`)
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)

## Database Schema (lib/db/src/schema/learning.ts)

- `courses` — id, title, description, category, difficulty, lessonCount, totalXp, iconColor
- `lessons` — id, courseId, title, description, order, xpReward, challengeCount
- `challenges` — id, lessonId, order, type, question, explanation, xpReward, options (jsonb), correctAnswer, hint
- `user_profiles` — id, clerkId, displayName, totalXp, streakDays, lastActiveDate, joinedAt
- `user_progress` — id, clerkId, lessonId, completed, xpEarned, completedAt
- `challenge_attempts` — id, clerkId, challengeId, lessonId, correct, attemptNumber, xpEarned, createdAt

## Courses (7 total, seeded in DB)

1. **Foundations of Probability** (Math, beginner)
2. **Logic & Critical Thinking** (Math, beginner)
3. **Computer Science Fundamentals** (Computer Science, beginner)
4. **Data Analysis Essentials** (Data Analysis, intermediate)
5. **The Geometry of Chance** (Math, intermediate) — Area models, Monty Hall, Expected Value
6. **Neural Networks from Scratch** (Computer Science, intermediate) — Neurons, Backprop, Layers
7. **Physics of Motion** (Physics, beginner) — Forces, Springs, Energy Conservation

## SVG Animation Components (artifacts/learning-platform/src/components/animations/)

Each animation is a self-contained interactive React component. Shown in `LessonIntro` for lessons that have no associated Diagramatics lab:

- `CoinFlipAnimation.tsx` — **Brilliant-style 3D draggable coin**: CSS `perspective` + `preserve-3d` + `backface-visibility:hidden` for H/T faces; pointer drag triggers `requestAnimationFrame` physics flip with 1800° spin; H: amber gradient, T: slate gradient; stats bar + Flip button
- `ProbabilityGridAnimation.tsx` — 10×10 grid with random point dropping, red hit tracking
- `MontyHallAnimation.tsx` — full Monty Hall simulator with stay/switch win rate tracking
- `NeuralNetAnimation.tsx` — 3-layer SVG neural net with clickable inputs and signal pulses
- `SpringAnimation.tsx` — **Vertical hanging spring**: SVG bezier coil path (10 coils, `C` curves), ceiling hatch, live PE/KE energy bars, damped SHM via `requestAnimationFrame`; k and mass sliders

### Animation ↔ Lesson Mapping (index.ts)

| Lesson ID | Lesson Title | Animation | Visible? |
|-----------|-------------|-----------|---------|
| 1 | What is Probability? | CoinFlipAnimation | ✅ LessonIntro |
| 2 | Gambler's Fallacy | CoinFlipAnimation | ❌ (has CoinFlipLab) |
| 14 | Area Models of Probability | ProbabilityGridAnimation | ❌ (has AreaModelLab) |
| 15 | The Monty Hall Problem | MontyHallAnimation | ✅ LessonIntro |
| 17 | Neurons and Weights | NeuralNetAnimation | ❌ (has NeuralNetLab) |
| 18 | The Learning Signal | NeuralNetAnimation | ❌ (has NeuralNetLab) |
| 19 | Layers and Depth | NeuralNetAnimation | ✅ LessonIntro |
| 21 | Springs and Oscillation | SpringAnimation | ❌ (has SpringLab) |
| 22 | Energy Conservation | SpringAnimation | ✅ LessonIntro |

## API Routes (all under /api)

- `GET /api/healthz` — health check
- `GET /api/courses` — list all courses
- `GET /api/courses/:courseId` — course detail with lessons
- `GET /api/courses/:courseId/lessons` — lessons for a course
- `GET /api/lessons/:lessonId` — lesson with challenges
- `GET /api/progress/me` — user's XP, streak, progress counts
- `POST /api/progress/complete-challenge` — submit challenge answer
- `GET /api/progress/lesson-progress/:lessonId` — lesson-specific progress
- `GET /api/progress/course-progress/:courseId` — course-specific progress
- `GET /api/user/profile` — user profile
- `GET /api/dashboard/summary` — dashboard summary with weekly activity

## Frontend Pages (artifacts/learning-platform/src/pages/)

- `landing.tsx` — public hero page for unauthenticated users
- `dashboard.tsx` — home for logged-in users (stats, weekly activity, course grid with SVG illustrations)
- `courses.tsx` — browse all courses grouped by category, with search and SVG illustrations
- `course-detail.tsx` — visual linear lesson path with progress nodes
- `lesson-player.tsx` — interactive challenge player; shows animation panel for mapped lessons
- `profile.tsx` — user stats, course list, sign out

## Learning Center (Diagramatics-Powered Labs)

A "discovery before practice" exploration phase that appears before the challenge player for lessons that have an associated lab. Built on the user's own [Diagramatics](https://github.com/ray-pH/diagramatics) library (v1.8.7, TypeScript, MIT).

### Architecture

- `labs/DiagramaticsInteractive.tsx` — React wrapper for Diagramatics `Interactive` class; manages SVG + controls div refs, async import, lifecycle cleanup
- `labs/CoinFlipLab.tsx` — Coin flip + running proportion line chart (Law of Large Numbers). Slider: 1–200 flips
- `labs/AreaModelLab.tsx` — 10×10 probability grid; two sliders control P(A) and P(B); shows P(A∩B) region
- `labs/SpringLab.tsx` — Spring-mass diagram using `mechanics.spring()`; sliders for k and displacement; shows PE/KE bars
- `labs/NeuralNetLab.tsx` — 3-layer network with signal propagation; sliders for weight and threshold
- `labs/PulleyLab.tsx` — **Single fixed pulley**: slider controls effort drop (0–100 units); load rises by same amount; shows ropes, hatch-ceiling, pulley wheel, effort handle, load block. Uses Diagramatics y-up Cartesian coordinates (point.y = -p.y * scale internally).
- `labs/LearningCenter.tsx` — Full-screen exploration UI: lab on left, guided discovery steps panel on right, "Start Practice" CTA
- `labs/index.ts` — `LESSON_LABS` registry mapping lesson IDs → lab component + guided discovery steps

### Diagramatics Coordinate System
`draw_to_svg_element` uses **y-up Cartesian** (`point.y = -p.y * scale`). After rendering, the library auto-sets the inner SVG's viewBox via `getBBox()`. Use centered coordinates with positive y = visually up. The outer `svg.setAttribute("viewBox", ...)` call is ignored when `set_html_attribute=true` (default).

### Lab ↔ Lesson Mapping

| Lesson ID | Lesson Title | Lab | Discovery Theme |
|-----------|-------------|-----|----------------|
| 2 | Gambler's Fallacy | CoinFlipLab | Law of Large Numbers |
| 14 | Area Models of Probability | AreaModelLab | Probability as area |
| 17 | Neurons and Weights | NeuralNetLab | Weights and activation |
| 18 | The Learning Signal | NeuralNetLab | Signal propagation |
| 20 | Forces and Acceleration | PulleyLab | Force direction + fixed pulley |
| 21 | Springs and Oscillation | SpringLab | Hooke's Law and energy |

### Lesson Player Flow

1. Lesson has a lab → `LearningCenter` is shown first (full screen)
2. User works through 3 guided discovery steps, then clicks "Start Practice"
3. Practice challenges begin; a flask icon in the top bar lets them return to the lab at any time
4. Lessons without a lab → skip straight to challenges (unchanged behaviour)

## Frontend Components

- `CourseIllustration.tsx` — category-based SVG course card illustrations (Math/Logic/CS/Physics/Data/Neural)
- `animations/` — interactive SVG simulation components (lazy-loaded per lesson)
- `labs/` — Diagramatics-powered Learning Center components (lazy-loaded per lesson)

## Auth (Clerk)

- Frontend: ClerkProvider with proxyUrl only set in production (`import.meta.env.PROD`)
- Server: `clerkMiddleware` + `clerkProxyMiddleware` (proxy only active in production)
- Clerk config: `VITE_CLERK_PUBLISHABLE_KEY` (frontend), `CLERK_PUBLISHABLE_KEY` + `CLERK_SECRET_KEY` (server)
- Protected routes use `Show when="signed-in"` / `Show when="signed-out"` from `@clerk/react`

## Design System

- Primary color: Indigo (`238 80% 50%`)
- Secondary color: Emerald (`150 70% 40%`)
- Font: Inter (Google Fonts)
- Theme: Light/dark CSS variables in `index.css`
- All interactive elements have `data-testid` attributes
