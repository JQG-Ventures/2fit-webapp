# Backend: estado de testing y roadmap (umbral de cobertura ≥85%)

**Última verificación:** 2026-04-12 — `cd backend && pytest tests/ --cov=app --cov-report=term-missing --cov-fail-under=0`.

## Resumen ejecutivo

| Métrica | Valor actual | Objetivo (repo) |
|--------|----------------|-----------------|
| Archivos `tests/test_*.py` | **31** + `conftest.py`, `db_utils.py`, `db_checks.py`, `support/*`, `factories/*`, `helpers/*` | Seguir ampliando por dominio |
| Última corrida local | **52 passed, 161 skipped** (sin PostgreSQL: la mayoría de `@pytest.mark.integration` no corre) | En CI con `TEST_DATABASE_URL` + Postgres deberían ejecutarse casi todos |
| Cobertura total (`app`, según `pyproject` `omit`) | **~49%** en el entorno anterior | **≥85%** (`[tool.coverage.report] fail_under = 85`; CI: `--cov-fail-under=85`) |

La barra oficial del repositorio es **≥85%** de líneas en `app/` (excluyendo Celery/tasks ya omitidos). El porcentaje local **sube** cuando Postgres está disponible: muchos tests de rutas, repositorios y servicios solo corren con el fixture `db`.

**Exclusiones de cobertura** (no entran en el total medido): `app/celery.py`, `app/celery_worker.py`, `app/tasks/*` (`pyproject.toml`).

---

## Inventario actual de tests (`tests/test_*.py`)

| Área | Archivos |
|------|-----------|
| Auth / JWT / roles | `test_auth_routes.py`, `test_auth_decorators_routes.py` |
| Usuarios | `test_user_repository.py`, `test_users_routes.py`, `test_users_verify_code.py`, `test_users_utils_unit.py`, `test_users_api_workouts.py` |
| Workouts / planes / progreso / home | `test_workout_repository.py`, `test_workout_routes.py`, `test_progress_repository.py`, `test_home_discovery_repository.py`, `test_user_workout_service_unit.py` |
| Ejercicios / músculos | `test_exercise_repository.py`, `test_exercise_routes.py`, `test_muscle_repository_helpers.py`, `test_muscle_taxonomy_expand.py` |
| Challenges | `test_challenges_routes.py`, `test_challenges_progress_batch.py`, `test_challenge_repository.py`, `test_user_challenge_service_integration.py` |
| Schemas / tipos | `test_schemas_challenge_workout.py`, `test_challenge_types_smoke.py` |
| Chat / OpenAI (mocks) | `test_chat_routes.py`, `test_chat_service_unit.py` |
| Email / Azure | `test_email_routes.py`, `test_azure_content_routes.py` |
| Utilidades / generación | `test_utils_unit.py`, `test_workout_plan_generator_unit.py` |
| Smoke / infra | `test_db_smoke.py`, `test_integration_fixtures_smoke.py`, `test_typing_smoke.py` |

**Infraestructura:** `conftest.py` (app, `client`, `db`, tablas + `TRUNCATE`), `tests/factories/`, `tests/support/builders.py`, `tests/support/mocks.py`, `tests/helpers/jwt_headers.py`, `postgres_reachable()` en `db_checks.py`.

---

## Cobertura por módulo (referencia de la última corrida local)

Cifras con **muchos tests saltados** (sin Postgres). Sirven para **priorizar**, no como techo definitivo.

**Mayor brecha (mejoras opcionales por encima del umbral):**

| Módulo | Cobertura (aprox.) | Comentario |
|--------|-------------------|------------|
| `app/services/user_workout_service.py` | ~10% | Núcleo grande de lógica de negocio; pocos unitarios frente al tamaño del archivo |
| `app/routes/workouts.py` | ~23% | Muchos endpoints; `test_workout_routes.py` no cubre la mayoría de ramas |
| `app/routes/authentication.py` | ~25% | Google login, subida de imagen, flujos largos sin tests o con mocks parciales |
| `app/repositories/progress_repository.py` | ~22% | Muchos métodos; ampliar tests de repo o vía servicios |
| `app/repositories/workout_repository.py` | ~24% | Similar |
| `app/repositories/challenge_repository.py` | ~25% | Similar |
| `app/services/user_challenge_service.py` | ~23% | Complementar integración existente |
| `app/routes/exercises.py` | ~29% | CRUD y filtros; ampliar `test_exercise_routes.py` |
| `app/routes/challenges.py` | ~30% | Varias ramas (activos, por id, errores Pydantic) |
| `app/routes/users.py` | ~33% | Perfil, workouts anidados, motivación, Azure, etc. |
| `app/repositories/home_discovery_repository.py` | ~33% | Consultas de exploración |
| `app/repositories/exercise_repository.py` | ~37% | |
| `app/repositories/user_repository.py` | ~38% | |
| `app/routes/content.py` | ~37% | Azure upload/list; parcialmente cubierto con admin/JWT |
| `app/services/azure_service.py` | ~25% | Idealmente unit tests con SDK/storage mockeado |
| `app/auth/decorators.py` | ~48% | Con Postgres + rutas RESTX, `role_required` se ejerce; sin DB el decorador casi no cuenta |
| `app/services/chat_service.py` | ~56% | Ampliar ramas de conversación / Whisper en unit |
| `app/routes/chat.py` | ~45% | Rutas reales con JWT + mocks |

