# My Plan (personalizado) — Rework: tech spec + UI para v0

**Última actualización:** Abril 2026  
**Audiencia:** ingeniería, producto, IAs que implementen el cambio  
**Relacionado:** [`../domain/workouts-and-progress.md`](../domain/workouts-and-progress.md), [`../architecture.md`](../architecture.md), [`home-dashboard.md`](./home-dashboard.md), [`../backend-testing-status-and-roadmap.md`](../backend-testing-status-and-roadmap.md)

---

## 1. Decisión de producto (acordada)

| Tema | Decisión |
|------|----------|
| Planes personalizados activos | **Normalmente uno** a la vez. Workouts de 1 día, suscripciones a otros planes o challenges son **otro hilo** (misma app, distintas rutas/entidades). |
| Mismo `exercise_id` en varios días | **Sí, puede ocurrir** (ej. press banca en dos días de pecho). Toda lógica de progreso y optimista en UI debe ser **por día + ejercicio**, nunca solo por `exercise_id` global. |
| “Completar entreno” / cierre de sesión | Aplica a **hoy** (día de entrenamiento del usuario en el contexto actual), no a “toda la semana en un solo botón” salvo que se defina otro flujo. |

---

## 2. Estado actual (inventario técnico)

### 2.1 Backend

- **Ruta:** `GET /api/workouts/weekly-progress` (`backend/app/routes/workouts.py` → `UserWorkoutService.get_weekly_workout_progress`).
- Resuelve el **primer** `ActivePlan` con `plan_type == "personalized"` y no completado; mezcla template del `WorkoutPlan` con `progress_details` de la **semana corriente** (anclada a `start_date` del plan, no a semana ISO de calendario).
- Devuelve: `week_start_date`, `week_end_date`, `progress` (ratio de **días** completos / días programados), `days[]` con `day_of_week`, `date`, `is_completed`, y por ejercicio: metadatos + `is_completed`.

**Limitación:** el GET **no** recibe `workout_plan_id`. El `id` en la URL del frontend no filtra el payload.

### 2.2 Frontend (archivos clave)

| Archivo | Rol |
|---------|-----|
| `frontend/app/(app)/workouts/my-plan/[id]/page.tsx` | Página: fetch, estado local, selector de día, grid, flujos delete/replace, `ExerciseFlow` con **un** ejercicio. |
| `frontend/app/_components/workouts/my-plan/ExerciseCard.tsx` | Tarjeta de ejercicio. |
| `frontend/app/_components/workouts/my-plan/DaysOfWeekSelector.tsx` | Píldoras M–Su. |
| `frontend/app/(app)/home/_hooks/useHomeDashboard.ts` | Mismo endpoint, query key `['activePlans']`; deriva `todayExercise`, `planProgress`, `sessionsThisWeek`. |
| `frontend/app/_types/home.ts` | `WeeklyProgressMessage`, `WeeklyProgressDay`, `WeeklyProgressExercise`. |

**Problemas detectados (pre-rework):**

- Cache duplicada: misma API con keys distintas → riesgo de desincronización.
- `weeklyProgressState` duplica el resultado de React Query.
- Ruta `planId` desalineada con el plan que el API usa para leer; mutaciones (delete/replace) usan el `id` de la ruta.
- `handleConfirmExerciseReplace` mezcla `deleteExercises` + `modifyExercises` y limpia estado sin orquestar bien; revisar y separar.
- `handleExerciseComplete` actualiza por `exercise_id` en **todos** los días: **incorrecto** si el mismo id aparece en lunes y jueves (marca ambos al completar uno).

### 2.3 UX actual (referencia de pantalla)

- Título, selector semanal, grid 2 columnas, thumbs + icono play grande, texto sets/reps.
- Las imágenes a menudo son **placeholders** (p. ej. Picsum por seed) — poco afinidad con el ejercicio; el reto de “bonito y minimal” es tanto **diseño** como **contenido** en catálogo.

