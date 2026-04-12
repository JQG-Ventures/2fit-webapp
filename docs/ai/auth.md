# 2fit — Authentication & Authorization

This document is the single source of truth for any AI or developer working on the auth system.
It covers the current implementation, the known issues that were fixed, and the planned migration to Better Auth.

---

## 1. Current Implementation (Post-Fix)

### Architecture Overview

```
Browser
  │
  ├──[Auth flows]──► NextAuth v5 (Next.js API route: /api/auth/[...nextauth])
  │                      │
  │                      ├── Flask backend  (/api/auth/login, /api/auth/refresh-token)
  │                      └── Google OAuth (via NextAuth GoogleProvider)
  │
  └──[App API calls]──► Flask backend (Authorization: Bearer <access_token>)
                              │
                              └── Flask-JWT-Extended (@jwt_required())
```

NextAuth acts as a session layer. It stores Flask JWT tokens inside an encrypted NextAuth session cookie (JWT strategy). The client never manages tokens directly — it reads them from the NextAuth session via `useSession()`.

---

### Key Files

| File | Purpose |
|------|---------|
| `frontend/auth.ts` | NextAuth instance — exports `auth`, `signIn`, `signOut`, route handlers |
| `frontend/app/config/auth.config.ts` | Providers, JWT callback (token refresh logic), session callback |
| `frontend/app/_providers/AuthProvider.tsx` | `SessionProvider` wrapper — root of all client auth state |
| `frontend/app/_components/others/SessionSync.tsx` | Syncs NextAuth session into `tokenStore` (in-memory singleton) |
| `frontend/app/utils/tokenStore.ts` | In-memory token store — the Axios interceptor reads from here |
| `frontend/app/utils/axiosInstance.ts` | Axios instance — attaches Bearer token from `tokenStore` |
| `frontend/middleware.ts` | Route protection — uses `getToken()` (local JWT decode, no HTTP) |
| `frontend/app/_services/authServerService.ts` | Server-side functions: `loginWithCredentials`, `refreshServerAccessToken` |
| `backend/app/routes/authentication.py` | Flask auth endpoints: `/login`, `/refresh-token`, `/google-login` |

---

### Auth Providers

| Provider | ID | Flow |
|----------|----|------|
| Email/Password | `credentials` | Form → Flask `/api/auth/login` → Flask JWT stored in NextAuth session |
| Google (existing users) | `flaskgoogle` | NextAuth Google OAuth → page sends `id_token` to Flask `/api/auth/google-login` → Flask JWT stored in NextAuth session |
| Google (new users / register) | `google` | NextAuth Google OAuth → redirect to register flow with Google data |

---

### Token Lifecycle

1. **Login:** User authenticates → Flask returns `access_token`, `refresh_token`, `expires_at`.
2. **Storage:** NextAuth stores these inside the encrypted session cookie (httpOnly). The client only sees `access_token` via `session.user.token`.
3. **Request flow:** `useSession()` populates `tokenStore` via `SessionSync`. Every Axios request reads from `tokenStore` — zero HTTP calls to `/api/auth/session`.
4. **Token refresh:** Handled in the NextAuth `jwt` callback. When `Date.now() >= token.accessTokenExpires`, it calls Flask `/api/auth/refresh-token` with the `refresh_token` from the JWT cookie (server-only). The client never sees the refresh token.
5. **Session resolution order:**
   - Middleware → `getToken()` (local JWT decode, no network call)
   - Server components → `auth()` (local JWT decode via NextAuth)
   - Client components → `useSession()` (React context, populated once on page load)
   - Axios → `tokenStore.get()` (in-memory, updated by `SessionSync`)
6. **After long idle (access token expired):** The in-memory token is stale. The next API call may return **401** from Flask. The Axios response interceptor calls `getSession({ broadcast: false })` once (shared across parallel 401s), which runs the NextAuth `jwt` callback and refreshes the Flask access token. `tokenStore` is updated and the request is retried. If refresh fails (no session / invalid refresh token), redirect to `/re-auth` — **no manual logout required** for normal expiry.

---

### Route Protection

**Middleware (`middleware.ts`):**
- Uses `getToken()` which decodes the NextAuth JWT cookie locally — no HTTP call to `/api/auth/session`.
- Checks `token?.accessToken` to determine if the user is authenticated.
- Public paths: `/`, `/login`, `/register`, `/re-auth`, `/options/forgotpassword`
- Authenticated users hitting public paths → redirect to `/home`
- Unauthenticated users hitting protected paths → redirect to `/`

**Matcher:**
```ts
matcher: ['/((?!_next|api|static|favicon.ico|images).*)']
```
Note: `api` routes are excluded from the matcher, meaning Flask proxy routes and NextAuth routes are not intercepted.

---

### Security Properties

