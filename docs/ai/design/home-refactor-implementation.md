# Home — Implementación del refactor (sesión Abril 2026)

**Versión:** 1.0  
**Fecha:** Abril 2026  
**Estado:** Implementación mayor entregada; métricas agregadas y algunos textos siguen evolución  
**Relacionado:** [`home-dashboard.md`](./home-dashboard.md) (intención de diseño), [`../objectives/current-sprint.md`](../objectives/current-sprint.md)

Este documento registra **lo implementado en el rework del home**, detalles técnicos, decisiones, y **trabajo futuro** acordado en la sesión. No sustituye el roadmap global; sirve como referencia para continuidad entre sesiones.

---

## 1. Resumen ejecutivo

| Área | Qué se hizo |
|------|-------------|
| **Layout y espaciado** | Columna única alineada con `px-6` / `mx-6` (mismo ritmo que el hero); secciones con `py-6`; saludo sin paddings responsive extra que desalineen. |
| **Tipografía** | Escalado ~+25% respecto a la base anterior en la mayoría de textos del home; enlaces «Ver todo» se mantienen en `text-base` a propósito. |
| **Hero del día** | `WorkoutHeroCard` con datos de `GET /api/workouts/weekly-progress`, estados sin plan / loading / con plan. |
| **Stats (racha / semana / total)** | Componente `HomeStatsRow` en `frontend`; animación al subir números (Framer Motion + `prefers-reduced-motion`). **Esta semana** derivada del weekly progress; **racha** y **total** en `0` hasta endpoint dedicado. |
| **Challenges** | Widget de progreso con batch API; contenedor solo si hay challenges activos (sin hueco en blanco). |
| **Descubrimiento** | `GET /api/workouts/home/explore` y `home/by-level`; secciones Explora + Niveles de entrenamiento. |
| **Rendimiento** | Batch de progreso de challenges, cache de token en axios, `staleTime` en React Query, skeletons, queries de búsqueda con `enabled` condicional, ajustes backend (eager loads / N+1) donde aplica. |
| **i18n** | Textos del home pasando por `global.json`; niveles del backend mapeados con `translateFitnessLevel` (p. ej. `beginner` → Principiante); motivación con frases desde i18n; footer y marca top bar. |
| **Prototipo IA** | Código de referencia en `tempcontent/` (p. ej. stats row) **no** es el código de producción; el widget real es `HomeStatsRow.tsx` en `frontend`. |

---

## 2. Archivos frontend relevantes

| Ruta | Rol |
|------|-----|
| `frontend/app/(app)/home/page.tsx` | Orquestación: queries, hero, stats, motivación, challenges, explore, niveles, guardados. |
| `frontend/app/_components/_sections/GreetingSection.tsx` | Saludo + nombre; i18n en `aria-label` de iconos. |
| `frontend/app/_components/_sections/WorkoutHeroCard.tsx` | Hero oscuro; dificultad vía `translateFitnessLevel`. |
| `frontend/app/_components/_sections/HomeStatsRow.tsx` | Tres métricas + skeleton + animación de valores. |
| `frontend/app/_components/_sections/MotivationSection.tsx` | Frases `home.motivation.phrases`; título invitado `headlineGuest`. |
| `frontend/app/_components/_sections/ExploreWorkoutsSection.tsx` | Carrusel explore; niveles traducidos con util compartido. |
| `frontend/app/_components/_sections/TrainingLevelsSection.tsx` | Filtros por nivel + lista. |
| `frontend/app/_components/_sections/SavedWorkoutsSection.tsx` | Guardados. |
| `frontend/app/_components/navbar/MobileTopBar.tsx` | Marca i18n `home.topBar.brand`. |
| `frontend/app/_components/_sections/Footer.tsx` | Copyright `home.footer.copyright` + `poweredBy`. |
| `frontend/app/_components/workouts/challenges/ChallengeProgressWidget.tsx` | Challenges activos (sin `max-w` forzado en desktop para alinear con columna). |
| `frontend/app/utils/translateFitnessLevel.ts` | Normalización + mapeo a `home.discovery.level*`. |
| `frontend/public/locals/en/global.json` / `es/global.json` | Claves `home.*` ampliadas (stats, greeting, footer, motivation, etc.). |