---

## 3. Objetivos del rework

1. **Claridad:** en un vistazo: hoy, progreso de la semana, qué queda hoy, qué días ya están hechos.
2. **Confianza:** alineación URL/plan/activo; datos coherentes con Home tras completar o editar.
3. **Corrección:** progreso optimista **acotado a** `(date | day_of_week) + exercise_id)`.
4. **Engagement:** CTA de “cierre de **hoy**” cuando tenga sentido, sin mezclar con “semana” en el copy.
5. **Mantenibilidad:** un hook o query compartida, tipos unificados, página más fina.
6. **Diseño:** look minimalista, jerarquía clara, menos ruido visual; preparado para v0/iteración de maquetas.

---

## 4. Dirección UI/UX (para v0, Cursor, Lovable, etc.)

Usa este bloque como **brief creativo** al generar la maqueta. Ajusta tokens al design system (verde, redondez) ya existente.

### 4.1 Narrativa

- **Bloque superior fijo o sticky (light):**  
  - Etiqueta: “Hoy, [día] [número] de [mes]” o rango de semana si aplica.  
  - Progreso semanal: anillo o barra fina + “X de Y días de entrenamiento hechos” (Y = días **con** sesión programada, no 7 fijos).  
  - Línea secundaria: “Faltan N ejercicios hoy” (N = conteo de `!is_completed` en el día de hoy según el payload).

- **Completar el día (producto acordado):**  
  - CTA claro, solo habilitado cuando, para **la fecha/ día actual**, todos los `exercises` tienen `is_completed` **o** como acción de “más adelante” (si el flujo pasa a backend). Si el cierre requiere endpoint, documentar en P1.  
  - Wording: “Cerrar día de hoy” o “Día hecho” — no “semana hecha”.

- **Selector de días (replaza M T W Th… básico):**  
  - Círculos o “chips” con iniciales o número de día, **3 estados** sugeridos: pasado (check / tono sutil), hoy (anillo/acento), futuro.  
  - Día completado: check discreto, no lleno de colores.  
  - Haptic opcional: solo móvil, no requisito v1.

- **Cards de ejercicio (reduce el “ruido”):**  
  - Preferir **lista vertical** de ancho completo o 1 col en móvil, en lugar de 2 col si hace la tarjeta pequeña; si se mantiene 2 col, bajar el peso del thumb (ratio 4:3 o 16:9) y título con más aire.  
  - Sustituir el **play gigante** por: icono de play en esquina (16–20px) o CTA en footer de card “Empezar”.  
  - Fondo de imagen: tratar fallbacks con **fondo sólido tenue** + iniciales del nombre del ejercicio o icono de categoría, si no hay `image_url` confiable.  
  - Línea de detalle: “4 × 10 · 90s descanso” (tipografía secundaria, 13–14px, color gris).

- **Jerarquía y minimalismo**  
  - Más aire, menos sombras fuertes; bordes `1px` o sombra MUY suave.  
  - Título de pantalla: una sola línea, peso semibold, sin competir con el héroe de progreso.  
  - Menú “tres puntos” mantener, pero con bottom sheet o sheet consistente (opciones: cambiar ejercicio, quitar, etc.).

- **Contenido** (separar de código): a medio plazo, reemplazar placeholders Picsum por imágenes del **catálogo** por ejercicio. El spec de UI asume mejores assets.

### 4.2 Texto de prompt (copiar a v0 / generador)

```text
Mobile PWA, fitness, screen "Mi plan de entrenamiento". Sticky top: back + title, optional menu. Below: a calm minimal header (white/off-white) showing the current date, a thin week progress (bar or 7 rings), and text "X of Y training days" and "M exercises left today". 
Day strip: 7 day chips, states for completed (small check, muted green), today (emerald border), default (outline). 
Exercise list: single column, generous padding, 16-20px border radius, soft 1px border or no border + hairline shadow. Each item: 16:9 or 4:3 left thumbnail, title bold, one line of meta "4 sets x 10 reps" with a tiny flame in muted green, small play on thumbnail corner (not a giant play). No large overlay icon in center. 
Primary green gradient only for primary CTAs. Typography clean sans, plenty of negative space, avoid clutter. iOS 17 / Material 3 health-app vibe. Spanish labels.
```

