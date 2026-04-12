# Tracking de entrenamiento y roadmap de analytics

**Última actualización:** Abril 2026  
**Audiencia:** producto, ingeniería, IAs sin contexto previo del repo  
**Objetivo:** describir **qué existe hoy**, **qué ve el usuario**, **qué falta** y **por dónde avanzar** (principios acordados + fases de implementación).

**Relacionado:** [`analytics-layer.md`](./analytics-layer.md) (patrón operativa vs derivada), [`muscle-taxonomy-v1.md`](./muscle-taxonomy-v1.md), [`exercise-catalog-strategy.md`](./exercise-catalog-strategy.md), [`../domain/workouts-and-progress.md`](../domain/workouts-and-progress.md)

---

## 1. Resumen ejecutivo

| Tema | Estado actual | Dirección acordada |
|------|----------------|----------------------|
| Tiempos | El front usa contadores (`exerciseStartTime`, `workoutStartTime`) y envía `duration_seconds` por ejercicio | Seguir usando **duración medida en app** como fuente de verdad para tiempo |
| Series / reps | Se envía al terminar **todo** el ejercicio (no serie a serie); `reps_completed` repite la rep programada por serie | Evolucionar a **registro de series completadas** (y luego reps/peso por serie) para **cálculos derivados** (volumen, tendencias, músculos) |
| Calorías | Siempre `0` en cliente | Fase posterior (estimación MET + peso, etc.) |
| Sesión unificada (`CompletedWorkout`) | `oneDay` y **`myPlan`** llaman a `/api/users/workouts/complete` al cerrar sesión | Varios registros por día permitidos (misma `workout_plan_id` + distintas marcas de tiempo) |
| Analytics rico | No hay agregados por músculo ni dashboard de tendencias aún | Construir sobre **capa derivada** (consultas SQL + taxonomía `exercise_muscles`) cuando los datos operativos lo permitan |
| Challenges | Progreso por día del reto en tablas propias | **Sí cuentan** como actividad: cada día completado ≈ una sesión; pueden combinarse con rutina (*dos sesiones* el mismo día si completa ambos) — véase §2.6 |

---

## 2. Visión de producto: qué debe reflejar el progreso

Esta sección fija la **intención** para quien diseñe UI, datos o analytics sin haber vivido la conversación de producto. El código actual puede no cumplirla al 100% — véanse brechas en §5.

### 2.1 Objetivo del tracking

- Dar al usuario **datos que motiven** y mantengan **engagement**, pero que sean **creíbles**: lo que muestra la app debe corresponder a **lo que el cuerpo hizo** (tiempo, esfuerzo, sesiones reales).
- El tracking no es solo “cumplir el plan”, es **registrar actividad** para poder celebrar hitos, tendencias y feedback (incluida la IA más adelante).

### 2.2 Unidad atómica: la sesión de entrenamiento

- Una **sesión** = una vez que el usuario abre un workout en el player y lo lleva hasta un estado terminal (completado o abandonado/en progreso según reglas de producto).
- **Varias sesiones el mismo día** son válidas y esperables (ej.: mañana piernas en un plan *oneDay* de la biblioteca, tarde el día programado de su *myPlan*).
- **Todo debe sumar** al tracking agregado (duración del día, series, volumen futuro, etc.): no limitar artificialmente a “un solo workout por día” en los totales que ve el usuario.

### 2.3 Rutina programada (*myPlan*) vs workout suelto (*oneDay* / biblioteca)

| Situación | Comportamiento deseado |
|-----------|-------------------------|
| Hoy toca un día de la rutina y el usuario **hace ese workout** | Cuenta como **día de rutina completado** (progreso del plan) **y** como **una sesión** de actividad real. |
| El mismo día el usuario **además** hace otro workout (ej. *oneDay* de pierna) | Es una **segunda sesión** independiente; también cuenta hacia actividad total del día. |
| Empieza un workout y **no lo termina** | Debe poder quedar **en progreso** o **parcial** (según diseño), sin borrar el intento si producto lo requiere. |
| Hace solo el *oneDay* y **no** el día de rutina | El *oneDay* cuenta como sesión; el día de rutina puede seguir **pendiente** u otro estado — no sustituye automáticamente al slot de rutina salvo que producto defina “sustitución”. |

