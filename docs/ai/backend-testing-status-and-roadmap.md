# Backend: estado de testing y roadmap hacia >90% cobertura

**Última verificación:** 2026-04-12 (ejecución local: `pytest tests/ --cov=app --cov-report=term-missing`).

## Resumen ejecutivo

| Métrica | Valor actual | Objetivo (repo) |
|--------|----------------|-----------------|
| Tests | 16+ (1 integración PG opcional puede quedar en skip local) | Crecer por lotes |
| Cobertura total (`app`) | **~45%** | **≥90%** (`pyproject.toml` `[tool.coverage.report] fail_under = 90`; CI: `--cov-fail-under=90`) |
| Archivos de test | 4 módulos + `conftest.py` | Ampliar por dominio |

La meta de cobertura del repositorio es **90%**; hoy la suite **no la alcanza**. Los tests actuales cubren bien piezas puntuales (taxonomía muscular, helpers de repositorio, un endpoint de challenges con mocks), pero la mayor parte de **routes**, **services** y **repositories** permanece sin ejercitar.

**Exclusiones de cobertura** (no cuentan hacia el total medido): `app/celery.py`, `app/celery_worker.py`, `app/tasks/*` (`pyproject.toml`).

---

## Inventario de tests existentes

| Archivo | Enfoque aproximado |
|---------|-------------------|
| `tests/test_challenges_progress_batch.py` | API `GET .../progress/batch`: 401 sin JWT, 400 sin user, lista vacía, datos mockeados del repositorio |
| `tests/test_muscle_repository_helpers.py` | Funciones puras / helpers del repositorio muscular |
| `tests/test_muscle_taxonomy_expand.py` | Constantes y expansión de taxonomía muscular |
| `tests/test_typing_smoke.py` | Smoke de import / tipado |
| `tests/conftest.py` | App Flask session-scoped, `client`, `db` (Postgres + truncate), `auth_headers()` |
| `tests/test_db_smoke.py` | Smoke de factory `User` + Postgres (skip si no hay servidor) |
| `tests/factories/` | Factory Boy para modelos de dominio (users, prefs, workout plans, challenges, progreso, conversación, notificaciones, contenido, email) |
| `tests/support/builders.py` | Grafos persistidos reutilizables (plan+día+ejercicio, usuario+saved+active plan, …) |
| `tests/support/mocks.py` | Mocks mínimos (Azure, OpenAI) para unit tests sin DB |
| `tests/db_checks.py` | `postgres_reachable()` para skip condicional |
| Marcadores pytest | `@pytest.mark.integration` / `@pytest.mark.unit` (`pyproject.toml`) |

**Infraestructura compartida:** `conftest.py` fuerza `DATABASE_URL` desde `TEST_DATABASE_URL` (por defecto `postgresql://...@127.0.0.1:5432/twofit_test`). Los tests que **no** piden el fixture `db` no crean tablas ni necesitan Postgres. El fixture `db` hace `create_all` una vez y `TRUNCATE … CASCADE` tras cada test que lo usa. Factories: `tests/factories/` (Factory Boy).

### Esquema, migraciones y seed

- **No hay revisiones Alembic en el repo** (`backend/migrations/versions/` vacío o inexistente). El esquema sale de los **modelos SQLAlchemy** y de `db.create_all()` (CLI `flask create-tables`, `scripts/seed.py`, tests con fixture `db`).
- **No se puede usar SQLite** para reflejar el esquema actual: los modelos usan tipos propios de PostgreSQL (`ARRAY`, `UUID` de `sqlalchemy.dialects.postgresql`). `create_all` contra SQLite falla al compilar columnas `ARRAY`.
- **Seed (`scripts/seed.py`)** está alineado con los modelos (mismos campos al insertar ejercicios, planes, retos). Si la base real se modificó **a mano** o con SQL externo, ese desfase **no** está versionado aquí; habría que documentar el cambio o añadir migraciones Alembic.
- **Inconsistencia menor en datos de seed:** el plan de workout se llama `"Marathon Prep 60-Day Plan"` y el challenge relacionado en `CHALLENGES_DATA` se llama `"Marathon Ready 60-Day Prep"` (nombres distintos; mismo tipo de contenido, distinta cadena).

---

## Cobertura por área (referencia de la última corrida)

Valores orientativos; el detalle línea a línea está en `coverage.xml` tras correr pytest con `--cov-report=xml`.

**Bien cubiertos o razonables:** modelos SQLAlchemy, muchos schemas, `settings.py`, `extensions.py`, parte de `app/__init__.py`, `muscle_taxonomy.py`.

**Huecos grandes (prioridad para roadmap):**

- **`app/services/user_workout_service.py`** (~10% cubierto): núcleo de lógica de entrenamientos.
- **`app/routes/workouts.py`**, **`app/routes/users.py`**, **`app/routes/authentication.py`**: mayoría de líneas sin ejecutar.
- **Repositories** (`progress_repository`, `workout_repository`, `challenge_repository`, `home_discovery_repository`, `muscle_repository` parcial, etc.): bajo % salvo lo tocado por tests unitarios puntuales.
- **`app/services/workout_plan_service.py`**, **`user_challenge_service.py`**, **`chat_service.py`**, **`azure_service.py`**: casi sin tests.
- **`app/utils/users.py`**, **`app/types/challenge_types.py`**: 0% en la corrida (convienen tests directos o uso vía rutas/servicios).
- **`app/auth/decorators.py`**: ~50%; completar con requests autenticados / no autenticados.
- **`app/utils/utils.py`**: parcial; añadir casos borde.