**Razonablemente altos o completos (27 archivos “skipped” por 100% en el reporte):** modelos, `settings`, `extensions`, parte de `app/__init__.py`, varios schemas, `workout_plan_service.py` parcial (~67%), taxonomía muscular, etc.

---

## Qué falta implementar para seguir subiendo cobertura

Orden sugerido por **impacto en líneas** y **riesgo de regresiones**:

1. **`UserWorkoutService`** — Tests unitarios por función pública (cálculo de semana, armado de respuestas, errores) y/o tests de integración que invoquen rutas que delegan en este servicio. Es el mayor agujero único.
2. **`routes/workouts.py`** — Tabla de endpoints sin cobertura: happy path + 401/403/404/400 para cada grupo (planes, one-day, saved, library, bulk, weekly/challenge, etc.), con DB + factories.
3. **`routes/authentication.py`** — Ramas restantes: `google-login` (mock de verificación de token), `profile/image` (mock Azure), recuperación de contraseña si aplica, validaciones de body.
4. **`ProgressRepository` + `WorkoutRepository`** — Tests directos del repo (como ya hacéis con otros) o vía servicios para cubrir `list`, updates, soft deletes y agregaciones.
5. **`routes/users.py`** — Endpoints de perfil, mensajes motivacionales (OpenAI mockeado), sub-rutas de workouts bajo `/api/users` no cubiertas por `test_users_api_workouts.py`.
6. **`routes/exercises.py`** y **`ExerciseRepository`** — Listados, filtros, errores de validación.
7. **`UserChallengeService` + `routes/challenges.py`** — Casos borde, retos inactivos, errores de validación de schemas ya parcialmente testeados.
8. **`AzureService`** — Unit tests aislados (sin red) mockeando cliente de blob/storage.
9. **`app/repositories/base.py`** — Si sigue contando líneas sin cubrir, tests mínimos o `# pragma: no cover` solo donde sea intencional (mejor cubrir).

**Táctica práctica:** tras cada lote, volver a ejecutar `pytest tests/ --cov=app --cov-report=term-missing --cov-fail-under=0` **con Postgres** y ordenar el reporte por `Miss` para el siguiente objetivo.

---

## Esquema, migraciones y seed

- **No hay revisiones Alembic** en el repo en muchos despliegues: el esquema sale de modelos + `db.create_all()` (tests con fixture `db`, `flask create-tables`, `scripts/seed.py`).
- **SQLite no replica el esquema** actual (p. ej. `ARRAY`, `UUID` de PostgreSQL).
- **Seed (`scripts/seed.py`)** debe mantenerse alineado con los modelos; nombres de planes/challenges pueden diferir entre constantes (detalle documentado antes en este archivo).

---

## Criterios de calidad

1. Cada endpoint o función pública: al menos **éxito** + **error esperado** (401, 403, 404, 400/415/422 según diseño).
2. **Mocks** para OpenAI, Azure, Twilio, SendGrid, etc., en tests que no sean E2E.
3. **Determinismo:** fechas e IDs acotados donde aplique.
4. **Cobertura:** `pytest --cov=app --cov-report=term-missing`; en CI el umbral **85%** es la barra oficial (`fail_under` / `--cov-fail-under`).

---

## Comandos útiles

```bash
cd backend
# Con Postgres (TEST_DATABASE_URL apuntando a twofit_test, p. ej.):
pytest tests/ --cov=app --cov-report=term-missing --cov-report=xml

# Medir sin fallar por umbral (exploración local):
pytest tests/ --cov=app --cov-report=term-missing --cov-fail-under=0
```

Si la cobertura global cae por debajo de **85%**, `pytest` fallará por `fail_under` en local y en CI (salvo que se use `--cov-fail-under=0` solo para exploración).
