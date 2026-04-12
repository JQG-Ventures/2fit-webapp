# Taxonomía de músculos v1 — granularidad media / mapa corporal

**Última actualización:** Abril 2026  
**Relacionado:** [`exercise-catalog-strategy.md`](./exercise-catalog-strategy.md)

---

## 1. Principios

- **Códigos estables** (`snake_case`) en backend y API; son la clave para **i18n en el frontend** (`muscles.codes.{code}` en archivos de locale).
- **Etiqueta en API:** un solo campo inglés `name` (base para logs/admin); **no** se duplican idiomas en BD — las traducciones viven en `frontend/public/locals/*/global.json` (y futuros idiomas).
- **Pecho:** separado en **parte alta / parte baja** para ejercicios y mapa; el string legacy genérico `"chest"` en `exercises.muscle_group` se expande a ambos códigos al generar `exercise_muscles`.
- **Pierna:** además de cuádriceps / isquios / glúteos / gemelos, **adductors** (aductores / cara interna) y **shins** (tibia / parte frontal de la pierna).
- **Media:** placeholders hasta Azure; ETL externo pospuesto.

---

## 2. Lista v1 (~20 códigos)

| Código | `name` (EN, API) | Región | Cluster visual | Heatmap slot |
|--------|------------------|--------|----------------|--------------|
| `upper_chest` | Upper chest | upper | chest | upper_chest |
| `lower_chest` | Lower chest | upper | chest | lower_chest |
| `upper_back` | Upper back | upper | back | upper_back |
| `lats` | Lats | upper | back | lats |
| `mid_back` | Mid back | upper | back | mid_back |
| `lower_back` | Lower back | upper | back | lower_back |
| `deltoid_anterior` | Front deltoid | upper | shoulders | deltoid_front |
| `deltoid_lateral` | Side deltoid | upper | shoulders | deltoid_side |
| `deltoid_posterior` | Rear deltoid | upper | shoulders | deltoid_rear |
| `biceps` | Biceps | upper | arms | biceps |
| `triceps` | Triceps | upper | arms | triceps |
| `forearms` | Forearms | upper | arms | forearms |
| `quadriceps` | Quadriceps | lower | legs | quadriceps |
| `hamstrings` | Hamstrings | lower | legs | hamstrings |
| `glutes` | Glutes | lower | legs | glutes |
| `adductors` | Adductors | lower | legs | adductors |
| `calves` | Calves | lower | legs | calves |
| `shins` | Shins | lower | legs | shins |
| `abs` | Abs | core | core | abs |
| `obliques` | Obliques | core | core | obliques |

**Clusters** para UI: `chest`, `back`, `shoulders`, `arms`, `core`, `legs`.

---

## 3. i18n (frontend)

- Usar **`code`** como clave: `t('muscles.codes.upper_chest')`, etc.
- Archivos base: `public/locals/en/global.json` y `public/locals/es/global.json` bajo `muscles.codes`.
- Nuevos idiomas: copiar el bloque `muscles.codes` sin tocar backend.

---

## 4. Implementación

- `backend/app/constants/muscle_taxonomy.py` — `MUSCLES_V1`, `LEGACY_MUSCLE_STRING_TO_CODES`.
- Tablas `muscles` (columna `name`, sin `name_es`), `exercise_muscles`.
- `ensure_muscles_seeded` elimina filas cuyo `code` ya no está en la taxonomía (p. ej. migración desde `chest` único).
- `GET /api/exercises/muscles/taxonomy` devuelve `code`, `name`, regiones y slots.

---

## 5. Migración BD existente

Si la tabla `muscles` tenía `name_en` / `name_es`:

```sql
ALTER TABLE muscles DROP COLUMN IF EXISTS name_es;
ALTER TABLE muscles RENAME COLUMN name_en TO name;
```

Luego ejecutar `seed.py` o llamar a `ensure_muscles_seeded` para datos al día.

---

## 6. Próximos pasos

1. Opcional: editar `exercises.muscle_group` en seed para etiquetas más finas (`upper chest`, etc.).
2. Actualizar `WorkoutPlanGenerator` para usar `exercise_muscles` o códigos cuando toque el rework de planes.
