## Objetivo

Aprovechar el JSON que expone el panel franquiciado (`show_encuesta({...})`) para:

1. Importar/actualizar contactos en SistecPOS con todos los campos de cualificación ya respondidos.
2. Unificar el mapeo entre los 3 orígenes: panel franquiciado, `/lp/demo` propio, y formulario de prospección externo.
3. Dejar trazabilidad bidireccional (token, reseller_id, store_id, license).

## Mapeo de campos (fuente → SistecPOS)


| JSON panel franquiciado              | Tabla / Columna SistecPOS                                             |
| ------------------------------------ | --------------------------------------------------------------------- |
| `id`                                 | `leads_trials.external_lead_id` (nuevo)                               |
| `reseller_id`, `reseller_name`       | `leads_trials.external_reseller_id`, `external_reseller_name` (nuevo) |
| `store_id`, `store`, `store_name`    | `leads_trials.external_store_id`, `pos_store`, `pos_store_internal`   |
| `name` + `last_names`                | `contact_name` / `contacts.full_name`                                 |
| `phone`, `email`                     | `phone`, `email`                                                      |
| `city`, `country`                    | `city`, `country`                                                     |
| `license` (hash 32)                  | `leads_trials.license_key_external`                                   |
| `token`                              | `activation_token` (ya existe)                                        |
| `password` (hash)                    | `pos_password_hash_external` (solo lectura, no descifrable)           |
| `status` ("SIN CONTACTAR"…)          | mapear a `pipeline_stage`                                             |
| `day_demo` ("demo_day_14")           | `trial_ends_at` calculado                                             |
| `created_at`, `updated_at`           | `external_created_at`, `external_updated_at`                          |
| `name_lang_key` ("Restaurante")      | `business_type`                                                       |
| `manage_software` (Si/No)            | `qual_has_software`                                                   |
| `software_ideal`                     | `qual_ideal_pos`                                                      |
| `change_software_description`        | `qual_main_pain`                                                      |
| `know_inventory` (Si/No)             | `qual_inventory_knowledge`                                            |
| `how_employees`                      | `qual_staff_count`                                                    |
| `in_time_systematize`                | `qual_time_to_start`                                                  |
| `business_time`                      | `qual_business_age`                                                   |
| `nom_sale` ("1-30"…)                 | `qual_sales_per_day`                                                  |
| `description`                        | `qual_notes`                                                          |
| `profile_id`, `is_active`, `deleted` | metadata cruda en `external_payload jsonb`                            |


## Entregables

### 1. Migración DB

- Añadir a `leads_trials`: `external_lead_id int`, `external_reseller_id int`, `external_reseller_name text`, `external_store_id int`, `pos_store_internal text`, `license_key_external text`, `pos_password_hash_external text`, `external_created_at timestamptz`, `external_updated_at timestamptz`, `external_payload jsonb`, `external_status text`.
- Índice único parcial sobre `external_lead_id` para evitar duplicados.
- Función `public.upsert_lead_from_external_json(_payload jsonb)` (SECURITY DEFINER, solo admin):
  - busca por `external_lead_id` → si no existe, por `email`/`phone`.
  - hace `INSERT` o `UPDATE` con merge no destructivo.
  - sincroniza `contacts` vía el trigger existente `sync_lead_to_contact`.
  - devuelve `{action: 'created'|'updated'|'skipped', lead_id, contact_id}`.

### 2. UI Admin — "Importar desde Panel Franquiciado"

Ubicación: `ContactsView.tsx` (junto al botón "Importar Excel" ya existente).

Nuevo componente: `src/components/admin/contacts/ExternalSurveyImportDialog.tsx`

- Textarea: el admin pega el `show_encuesta('{...}')` completo o solo el JSON.
- Parser tolerante: si detecta `show_encuesta(`, extrae lo que está entre comillas y hace `JSON.parse`.
- Vista previa lado-a-lado: campo → valor → estado (Nuevo / Existente: valor actual vs nuevo).
- Confirmación por campo (checkbox "actualizar este campo") antes de ejecutar.
- Llama a `upsert_lead_from_external_json`.
- Soporta **lote**: pegar un array JSON `[{...}, {...}]`.

