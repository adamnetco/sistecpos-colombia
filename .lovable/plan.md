

# Plan: Rediseno Integral del Panel Admin + IA + UX/UI (Inspirado en Nubeyne)

## Contexto y Diagnostico

Tras auditar todo el panel actual de SistecPOS (`/admin`) y el portal de socios (`/socio`), se identificaron las siguientes brechas frente al modelo Nubeyne y al modelo de negocio real (socios, clientes directos/indirectos, proveedores de software/hardware/certificados):

### Lo que ya funciona bien
- Central IA con base de conocimiento (FAQs, documentos, texto libre)
- Conversaciones del chatbot con captura de leads automatica
- CRM unificado con filtros por fuente y tipo
- Kanban de certificados con gestion documental
- Tracking scripts (GA, GTM, Pixel)
- Portal de socios con licencias, tickets, comisiones y entrenamientos

### Brechas detectadas

| Area | Brecha |
|------|--------|
| Dashboard Admin | Sin graficos de tendencia, sin metricas de IA, sin revenue |
| Central IA | Sin metricas de uso (conversaciones/dia, tasa de captura), sin test en vivo, sin prompt editor avanzado |
| CRM | Sin pipeline visual (Kanban), sin actividad/notas por contacto, sin scoring |
| Proveedores | No existe modulo de proveedores (software, hardware, certificados) |
| Socios | Dashboard basico sin graficos, sin historial de comisiones ganadas |
| UX/UI Sidebar | Sin responsive mobile (hamburger menu), sin notificaciones |
| Pagos | Sin graficos de revenue, sin exportacion |

---

## Alcance de Implementacion (7 bloques)

### Bloque 1: Dashboard Admin Rediseñado
- Agregar fila de graficos con recharts: Revenue mensual, Leads por semana, Conversiones
- KPIs de IA: conversaciones del chatbot hoy, leads capturados por IA, tasa de conversion
- Mini-calendario de licencias por vencer en los proximos 7 dias
- Alertas activas mejoradas con iconos y urgencia visual

### Bloque 2: Central IA Avanzada
- **Tab "Metricas IA"**: grafico de conversaciones/dia (ultimos 30 dias), leads capturados por IA, tasa de captura, paginas con mas interaccion
- **Tab "Prompt Studio"**: editor del system prompt del chatbot directamente desde el admin (guardado en `app_settings`), con preview en tiempo real
- **Tab "Test en Vivo"**: mini-chatbot embebido en el admin para probar cambios al prompt y KB sin salir del panel
- Indicador de tokens/coste estimado por conversacion

### Bloque 3: CRM con Pipeline Kanban
- Vista Kanban con columnas: Nuevo > Contactado > Demo Activa > Negociacion > Cerrado/Perdido
- Drag & drop para mover contactos entre etapas
- Panel lateral al hacer click en un contacto: historial de notas, actividades, archivos
- Lead scoring basico (automatico por interaccion: visito web +1, chatbot +2, solicito demo +5)
- Tabla `contact_activities` para registrar llamadas, emails, notas

### Bloque 4: Modulo de Proveedores
- Nueva seccion `/admin/proveedores` en el sidebar
- Tabla `suppliers` con campos: nombre, tipo (software/hardware/certificados), contacto, email, telefono, ciudad, estado, notas
- Vista con filtros por tipo de proveedor
- Formulario de alta/edicion
- RLS: solo admins pueden ver/editar

### Bloque 5: Portal Socio Mejorado
- Dashboard con graficos: licencias creadas por mes, comisiones acumuladas
- Historial de comisiones con estado (pendiente/pagada/rechazada) y total acumulado
- Notificaciones simples (banner) cuando hay entrenamientos nuevos o tickets resueltos
- Sidebar responsive con hamburger menu en mobile

### Bloque 6: UX/UI Global del Admin
- Sidebar responsive: colapsable en desktop, drawer/hamburger en mobile
- Header con breadcrumbs + indicador de notificaciones (licencias por vencer, socios pendientes, certificados sin procesar)
- Tema consistente: cards con hover mejorado, transiciones suaves
- Skeleton loaders en lugar de "Cargando..." en todas las tablas
- Todos los formularios con validacion visual (bordes rojos, mensajes inline)

### Bloque 7: Pagos Enriquecidos
- Graficos de revenue mensual con recharts
- Filtros por metodo de pago, rango de fechas, estado
- Subtotales visibles (total confirmado, pendiente)
- Vinculacion visual: click en pago abre el detalle de la licencia o certificado asociado

---

## Cambios en Base de Datos

1. **Nueva tabla `suppliers`**: id, name, supplier_type (enum: software/hardware/certificados/otro), contact_name, email, phone, city, status, notes, created_at
2. **Nueva tabla `contact_activities`**: id, contact_id (FK), activity_type (call/email/note/meeting), description, created_by, created_at
3. **Agregar columna `lead_score`** (integer, default 0) a tabla `contacts`
4. **Agregar fila `chatbot_system_prompt`** a `app_settings`
5. RLS en `suppliers`: solo usuarios con rol admin
6. RLS en `contact_activities`: solo usuarios con rol admin

---

## Seccion Tecnica

### Archivos a crear
- `src/components/admin/SuppliersView.tsx` - CRUD de proveedores
- `src/components/admin/AIMetricsTab.tsx` - Metricas de IA con recharts
- `src/components/admin/PromptStudioTab.tsx` - Editor del prompt del chatbot
- `src/components/admin/AITestTab.tsx` - Chat de prueba embebido
- `src/components/admin/ContactPipelineView.tsx` - Kanban CRM
- `src/components/admin/ContactDetailPanel.tsx` - Panel lateral de contacto
- `src/components/admin/AdminHeader.tsx` - Header con breadcrumbs y notificaciones
- `src/components/admin/AdminSidebar.tsx` - Sidebar responsive extraido

### Archivos a modificar
- `src/components/admin/AdminLayout.tsx` - Sidebar responsive + header
- `src/components/admin/DashboardOverview.tsx` - Graficos y KPIs de IA
- `src/components/admin/CentralIAView.tsx` - Nuevos tabs (Metricas, Prompt Studio, Test)
- `src/components/admin/ContactsView.tsx` - Agregar vista Kanban toggle
- `src/components/admin/PaymentsView.tsx` - Graficos y filtros
- `src/pages/AdminPage.tsx` - Nueva ruta /admin/proveedores
- `src/components/reseller/ResellerDashboard.tsx` - Graficos
- `src/components/reseller/ResellerLayout.tsx` - Sidebar responsive
- `src/components/reseller/ResellerCommissionsView.tsx` - Historial con estados
- `supabase/functions/chat-ai/index.ts` - Leer prompt desde app_settings

### Dependencias
- `recharts` ya esta instalado
- No se necesitan dependencias adicionales

### Migracion SQL
Una sola migracion con: tabla `suppliers`, tabla `contact_activities`, columna `lead_score` en `contacts`, fila en `app_settings`, y politicas RLS correspondientes.

