# 2fit — AI Context Hub

This directory is the single source of truth for any AI assistant (Claude, Cursor, ChatGPT, Gemini, etc.) working on this project. Read it before starting any task.

## How to Use This Hub

When starting a new session with any AI, provide this README as the first message. The AI should then request specific files based on the task at hand.

### Recommended Reading Order

1. **This file** — orientation and index
2. [`architecture.md`](./architecture.md) — tech stack, folder structure, data flow, architectural decisions
3. [`conventions.md`](./conventions.md) — coding standards, naming rules, patterns to follow
4. [`progress.md`](./progress.md) — current state of every module (done / in progress / pending)
5. [`roadmap.md`](./roadmap.md) — 12-month product vision and feature phases
6. [`vision-ecosystem.md`](./vision-ecosystem.md) — long-term ecosystem narrative (hub, coaches, marketplace, community)
7. [`domain/workouts-and-progress.md`](./domain/workouts-and-progress.md) — business/technical domain: workout generation, progress models, muscle taxonomy direction
8. [`design/analytics-layer.md`](./design/analytics-layer.md) — what “analytics layer” means (derived metrics vs operational data, no extra product)
8b. [`design/workout-tracking-and-analytics.md`](./design/workout-tracking-and-analytics.md) — **tracking end-to-end, payloads, gaps, agreed principles, roadmap phases**
9. [`design/exercise-catalog-strategy.md`](./design/exercise-catalog-strategy.md) — Option A: canonical exercise catalog + ETL, current vs target, phased work  
9b. [`design/muscle-taxonomy-v1.md`](./design/muscle-taxonomy-v1.md) — ~20 muscle codes, i18n by `code` on frontend, clusters, heatmap slots
10. [`objectives/current-sprint.md`](./objectives/current-sprint.md) — active short-term goals
11. [`design/home-dashboard.md`](./design/home-dashboard.md) — UI/UX intent for the home screen  
12. [`design/home-refactor-implementation.md`](./design/home-refactor-implementation.md) — what was built in the home refactor (APIs, files, pending work)

## File Index

| File | Purpose |
|------|---------|
| `architecture.md` | Stack, folder structure, backend patterns, key decisions |
| `conventions.md` | Code style, naming, patterns, rules |
| `auth.md` | Auth system: current implementation, fixed issues, Better Auth migration plan |
| `roadmap.md` | 12-month product roadmap (4 phases) |
| `vision-ecosystem.md` | Long-term product/ecosystem vision (coaches, marketplace, community) |
| `progress.md` | Module-by-module status tracker |
| `domain/workouts-and-progress.md` | Workout generation, muscle tagging, progress tracking — as implemented |
| `design/analytics-layer.md` | Derived training metrics (aggregates for UI and AI context) |
| `design/workout-tracking-and-analytics.md` | Current tracking + CompletedWorkout gaps; timers/sets strategy; analytics roadmap (phases A–F) |
| `design/exercise-catalog-strategy.md` | Canonical exercise/muscle catalog (Option A), ETL, phases D1–D6 |
| `objectives/current-sprint.md` | Active tasks and immediate objectives |
| `design/home-dashboard.md` | Home dashboard design intent and layout description |
| `design/home-refactor-implementation.md` | Home refactor: shipped features, technical notes, future work |

## Updating This Hub

After completing any significant task:
- Update `progress.md` to reflect the new state
- Update `objectives/current-sprint.md` if the active goal changed
- Add a new file under `design/` when planning a new screen or feature  
- After a major UI refactor, update or add an `*-implementation.md` companion (see `home-refactor-implementation.md`) and sync `progress.md`

## Project Summary

**2fit** is a mobile-first fitness ecosystem. It combines AI-generated personalized workout plans, an AI personal trainer (chat + voice), progress tracking, and a community layer. The long-term goal is to support trainers managing users from a separate portal, with a freemium + marketplace monetization model.

- **Frontend:** Next.js 14 PWA (installable on Android/iOS)
- **Backend:** Flask REST API
- **AI:** OpenAI GPT-4o + Whisper + Vision API
- **Target:** Mobile-first, desktop supported