| Property | Status |
|----------|--------|
| `refreshToken` server-only (never in client session) | ✅ Fixed |
| `accessToken` only in httpOnly NextAuth cookie | ✅ (NextAuth JWT strategy) |
| No `getSession()` on every API request | ✅ (only on 401 refresh + initial session) |
| `refetchOnWindowFocus` disabled (refresh handled by JWT callback) | ✅ Fixed |
| Middleware uses local JWT decode (no network) | ✅ |
| Flask routes protected with `@jwt_required()` | ✅ |

---

## 2. Known Issues Fixed (April 2026)

### Issue 1: Excessive GET /api/auth/session calls
**Root cause:** `axiosInstance.ts` called `getSession()` inside the request interceptor. `getSession()` always performs a `fetch` to `/api/auth/session` — no caching, no deduplication. A page with 5 parallel React Query calls would trigger 5 session HTTP requests simultaneously.

**Fix:** Replaced with `tokenStore` singleton. `SessionSync` (a zero-UI component inside `SessionProvider`) syncs the token into memory via `useSession()`. The interceptor reads from memory — zero HTTP calls per request.

### Issue 2: 401 handling (evolved)
**Earlier bug:** The interceptor called `getSession()` twice per 401 and still retried with a stale token.

**Current behavior:** On **401**, the interceptor calls `getSession({ broadcast: false })` once (with in-flight deduplication for parallel failures). That hits `/api/auth/session`, runs the NextAuth `jwt` callback (Flask refresh if needed), updates `tokenStore`, and retries the request. If there is no token after refresh, redirect to `/re-auth`. This is intentional: **not** every request calls `getSession()` — only recovery after Flask rejects an expired access token.

### Issue 3: refreshToken exposed in client session
**Root cause:** The `session` callback was setting `session.refreshToken = token.refreshToken`, which made the refresh token accessible to all client JavaScript. This is an XSS risk — any injected script could read and exfiltrate the refresh token.

**Fix:** Removed `session.refreshToken` from the session callback. The refresh token stays inside the encrypted NextAuth JWT cookie (server-only). Only `accessTokenExpires` is kept on the session for UI purposes.

### Issue 4: SessionProvider with refetchOnWindowFocus=true (default)
**Root cause:** The default behavior of `SessionProvider` is to refetch the session when the browser tab regains focus. Since token refresh is handled entirely in the NextAuth `jwt` callback, this was redundant and caused extra `/api/auth/session` bursts.

**Fix:** Added `refetchOnWindowFocus={false}` to `SessionProvider`.

---

## 3. Future Migration — Better Auth

### Why Better Auth

The current implementation has a fundamental architectural tension: **two identity systems** (NextAuth + Flask-JWT-Extended) that must stay in sync. The fixes above stabilize it, but the architecture has a ceiling:

- No built-in MFA / 2FA
- No passkeys / biometrics support
- Google auth requires a custom two-step flow (`flaskgoogle` workaround)
- Managing tokens across NextAuth and Flask adds complexity for every new auth feature
- Mobile apps (planned) are harder to support with this model

**Better Auth** is an open-source, self-hosted auth library for Next.js that eliminates these problems:
- Single identity system — users, sessions, and accounts live in **your own PostgreSQL**
- Official plugins: 2FA, passkeys, social logins (Google, Apple, GitHub, etc.), RBAC (`admin` plugin)
- React Native SDK — covers the mobile roadmap
- Flask backend only needs to verify the Better Auth JWT using its public key — no dependency on Better Auth internals
- No vendor lock-in, no per-user pricing

---

### Target Architecture (Post-Migration)

```
Browser / Mobile App
  │
  ├──[Auth flows]──► Better Auth (Next.js API route: /api/auth/[...all])
  │                      │
  │                      ├── Your PostgreSQL (users, sessions, accounts tables)
  │                      └── Google OAuth, Apple, etc. (native, no workarounds)
  │
  └──[App API calls]──► Flask backend
                              │
                              └── Verifies Better Auth JWT with public key
                                  (replaces @jwt_required() decorator)
```

### What Changes

#### Frontend
| Current | After Migration |
|---------|----------------|
| NextAuth `SessionProvider` + `useSession` | Better Auth `<AuthProvider>` + `useSession` (same pattern, different library) |
| `auth.config.ts` with JWT/session callbacks | Better Auth config with plugins |
| `axiosInstance` + `tokenStore` | Same pattern, token comes from Better Auth session |
| `middleware.ts` with `getToken()` | Better Auth middleware helper |
| `flaskgoogle` CredentialsProvider (workaround) | Native Google social provider in Better Auth |

