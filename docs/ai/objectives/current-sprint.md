# Objetivo Actual — Home Dashboard Redesign

**Fase:** 1 — Fundación y Experiencia Core  
**Iniciado:** Abril 2026  
**Estado:** ✅ Iteración principal del home entregada — **seguimiento:** datos agregados (racha, total), refetch post-sesión, ver [`../design/home-refactor-implementation.md`](../design/home-refactor-implementation.md)

---

## Contexto

El home page actual (`frontend/app/(app)/home/page.tsx`) es un placeholder funcional pero no inspiracional. No comunica el valor del app, no invita al usuario a actuar, y no aprovecha la data que ya existe (usuario, workouts, AI).

El objetivo de este sprint es redesignar el home para que sea un **dashboard que inspire acción**, siguiendo el estilo de apps como Nike Training Club y Thenx.

---

## Objetivo Principal

Crear un home dashboard que comunique al usuario de forma inmediata:

1. **Quién eres** — saludo personalizado con el nombre del usuario
2. **Qué hacer hoy** — CTA claro hacia el workout del día o el próximo paso del plan
3. **Cómo vas** — mini-resumen de progreso (streak, última sesión)
4. **Tu entrenador** — punto de entrada prominente al AI personal trainer
5. **Explorar** — acceso rápido a ejercicios, challenges o contenido nuevo

---

## Criterios de Éxito

- [ ] El home se ve inspiracional en mobile (iPhone 14 Pro Max como referencia visual)
- [ ] El desktop no se ve afectado negativamente
- [ ] Hay un CTA claro para el workout del día
- [ ] El AI trainer tiene un punto de entrada visible sin ser intrusivo
- [ ] Los componentes son reutilizables y siguen las convenciones del proyecto
- [ ] No hay placeholders de texto — si el dato no existe, el estado vacío se ve bien

---

## Componentes a Crear / Refactorizar

### Nuevos (entregados con nombres reales)
| Componente | Descripción |
|-----------|------------|
| `WorkoutHeroCard` | Card del workout del día con CTA (reemplaza el nombre genérico *TodayWorkoutCard* del plan inicial) |
| `HomeStatsRow` | Tres métricas (racha / semana / total), animación al subir valores; prototipo en `tempcontent` obsoleto |
| *(Motivation / AI)* | `MotivationSection` existente, reforzada con i18n — no se creó un archivo separado *AITrainerPrompt* |

### Refactorizar
| Componente | Qué cambiar |
|-----------|------------|
| `GreetingSection` | Ya ajustado (centrado vertical + lupa corregida) — revisar en contexto del nuevo layout |
| `MotivationSection` | Mejorar diseño y conexión con el AI trainer |
| `ExerciseBannerSection` | Integrar con datos reales o mejorar estado vacío |
| `SavedWorkoutsSection` | Mejorar estado vacío, diseño de cards |

---

## Layout Deseado (Mobile)

```
┌─────────────────────────────┐
│  Buenos Días ☀️              │  ← GreetingSection (ya existe)
│  Nombre del Usuario         │
│                          🔍 │  ← SearchBar (ya existe)
├─────────────────────────────┤
│  ┌───────────────────────┐  │
│  │  TodayWorkoutCard     │  │  ← NUEVO: workout del día + CTA
│  │  "Día 3 · Upper Body" │  │
│  │  [▶ Empezar]          │  │
│  └───────────────────────┘  │
├─────────────────────────────┤
│  🔥 Racha: 5 días           │  ← StreakBadge (NUEVO)
│  Esta semana: 3 sesiones    │
├─────────────────────────────┤
│  ┌───────────────────────┐  │
│  │  AITrainerPrompt      │  │  ← Card con mensaje motivacional AI
│  │  "Ayer lo hiciste..." │  │
│  │  [¡Charlemos!]        │  │
│  └───────────────────────┘  │
├─────────────────────────────┤
│  Explora ejercicios →       │  ← ExerciseBannerSection
├─────────────────────────────┤
│  Entrenamientos guardados → │  ← SavedWorkoutsSection
└─────────────────────────────┘
```

---

## Archivos Involucrados

```
frontend/app/(app)/home/page.tsx                         ← página principal
frontend/app/_components/_sections/GreetingSection.tsx   ← ya ajustado
frontend/app/_components/_sections/MotivationSection.tsx ← refactorizar
frontend/app/_components/_sections/ExerciseBannerSection.tsx
frontend/app/_components/_sections/SavedWorkoutsSection.tsx
frontend/app/_components/searchbar/SearchBarComponent.tsx ← ya corregido
```

### Archivos creados en la práctica (refactor)
```
frontend/app/_components/_sections/HomeStatsRow.tsx
frontend/app/utils/translateFitnessLevel.ts
```
Ver lista completa en [`../design/home-refactor-implementation.md`](../design/home-refactor-implementation.md).

---

## Datos que el Home Necesita Consumir

| Dato | Fuente actual | Estado |
|------|-------------|--------|
| Nombre del usuario | `session.user.userName` | ✅ disponible |
| Workout del día | `workoutService` | 🔄 endpoint existe, necesita integración |
| Racha del usuario | — | UI lista; **cálculo + API** pendientes |
| Stats de la semana | `weekly-progress` + conteo días completados | ✅ parcial en `HomeStatsRow` |
| Total de sesiones | — | UI en 0 hasta API agregada |
| Mensaje AI motivacional | `users.py` → `ChatService` | ✅ existe básico |
| Ejercicios guardados | `exerciseService` | 🔄 existe |

---

## Notas de Diseño

- Paleta: negro, verde (`#22C55E` aprox.), blanco — ya usada en el app
- Tipografía: bold para nombres/títulos, regular para subtextos
- Cards: bordes redondeados (`rounded-2xl`), sombra sutil
- El fondo del home es blanco — las cards dan profundidad
- El CTA principal debe ser verde y ocupar todo el ancho de la card
- No usar carousel en el hero — una card clara es mejor que un carrusel escondido

---

## Próximo Paso Después de Este Sprint

Una vez terminado el redesign del home, el siguiente objetivo es el **refactor del módulo de Workouts** (plan generado por AI desde datos del onboarding, player mejorado, historial de sesiones).