---

## 5. Especificación técnica (implementación)

### 5.1 Contrato de API (evolución recomendada)

**Fase mínima (P0) — sin tocar backend:**

- Aceptar que el GET es global; en frontend, tras cargar `userActivePlans` o equivalente, **verificar** que el `id` de la ruta es el `workout_plan_id` del `ActiveUserPlan` de tipo `personalized`.  
  - Si no coincide → `router.replace(/workouts/my-plan/${correctId})` o 404/empty.  
- Documentar: la fuente de verdad del “plan a mostrar” en lectura es el servicio, no el segmento de URL; el segmento es conveniencia y para mutaciones.

**Fase P1 (opcional backend):**

- Añadir query opcional: `GET /api/workouts/weekly-progress?workout_plan_id=<uuid>`; si se omite, se mantiene el comportamiento actual.  
- Validar que el plan es del usuario y está activo.  
- Ventaja: caché por plan y navegación explícita.

**Fuera de alcance inmediato:** múltiples personalizados activos (producto no lo pide ahora).

### 5.2 React Query: una sola “fuente de verdad”

- Unificar a **un query key** para el GET semanal, p. ej. `['weeklyWorkoutProgress']` o `['weeklyWorkoutProgress', userId]`.  
- `useHomeDashboard` y my-plan usan el **mismo** `queryKey` y, si aplica, `select` para derivar vistas.  
- Al `invalidateQueries` (tras delete/replace/completar con éxito), se actualizan home y my-plan.  
- Eliminar el clon en `useState` salvo híbridos puntuos; para optimista, preferir `setQueryData` con estructura `WeeklyProgressMessage`.

### 5.3 Actualizar “completé un ejercicio” (obligatorio por dominio)

```ts
// Firma lógica (pseudocódigo) — nunca:
updateByExerciseIdOnly(id)

// Siempre:
updateExerciseCompletion(targetDayKey, exerciseId, isCompleted: true)
// donde targetDayKey es `date` (preferido) o (week_start + day_of_week) de forma explícita
```

- `ExerciseFlow` callback debe pasar **día** en contexto, o leerse del `selectedDay` (fecha del día bajo el selector + payload).  
- Si un mismo `exercise_id` vuelve a aparecer: solo la instancia de ese **día** se marca.

### 5.4 “Completar hoy”

- **Definición de producto:** refleja que el usuario “cerró” el entreno del **día calendario actual** (coincidencia con `date` de `days[]` o regla de timezone documentada).  
- **UI:** botón visible cuando faltan 0 movimientos según criterio acordado, o estado “Día hecho” si `day.is_completed`.  
- **Backend:** si hoy al marcar el último ejercicio el servidor ya pone el día a completado, el botón puede ser solo de celebración/confirmación. Si hace falta endpoint explícito, dejar tarea TBD en P1 (documentar en PR).

### 5.5 Página y componentes (reorganizar)

| Pieza | Acción sugerida |
|-------|------------------|
| Página | ≤200 líneas: composición, hooks, routing. |
| Lógica | `useMyPlanData(planIdFromUrl)` o `useWeeklyProgress()` con composición. |
| Selector días | Nuevo o extendido: props `days: WeeklyProgressDay[]`, `selectedKey`, `onSelect`, `todayKey`. |
| Progreso semana | Nuevo: `MyPlanWeekSummary` o integrado en el header. |
| Lista | `MyPlanExerciseList` o lista virtual si crece. |

**Modal / replace / delete** — reescribir confirmaciones con mutaciones en serie o `Promise.all` solo si son independientes; **nunca** llamar delete con payload ajenas al flujo de replace; tests de unidad o E2E para el reemplazo.

