# 2fit — Visión de ecosistema (largo plazo)

**Última actualización:** Abril 2026  
**Relacionado:** [`roadmap.md`](roadmap.md) (ejecución por fases ~12 meses), [`domain/workouts-and-progress.md`](domain/workouts-and-progress.md) (estado técnico actual)

Este documento captura la **narrativa estratégica** del producto: hub de salud y fitness donde usuarios pueden empezar desde cero, el producto genera valor con IA y datos, y a medio plazo entran **creadores (coaches)** y **comunidad**, con monetización transaccional. El [`roadmap.md`](roadmap.md) sigue siendo el plan por fases concreto; aquí se alinean intención y “por qué”.

---

## 1. Propuesta de valor nucleo

1. **Usuario:** plan y rutina accionables, seguimiento de progreso, conversación con IA contextualizada (objetivo: que el modelo “entienda” plan + historial con el tiempo).
2. **Plataforma:** retención por hábito + datos; ingresos por suscripción y **comisión** sobre ventas de contenido/servicios de terceros.
3. **Coach / creador (futuro):** audiencia dentro de 2fit, herramientas para vender planes/programas, posible portal aparte para gestión (ya anticipado en roadmap).

---

## 2. Pilares del producto

| Pilar | Descripción | Estado típico (2026) |
|-------|-------------|----------------------|
| **Core training** | Catálogo de ejercicios, planes (editoriales + generados), player, progreso básico | Implementado en parte; ver dominio workouts |
| **Inteligencia** | IA coach, límites por tier, adaptación de plan | Parcial (chat existe; contexto plan/progreso en evolución) |
| **Progreso medible** | Sesiones, métricas derivadas, opcional peso/medidas/fotos | Sesiones sí; agregados avanzados pendientes |
| **Monetización** | Freemium, premium, marketplace con comisión | Diseñado en roadmap; Stripe pendiente |
| **Comunidad** | Feed, retos sociales, seguimiento | Roadmap fase tardía |
| **Ecosistema creadores** | Coaches verificados, ventas, comisiones | Roadmap + decisión de app separada para trainers |

---

## 3. Modelo de negocio (intención)

- **Suscripción** al producto (IA ilimitada, historial, features premium).
- **Marketplace:** planes, programas u ofertas de coaches; **comisión pequeña** por transacción (ej. referencia en roadmap 70/30 trainer/plataforma — ajustable según mercado y costos).
- **2fit** como **intermediario de confianza**: pagos, desbloqueo de contenido, métricas de uso para el coach.

*Detalle fiscal, contratos con coaches y KYC/verificación son decisiones de negocio/legal fuera de este doc técnico.*

---

## 4. Mapa de aplicaciones (evolución)

Hoy: **una PWA Next.js** (usuario) + **API Flask** + workers.

Futuro probable:

- **App usuario (actual):** sigue siendo el hub principal.
- **Portal coaches (web separada):** ya previsto en roadmap — evita mezclar roles y permisos complejos en la misma codebase de consumo.

Opcional más adelante: apps nativas si el tráfico y el equipo lo justifican; no es prerequisito de la visión de marketplace.

---

## 5. Riesgos y dependencias

- **Calidad del catálogo:** la generación y el análisis por músculo dependen de etiquetas consistentes (`domain/workouts-and-progress.md`).
- **Confianza en IA:** límites claros (no es médico), cumplimiento y mensajes de seguridad.
- **Complejidad marketplace:** pagos, reembolsos, disputas, comisiones y reporting — mejor en fase dedicada (roadmap Fase 3+).
- **Comunidad:** moderación, privacidad, RGPD/consentimiento en feeds.

---

## 6. Horizonte ~6 meses (acordado con producto)

Objetivo: **base sólida** — tracking coherente, generación de planes, UI funcional y responsive, métricas derivadas donde aplique, e **IA básica pero con camino** hacia coach virtual con contexto real.

- **Marketplace / monetización con coaches:** **fuera** de este tramo; reactivar cuando haya despliegue estable y del orden de **~10 usuarios freemium** (validación real de issues).
- **Comunidad:** solo **actividad privada** al usuario; a corto plazo, como mucho **insights agregados** (“qué programas o workouts usa más la base”) sin feed social ni perfiles públicos.
- **Portal de coaches (web aparte):** sigue siendo **referencia de largo plazo** (véase [`roadmap.md`](roadmap.md)); no bloquea el trabajo actual.
- **ADR / decisiones formales en repo:** **baja prioridad** mientras no haya tracción; la documentación en `docs/ai/` basta.

---

## 7. Visión IA (largo plazo, más allá de “chatbot”)

Dirección deseada: un **coach virtual** que use datos del usuario (plan, semana, historial, métricas derivadas) para **ajustar lo que ve** el usuario y, a medio plazo, **proponer cambios de plan** (carga, repeticiones, progresión) con **hechos** inyectados por backend para limitar alucinaciones. El alcance es grande y se desglosará en entregables incrementales; ver [`design/analytics-layer.md`](design/analytics-layer.md) para cómo los agregados alimentan ese contexto.

---

## 8. Decisiones abiertas (cuando toque marketplace / coaches)

1. Verificación de coaches, comisión por categoría, modelo de feed si en el futuro hay comunidad pública.
2. Si los creadores podrán definir reglas o tono de IA para sus clientes.

*(No hace falta cerrarlas hasta acercarse a marketplace.)*

---

## 9. Cómo usar este doc en el día a día

- **Roadmap** = *cuándo* y *qué* en el horizonte ~12 meses.
- **Este archivo** = *hacia dónde* va el ecosistema y *cómo* encajan marketplace y comunidad (cuando aplique).
- **Dominio workouts** = *qué hay hoy* en código para no sobreprometer en demos.

Actualizar este archivo cuando cambie la estrategia comercial o el alcance de “solo B2C” vs “B2B2C con coaches”.
