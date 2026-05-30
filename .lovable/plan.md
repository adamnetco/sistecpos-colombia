# Plan: Cualificación completa de demo + paridad con panel franquicia

## 1. Comparación de campos (auditoría)

| # | Campo en licenciaspos.online (3 pasos) | ¿Lo tenemos en /lp/demo? | Acción |
|---|---|---|---|
| 1 | Nombre y apellidos | ✅ `fullName` | OK |
| 2 | Correo + Confirmar correo | ✅ `email` (sin confirmación) | OK (duplicamos al enviar) |
| 3 | Nombre del negocio (máx 15) | ⚠️ `businessName` máx 30 | **Bajar a 20** y avisar al usuario |
| 4 | Tipo de negocio | ✅ `businessType` | OK (ya sincronizado) |
| 5 | País | ✅ `country` | OK |
| 6 | Ciudad | ✅ `city` | OK |
| 7 | WhatsApp (+57) | ✅ `whatsapp` | OK |
| 8 | a) ¿Maneja algún software? Sí/No | ❌ Falta | **Agregar** |
| 9 | b) ¿Sabe inventarios/ganancias/pérdidas? Sí/No | ❌ Falta | **Agregar** |
| 10 | c) Mayor inconveniente (texto largo) | ❌ Falta | **Agregar** |
| 11 | d) ¿Qué debe tener su POS ideal? (texto) | ❌ Falta | **Agregar** |
| 12 | e) Ventas promedio/día (1-30, 31-60, 61-100, +100) | ❌ Falta | **Agregar select** |
| 13 | f) Cuántos empleados (Ninguno, 1-3, 4-10, +10) | ❌ Falta | **Agregar select** |
| 14 | g) ¿En cuánto tiempo quiere sistematizar? | ❌ Falta | **Agregar select** |
| 15 | h) Antigüedad negocio (número + Meses/Años) | ❌ Falta | **Agregar 2 campos** |

## 2. Cambios en el formulario público `/lp/demo`

- Convertir `LandingDemoPage.tsx` en wizard de **2 pasos** (la UX actual + paso de cualificación), barra de progreso simple `1/2 · 2/2`.
- **Paso 1** (igual al actual) con un solo cambio: `businessName` `max(20)` y helper "Máx. 20 caracteres (límite de la plataforma)".
- **Paso 2 — Cualificación** (los 8 campos a–h). Todos opcionales salvo a, b, e, f, g, h (igual que el externo). Mismas etiquetas y opciones literales para que el copy-paste sea 1:1.
- Al enviar se guardan en `leads_trials` (columnas nuevas, ver §4) y se mantiene el flujo de notify-new-lead.
- Replicar el paso 2 en `ResellerDemoRequestView.tsx` (mismo componente compartido).

## 3. Centralizar opciones

Nuevo archivo `src/data/demoQualifyingOptions.ts` con los selects exactos del panel externo (`SALES_PER_DAY`, `EMPLOYEES`, `TIME_TO_SYSTEMATIZE`, `BUSINESS_AGE_PERIOD`) para mantener paridad literal.

## 4. Persistencia

Migración: agregar a `leads_trials` columnas `qual_has_software boolean`, `qual_knows_inventory boolean`, `qual_main_pain text`, `qual_ideal_pos text`, `qual_sales_per_day text`, `qual_employees text`, `qual_time_to_systematize text`, `qual_business_age_value int`, `qual_business_age_period text`. Todas nullables, sin romper inserts existentes.

## 5. Panel de Contactos — Copiar/Pegar para licenciaspos.online

En `ContactDetailPanel.tsx`, extender el mini-panel "Reenviar al Panel Franquiciado" con una segunda sección **"Paso 3 — Cualificación"** que muestra cada respuesta del lead con su botón Copiar:

- a) ¿Maneja software? → "Sí"/"No"
- b) ¿Conoce inventarios…? → "Sí"/"No"
- c) Mayor inconveniente → texto del usuario (botón Copiar)
- d) POS ideal → texto del usuario (botón Copiar)
- e) Ventas/día → opción
- f) Empleados → opción
- g) Tiempo para sistematizar → opción
- h) Antigüedad → "N Meses/Años"

Cada item con el mismo patrón visual (border-amber → border-emerald al copiar) ya implementado. Si el lead no respondió un campo, se muestra deshabilitado con tag "Sin respuesta".

## 6. UX/UI

- Wizard con dos botones grandes "Atrás / Siguiente / Finalizar" (mobile-first).
- Validación del paso 1 antes de pasar al 2.
- Mensaje en el paso 2: "Estas preguntas nos ayudan a asesorarte mejor. Toma 30 segundos."
- En admin, badge "✅ Cualificado" si el lead respondió el paso 2; "⚠️ Sin cualificar" si no.

## Archivos a tocar
- `src/pages/LandingDemoPage.tsx` (wizard + paso 2)
- `src/components/reseller/ResellerDemoRequestView.tsx` (mismo paso 2)
- `src/data/demoQualifyingOptions.ts` (nuevo)
- `src/components/admin/ContactDetailPanel.tsx` (sección Copiar Paso 3)
- Migración SQL en `leads_trials`

¿Apruebas para implementar?
