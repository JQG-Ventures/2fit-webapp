# 2fit Webapp

Containerized stack for local development and production smoke checks without requiring Python or Node to be installed on the host.

## Architecture

- `frontend`: Next.js at `http://localhost:3000`
- `backend`: Flask at `http://localhost:5000`
- `worker`: Celery reusing the backend image
- `mongo`: internal database for the stack
- `redis`: broker and result backend for Celery

## Environment Files

- `backend/.env`: local backend variables
- `frontend/.env.local`: local frontend variables
- `backend/.env.example` and `frontend/.env.example`: sanitized templates for new environments

If you clone the repository on another machine, copy the templates:

```bash
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env.local
```

In PowerShell:

```powershell
Copy-Item backend/.env.example backend/.env
Copy-Item frontend/.env.example frontend/.env.local
```

## Daily Usage

Development:

```bash
docker compose up --build
```

Windows:

```powershell
powershell -ExecutionPolicy Bypass -File .\scripts\dev.ps1
```

Unix:

```bash
bash ./scripts/dev.sh
```

Stop the stack:

```bash
docker compose down --remove-orphans
```

Production smoke check:

```bash
docker compose -f compose.yaml -f compose.prod.yaml up --build -d
```

Windows:

```powershell
powershell -ExecutionPolicy Bypass -File .\scripts\prod-smoke.ps1
```

Unix:

```bash
bash ./scripts/prod-smoke.sh
```

## Operational Notes

- `compose.yaml` is the source of truth for development.
- `compose.prod.yaml` is an override used to validate production images without bind mounts.
- The frontend uses two backend URLs:
  - `NEXT_PUBLIC_API_BASE_URL` for browser requests
  - `API_BASE_URL_INTERNAL` for server-side calls inside Docker
- Mongo and Redis are not published to the host in this phase.
