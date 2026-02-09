
# Cotizaciones Web Inteligentes y Limpieza del CRM

## Problema Detectado

Actualmente, cada vez que alguien envía una cotización por WhatsApp desde el carrito, se crea un contacto en el CRM con:
- **Nombre:** "Cotización Web" (genérico, inútil)
- **Email:** vacío
- **Teléfono:** vacío
- **Notas:** solo el detalle de productos

Esto llena el CRM de registros "fantasma" que no permiten dar seguimiento.

## Causa Raíz

1. El `CartDrawer` no pide datos de contacto antes de enviar la cotización
2. La Edge Function `register-quote` crea un contacto siempre, incluso sin datos identificables
3. No existe validación de "datos mínimos" para crear un contacto

## Solución Propuesta

### 1. Mini-formulario de contacto antes de cotizar

Agregar un paso previo en el `CartDrawer` que pida:
- **Nombre** (obligatorio)
- **WhatsApp** (obligatorio, 10 dígitos)
- **Email** (opcional)

Este formulario se muestra al hacer clic en "Cotizar por WhatsApp", antes de abrir la ventana de WhatsApp. Es un formulario compacto inline, no un dialog extra.

### 2. Refactorizar la Edge Function `register-quote`

- Aplicar **smart upsert** (igual que ya se hace en `sync_lead_to_contact`): buscar contacto existente por teléfono o email antes de crear uno nuevo
- Si ya existe, solo agregar una actividad de cotización al historial
- Si no existe, crear contacto con los datos reales del formulario
- Marcar la fuente como `"cotizacion_web"` para diferenciarlos en el CRM

### 3. Limpieza de datos existentes

Eliminar los contactos "Cotización Web" que no tienen teléfono ni email (son 2 registros actualmente), ya que no aportan valor.

### 4. No crear contacto si no hay datos identificables (fallback)

Si por alguna razón se invoca `register-quote` sin nombre ni teléfono, solo registrar los eventos de producto pero NO crear contacto. Esto previene basura futura.

## Flujo Nuevo

```text
Usuario agrega productos al carrito
    |
    v
Clic en "Cotizar por WhatsApp"
    |
    v
Mini-formulario: Nombre + WhatsApp + Email(opcional)
    |
    v
Se envía a register-quote con datos reales
    |
    v
Edge Function: busca contacto por phone/email
    |-- Existe --> agrega actividad "nueva cotización"
    |-- No existe --> crea contacto con datos reales
    |
    v
Abre WhatsApp con mensaje pre-armado
```

## Cambios Técnicos

| Archivo | Cambio |
|---------|--------|
| `src/components/cart/CartDrawer.tsx` | Agregar mini-formulario de contacto (nombre, WhatsApp, email opcional) con validación. Enviar datos al payload de `register-quote`. |
| `supabase/functions/register-quote/index.ts` | Implementar smart upsert por phone/email. Si no hay datos identificables, saltar creación de contacto. Usar fuente `"cotizacion_web"`. |
| SQL (limpieza) | Eliminar registros existentes de "Cotización Web" sin phone ni email. |
| `src/components/admin/ContactsView.tsx` | Agregar `"cotizacion_web"` como fuente reconocida en los labels del CRM. |

## Sobre Leads/Demos

El flujo de Leads/Demos ya captura correctamente nombre, WhatsApp, email y ciudad desde el formulario. El trigger `sync_lead_to_contact` ya sincroniza al CRM con deduplicación. No requiere cambios.
