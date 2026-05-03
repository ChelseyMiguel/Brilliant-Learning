# Luminary — Interactive Learning Platform

## Overview

Luminary is a Brilliant.org-inspired interactive learning platform. Users sign up, browse courses, and complete interactive challenges (multiple choice, true/false, numeric input) to earn XP and build streaks.

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
- `dashboard.tsx` — home for logged-in users (stats, weekly activity, course list)
- `courses.tsx` — browse all courses with search
- `course-detail.tsx` — visual linear lesson path with progress nodes
- `lesson-player.tsx` — interactive challenge player (one challenge at a time)
- `profile.tsx` — user stats, course list, sign out

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
