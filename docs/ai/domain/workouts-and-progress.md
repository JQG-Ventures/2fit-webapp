# Dominio: Workouts, generación de planes y progreso

**Última actualización:** Abril 2026  
**Audiencia:** producto, ingeniería, IAs de contexto  
**Relacionado:** [`../roadmap.md`](../roadmap.md), [`../architecture.md`](../architecture.md), [`../design/workout-tracking-and-analytics.md`](../design/workout-tracking-and-analytics.md) (tracking detallado, payload, gaps y roadmap de analytics)

Este documento describe **qué existe hoy** en código y datos respecto a generación de entrenamientos, uso del catálogo de ejercicios, seguimiento de sesiones y **qué no está modelado aún** (p. ej. volumen agregado por músculo en el tiempo).

---

## 1. Fuente de verdad: catálogo de ejercicios

- Tabla `exercises` (`backend/app/models/exercise.py`).
- Cada ejercicio tiene: `muscle_group` (array de strings), `category`, `difficulty`, `equipment`, etc.
- Los valores de `muscle_group` se usan como **etiquetas flexibles** (no hay tabla normalizada de músculos ni jerarquía oficial en BD).
- El seed (`backend/scripts/seed.py`) y contenido editorial alimentan este catálogo; los planes (seed o generados) referencian ejercicios por `exercise_id`.

**Implicación:** el “tracking de músculos trabajados” a nivel **producto avanzado** (mapa corporal, balance semanal, recomendaciones) requeriría o bien normalizar músculos + mapeo ejercicio→músculo con pesos, o derivar métricas agregadas desde `Exercise.muscle_group` y el log de sesiones.

---

## 2. Generación de planes personalizados (post-registro)

**Ubicación:** `backend/app/services/workout_plan_service.py` — clase `WorkoutPlanGenerator`.

**Disparador:** registro exitoso en `authentication` — tras crear el usuario se llama `WorkoutPlanGenerator.generate_workout_plan(user_id, user_data)` con `fitness_level`, `fitness_goal`, `available_days` (y nombre para el título del plan).

**Lógica resumida:**

1. **Nivel:** `map_user_level` mapea `irregular` → beginner, etc.
2. **Intensidad:** `get_intensity_settings` combina nivel + objetivo (`weight`, `strength`, `muscle`, `keep`) → sets, rango de reps, descanso.
3. **Duración en semanas:** `determine_plan_duration` según objetivo y nivel.
4. **Split semanal:** `calculate_splits` según número de días disponibles (5+, 4, o menos) → listas de grupos lógicos (`push`, `legs`, `full_body`, `cardio`, etc.).
5. **Por cada día** del usuario: se expanden grupos con `MUSCLE_GROUPS_MAPPING` (p. ej. `push` → chest, shoulders, triceps), se filtran ejercicios del catálogo cuyo `muscle_group` intersecta (comparación en minúsculas), se elige cantidad aleatoria dentro de rangos por nivel, opcionalmente se mezcla cardio.
6. **Persistencia:** se crea un `WorkoutPlan` `plan_type="personalized"` vía `WorkoutPlanRepository.create_full_plan`, luego `set_active_plan_for_user` crea un `ActivePlan` (marca planes personalized previos como completados, define ventana `start_date`/`end_date`).

**Nota:** la generación es **heurística + aleatoriedad controlada**, no LLM. No hay “regeneración adaptativa” automática según progreso real aún (véase roadmap Fase 2).

---

## 3. Otros planes y contenido editorial

- **CRUD / bulk:** rutas en `backend/app/routes/workouts.py` permiten crear planes con `workout_schedule` (días + ejercicios). Uso típico: administración o seed.
- **Seed:** `seed.py` inserta planes y challenges con nombres de ejercicio resueltos al `exercise_map`.
- **Biblioteca / discovery:** `home_discovery_repository` y listados de planes activos para exploración en home.

---

## 4. Challenges vs plan personalizado

| Aspecto | Plan personalizado (`ActivePlan` + `WorkoutPlan`) | Challenge |
|--------|---------------------------------------------------|-----------|
| Progreso por día | `day_of_week` + `week_number` en `DayProgress` | `sequence_day` (y lógica específica en servicios) |
| Cálculo % en UI/API | `_calc_personalized_progress` (sets del día vs completados) | `_calc_challenge_progress` / `get_challenge_progress` |
| Entidades extra | — | `ActiveChallenge`, `CompletedChallengeDay`, repositorios dedicados |

