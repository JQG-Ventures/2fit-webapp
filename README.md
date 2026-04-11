# 2fit Webapp

Containerized stack for local development and production smoke checks without installing Python or Node on the host. **Docker** and **bash** are assumed for all workflows below.

## Architecture

- `frontend`: Next.js at `http://localhost:3000`
- `backend`: Flask at `http://localhost:5000`
- `worker`: Celery (same image as the backend)
- `postgres`: primary application database (PostgreSQL)
- `redis`: Celery broker and result backend (not the app’s primary datastore)

## Environment files

- `backend/.env`: local backend variables
- `frontend/.env.local`: local frontend variables
- `backend/.env.example` and `frontend/.env.example`: templates for new environments

After cloning, copy the templates:

```bash
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env.local
```

## Development (bash + Docker)

Start the stack:

```bash
docker compose up --build
```

Or use the helper scripts (ensure they are executable: `chmod +x scripts/*.sh`, or call them with `bash scripts/dev.sh`):

```bash
./scripts/dev.sh
```

Stop the stack:

```bash
docker compose down --remove-orphans
```

Or:

```bash
./scripts/down.sh
```

Production-style smoke (compose + prod override, detached):

```bash
docker compose -f compose.yaml -f compose.prod.yaml up --build -d
```

Or:

```bash
./scripts/prod-smoke.sh
```

## Operational notes

- `compose.yaml` is the source of truth for development.
- `compose.prod.yaml` overrides for validating production images without dev bind mounts.
- The frontend uses two backend URLs:
  - `NEXT_PUBLIC_API_BASE_URL` for browser requests
  - `API_BASE_URL_INTERNAL` for server-side calls inside Docker
- **PostgreSQL** and **Redis** are only reachable on the Docker network; their ports are not published to the host. Services connect by name (`postgres`, `redis`).
