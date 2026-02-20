
# Plan: Ecosistema Centralizado del Portal de Clientes

## Resumen Ejecutivo

Crear la infraestructura completa para el portal de clientes de SistecPOS con 4 nuevas tablas, chat de soporte en tiempo real, y refactorización de los componentes existentes.

## Fase 1: Base de Datos (Migración)

### Tabla `businesses`
Entidad central del negocio del cliente. Un negocio puede tener varios usuarios.

| Columna | Tipo | Descripcion |
|---------|------|-------------|
| id | UUID PK | Identificador unico |
| owner_user_id | UUID | Usuario principal (auth.uid) |
| business_name | TEXT | Razon social |
| nit | TEXT | NIT del negocio |
| phone | TEXT | Telefono del negocio |
| email | TEXT | Correo corporativo |
| city | TEXT | Ciudad |
| address | TEXT | Direccion |
| created_at / updated_at | TIMESTAMPTZ | Fechas de control |

- RLS: El propietario puede ver/editar su negocio. Admins acceso total.

### Tabla `support_subscriptions`
Suscripciones de soporte separadas de las licencias del software.

| Columna | Tipo | Descripcion |
|---------|------|-------------|
| id | UUID PK | Identificador unico |
| business_id | UUID FK | Referencia a businesses |
| user_id | UUID | Usuario que contrato |
| plan | TEXT | autogestion, tranquilidad, socio_estrategico |
| status | TEXT | active, cancelled, past_due |
| price_cop | INTEGER | Valor mensual en COP |
| billing_anchor_day | INTEGER | Dia de corte (1-28) |
| current_period_start | DATE | Inicio del periodo actual |
| current_period_end | DATE | Fin del periodo actual |
| payment_method | TEXT | wompi, mercadopago, manual |
| created_at / updated_at | TIMESTAMPTZ | Control |

- RLS: Usuario ve su propia suscripcion. Admins acceso total.

### Tabla `contracts`
Contratos/SLA firmados.

| Columna | Tipo | Descripcion |
|---------|------|-------------|
| id | UUID PK | Identificador unico |
| business_id | UUID FK | Referencia a businesses |
| contract_type | TEXT | sla_soporte, licencia, otro |
| title | TEXT | Nombre del contrato |
| signed_at | DATE | Fecha de firma |
| expires_at | DATE | Fecha de vencimiento (nullable) |
| pdf_url | TEXT | URL del documento firmado |
| status | TEXT | active, expired, cancelled |
| notes | TEXT | Observaciones |
| created_at / updated_at | TIMESTAMPTZ | Control |

- RLS: Visibles para el owner del business. Admins acceso total.

### Tabla `ticket_messages`
Hilo de conversacion dentro de cada ticket. Reemplaza el campo unico `admin_response`.

| Columna | Tipo | Descripcion |
|---------|------|-------------|
| id | UUID PK | Identificador unico |
| ticket_id | UUID FK | Referencia a client_tickets |
| sender_id | UUID | auth.uid del emisor |
| sender_role | TEXT | customer, admin, ai_agent |
| content | TEXT | Contenido del mensaje |
| attachment_url | TEXT | Archivo adjunto (nullable) |
| created_at | TIMESTAMPTZ | Fecha de envio |

- RLS: El cliente ve mensajes de sus tickets. Admins ven todos. Ambos pueden insertar.
- **Realtime**: Se habilitara `ALTER PUBLICATION supabase_realtime ADD TABLE public.ticket_messages;`

### Columna adicional en `profiles`
- Agregar `business_id UUID` (nullable, FK a businesses) para vincular usuario a su empresa.

## Fase 2: Refactorizacion del Frontend

### 2.1 ClientDashboardTab
- Agregar metrica de "Plan de Soporte" leyendo de `support_subscriptions`.
- El boton "Solicitar Soporte" redirigira a la pestana de tickets (ya existe la logica de tabs).

### 2.2 ClientSubscriptionTab
- Leer el plan activo de `support_subscriptions` en vez de asumir "Autogestion" por defecto.
- Al hacer clic en "Actualizar Plan", registrar interes en la tabla (o redirigir a Wompi/WhatsApp segun el metodo disponible).
- Mostrar fecha de corte y proximo cobro.

### 2.3 ClientTicketsTab (Chat de Soporte)
- Reemplazar el dialog de "detalle" por una vista de chat con hilo de mensajes (`ticket_messages`).
- Input para escribir mensajes con soporte para adjuntos.
- Suscripcion Realtime para ver mensajes nuevos al instante.
- Indicador visual de quien escribe (cliente, admin, agente IA).
- Mantener el formulario de creacion de ticket existente intacto.

### 2.4 ClientBillingTab
- Ademas de pagos por licencia, mostrar pagos vinculados a `support_subscriptions`.
- Mostrar proximo cobro pendiente segun la fecha de corte.

### 2.5 Nuevo: Pestana "Contratos"
- Agregar tab "Contratos" al portal mostrando lista de contratos con descarga de PDF.
- UI simple: lista de cards con titulo, tipo, fecha firma, estado y boton "Ver PDF".

## Fase 3: Integraciones

### 3.1 WhatsApp
- Crear template `support_plan_upgrade` en `whatsapp_templates` para notificar al equipo cuando un cliente solicita upgrade de plan.
- Crear template `new_ticket_message` para notificar por WhatsApp cuando hay un nuevo mensaje en un ticket.

### 3.2 Admin Panel
- Agregar vista de gestion de `support_subscriptions` en admin.
- Agregar vista de contratos en admin.
- Actualizar la vista de tickets del admin para usar el hilo de mensajes en vez del campo `admin_response`.

## Secuencia de Implementacion

1. **Migracion SQL**: Crear las 4 tablas + columna en profiles + RLS + Realtime
2. **Tipos**: Se actualizan automaticamente con la migracion
3. **Componentes de cliente**: Refactorizar las 4 pestanas existentes + agregar pestana Contratos
4. **Templates WhatsApp**: Insertar templates para los nuevos eventos
5. **Admin**: Actualizar vistas administrativas para las nuevas tablas

## Consideraciones de Seguridad

- Todas las tablas usan la funcion `has_role()` existente para evitar recursividad en RLS.
- Los clientes solo ven datos de su propio `user_id` o `business_id`.
- Los archivos adjuntos de contratos iran al bucket `certificate-docs` (privado) o se crea uno nuevo `contract-docs`.
- `ticket_messages` con Realtime tendra RLS que filtra por propiedad del ticket.
