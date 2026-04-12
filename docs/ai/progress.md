# 2fit — Estado de Progreso

**Última actualización:** Abril 2026

Leyenda: ✅ Hecho | 🔄 En progreso | ⏳ Pendiente | ❌ No iniciado

---

## Módulos del Producto

### Autenticación & Sesión
| Feature | Estado | Notas |
|---------|--------|-------|
| Login con email/password | ✅ | Funcional |
| Login con Google OAuth | ✅ | Funcional |
| Registro con wizard (11 pasos) | ✅ | Steps 0–10 implementados |
| Forgot password (4 pasos) | ✅ | Flujo completo |
| Re-auth flow | ✅ | Implementado |
| JWT backend + NextAuth frontend | ✅ | Integrados |
| Mejoras de seguridad (refresh tokens, etc.) | ⏳ | Planificado por separado |

---

### Home / Dashboard
| Feature | Estado | Notas |
|---------|--------|-------|
| Greeting section (Buenos Días + nombre) | ✅ | `px-6`, i18n, iconos accesibles |
| Motivación AI card | ✅ | Frases desde i18n; título invitado `headlineGuest` |
| Workout del día (hero) | ✅ | `WorkoutHeroCard` + `weekly-progress` / plan activo |
| Explora + niveles de entrenamiento | ✅ | APIs `home/explore`, `home/by-level`; cards discovery |
| Stats row (racha / semana / total) | 🔄 | UI `HomeStatsRow` + animación; **racha y total** pendientes de API; semana derivada de weekly progress |
| Streak real (backend) | ⏳ | Ver endpoint `home-stats` en [`design/home-refactor-implementation.md`](./design/home-refactor-implementation.md) |
| CTA workout del día | ✅ | Continuar sesión / generar plan |
| Challenge progress en home | ✅ | Batch API; bloque oculto si no hay challenges |
| Espaciado / tipografía unificados | ✅ | `px-6`, escala tipo +25% (excepto «Ver todo») |
| i18n niveles (beginner → Principiante, etc.) | ✅ | `translateFitnessLevel.ts` |
| **Redesign home (fase actual)** | ✅ | Iteración mayor entregada; seguir con datos agregados y pulido |

---

### Workouts & Rutinas
| Feature | Estado | Notas |
|---------|--------|-------|
| Listado de workouts | 🔄 | Básico, necesita refactor |
| Workout player (timers, descansos) | 🔄 | Existe pero necesita mejora |
| Plan de workout personalizado | ✅ | Generado en backend al registrar (`WorkoutPlanGenerator`); heurístico, no LLM |
| Historial de sesiones completadas | 🔄 | Modelo `CompletedWorkout` + API; exposición/UI incompleta |
| Challenges | 🔄 | Básico |
| Generación de plan inicial (onboarding data) | ✅ | `fitness_level`, `fitness_goal`, `available_days` → plan activo |

---

### AI Personal Trainer
| Feature | Estado | Notas |
|---------|--------|-------|
| Chat UI | 🔄 | Existe, necesita mejora |
| OpenAI chat completions | ✅ | `chat_service.py` funcional |
| Historial de conversaciones en DB | ✅ | Modelo `Conversation/Message` |
| Contexto del usuario en el prompt | ❌ | Bot no conoce plan/progreso aún |
| Límites por tier (free vs premium) | ❌ | No implementado |
| Transcripción por voz (Whisper) | 🔄 | Endpoint existe, no integrado en UI |
| Análisis semanal generado por AI | ❌ | Fase 2 |
| Vision API (análisis de forma) | ❌ | Fase 4 |

---

### Progreso & Stats
| Feature | Estado | Notas |
|---------|--------|-------|
| Modelo `Progress` en DB | 🔄 | `DayProgress` / `ExerciseProgress` / `ActivePlan`; agregados por músculo no calculados |
| Entrada manual de progreso (peso, medidas) | ❌ | No implementado |
| Auto-tracking desde workout log | 🔄 | Progreso por ejercicio/sesión existe; agregados y KPIs avanzados pendientes |
| Dashboard de progreso con gráficas | ❌ | No implementado |
| Fotos de progreso | ❌ | No implementado |
| Streak / gamificación | 🔄 | UI en home (`HomeStatsRow`); lógica y persistencia agregadas pendientes |

---

### Perfil de Usuario
| Feature | Estado | Notas |
|---------|--------|-------|
| Ver perfil | 🔄 | Básico |
| Editar perfil | 🔄 | Básico |
| Foto de perfil | 🔄 | Azure Blob integrado parcialmente |
| Configuración de notificaciones | 🔄 | OneSignal básico |
| Configuración de seguridad | 🔄 | Básico |

---

### Notificaciones
| Feature | Estado | Notas |
|---------|--------|-------|
| Push notifications (OneSignal) | 🔄 | Funcional básico |
| Celery tasks para notificaciones | 🔄 | Worker configurado |
| Notificaciones personalizadas/contextuales | ❌ | Fase 2 |
| Email transaccional (SendGrid) | 🔄 | Básico |
| SMS (Twilio) | 🔄 | Básico |

---

### Premium & Monetización
| Feature | Estado | Notas |
|---------|--------|-------|
| UI de planes premium | 🔄 | Pantalla existe, sin funcionalidad real |
| Stripe integration | ❌ | No implementado |
| Modelo `Subscription` en DB | ❌ | No implementado |
| Feature gating por tier | ❌ | No implementado |
| Marketplace de planes | ❌ | Fase 3 |

---

### Comunidad & Trainers
| Feature | Estado | Notas |
|---------|--------|-------|
| Feed de actividad | ❌ | Fase 4 |
| Challenges grupales | ❌ | Fase 4 |
| Seguir usuarios/trainers | ❌ | Fase 4 |
| Portal web de trainers | ❌ | Fase 4, app separada |

---

## Infraestructura & DevOps
| Feature | Estado | Notas |
|---------|--------|-------|
| Docker Compose (5 servicios) | ✅ | frontend, backend, worker, postgres, redis |
| Alembic migrations | ✅ | Configurado |
| Azure Blob Storage | ✅ | Configurado |
| CI/CD | ❌ | No configurado |
| Staging environment | ❌ | No configurado |
| Producción | ❌ | No desplegado |

---

## Resumen por Fase del Roadmap

| Fase | Descripción | Estado |
|------|------------|--------|
| Fase 1 (Meses 1–3) | Fundación y experiencia core | 🔄 En progreso |
| Fase 2 (Meses 4–6) | Progreso e inteligencia | ❌ No iniciada |
| Fase 3 (Meses 7–9) | Monetización | ❌ No iniciada |
| Fase 4 (Meses 10–12) | Comunidad y trainers | ❌ No iniciada |