---

## 3. APIs y datos

| Endpoint / mecanismo | Uso en home |
|---------------------|-------------|
| `GET /api/workouts/weekly-progress` | Días de la semana del plan personalizado, ejercicio pendiente del día, `%` de progreso del plan; base para **sesiones esta semana** (conteo de días `is_completed`). |
| `GET /api/users/active-plans` | Planes activos; filtro de challenges para batch. |
| `GET /api/challenges/challenges/progress/batch` | Progreso de varios challenges en una llamada. |
| `GET /api/workouts/home/explore` | Cards para Explora. |
| `GET /api/workouts/home/by-level` | Cards por filtro de nivel. |
| `GET /api/workouts/saved` | Guardados. |

**Pendiente (acordado):** endpoint tipo `GET /api/users/home-stats` o `/api/workouts/home-stats` con `{ streak_days, sessions_this_week, total_sessions }` y reglas de negocio explícitas (zona horaria, qué cuenta como sesión, inclusión de challenges, etc.). Hasta entonces `HomeStatsRow` muestra racha y total en **0** y solo **esta semana** es fiable desde weekly progress (contexto plan personalizado).

---

## 4. Detalles técnicos de producto / UX

- **Espaciado:** contenedor de challenge progress **no** se renderiza si `challengeIds.length === 0`, evitando `div` con padding vacío.
- **Stats — animación:** incremento de número dispara micro-spring; decrementos no celebran; respeta `prefers-reduced-motion`.
- **i18n niveles:** el backend puede enviar `beginner`, `Beginner`, typos cercanos; `normalizeFitnessLevel` reduce a claves canónicas antes de traducir.
- **Motivación:** frases rotan por día de la semana desde el array en JSON; al cambiar idioma se recalcula (`i18n.language`).

---

## 5. Rendimiento (sesión)

- React Query: `staleTime` global (p. ej. 30s) donde se acordó.
- Axios: cache del token de sesión para no llamar `getSession()` en cada request.
- SearchBar: queries con `enabled` solo cuando el buscador está abierto / fullscreen.
- Backend: batch de challenges; eager loading en rutas que serializaban relaciones (evitar N+1) — ver historial de commits en `repositories` / `routes` relacionados.

*(Detalle fino de cada cambio de backend en este repo puede consultarse en git diff de la rama.)*

---

## 6. Criterios del sprint vs estado

Referencia: [`current-sprint.md`](../objectives/current-sprint.md).

| Criterio | Estado |
|----------|--------|
| Home inspiracional en mobile | ✅ Avance grande (hero, stats, discovery, tipografía). |
| Desktop no degradado | ✅ Layout dos columnas (saludo + motivación) mantenido. |
| CTA workout del día | ✅ `WorkoutHeroCard` + CTA continuar / generar plan. |
| AI trainer visible | ✅ `MotivationSection`. |
| Componentes reutilizables / convenciones | ✅ En línea con `_sections` y util i18n. |
| Sin placeholders toscos | 🔄 Stats parcialmente con ceros; copy de vacíos revisado en discovery/guardados según implementación actual. |

---

## 7. Trabajo futuro (prioridad sugerida)

1. **Backend `home-stats`:** racha consecutiva, total histórico, coherencia con `CompletedWorkout` / challenges.
2. **Invalidación / refetch** del home tras completar sesión para que stats y weekly progress reflejen el cambio al volver.
3. **Mensaje AI motivacional** cacheado (p. ej. TanStack Query, `staleTime` 1h) si se genera por API — ver nota en `home-dashboard.md`.
4. **Eliminación de `tempcontent/`** cuando ya no se use como sandbox; el widget de stats vive en `HomeStatsRow.tsx`.
5. **Ajuste fino responsive** si en viewports muy estrechos los tres bloques de stats necesitan stack o tipografía condicional.

---

## 8. Changelog del documento de diseño

- **`home-dashboard.md`:** actualizar versión y estado; las zonas 2–6 están **parcialmente** alineadas con la implementación real (p. ej. stats en **card** blanca, no solo texto sobre fondo). Este archivo (`home-refactor-implementation.md`) es la fuente de verdad de **qué está en código**.

---

*Última revisión: Abril 2026 — refactor home (sesión documentada).*