### 5.6 Home alineada

- Tras rework, al completar entreno en my-plan, la invalidación debe refrescar `pendingExercise` y stats en `WorkoutHeroCard` sin duplicar fetch lógicamente.  
- `streak` en `HomeStatsRow` sigue hardcode; enlazar a roadmap/otro doc, no mezclar con este P0 a menos que exista dato en API.

### 5.7 Accesibilidad y i18n

- `aria-pressed` / `aria-selected` en chips de día.  
- Todos los strings vía i18n (`workouts.my-plan.*`).  
- Evitar anuncios duplicados para screen readers (play + title).

### 5.8 Tests a añadir o ajustar

- Hook o util: dado días, buscar el día de “hoy” con misma lógica que `useHomeDashboard` (single source en util compartida).  
- `handleExerciseComplete` con mismo `exercise_id` en dos días: solo se actualiza un día.  
- Query key: invalidación toca a home.  
- Contrato: snapshot de estructura `WeeklyProgressMessage` mínima.

---

## 6. Plan de fases y entregables

| Fase | Alcance | Entregables |
|------|---------|------------|
| **P0** | Unificar query, validación planId, fix optimista por día+ejercicio, alinear my-plan con tipos, refactor ligero de replace/delete, esqueleto UI: header con progreso y chips con estados. | PR(s) con tests, sin cambio de API. |
| **P1** | v0 de maqueta (v0) integrada, lista 1 col o iteración, CTA “día hecho”, imágenes fallback, optional `?workout_plan_id` backend. | Doc actualizada; métrica de carga. |
| **P2** | Streak, animaciones, “entreno del día en una sesión” (navegación con cola) si producto lo aprueba. | Tema en roadmap. |

---

## 7. Criterios de aceptación (P0)

- [ ] Una sola clave de React Query para progreso semanal compartida con home (o mecanismo documentado de invalidación cruzada si se justifica otra estructura).  
- [ ] Navegación: si la URL de my-plan no coincide con el plan personalizado activo, redirección o manejo explícito, sin mostrar mezclado con otro plan.  
- [ ] Completar un ejercicio vía `ExerciseFlow` solo marca el ejercicio en el **día actual de contexto** (no otras apariciones del id).  
- [ ] `handleConfirmExerciseReplace` (o reemplazo) no invoca `deleteExercises` en el flujo de reemplazo salvo requisito real.  
- [ ] Tipos: reutilizar `WeeklyProgressMessage` de `@/app/_types/home` (o re-export central).  
- [ ] i18n y accesibilidad básica en el nuevo selector.  

---

## 8. Preguntas abiertas (seguimiento)

- Timezone: “hoy” es siempre reloj del dispositivo vs. servidor (para `is_completed` del día). Recomendación: documentar “reloj local del cliente para selección; payload `date` en ISO para matching”.  
- Cierre de día: ¿solo con todos los `is_completed` a true vía progreso incremental, o requiere POST de “cierre de sesión”? (Acordar en P0/P1 con backend.)

---

## 9. Checklist de archivos para un implementador/IA

| Ruta (aprox.) | Tarea |
|--------------|--------|
| `app/(app)/workouts/my-plan/[id]/page.tsx` | Reducir, delegar, validación de plan, optimista acotada. |
| `app/(app)/home/_hooks/useHomeDashboard.ts` | Misma key / hook compartido. |
| `app/utils/apiClient.ts` o nuevo hook | Opcional: factory `useWeeklyWorkoutProgress`. |
| `app/_types/home.ts` | Tipo único, sin interface duplicada en la página. |
| `app/_components/workouts/my-plan/*` | Nuevos presentacionales. |
| `docs/ai/progress.md` | Marcar rework my-plan. |

---

*Fin del documento. Actualizar al cerrar fases o al introducir `?workout_plan_id` en API.*