---

## Roadmap por lotes (implementación sugerida)

Cada lote debería incluir: **happy path**, **parámetros inválidos** (400/422 según el diseño), **autenticación** (401), **recursos inexistentes** (404), y **autorización** (403 si aplica). Para servicios externos (Azure, OpenAI, email, etc.), usar **mocks** (`unittest.mock` / `pytest` fixtures).

### Lote 0 — Base de test (habilita el resto)

- **Postgres dedicado** (`TEST_DATABASE_URL`, p. ej. `twofit_test`). Crear la base localmente: `docker compose up -d postgres` y `docker compose exec postgres psql -U postgres -c "CREATE DATABASE twofit_test;"` (una vez).
- Fixture `db` + `tests/db_utils.truncate_all_tables` + factories en `tests/factories/`.
- Ampliar factories según dominio (progreso, planes activos, etc.).

### Lote 1 — Autenticación y usuarios

**Implementado:** tests de integración (PostgreSQL) y algunos sin DB.

| Área | Archivos de test |
|------|------------------|
| Repositorio | `tests/test_user_repository.py` |
| Auth HTTP | `tests/test_auth_routes.py` (registro con mock de `WorkoutPlanGenerator.generate_workout_plan`) |
| Usuarios HTTP | `tests/test_users_routes.py` |
| SMS verify | `tests/test_users_verify_code.py` (sin Postgres; Twilio mockeado en `send-code`) |
| Helpers | `tests/support/registration_payload.py`, `tests/helpers/jwt_headers.py` |

**Fuera de este lote (siguen en backlog):** `POST /google-login` con token real, `POST /profile/image` (Azure), `POST /messages/motivational` (OpenAI), `POST /workouts/*` bajo `/api/users`.

### Lote 2 — Workouts y progreso (mayor superficie)

**Implementado:** `tests/test_workout_repository.py`, `tests/test_progress_repository.py`, `tests/test_workout_routes.py`, `tests/test_home_discovery_repository.py`, `tests/test_user_workout_service_unit.py`, `tests/support/workout_payload.py`.

- Repositorio de planes: activos (excl. personalized), `get_with_schedule`, `get_one_day_plans`, `get_by_difficulty`, `soft_delete`, `get_library_with_exercise_count`, `create_full_plan`, `replace_schedule`.
- Progreso: `SavedWorkoutRepository`, `DayProgressRepository.find_or_create`.
- Rutas `/api/workouts/*`: planes, one-day, saved, home explore/by-level, library, popular, weekly/challenge (servicio mockeado), bulk, delete/update exercises (400 sin body).
- Unit: `UserWorkoutService.calculate_week_number`.

**Siguiente iteración:** `PUT /plans/<id>` con cuerpo completo, JSON reales para delete/update exercises, weekly/challenge sin mock si se quiere E2E.

### Lote 3 — Ejercicios, músculos, contenido discovery

**Implementado:** `tests/test_exercise_repository.py`, `tests/test_exercise_routes.py` (incluye `GET .../muscles/taxonomy`). Home discovery compartido con Lote 2 (`test_home_discovery_repository.py`). Tests existentes de `muscle_repository` / taxonomía (`test_muscle_*`) se mantienen.

### Lote 4 — Challenges (resto) y planes

- `routes/challenges.py` (más allá del batch), `services/user_challenge_service.py`, `repositories/challenge_repository.py`, `services/workout_plan_service.py`, `schemas/challenge.py` / `workout.py` (validadores y ramas faltantes).

### Lote 5 — Chat, email, contenido, Azure

**Implementado:** `tests/test_chat_routes.py` (`/api/chat`, `/api/transcribe`, mocks de `ChatService`), `tests/test_chat_service_unit.py` (`generate_bot_response`, `generate_motivational_phrases`, mensaje vacío), `tests/test_email_routes.py` (`/api/mail/save`, mock SendGrid), `tests/test_azure_content_routes.py` (`/api/azure/content/upload` y `GET .../content`, rol admin, mock `AzureService`).

### Lote 6 — Utilidades, tipos y capa transversal

**Implementado:** `tests/test_utils_unit.py` (`build_gpt_generator_request`, `parse_answer`, `parse_date`, `format_json_string`), `tests/test_users_utils_unit.py` (`validate_user_by_credentials`), `tests/test_challenge_types_smoke.py` (TypedDicts), `tests/test_auth_decorators_routes.py` (`role_required` vía rutas Azure: 403 sin admin, 404 usuario inexistente).

---

## Criterios de calidad (alineado con tu objetivo)

1. **Funcional:** cada endpoint o función pública con al menos un test de éxito y uno de error esperado.
2. **Parámetros incorrectos:** query/body inválidos, tipos erróneos, límites (strings vacíos, listas vacías, enums fuera de rango).
3. **Determinismo:** mocks en I/O y reloj cuando haya fechas o IDs generados.
4. **Cobertura:** ejecutar `pytest --cov=app --cov-report=term-missing` y revisar `Missing` hasta superar el umbral del proyecto.

---

## Comandos útiles

```bash
cd backend
pytest tests/ --cov=app --cov-report=term-missing --cov-report=xml
```

Nota: con la configuración actual, el reporte fallará en cobertura hasta acercarse al 90%; es el comportamiento esperado en CI.