El frontend (`ExerciseFlow`) bifurca envío de progreso según tipo de workout (plan vs challenge).

---

## 5. Tracking de actividad del usuario (estado actual)

### 5.1 Progreso dentro del plan activo

- **`DayProgress`** + **`ExerciseProgress`:** sets/reps/duración/calorías por ejercicio en un día concreto; marca `is_completed` a nivel ejercicio y día.
- **`UserWorkoutService.save_workout_progress`:** fusiona con el día del plan; cuando todos los ejercicios programados del día están completos, actualiza `active_plan.progress` y puede cerrar el plan.

### 5.2 Sesiones completadas (historial)

- **`CompletedWorkout`** + **`CompletedWorkoutExercise`:** registro de sesión terminada con duración, calorías, ejercicios.
- Persistencia vía `save_completed_workout` (según uso desde rutas/cliente).

### 5.3 Qué **no** existe como dominio explícito hoy

- **Agregados por músculo** (volumen, series/semana, “brazo vs pecho”): no hay tablas ni jobs que acumulen por músculo desde `ExerciseProgress`.
- **Streak / actividad diaria** para gamificación: no modelado en progreso (roadmap lo marca pendiente).
- **Evento unificado “actividad del usuario”** (feed, auditoría, analytics): los datos están repartidos entre progress, completed workouts y challenges; no hay un `activity_stream` único.
- **Calorías:** campos existen; el flujo del player puede mandar `0` si no hay estimación real.

---

## 6. Dirección acordada: taxonomía de músculos (enum + UI) y catálogo Opción A

**Estrategia de datos del catálogo:** catálogo canónico interno + ETL desde fuentes externas — ver [`../design/exercise-catalog-strategy.md`](../design/exercise-catalog-strategy.md) (baseline, gaps, fases D1–D6).

**Prioridad de producto:** normalizar músculos **primero en backend** (enum / conjunto cerrado de valores en BD o capa de aplicación), luego **frontend** alineado a los **grupos musculares principales** para tracking y visualización.

**Objetivo en cadena:**

1. Un vocabulario único (p. ej. `MuscleGroup` o tabla `muscles` con códigos estables).
2. Cada ejercicio referencia uno o más músculos con posible **peso** (primario vs secundario) vía tabla puente si hace falta.
3. Las sesiones completadas + ese mapeo permiten **agregados correctos** (series o volumen por músculo en una semana).
4. **Futuro:** vista tipo **perfil / cuerpo humano** donde el usuario ve en qué zonas va progresando (alimentado por los mismos datos, no por texto libre).

Hasta migrar, `muscle_group` como array de strings sigue siendo la realidad en código; el generador (`MUSCLE_GROUPS_MAPPING`) deberá alinearse al enum en una migración posterior.

---

## 7. Puntos de extensión recomendados (sin implementar aquí)

1. **Capa de analytics de entrenamiento:** lecturas derivadas desde sesiones completadas + catálogo → agregados por músculo, streaks, rankings globales anonimizados. Ver [`../design/analytics-layer.md`](../design/analytics-layer.md).
2. **Adaptación del plan:** servicio que ajuste o regenere bloques del `WorkoutPlan` según métricas y reglas (complemento a IA con hechos).
3. **Actividad social (futuro):** eventos o feed cuando el producto abra comunidad pública (roadmap tardío).

---

## 8. Referencias de código principal

| Tema | Archivo(s) |
|------|------------|
| Generación de plan | `backend/app/services/workout_plan_service.py` |
| Registro → plan | `backend/app/routes/authentication.py` |
| Progreso y weekly | `backend/app/services/user_workout_service.py` |
| Modelos | `backend/app/models/progress.py`, `exercise.py`, `workout_plan.py` |
| Repositorios | `backend/app/repositories/progress_repository.py`, `workout_repository.py` |
| API progreso usuario | `backend/app/routes/users.py` (`/workouts/progress`, etc.) |
| Player frontend | `frontend/app/_components/workouts/ExerciseFlow.tsx` |

---

## 9. Preguntas abiertas (detalle de implementación)

- **Pesos primario/secundario** por ejercicio: ¿obligatorio desde el primer enum o fase 2?
- **Mapa corporal en UI:** ¿cuántas regiones en v1 (p. ej. 8–12) vs detalle fino más adelante?
- **Historial de sesiones en UI** vs **primera versión del cuerpo**: orden de entrega (producto).

La decisión de **vocabulario cerrado vía enum en backend** ya está tomada; ver [`../vision-ecosystem.md`](../vision-ecosystem.md).
