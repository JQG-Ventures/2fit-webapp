# Capa de analytics (entrenamiento) — qué es y para qué sirve

**Última actualización:** Abril 2026  
**Audiencia:** producto e ingeniería (sin implementación obligatoria aún)

“Capa de analytics” **no** es una marca de software ni un producto aparte. Es un nombre para un **patrón**: separar **registro operativo** (lo que ya guardas cuando el usuario entrena) de **lecturas inteligentes** (números que el usuario, la UI o la IA necesitan para decidir o mostrar algo).

---

## 1. Dos capas de datos

| Capa | Qué es | Ejemplos en 2fit hoy |
|------|--------|----------------------|
| **Operativa / transaccional** | Filas que representan “qué pasó” en una sesión o día | `ExerciseProgress`, `CompletedWorkout`, `DayProgress` |
| **Analytics / derivada** | Resultado de **consultar y combinar** lo anterior (y el catálogo) | “Series totales por músculo esta semana”, “días con sesión en los últimos 7 días”, “ejercicios más usados en la app” (agregado global) |

La “capa de analytics” es, en la práctica: **endpoints, consultas o jobs** que leen la operativa + `Exercise` (y futuro enum de músculos) y devuelven **agregados** listos para gráficas, home o prompts de IA.

---

## 2. Por qué no hacerlo todo en el player ni en el chat

- El **player** debe seguir siendo rápido: guardar sets/reps y listo.
- Los **totales por semana, por músculo o tendencias** implican sumar muchas filas: eso es trabajo de **backend** (o de una vista materializada más adelante), no del cliente en cada render.
- La **IA** necesita **hechos** (últimas cargas, semana del plan, volumen por grupo) inyectados como contexto; esos hechos salen mejor de consultas estructuradas que de pedirle al modelo que “adivine” el historial.

Así reduces **alucinación**: el modelo recomienda o explica usando números que ya calculó el sistema.

---

## 3. Ejemplos concretos (futuro cercano)

1. **Por usuario:** volumen aproximado o series por `MuscleId` en la última semana (cuando exista enum + mapeo ejercicio→músculo).
2. **Por usuario:** racha de días con al menos una sesión completada (streak).
3. **Global / producto:** ranking de planes o workouts más completados (para “lo que más usa la comunidad” **sin** exponer datos personales — solo agregados).
4. **Para IA:** payload JSON con `{ semana_actual_del_plan, objetivo, resumen_ultimos_7_dias }` generado por el backend antes de llamar a OpenAI.

Nada de esto requiere obligatoriamente una base de datos nueva al día uno: puede ser **SQL + repositorios** que agrupan tablas existentes.

---

## 4. Qué no es

- No es reemplazar PostgreSQL por una “analytics DB” en la fase actual (eso sería BigQuery, etc., solo si escala mucho).
- No es confundir con **ADR** ni gobernanza de decisiones técnicas; es solo diseño de lecturas y métricas.

---

## Relacionado

- [`workout-tracking-and-analytics.md`](./workout-tracking-and-analytics.md) — **tracking actual, qué envía el cliente, brechas, roadmap de analytics y fases de implementación** (lectura obligatoria antes de trabajar en progreso o métricas).
- [`../domain/workouts-and-progress.md`](../domain/workouts-and-progress.md) — estado del dominio y normalización de músculos.
- [`../vision-ecosystem.md`](../vision-ecosystem.md) — horizonte de producto e IA.