### 3. Bookmarklet para el admin (1-clic desde el panel franquiciado)

Documentado en una nueva tarjeta dentro de `ContactDetailPanel.tsx` → "Herramientas Franquicia":

```js
javascript:(()=>{const o=window.show_encuesta;window.show_encuesta=d=>{navigator.clipboard.writeText(d);alert('Encuesta copiada. Pega en SistecPOS.');};})()
```

El admin lo instala una vez; al hacer clic en la fila del panel franquiciado, el JSON se copia al portapapeles en vez de abrir el modal de encuesta. Luego pega en SistecPOS.

### 4. Endpoint público de captura (para flujos sin pasar por /lp/demo)

Edge function `ingest-external-lead`:

- Recibe `POST` con el mismo JSON + header `x-franchise-token` (secret nuevo `FRANCHISE_INGEST_TOKEN`).
- Llama a `upsert_lead_from_external_json`.
- Permite que el panel franquiciado (o un Zapier/n8n) empuje leads automáticamente.

### 5. Unificación con `/lp/demo`

- `LandingDemoPage.tsx` ya guarda `qual_*`. Reusar exactamente los mismos nombres internos para que el importador y el formulario propio escriban en las mismas columnas.
- En `demoQualifyingOptions.ts`, añadir mapeo `externalValueMap` para traducir valores del panel ("1-30", "1 mes", "1 año(s)") a los `value` internos.

### 6. Visualización en ContactDetailPanel

- Nueva sección colapsable **"Datos del Panel Franquiciado"** mostrando: external_lead_id (link directo `https://licenciaspos.online/prospects/register/{license}?token={token_b64}`), reseller, store_id, status externo, fechas, payload crudo (JSON pretty con copy).
- Botón **"Re-sincronizar desde panel"** (si hay `external_lead_id`, abre el dialog pre-llenado).

## Detalles técnicos

- El `password` del JSON es un hash MD5/bcrypt del panel — **nunca** se descifra ni se reusa; solo se guarda como evidencia.
- `license` (hash 32) se cruza con `parse_supplier_license` ya existente para asociar con la licencia real cuando se cree.
- `day_demo: "demo_day_14"` → regex `/demo_day_(\d+)/` → `trial_ends_at = created_at + N days`.
- `status` map: `SIN CONTACTAR→new`, `CONTACTADO→contacted`, `INTERESADO→qualified`, `DEMO→demo`, `CLIENTE→client`, `DESCARTADO→lost`.
- Todos los campos `qual_*` ya existen en la migración previa — no se duplican.

## Archivos

- `supabase/migrations/<ts>_external_franchise_lead_import.sql` (nuevo)
- `src/components/admin/contacts/ExternalSurveyImportDialog.tsx` (nuevo)
- `src/lib/externalSurveyParser.ts` (nuevo — parser + value mapping)
- `src/components/admin/ContactsView.tsx` (editar — botón)
- `src/components/admin/ContactDetailPanel.tsx` (editar — sección franquicia + bookmarklet)
- `src/data/demoQualifyingOptions.ts` (editar — externalValueMap)
- `supabase/functions/ingest-external-lead/index.ts` (nuevo, opcional fase 2)

## Fases

1. **Fase 1 (core)**: migración + parser + dialog manual + visualización. Cubre el 100% del caso "copio JSON → cargo cliente".
2. **Fase 2**: bookmarklet + edge function de ingest automático.
3. **Fase 3**: job programado que el panel franquiciado dispare diariamente para sincronizar deltas.

¿Apruebas para implementar Fase 1? Si tambien puedes dar soporte avanzado para importar json así como importamos doc excel, con solo pegar el JSON con la misma estructura copiada en el panel de administración de la franquicia, tambien se pueda importar un nuevo contacto con demo. cuando viene así, es porque su estado es con demo activa / pendiente de activar (pero ya se registró)