**Ejemplo:** dos visitas al gym en un día → sesión A (*oneDay* pierna) + sesión B (día de rutina) = **2 sesiones completadas** en el mismo día; ambas entran en resúmenes de “qué hice hoy / esta semana”.

### 2.4 Principios para analytics y UI derivada

- Los **totales por día/semana** deben poder **sumar todas las sesiones** (rutina, *oneDay*, **días de challenge**, etc.).
- El **progreso del plan** (por día de la semana en *myPlan*), el **progreso del challenge** (por `sequence_day`) y el **historial de actividad** global son **vistas complementarias**: adherencia a cada programa vs trabajo total que hizo el cuerpo.
- La coherencia (“esto es correcto”) viene de que **cada sesión** tenga duración, ejercicios y estado claros, y que los agregados sean sumas explícitas de esas sesiones.

### 2.5 Gap respecto al modelo actual (lectura para ingeniería)

- Hoy **`DayProgress`** está pensado como **un bloque por (plan, semana, día de la semana)** para la rutina; **`CompletedWorkout`** representa una sesión pero no está unificado para *myPlan* al cerrar desde el player.
- Para soportar **varias sesiones por día** y que “todo sume”, hace falta un modelo mental claro de **sesión** (p. ej. filas múltiples de `CompletedWorkout` por día, o `workout_session` explícito) y reglas de cómo se relacionan con el slot de rutina.
- Detalle de diseño en implementación — **no** está cerrado en código a la fecha de este documento.

### 2.6 Challenges y rutina: ambos cuentan

- Los **challenges** son otro tipo de programa con días secuenciales; **también entran en el tracking** de actividad real, igual que la rutina (*myPlan*) o un *oneDay*.
- **Cada día del challenge que el usuario completa** debe tratarse, a efectos de “qué entrené”, como **una sesión / workout completado** (además del avance propio del challenge: día 3 de 30, etc.).
- **Rutina + challenge a la vez:** muchos usuarios harán **solo uno al día** (recomendación simple); un usuario más avanzado puede combinar **rutina y challenge el mismo día** → en ese caso son **dos sesiones** distintas si completa ambos; cada una suma al trabajo total del día y puede reflejarse por separado en adherencia al challenge y a la rutina.
- **Día de rutina completado** = una sesión registrada hacia la adherencia de *myPlan* **y** hacia el agregado de actividad; **día de challenge completado** = lo mismo respecto al challenge **y** hacia el mismo agregado global.
- Objetivo: que el usuario vea que **todo lo que hace en la app** (rutina, biblioteca, challenge) **contribuye** a una narrativa coherente de esfuerzo, sin que un tipo “anule” al otro en los totales.

---

## 3. Modelo de datos relevante (backend)

Referencias de código: `backend/app/models/progress.py`, `backend/app/models/workout_plan.py`, `backend/app/models/muscle.py`.

| Entidad | Rol |
|---------|-----|
| `ActivePlan` | Plan activo del usuario; `progress` % agregado; relación con `DayProgress` |
| `DayProgress` | Progreso de un **día** dentro del plan (semana + `day_of_week` o `sequence_day` para challenges) |
| `ExerciseProgress` | Por **día** y **ejercicio**: `sets_completed`, `reps_completed[]`, `duration_seconds`, `calories_burned`, `is_completed` |
| `CompletedWorkout` | **Sesión** terminada: fecha, duración total, `workout_plan_id`, ejercicios resumidos en `CompletedWorkoutExercise` |
| `Exercise` / `exercise_muscles` | Catálogo; mapeo a músculos para **futuros** agregados por músculo |

**Restricción útil:** `ExerciseProgress` tiene un único registro por `(day_progress_id, exercise_id)` — los reenvíos actualizan el mismo bloque (merge en servicio).