#### Backend (Flask)
| Current | After Migration |
|---------|----------------|
| `flask-jwt-extended` | Remove entirely |
| `@jwt_required()` decorator on all routes | Custom decorator that verifies Better Auth JWT (RSA public key) |
| `/api/auth/login` endpoint | Remove — Better Auth handles credentials auth |
| `/api/auth/refresh-token` endpoint | Remove — Better Auth handles token refresh |
| `/api/auth/google-login` endpoint | Remove — Better Auth handles Google OAuth |
| `password_hash` on User model | Remove — Better Auth handles credentials in its own tables |
| `auth_provider` on User model | Can stay for reference, managed by Better Auth |

#### Database
Better Auth creates its own tables alongside your existing schema:
- `user` — Better Auth user record (id, email, name, emailVerified, etc.)
- `session` — active sessions (token, userId, expiresAt)
- `account` — linked OAuth accounts (Google, Apple, etc.)
- `verification` — email/phone verification tokens

Your existing `User` model (workouts, preferences, fitness data) **stays untouched** — Better Auth's `user.id` becomes the foreign key.

#### Register Flow
The 11-step wizard needs to be split into two phases:

**Phase 1 — Identity (Steps 0, Google):**
Better Auth creates the account (email/password or Google). Returns a session immediately.

**Phase 2 — Profile (Steps 1–11):**
With the session established, the remaining steps POST to Flask to build the user's fitness profile. Flask links the profile to `better_auth_user_id`.

A webhook from Better Auth on `user.created` can trigger the Flask profile creation bootstrap.

---

### Migration Checklist (for AI implementation session)

Use this checklist when starting the migration. Work in this order to keep the app functional at each step.

#### Phase 1 — Setup Better Auth (do not remove NextAuth yet)
- [ ] Install Better Auth: `npm install better-auth`
- [ ] Create `frontend/lib/auth.ts` — Better Auth server instance with Google plugin, 2FA plugin, admin plugin
- [ ] Create `frontend/app/api/auth/[...all]/route.ts` — Better Auth route handler
- [ ] Add Better Auth environment variables (see env section below)
- [ ] Run `npx better-auth generate` to create DB migration for auth tables
- [ ] Apply migration to PostgreSQL

#### Phase 2 — Migrate Frontend Auth
- [ ] Replace `AuthProvider.tsx` — swap `SessionProvider` for Better Auth `<AuthProvider>`
- [ ] Replace `SessionSync.tsx` — update to read token from Better Auth `useSession`
- [ ] Rewrite `middleware.ts` — use Better Auth's `auth.api.getSession` or middleware helper
- [ ] Rewrite login page — use Better Auth `signIn.email()` and `signIn.social('google')`
- [ ] Rewrite register Step 0 — use Better Auth `signUp.email()` for credentials
- [ ] Remove `NextAuthSecret`, `auth.config.ts`, `auth.ts` (NextAuth files) after all pages are migrated
- [ ] Remove `flaskgoogle` provider entirely

#### Phase 3 — Migrate Flask Backend
- [ ] Create `backend/app/utils/auth.py` — JWT verification using Better Auth public key (JWKS endpoint)
- [ ] Create `@better_auth_required` decorator to replace `@jwt_required()`
- [ ] Replace `@jwt_required()` on all routes with `@better_auth_required`
- [ ] Remove `/api/auth/login`, `/api/auth/refresh-token`, `/api/auth/google-login` endpoints
- [ ] Remove `flask-jwt-extended` from `requirements.txt`
- [ ] Remove `password_hash` column from `User` model (migration required)

#### Phase 4 — Register Flow Coordination
- [ ] After Better Auth `signUp`, call Flask `/api/users/profile/init` to create the fitness profile stub
- [ ] The remaining wizard steps POST to Flask as before, but authenticated via Better Auth JWT
- [ ] Test full flow: email signup → profile wizard → authenticated home

#### Phase 5 — Enable Auth Features
- [ ] Enable 2FA plugin in Better Auth config
- [ ] Enable passkeys plugin (WebAuthn) in Better Auth config
- [ ] Add Apple social provider
- [ ] Configure RBAC with Better Auth `admin` plugin (roles: `user`, `premium`, `admin`)

---

### Environment Variables (Better Auth)

```env
# Frontend
BETTER_AUTH_SECRET=<random 32+ char string>
BETTER_AUTH_URL=http://localhost:3000          # or your production URL

# Keep existing Google credentials — Better Auth uses the same ones
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...

# Remove after migration:
# NEXTAUTH_SECRET
# NEXTAUTH_URL
```

---

### Reference Links

- Better Auth docs: https://www.better-auth.com/docs
- Better Auth Next.js guide: https://www.better-auth.com/docs/integrations/next-js
- Better Auth plugins (2FA, passkeys, admin): https://www.better-auth.com/docs/plugins
- Better Auth React Native: https://www.better-auth.com/docs/integrations/react-native
- Verifying Better Auth JWT in a non-Node backend: https://www.better-auth.com/docs/concepts/session-management#custom-backend-verification
