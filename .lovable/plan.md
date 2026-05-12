
# Plan: CRM ampliado + Demos unificadas + Parser de licencias del proveedor

Cambio grande dividido en 5 bloques. Implemento todo de corrido si lo apruebas.

## 1. Modelo CRM profesional (Negocios → Sucursales → Contactos)

Aprovechamos la tabla `businesses` existente y la enriquecemos:

- `businesses`: ya existe (CRM centralizado). Añado/uso campos: `legal_name`, `nit`, `industry`, `website`, `address`, `notes`, `primary_contact_id`.
- Nueva tabla `business_branches`: sucursales por negocio (`business_id`, `branch_name`, `city`, `address`, `phone`, `is_primary`).
- `contacts`: añado `business_id` (FK → businesses) y `branch_id` (FK → business_branches), además de `role_in_business` (texto: dueño, admin, contador, etc.). Mantengo retrocompatibilidad con `business_name` actual.
- RPC `find_related_by_contact(_email, _phone)`: al digitar email/teléfono devuelve negocios + contactos + sucursales + licencias + demos relacionadas para auto-vincular.
- Trigger: si se crea un contacto con email/teléfono ya existente, sugerir merge en UI (no auto-merge destructivo).

## 2. Edición completa de contactos (estilo CRM pro)

Nuevo `ContactDetailDialog.tsx` (drawer lateral) reemplaza la edición actual de `ContactsView`:

- Pestañas: **Resumen · Negocio · Sucursales · Otros contactos del negocio · Actividad · Notas**.
- Edición inline de TODOS los campos del contacto y del negocio asociado.
- Botón "Vincular a otro negocio" + "Crear sucursal".
- Buscador de relaciones: al escribir email o teléfono muestra coincidencias en otros negocios.
- Historial de cambios visible (de `pos_credential_history` y un nuevo `contact_activity_log`).

## 3. Unificación CRM + Demos Activas

`ContactsView.tsx` pasa a tener tres vistas (toggle): **Tabla · Pipeline · Demos Activas**.

- Demos Activas se monta como tab interna (mismo componente `ActiveDemosView` reusado), filtrando por `pipeline_stage = 'demo'` o existencia en `leads_trials`.
- Sidebar: elimino "Demos Activas" como entrada separada; redirect `/admin/demos-activas` → `/admin/contactos?view=demos`.
- Filtros compartidos (búsqueda, ciudad, fuente) entre las 3 vistas.

## 4. Conversión Demo → Licencia + creación manual flexible

- En cada tarjeta de Demo Activa: botón prominente **"Convertir a Licencia Activa"** que abre `LeadConversionDialog` (ya existe, lo amplío).
- El dialog ahora permite: editar fecha de vencimiento, tipo (Anual/Mensual/Permanente), pegar clave de licencia del proveedor (ver bloque 5), elegir sucursal destino. Migra POS users + contacto + negocio.
- Nueva ruta `/admin/licencias/nueva`: formulario para crear licencia **sin restricciones**, con `expires_at` editable (date picker libre, sin validación de "futuro obligatorio") y opción de pegar bloque del proveedor.
- Quito validaciones bloqueantes en `LicenseFormDialog` que impedían fechas personalizadas.

## 5. Parser de licencias del proveedor + cambios en `/clientes/#pos`

Caja "Pega aquí los datos de tu licencia" en:
- Vista de cliente `/clientes` pestaña Licencias (autoservicio del cliente).
- Admin: al crear/editar licencia.

Acepta texto pegado tipo:
```
Ubicación: Tienda Principal   Tipo: Media
6129d58fdb654f46e0381e48af03d8f7
+ 0 facturas   2027-05-08 14:46:06
365 días
Fecha de creacion 2026-05-04 21:05:00
Tipo de licencia Anual
Licencia 6129d58fdb654f46e0381e48af03d8f7
```

Parser regex extrae: `license_key` (hash 32), `branch_name`, `license_tier` (Media/Alta/etc), `expires_at`, `created_at`, `billing_type` (Anual/Mensual), `invoice_count`. Muestra preview formateado y botón "Guardar". Persiste en `licenses` + `license_branches` para trazabilidad.

En `/clientes/#pos` (`ClientPOSLogin.tsx`):
- Cambio placeholders/labels a **Usuario / Tienda / Clave** (uniformidad con POS).
- **Elimino** la sección "Clave de Licencia Activa" del flujo de login (queda solo en la pestaña Licencias como información/parser, no como credencial de acceso).

## Detalles técnicos

**Migración SQL**:
- `ALTER TABLE businesses ADD COLUMN legal_name, nit, industry, website, address, notes, primary_contact_id`.
- `CREATE TABLE business_branches (id, business_id, branch_name, city, address, phone, is_primary, ...)` + RLS admin-only.
- `ALTER TABLE contacts ADD COLUMN business_id, branch_id, role_in_business`.
- RPC `find_related_by_contact(email, phone)` → JSONB con negocios/contactos/licencias coincidentes.
- RPC `parse_and_create_license(_raw_text, _business_id)` → inserta `licenses` + `license_branches`.
- `CREATE TABLE contact_activity_log` (cambios y eventos por contacto).

**Frontend**:
- Nuevo `src/components/admin/contacts/ContactDetailDialog.tsx` (tabs).
- Nuevo `src/components/admin/contacts/BusinessRelationsPanel.tsx` (sucursales + contactos relacionados).
- Nuevo `src/components/admin/licenses/LicenseRawPasteParser.tsx` (caja de pegado + preview).
- Modificar `ContactsView.tsx` (toggle 3 vistas + filtros compartidos).
- Modificar `LeadConversionDialog.tsx` (date picker libre + parser opcional).
- Modificar `ClientPOSLogin.tsx` (labels Usuario/Tienda/Clave, quitar clave-de-licencia del login).
- Modificar `LicenseFormDialog.tsx` y crear ruta `/admin/licencias/nueva` sin restricciones de fecha.
- `AdminSidebar.tsx`: quitar "Demos Activas".
- `AdminPage.tsx`: redirect viejo.

**No se rompen** los datos existentes; los nuevos campos son opcionales y se rellenan progresivamente.

## Orden de ejecución

1. Migración SQL (apruebas).
2. Refactor `ContactsView` + nuevo `ContactDetailDialog` con relaciones.
3. Unificación con Demos Activas (toggle interno + sidebar).
4. `LicenseRawPasteParser` reusable + integración en conversión y creación manual.
5. Cambios en `ClientPOSLogin` (labels + quitar clave de licencia del login).
6. QA visual del flujo completo.

¿Apruebas para implementar?
