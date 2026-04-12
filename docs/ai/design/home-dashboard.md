# Diseño — Home Dashboard

**Versión:** 1.1  
**Fecha:** Abril 2026  
**Estado:** Diseño base + **implementación mayor** — ver [`home-refactor-implementation.md`](./home-refactor-implementation.md) para lo entregado en código, APIs y pendientes.

---

## Inspiración Visual

- **Nike Training Club:** Cards limpias, tipografía bold grande, mucho espacio negativo, CTA claros
- **Thenx:** Orientado a acción inmediata, el workout del día es el hero del home
- **Whoop:** Datos presentados de forma clara y motivacional, no abrumadora

---

## Principios de Diseño para el Home

1. **Una acción principal visible** — el usuario debe saber qué hacer sin scrollear
2. **Datos contextuales, no información** — no listas de datos; insights accionables
3. **El AI trainer es un compañero, no un chatbot** — su presencia en el home debe sentirse como un coach real esperando
4. **Estados vacíos cuidados** — si no hay workout del día, la card explica por qué y qué hacer
5. **Mobile primero** — todo debe verse perfecto en 390px de ancho antes de pensar en desktop

---

## Paleta de Colores

| Uso | Color | Tailwind |
|-----|-------|---------|
| Fondo principal | Blanco | `bg-white` |
| CTA principal | Verde | `bg-green-500` / `#22C55E` |
| Texto primario | Negro | `text-gray-900` |
| Texto secundario | Gris | `text-gray-500` |
| Cards | Blanco con sombra | `bg-white shadow-sm` |
| Acento dark | Negro | `bg-gray-900` (botones dark) |

---

## Tipografía

| Elemento | Estilo | Tailwind |
|---------|-------|---------|
| Nombre del usuario | Bold, grande | `text-4xl font-bold` |
| Títulos de cards | Bold, medio | `text-xl font-bold` |
| Subtítulos / labels | Regular, gris | `text-sm text-gray-500` |
| CTA buttons | Semibold | `font-semibold` |
| Greeting ("Buenos Días") | Regular, gris | `text-2xl text-gray-500` |

---

## Layout Mobile (390px)

### Zona 1 — Header (Greeting + Search)
```
┌─────────────────────────────────┐
│                                 │
│  Buenos Días ☀️                  │
│  Nombre Usuario              🔍 │
│                                 │
└─────────────────────────────────┘
```
- Padding horizontal: `px-6`
- El saludo y el nombre centrados verticalmente en su espacio (`min-h-[20vh]`)
- Search icon alineado verticalmente con el bloque de texto
- Ya implementado y corregido ✅

---

### Zona 2 — Workout del Día (Hero Card)
```
┌─────────────────────────────────┐
│  ┌───────────────────────────┐  │
│  │  📅 Día 3 de 30           │  │
│  │                           │  │
│  │  Upper Body Strength      │  │
│  │  45 min · 6 ejercicios    │  │
│  │                           │  │
│  │  ██████████████████████   │  │  ← Progreso del plan
│  │  [▶  Empezar sesión    ]  │  │  ← CTA verde, full width
│  └───────────────────────────┘  │
└─────────────────────────────────┘
```
- Card con `rounded-2xl`, sombra sutil
- Si no hay plan generado: card con CTA para "Generar mi plan con AI"
- Si el workout del día ya fue completado: mostrar estado de completado + motivación

---

### Zona 3 — Racha & Stats
```
┌─────────────────────────────────┐
│  🔥 Racha: 5 días   │  3 sesiones esta semana  │
└─────────────────────────────────┘
```
- **Implementado:** componente `HomeStatsRow` — card blanca con tres columnas (llama / calendario / trofeo), tipografía alineada al resto del home, animación al subir números.
- **Datos:** "esta semana" puede alimentarse desde weekly progress; racha y total requieren endpoint agregado (ver doc de implementación).
- Si no hay racha: copy tipo "¡Empieza hoy!" / i18n `home.stats.streakEmpty`.

---

### Zona 4 — AI Trainer Card
```
┌─────────────────────────────────┐
│  ┌───────────────────────────┐  │
│  │  🤖  (avatar dark)        │  │
│  │                           │  │
│  │  ¡Sigue con el excelente  │  │
│  │  trabajo!                 │  │
│  │  Every workout is         │  │
│  │  progress, no matter      │  │
│  │  how small.               │  │
│  │                           │  │
│  │  Habla con tu entrenador  │  │
│  │  [¡Charlemos!]            │  │
│  └───────────────────────────┘  │
└─────────────────────────────────┘
```
- El mensaje debe ser dinámico (generado por AI según el contexto del usuario)
- El avatar es oscuro/negro para contraste con el fondo blanco
- El botón "¡Charlemos!" es verde

---

### Zona 5 — Explorar Ejercicios
```
┌─────────────────────────────────┐
│  Explora nuestra biblioteca  →  │
│                                 │
│  [Card] [Card] [Card]           │  ← Scroll horizontal
└─────────────────────────────────┘
```
- Header con "Ver todo" a la derecha
- Si no hay contenido: mensaje de "Próximamente" digno (no texto plano)

---

### Zona 6 — Entrenamientos Guardados
```
┌─────────────────────────────────┐
│  Entrenamientos guardados    →  │
│                                 │
│  [Card] [Card] [Card]           │
└─────────────────────────────────┘
```
- Similar a la zona anterior
- Estado vacío cuidado con CTA para explorar

---

## Layout Desktop

En desktop, el layout cambia a dos columnas:

```
┌──────────────────┬──────────────────┐
│  Greeting        │  AI Trainer Card │
│  + Stats         │                  │
├──────────────────┴──────────────────┤
│  Workout del Día (full width)       │
├─────────────────────────────────────┤
│  Ejercicios (grid)                  │
├─────────────────────────────────────┤
│  Entrenamientos guardados (grid)    │
└─────────────────────────────────────┘
```

- El greeting ocupa `flex-1` de la columna izquierda
- La AI trainer card está al lado derecho (ya existe parcialmente)
- El workout del día va debajo, a full width

---

## Estados Vacíos

Cada sección debe tener un estado vacío digno:

| Sección | Estado vacío |
|---------|-------------|
| Workout del día | Card con "No tienes plan aún" + CTA "Generar mi plan con AI" |
| Racha | "¡Hoy es un buen día para empezar tu racha!" |
| Ejercicios | "Pronto tendrás acceso a miles de ejercicios" (con ilustración o icono) |
| Entrenamientos guardados | "Guarda tus workouts favoritos para acceder rápido" |

---

## Animaciones / Interacciones

- Transiciones suaves en cards: `transition-all duration-200`
- El CTA de workout tiene feedback haptico (si lo soporta el dispositivo, via API web)
- El streak counter puede tener una animación de fuego sutil
- No usar animaciones pesadas — el app debe sentirse rápido

---

## Notas de Implementación

- No usar carousel en el hero — una card clara es mejor que un carrusel escondido
- Evitar `overflow-hidden` en el contenedor del home — puede cortar sombras de cards
- Los datos del workout del día vienen del backend; si no hay respuesta, mostrar skeleton loader
- El mensaje del AI trainer puede ser cacheado por TanStack Query con `staleTime: 1000 * 60 * 60` (1 hora)
