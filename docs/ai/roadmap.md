# 2fit — Product Roadmap (12 meses)

**Última actualización:** Abril 2026

---

## Visión del Producto

2fit no es solo un tracker de workouts. Es un **ecosistema fitness personalizado** donde el usuario tiene un entrenador AI siempre disponible, un plan que se adapta a su progreso real, y eventualmente una comunidad y acceso a trainers humanos.

**Inspiración:** Nike Training Club + Thenx + Whoop, pero con AI generativa en el centro de cada decisión del producto.

**Plataforma:** Mobile-first PWA (instalable en Android/iOS), con soporte desktop.

---

## Perfil de Usuario

- Principiantes y personas con experiencia que buscan mejorar
- El app se adapta al nivel declarado en el onboarding y evoluciona con el progreso real

---

## Arquitectura del Ecosistema (Norte)

```
┌─────────────────────────────────────────────────────┐
│              App Usuario — Mobile/PWA               │
│  Dashboard │ AI Trainer │ Workouts │ Progreso       │
│  Comunidad │ Premium │ Marketplace                  │
└──────────────────────┬──────────────────────────────┘
                       │
┌──────────────────────▼──────────────────────────────┐
│              Portal Trainers — Web                  │
│  Dashboard │ Gestión Usuarios │ Builder de Planes   │
│  Analytics │ Mensajería                             │
└──────────────────────┬──────────────────────────────┘
                       │
┌──────────────────────▼──────────────────────────────┐
│              Backend — Flask API                    │
└──────┬───────────────────────────┬──────────────────┘
       │                           │
  PostgreSQL                  OpenAI / Celery / Redis
```

---

## Modelo de Monetización

```
Free Tier
  └─ Plan AI básico generado una vez
  └─ Chat con AI limitado (X mensajes/día)
  └─ Historial 30 días

Premium ($)
  └─ AI sin límites
  └─ Análisis semanal generado por AI
  └─ Historial completo
  └─ Planes especializados

Pro + Trainers ($$)
  └─ Todo Premium
  └─ Acceso a trainers humanos verificados
  └─ Planes exclusivos de trainers

Marketplace (transaccional)
  └─ Compra de planes/cursos de trainers
  └─ One-time payments
  └─ Comisión 70/30 (trainer/plataforma)
```

**Base técnica:** `subscription_tier` en el modelo `User`, validado server-side. Feature flags no hardcodeados en el frontend.

---

## Fase 1 — Fundación y Experiencia Core (Meses 1–3)

**Objetivo:** App usable, atractiva y con la base técnica correcta.

### Home Dashboard Redesign *(inmediato)*
- Layout inspiracional con métricas clave del día
- Streak del usuario, próximo workout, mensaje AI motivacional
- Estructura de cards reutilizables y componentes atómicos
- Mobile-first; desktop soportado sin sacrificar mobile UX

### Workouts & Rutinas (Refactor)
- Modelos: `WorkoutPlan`, `Exercise`, `Session`, `UserWorkoutLog`
- Generación de plan inicial basado en datos del registro (nivel, objetivos, disponibilidad)
- Player de workout mejorado: timers, descansos, progresión clara
- Historial de sesiones completadas

### AI Personal Trainer v1
- Contexto persistente por usuario (historial de conversaciones en DB)
- Prompt engineering: el bot conoce el plan actual, progreso y objetivos del usuario
- Chat UI mejorado en `(app)/chat/`
- Free tier: límite de mensajes/día; Premium: ilimitado

### Auth & Perfil (Refinamiento)
- Onboarding data completa desde el wizard de 11 pasos
- Foto de perfil, preferencias de notificación
- Re-auth y flujo de recuperación de contraseña pulidos

---

## Fase 2 — Progreso & Inteligencia (Meses 4–6)

**Objetivo:** El app aprende del usuario y adapta la experiencia.

### Tracking de Progreso
- Modelos: `ProgressEntry` (peso, medidas, fotos de progreso), `WorkoutStats`
- Dashboard de progreso: gráficas de fuerza, cardio, peso corporal
- Auto-tracking desde el workout log (no depende de entrada manual)

### AI Personal Trainer v2 (Adaptativo)
- El plan se ajusta automáticamente según: workouts completados, feedback post-sesión, progreso medido
- Análisis semanal generado por AI: "Esta semana mejoraste X, te recomiendo Y"
- Voz: transcripción con Whisper para consultas por voz al trainer

### Notificaciones Inteligentes
- Recordatorios personalizados basados en hábitos del usuario (no genéricos)
- Celery tasks para push notifications contextuales con OneSignal
- Mensajes motivacionales generados por AI

### Gamificación
- Racha de días (streak)
- Hitos de progreso y badges
- Refuerzo positivo para retención a largo plazo

---

## Fase 3 — Monetización (Meses 7–9)

**Objetivo:** Revenue sostenible sin comprometer la experiencia.

### Sistema de Pagos
- Stripe para suscripciones (mensual/anual)
- Webhooks procesados con Celery
- Modelo `Subscription` en DB
- UI de upgrade en `(app)/premium/`

### Feature Gating
- Middleware server-side que valida `subscription_tier`
- Respuestas 402/403 claras desde el backend cuando el usuario excede límites
- Frontend muestra prompts de upgrade contextuales (no intrusivos)

### Marketplace de Planes (Base)
- Trainers pueden subir planes/programas
- Usuarios pueden comprarlos (one-time payment via Stripe)
- Modelos: `TrainerPlan`, `Purchase`

---

## Fase 4 — Comunidad & Trainers (Meses 10–12)

**Objetivo:** Red social fitness y apertura a trainers externos.

### Comunidad
- Feed de actividad: workouts completados, logros, rachas
- Challenges grupales con leaderboard
- Seguir a otros usuarios y trainers

### Portal de Trainers (Web — Plataforma Separada)
- Next.js app independiente para trainers verificados
- Dashboard: usuarios suscritos, progreso de cada uno
- Builder de planes drag & drop
- Mensajería trainer ↔ usuario
- Analytics de engagement por plan

### AI Personal Trainer v3 (Vision)
- Análisis de forma/técnica via cámara usando OpenAI Vision API
- Feedback en tiempo real durante el workout
- Detección de reps (experimental)

---

## Decisiones Clave de Producto

| Decisión | Elección | Razón |
|----------|---------|-------|
| Portal trainers | App web separada | Workflows distintos; evita complejidad de roles en app del usuario |
| Monetización base | Freemium + suscripciones | Flexible para diversificar sin rediseñar el ecosistema |
| AI model | OpenAI GPT-4o | Mejor calidad chat + soporte Vision + Whisper nativo |
| Contexto AI | PostgreSQL (Conversation/Message) | Full history, sin vector DB externo en fase inicial |
| Mobile delivery | PWA (Next.js) | Instalable en Android/iOS sin costo de app nativa |

---

## Lo que NO es 2fit

- No es un CRUD app que lista planes y workouts estáticos
- No es un reemplazo de un gym físico
- No es una app de dietas o nutrición (al menos en el año 1)
- No tiene trainers en tiempo real en fase 1 (eso es fase 4)