---

## 4. Flujos por tipo de workout (frontend → API)

Implementación principal del player: `frontend/app/_components/workouts/ExerciseFlow.tsx`.  
Servicios HTTP: `frontend/app/_services/userService.ts` (`useSendProgressToBackend`, `useSendCompleteToBackend`, `useSendChallengeProgress`, `useSendChallengeComplete`).

### 4.1 Payload por ejercicio completado (estructura común)

Al terminar **todas las series** de un ejercicio, el cliente construye un objeto alineado con `ExecutedExercise` / `ExerciseProgress` en backend:

| Campo | Comportamiento actual en UI |
|--------|------------------------------|
| `exercise_id` | UUID del ejercicio en el plan |
| `sets_completed` | Número total de series del bloque completadas |
| `reps_completed` | Array de longitud `sets_completed`; cada elemento repite **`currentExercise.reps`** (programado), no reps registradas manualmente por serie |
| `duration_seconds` | Segundos entre inicio del ejercicio y fin (`Date.now() - exerciseStartTime`) |
| `calories_burned` | `0` |
| `is_completed` | `true` |

Esto es lo que persiste el backend en `ExerciseProgress` vía `UserWorkoutService.save_workout_progress` y equivalentes en challenges.

### 4.2 Plan personalizado (`workoutType === 'myPlan'`)

- **Durante la sesión:** tras cada ejercicio completado → **POST** `/api/users/workouts/progress`  
  - Query: `workout_plan_id`  
  - Body: `{ exercises: [payload de un ejercicio], day_of_week }` (día en inglés en minúsculas, derivado del cliente).
- **Persistencia incremental:** `save_workout_progress` → `DayProgress` + `ExerciseProgress`; puede marcar día y plan como completados.
- **Al terminar el último ejercicio del día:** **POST** `/api/users/workouts/complete` con `workout_id` (= plan activo), `duration_seconds` (desde inicio de sesión en el player), `exercises` (= todos los `ExerciseProgress` de la sesión), `day_of_week`, `was_skipped: false` → `save_completed_workout` → fila en **`completed_workouts`** + `completed_workout_exercises`. Así el historial de sesiones queda alineado con `oneDay`; pueden existir **varias filas el mismo día** si el usuario hace más de una sesión.

### 4.3 Plan “one day” (`workoutType === 'oneDay'`)

- Progreso incremental: similar idea de ejercicios en memoria.
- **Al terminar la sesión:** **POST** `/api/users/workouts/complete` con `duration_seconds` total del workout, lista `exercises` y metadatos → `save_completed_workout` → `CompletedWorkout` + líneas por ejercicio.

### 4.4 Challenge (`workoutType === 'challenge'`)

- Por ejercicio: **POST** al endpoint de progreso de challenges (según `userService`) con `sequence_day` y ejercicios.
- Al terminar sesión: **POST** complete de challenge con todos los `exercisesProgress`.

### 4.5 Qué ve el usuario en pantalla

| Momento | UI |
|---------|-----|
| Durante el workout | `ExerciseView` / `RestView`: serie actual, descansos, progreso % aproximado (`series completadas / series totales del día` en `ExerciseFlow`) |
| Fin de sesión | `oneDay`: `CompleteView` con **duración total** formateada; otros: toast / overlay de “completado” |
| Fuera del player | Home / workouts: típicamente **`/api/workouts/weekly-progress`** — días de la semana, ejercicios con `is_completed`, % de la semana (según `UserWorkoutService.get_weekly_workout_progress`) |

---

## 5. Brechas conocidas (para quien implemente)

