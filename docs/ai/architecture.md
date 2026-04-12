# 2fit — Architecture

## Tech Stack

| Layer | Technology | Notes |
|-------|-----------|-------|
| Frontend | Next.js 14 (App Router) | React 18, TypeScript |
| Styling | Tailwind CSS + NextUI | Tailwind-first, NextUI for complex components |
| State / Data | TanStack Query | Server state; no Redux |
| Auth (frontend) | NextAuth v5 beta | Session management, Google OAuth |
| i18n | i18next + react-i18next | Locale files in `frontend/public/locals/` |
| Backend | Flask 3 + Flask-RESTX | Python, blueprint-based routing |
| Auth (backend) | Flask-JWT-Extended | JWT tokens, role-based access |
| ORM | SQLAlchemy 2 + Alembic | PostgreSQL migrations |
| Database | PostgreSQL 16 | Primary data store |
| Cache / Queue | Redis 7 + Celery | Background jobs: emails, notifications |
| AI | OpenAI SDK (openai==1.47.0) | GPT-4o (chat), Whisper (voice), Vision API (future) |
| Storage | Azure Blob Storage | User media, exercise images |
| Push Notifications | OneSignal | Mobile push via Celery worker |
| Email | SendGrid | Transactional emails |
| SMS | Twilio | OTP, alerts |
| Payments | Stripe | Planned — not yet implemented |
| Containerization | Docker Compose | 5 services: frontend, backend, worker, postgres, redis |

---

## System Architecture

```
┌─────────────────────────────────────────────────────┐
│                  User (Mobile / PWA)                 │
└────────────────────┬────────────────────────────────┘
                     │ HTTPS
┌────────────────────▼────────────────────────────────┐
│           Next.js 14 — Frontend (:3000)             │
│  App Router │ NextAuth │ TanStack Query │ i18next   │
└────────────────────┬────────────────────────────────┘
                     │ REST API
┌────────────────────▼────────────────────────────────┐
│           Flask 3 — Backend (:5000)                 │
│  Blueprints │ Flask-RESTX │ JWT │ SQLAlchemy        │
│  ┌──────────┬──────────┬──────────┬──────────────┐  │
│  │ Auth     │ Chat/AI  │ Workouts │ Users/Profile│  │
│  │ Exercises│ Content  │ Challenges│ Email/Notif │  │
│  └──────────┴──────────┴──────────┴──────────────┘  │
└──────┬─────────────────────────┬────────────────────┘
       │                         │
┌──────▼──────┐         ┌────────▼────────┐
│ PostgreSQL  │         │  Redis + Celery │
│ (data)      │         │  (async tasks)  │
└─────────────┘         └─────────────────┘
                                 │
                    ┌────────────▼─────────────┐
                    │  OpenAI / Azure / OneSignal│
                    │  SendGrid / Twilio / Stripe│
                    └────────────────────────────┘
```

---

## Frontend Folder Structure

```
frontend/
├── app/
│   ├── (app)/              # Authenticated shell (navbar, bottom bar)
│   │   ├── layout.tsx
│   │   ├── home/           # Dashboard / home page
│   │   ├── chat/           # AI Personal Trainer chat
│   │   ├── workouts/       # Workout list, plan viewer, challenges
│   │   ├── premium/        # Premium plans and payment UI
│   │   └── profile/        # Profile, edit, security, notifications
│   ├── (auth)/             # Unauthenticated routes
│   │   ├── page.tsx        # Landing page
│   │   ├── login/
│   │   ├── register/       # Multi-step wizard (11 steps)
│   │   └── options/        # Forgot password (4 steps)
│   ├── _components/        # Shared components
│   │   ├── _sections/      # Page-level sections (GreetingSection, etc.)
│   │   ├── carousel/
│   │   ├── chat/
│   │   ├── form/           # Input components
│   │   ├── modals/
│   │   ├── navbar/         # Desktop + Mobile navbars
│   │   ├── others/         # Utility components
│   │   ├── register/       # Registration-specific components
│   │   ├── searchbar/
│   │   └── workouts/       # Workout player components
│   ├── _providers/         # React context providers
│   ├── _services/          # API call abstractions (client-side)
│   ├── config/             # NextAuth config
│   ├── utils/              # apiClient, i18n, helpers
│   └── globals.css
├── actions/                # Next.js server actions
├── lib/                    # apiRoutes, shared utilities
├── middleware.ts            # Route protection
└── public/
    └── locals/             # i18n translation files (es/, en/)
```

---

## Backend Folder Structure

```
backend/
└── app/
    ├── models/             # SQLAlchemy models
    │   ├── user.py
    │   ├── conversation.py  # AI chat history
    │   ├── workout_plan.py
    │   ├── exercise.py
    │   ├── challenge.py
    │   ├── progress.py      # Progress tracking (basic)
    │   ├── notification.py
    │   └── content.py
    ├── routes/             # Flask-RESTX blueprints
    │   ├── authentication.py
    │   ├── users.py
    │   ├── chat.py         # POST /api/chat, POST /api/transcribe
    │   ├── workouts.py
    │   ├── exercises.py
    │   ├── challenges.py
    │   ├── content.py
    │   └── email.py
    ├── services/           # Business logic layer
    │   └── chat_service.py  # OpenAI integration, chat completions, Whisper
    ├── repositories/       # Data access layer
    │   └── conversation_repository.py
    ├── utils/
    │   ├── prompts.py      # AI system prompts
    │   └── utils.py        # OpenAI request builders
    ├── celery_worker.py    # Celery app definition
    └── settings.py        # Config: OPENAI_API_KEY, OPENAI_MODEL, etc.
```

---

## Backend Patterns

- **Blueprints + Flask-RESTX:** Each domain (auth, users, workouts, chat…) is a separate blueprint registered in `app/__init__.py`.
- **Service Layer:** Business logic lives in `services/`. Routes are thin — they validate input and delegate to services.
- **Repository Layer:** Data access for complex queries is in `repositories/`. Models are not queried directly from routes.
- **Async Work:** Celery + Redis handles emails, push notifications, and any job that should not block the request cycle.

---

## Key Architectural Decisions (Already Made)

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Trainer portal | Separate web app | Different workflows; avoids role complexity in user app |
| Monetization base | Freemium + subscription tiers | Flexible for future diversification without full redesign |
| AI model | OpenAI GPT-4o | Best quality for chat, supports Vision and Whisper |
| AI context persistence | PostgreSQL (`Conversation` / `Message` models) | Full history, queryable, no external vector DB needed initially |
| Mobile-first | PWA (Next.js) | Installable on Android/iOS without native app overhead |
| Feature flags | `subscription_tier` field on `User` model | Server-enforced, not frontend-only |

---

## Environment Variables (Key)

```
# Frontend
NEXTAUTH_URL
NEXT_PUBLIC_API_BASE_URL      # → http://localhost:5000
API_BASE_URL_INTERNAL         # → http://backend:5000 (Docker internal)

# Backend
DATABASE_URL                  # PostgreSQL connection string
REDIS_URL
OPENAI_API_KEY
OPENAI_MODEL                  # e.g. gpt-4o
INTERNAL_OPENAI_MODEL         # e.g. gpt-4o-mini (for cheaper internal tasks)
AZURE_STORAGE_CONNECTION_STRING
ONESIGNAL_APP_ID
SENDGRID_API_KEY
TWILIO_*
```
