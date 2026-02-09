

# Plan: Deduplicacion de Contactos y Trazabilidad en CRM

## Problema actual

Cada vez que el chatbot detecta un `[LEAD_DATA:...]` en la respuesta de la IA, **inserta un nuevo registro** en la tabla `contacts` sin verificar si ese email o telefono ya existe. Esto genera los duplicados visibles en la captura (Eduardo Tobacia x5).

Adicionalmente, no existe una relacion formal entre negocios y contactos: `business_name` es solo un campo de texto plano en `contacts`.

## Solucion propuesta

### 1. Nueva tabla `businesses` (Negocios)

Crear una tabla dedicada para negocios, permitiendo que un negocio tenga muchos contactos:

```text
businesses
  id          uuid PK
  name        text NOT NULL
  nit         text (nullable, unique)
  city        text
  type        text (restaurante, farmacia, etc.)
  created_at  timestamp
  updated_at  timestamp
```

- Se agrega una columna `business_id` (FK) a la tabla `contacts`, manteniendo `business_name` como texto de respaldo para compatibilidad.
- RLS: lectura/escritura solo para admins; insert publico para el chatbot.

### 2. Logica de deduplicacion en el Edge Function `chat-ai`

Reemplazar el `INSERT` directo por una logica "upsert inteligente":

1. Buscar contacto existente por **email** (prioridad) o por **telefono**.
2. Si existe: **actualizar** datos faltantes (nombre, telefono, etc.) y vincular la conversacion al contacto existente.
3. Si no existe: crear el contacto nuevo.
4. Si viene nombre de negocio: buscar o crear el registro en `businesses` y asociarlo al contacto via `business_id`.
5. Registrar una actividad automatica en `contact_activities` indicando "Interaccion con chatbot IA" con link a la conversacion.

### 3. Limpiar duplicados existentes

Ejecutar una migracion SQL que:
- Identifique duplicados por email/telefono en contactos con `source = 'chatbot_ai'`.
- Conserve el registro mas antiguo (primera interaccion).
- Migre las conversaciones vinculadas (`ai_conversations.contact_id`) al registro conservado.
- Elimine los duplicados.

### 4. Constraint de unicidad parcial

Agregar un indice unico parcial para prevenir futuros duplicados:

```text
UNIQUE INDEX ON contacts (email) WHERE email IS NOT NULL
UNIQUE INDEX ON contacts (phone) WHERE phone IS NOT NULL AND email IS NULL
```

Esto impide dos contactos con el mismo email, y dos contactos con el mismo telefono cuando no tienen email.

### 5. Actualizar la vista de CRM (ContactsView)

- Mostrar la columna "Negocio" como un enlace al registro del negocio.
- Mostrar un badge con el conteo de conversaciones del chatbot por contacto.
- En el panel de detalle (ContactDetailPanel), agregar seccion de "Conversaciones IA" mostrando el historial de sesiones vinculadas.

---

## Secuencia tecnica de implementacion

1. **Migracion SQL**: Crear tabla `businesses`, agregar `business_id` FK a `contacts`, limpiar duplicados, crear indices unicos parciales, agregar RLS.
2. **Edge Function `chat-ai`**: Reescribir la seccion de captura de leads (lineas 231-264) con logica de deduplicacion y asociacion de negocios.
3. **Frontend `ContactsView`**: Mostrar datos del negocio vinculado y conteo de interacciones IA.
4. **Frontend `ContactDetailPanel`**: Agregar seccion de conversaciones IA vinculadas al contacto.

### Archivos a modificar
- **Nuevo**: Migracion SQL (via herramienta de migracion)
- **Modificar**: `supabase/functions/chat-ai/index.ts` (logica de deduplicacion)
- **Modificar**: `src/components/admin/ContactsView.tsx` (mostrar negocio vinculado)
- **Modificar**: `src/components/admin/ContactDetailPanel.tsx` (conversaciones IA)