1. **`myPlan` + `CompletedWorkout`:** ~~sin POST de complete~~ **Implementado (abr 2026):** `ExerciseFlow` envía `/workouts/complete` al cerrar sesión `myPlan`. Pendiente: endpoint/UI de **listado de sesiones** para el usuario si aún no existe.
2. **Granularidad:** no hay guardado **por serie** (solo blob al cerrar el ejercicio); `reps_completed` no refleja variaciones reales serie a serie.
3. **Carga externa:** no hay peso/banda; volumen de fuerza no calculable.
4. **Calorías:** campo existe pero sin valor útil.
5. **Músculos:** taxonomía y `exercise_muscles` listos para **derivar** analytics; las tablas de progreso aún no enlazan volumen por `muscle.code` (falta capa de consulta/agregación).
6. **IA:** el contexto “hechos” (plan + semana + resumen) debe construirse desde endpoints derivados cuando existan datos fiables.
7. **Varias sesiones / mismo día:** el modelo actual no modela explícitamente “N sesiones por día” de forma unificada para todos los tipos de plan; alineación con §2.5.

---

## 6. Principios de implementación acordados

1. **Tiempos:** seguir usando **duración medida en la app** (contadores) como fuente principal de tiempo por ejercicio y, donde aplique, por sesión.
2. **Series:** priorizar persistir **series completadas** (y en fases posteriores detalle por serie) para habilitar **cálculos** (volumen, tendencias, músculos) sin depender solo de un único agregado al final.
3. **Derivados:** métricas de producto (por músculo, semana, racha) viven en **consultas o servicios de lectura** ([`analytics-layer.md`](./analytics-layer.md)), no en lógica duplicada en el player.
4. **Iteración:** mejorar primero **operativa** (qué guardamos y con qué granularidad); después **dashboards** y **payloads para IA**.

---

## 7. Roadmap sugerido (fases — sin código aquí)

| Fase | Objetivo | Entregables típicos |
|------|----------|---------------------|
| **A — Operativa mínima** | Sesiones coherentes | `myPlan` + `complete` **hecho**; siguiente: API/listado de sesiones y agregados diarios desde `completed_workouts` |
| **B — Series** | Datos para cálculos | Registrar avance por serie (o actualizar `ExerciseProgress` al cerrar cada serie) sin romper API existente |
| **C — Derivados v1** | Valor en UI | Endpoint(s) de “resumen semanal por músculo” o series totales usando `exercise_muscles` |
| **D — Carga opcional** | Fuerza / volumen | Campos opcionales por serie o ejercicio |
| **E — Calorías / MET** | Estimación | Peso usuario + duración + tipo de ejercicio |
| **F — IA** | Contexto estructurado | JSON de hechos (semana del plan, agregados) antes de OpenAI |

El orden A→B→C es el más natural para “analytics que mejora con el tiempo”.

---

## 8. Archivos clave (mapa rápido)

| Área | Ruta |
|------|------|
| Player / contadores / payloads | `frontend/app/_components/workouts/ExerciseFlow.tsx` |
| Tipos de progreso en cliente | `frontend/app/_interfaces/ExerciseFlow.ts` |
| POST progreso / complete usuario | `frontend/app/_services/userService.ts` |
| Rutas API | `backend/app/routes/users.py` (`/workouts/progress`, `/workouts/complete`) |
| Lógica de negocio progreso | `backend/app/services/user_workout_service.py` |
| Persistencia detallada | `backend/app/repositories/progress_repository.py` |
| Esquemas de entrada | `backend/app/schemas/progress.py` |

---

## 9. Preguntas abiertas (cerrar antes de implementar Fase A)

- ¿`CompletedWorkout` es obligatorio para **todos** los tipos de plan al cerrar sesión?
- ¿Se guarda **tiempo de descanso** usado o solo tiempo “activo” por ejercicio?
- ¿Los challenges y `myPlan` deben compartir el **mismo** modelo de “sesión” para informes?
- Si el usuario hace un *oneDay* **en lugar** del día de rutina, ¿el slot de rutina queda pendiente, se marca sustituido o se auto-completa? (afecta adherencia vs actividad real.)
- ¿Cómo se muestra **en progreso** vs **abandonado** en UI y en datos?

Actualizar este documento cuando se cierren decisiones o se complete una fase del roadmap.
