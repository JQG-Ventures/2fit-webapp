# Catálogo de ejercicios y músculos — estrategia (Opción A)

**Última actualización:** Abril 2026  
**Decisión:** catálogo **canónico en PostgreSQL** (fuente de verdad de la app) + **importación / ETL** desde fuentes externas (datasets o APIs) para poblar y enriquecer, **sin** depender de terceros en runtime del usuario.  
**Relacionado:** [`muscle-taxonomy-v1.md`](./muscle-taxonomy-v1.md), [`workout-tracking-and-analytics.md`](./workout-tracking-and-analytics.md) (qué se guarda al entrenar y roadmap de analytics), [`domain/workouts-and-progress.md`](../domain/workouts-and-progress.md), [`analytics-layer.md`](./analytics-layer.md), [`../vision-ecosystem.md`](../vision-ecosystem.md)

---

## 1. Principios

| Principio | Significado |
|-----------|-------------|
| **IDs internos** | Toda referencia en planes, progreso y futuro marketplace usa **UUIDs de 2fit**, no IDs de proveedor como PK de negocio. |
| **Proveedor = metadato** | `external_source` + `external_id` opcionales (cuando se active ETL; **no prioritario**). |
| **Media bajo control** | Hoy placeholders en seed; **Azure Blob** cuando haya contenido propio — no bloquea el modelo de músculos. |
| **Músculos cerrados** | Taxonomía propia (enum o tabla `muscles` con `code` estable); import mapea strings del proveedor → códigos internos. |
| **ETL, no runtime** | Scripts o jobs importan; la API de la app **solo** lee la BD. |

---

## 2. Estado actual del repositorio (baseline)

### 2.1 Modelo de datos

- **`muscles` + `exercise_muscles`:** taxonomía v1 (~20 códigos) en BD; un campo inglés `name` en API; traducciones en locales del front por `code`. Enlaces desde `muscle_group` legacy vía `app/constants/muscle_taxonomy.py`. Ver [`muscle-taxonomy-v1.md`](./muscle-taxonomy-v1.md).
- **`exercises`:** sigue existiendo `muscle_group` (`ARRAY(String)`) para compatibilidad; la fuente “rica” para analytics/UI nueva será `exercise_muscles`.
- **`external_source` / `external_id`:** aún no en esquema — **ETL externo pospuesto**; catálogo self-service (seed/admin).
- **Planes y progreso** referencian ejercicios por `exercise_id` (UUID) — estable.

### 2.2 Lógica de negocio

- **`WorkoutPlanGenerator`** (`workout_plan_service.py`): aún usa `MUSCLE_GROUPS_MAPPING` + `ex.muscle_group` (strings). **Pendiente:** alinear splits a códigos `muscles.code` / `exercise_muscles` para generación consistente.
- **API:** `GET /api/exercises/muscles/taxonomy` expone la taxonomía para el rework de UI. Rutas `/workouts/library/...` siguen sin contrato de músculos normalizado (revisar al rework).
- **Seed:** `backend/scripts/seed.py` construye el catálogo y planes con datos in-house; al arrancar asegura `muscles` y enlaces `exercise_muscles`.

### 2.3 Frontend

- Tipos e interfaces consumen ejercicios como objetos con campos actuales (`muscle_group` como lista de strings implícita).
- No hay aún mapa corporal ni enum compartido front/back.

### 2.4 Resumen “progreso hacia Opción A”

| Área | Estado |
|------|--------|
| Catálogo interno como fuente de lectura | Sí (`exercises` + relaciones) |
| Taxonomía de músculos cerrada | **v1 en código y BD** (`MUSCLES_V1`, tabla `muscles`) |
| `exercise_muscles` poblado | Sí desde legacy `muscle_group` (seed / `sync_exercise_muscle_links_from_legacy`) |
| Trazabilidad a fuentes externas | No (pospuesto) |
| Pipeline ETL / import externo | No — seed propio |
| Media Azure / propia | Futuro; seed sigue usando placeholders |

---

## 3. Estado objetivo (Opción A completa)

1. **Tabla `muscles` (o enum en aplicación + check en BD)** con `code`, `display_name`, orden para UI, opcional `parent_id` para agrupar regiones del cuerpo.
2. **Tabla `exercise_muscles`** (`exercise_id`, `muscle_id`, `role`: primary | secondary, opcional `weight`).
3. **Columnas en `exercises`:** `external_source`, `external_id` (nullable, único por source donde aplique), `last_imported_at`, eventualmente deprecar `muscle_group` ARRAY tras migración.
4. **Script(s) de import:** JSON/API → upsert por `external_id`, mapeo de músculos, sin tocar UUIDs de ejercicios ya referenciados (estrategia merge documentada en implementación).
5. **Contrato API estable** hacia frontend: lista de `muscle.code` y payloads de ejercicio alineados al diseño del rework de planes.

---

## 4. Trabajo por fases (orden sugerido)

| Fase | Contenido |
|------|-----------|
| **D1 — Diseño** | Lista cerrada de códigos de músculo (v1), wireframe mapa corporal, contratos API exercise/plan, decisión primario/secundario en v1. |
| **D2 — Esquema** | Migración Alembic: `muscles`, `exercise_muscles`, columnas externas en `exercises`; backfill desde `muscle_group` actual. |
| **D3 — Servicios** | Actualizar `WorkoutPlanGenerator` y repos para usar `exercise_muscles` o códigos; tests. |
| **D4 — ETL v0** | Un import desde fuente elegida (archivo en repo o script) con idempotencia; documentar licencia. |
| **D5 — Frontend** | Tipos TS compartidos, filtros por músculo, integración home/workout player con nuevos campos. |
| **D6 — Limpieza** | Eliminar o congelar `muscle_group` legacy si ya no se usa; actualizar seed. |

*(Las fases D* son etiquetas de planificación; el sprint actual puede cortar solo D1–D2.)*

---

## 5. Riesgos y mitigaciones

- **Duplicados en import:** reglas de merge (mismo `external_id`, nombre similar) y revisión manual opcional.
- **Licencia comercial:** revisar ToS de cualquier dataset/API **antes** de producción; Opción A permite cambiar de fuente sin cambiar el modelo mental de la app.
- **Regresiones en planes existentes:** tras backfill, validar que los ejercicios de planes activos siguen teniendo mapeo muscular completo.

---

## 6. Próximo paso explícito

**Design (D1):** documento de pantalla/planes + lista de músculos v1 + shapes JSON de API — se elabora en el mismo ciclo que el rework de “planes / grupos / ejercicios” en el front.

Actualizar este archivo cuando se cierre el esquema SQL y el primer import ETL.
