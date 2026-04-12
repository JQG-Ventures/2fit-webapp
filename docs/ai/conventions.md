# 2fit — Coding Conventions

These are the standards every contributor (human or AI) must follow when writing code for this project.

---

## General Principles

- **Clean code over clever code** — readable and maintainable beats compact and tricky
- **DRY** — do not repeat yourself; extract reusable logic into utilities, hooks, or services
- **SOLID** — especially Single Responsibility and Open/Closed; each component/function does one thing well
- **OOP where it makes sense** — services and repositories in the backend follow class-based patterns

---

## Comments

- Do **not** add comments that narrate what the code does (`// increment counter`, `// return result`)
- Comments are only for **non-obvious intent**, trade-offs, or constraints the code cannot express alone
- Prefer self-documenting code (descriptive names) over comments

---

## Language

| Context | Language |
|---------|---------|
| Code (variables, functions, files, classes) | English |
| UI copy, labels, messages | Spanish (primary), via i18n keys |
| i18n keys | English (`home.greeting.morning`) |
| Documentation in `docs/` | Spanish (this project's working language) |

---

## Frontend — React / Next.js

### Components

- One component per file
- File name matches the exported component name (PascalCase): `GreetingSection.tsx`
- Components go in `_components/` under the appropriate domain subfolder
- Page-level layout sections go in `_components/_sections/`
- Shared UI primitives (inputs, buttons) go in `_components/form/` or `_components/others/`

### Naming

```
Components:     PascalCase    → GreetingSection, WorkoutCard
Hooks:          camelCase     → useWorkoutSession, useCurrentUser
Services:       camelCase     → workoutService.ts, userService.ts
Utils:          camelCase     → apiClient.ts, register.ts
Constants:      UPPER_SNAKE   → MAX_RETRY_COUNT
Types/Interfaces: PascalCase  → UserSession, WorkoutPlan
```

### Styling

- **Tailwind CSS first** — use utility classes directly; avoid custom CSS unless Tailwind cannot express it
- **No inline `style={{}}`** except for truly dynamic values (e.g. animated widths from JS)
- Mobile-first breakpoints: write base styles for mobile, add `md:` / `lg:` for larger screens
- Use NextUI components for complex UI (modals, dropdowns, inputs); do not reinvent them

### State Management

- **TanStack Query** for all server state (fetching, caching, mutations)
- **React `useState` / `useReducer`** for local UI state only
- No Redux; no Zustand; keep state as local as possible
- Server actions (`actions/`) for mutations that benefit from Next.js server-side execution

### API Calls

- All API routes are defined in `lib/apiRoutes.ts` — never hardcode URLs in components
- Client-side fetching goes through `app/utils/apiClient.ts`
- Service files (`app/_services/`) wrap API calls with typed return values

### File Structure Rules

- Pages (`page.tsx`) are thin — they compose sections, not implement logic
- Business logic belongs in hooks or services, not in components
- Do not import from `(app)/` into `(auth)/` or vice versa

---

## Backend — Flask / Python

### Route Handlers

- Routes are thin: validate input → call service → return response
- No business logic in route handlers; it goes in `services/`
- No direct model queries in routes; complex queries go in `repositories/`

### Naming

```
Files:          snake_case    → chat_service.py, workout_plan.py
Classes:        PascalCase    → ChatService, WorkoutPlan
Functions:      snake_case    → get_user_by_id, build_prompt
Constants:      UPPER_SNAKE   → MAX_TOKENS, DEFAULT_MODEL
```

### Models

- Each model in its own file under `models/`
- Use SQLAlchemy 2 declarative style
- Always define `__tablename__` explicitly
- Relationships declared with `relationship()` and `back_populates`

### Error Handling

- Return structured JSON errors with appropriate HTTP status codes
- Use Flask-RESTX `abort()` for standard errors
- Log errors server-side; never expose stack traces to the client

### AI / OpenAI

- All OpenAI calls go through `services/chat_service.py`
- System prompts are defined in `utils/prompts.py` — not inline in service methods
- Always pass user context (plan, goals, progress) in the system prompt for personalization
- Use `INTERNAL_OPENAI_MODEL` (cheaper) for background/non-interactive tasks

---

## Git

- Branch naming: `feature/short-description`, `fix/short-description`, `refactor/short-description`
- Commit messages: imperative, concise (`Add workout session timer`, not `Added timer to workout session`)
- Never commit secrets, `.env` files, or credentials
- Keep PRs focused — one concern per PR

---

## What to Avoid

- Spaghetti code — no mixed concerns in a single function or component
- Prop drilling beyond 2 levels — use context or TanStack Query instead
- Magic numbers/strings — define them as named constants
- Overengineering — build what is needed now with extensibility in mind, not all possible future cases
- Skipping mobile — always verify changes on mobile viewport first
