# Audit y Plan: Mejora del Portal de Socios (/socio)

## Auditoria Comparativa: Portal Clientes vs Portal Socios

### Lo que tiene el Portal de Clientes (avanzado)
| Funcionalidad | Estado |
|---|---|
| Dashboard con metricas (plan activo, estado cuenta, tickets) | Implementado |
| Suscripcion con planes de soporte (Autogestion/Tranquilidad/Socio Estrategico) | Implementado |
| Chat de tickets en tiempo real (ticket_messages + Realtime) | Implementado |
| Facturacion con historial de pagos | Implementado |
| Contratos/SLA con descarga de PDF | Implementado |
| Vinculacion a tabla `businesses` | Implementado |

### Lo que tiene el Portal de Socios (basico)
| Funcionalidad | Estado | Brecha |
|---|---|---|
| Dashboard basico con 4 KPIs + grafico barras | OK pero limitado | Falta plan de soporte, estado de cuenta, accesos rapidos inteligentes |
| Tickets con dialog estatico (admin_response unico) | Obsoleto | No usa `ticket_messages` ni Realtime como clientes |
| Comisiones con tabla basica | OK | Falta resumen ejecutivo y tendencia |
| Licencias con CRUD completo | Bien implementado | Solo falta vincular con `businesses` |
| Entrenamientos (reutiliza TrainingVideoHub) | OK | Sin brechas |
| Solicitar Demo (formulario independiente) | OK | Sin brechas |
| Sin tab de "Perfil de Negocio" | No existe | El socio no puede ver/editar sus datos |
| Sin tab de "Contratos" | No existe | No puede ver SLAs firmados |
| Sin vinculacion a `businesses` | No existe | No hay perfil de empresa |

### Brechas Criticas Detectadas

1. **Tickets sin chat Realtime**: El socio usa `reseller_tickets` con `admin_response` (campo unico), mientras los clientes ya tienen hilo de mensajes con `ticket_messages` + Realtime. Inconsistencia grave.

2. **Sin perfil de empresa**: El socio no puede ver ni editar su NIT, razon social, telefono. No esta vinculado a `businesses`.

3. **Sin contratos**: No tiene acceso a sus SLAs/contratos firmados.

4. **Dashboard limitado**: No muestra plan de soporte, no tiene alertas inteligentes ni accesos contextuales.

---

## Plan de Implementacion

### Fase 1: Base de Datos

**1.1 Vincular socios a `businesses`**
- Cuando un socio accede al portal, si no tiene `business_id` en su perfil, crear automaticamente un registro en `businesses` usando los datos de `reseller_applications` (full_name, email, phone, city).
- Esto permite que el socio comparta la infraestructura de contratos y suscripciones con clientes.

**1.2 Agregar soporte de `ticket_messages` para `reseller_tickets`**
- La tabla `ticket_messages` ya tiene `ticket_id UUID` que referencia a `client_tickets`. Necesitamos hacerla generica:
  - Agregar columna `ticket_source TEXT DEFAULT 'client'` (valores: 'client', 'reseller') a `ticket_messages`
  - Actualizar RLS para que socios puedan leer/escribir mensajes de sus propios tickets
  - Esto evita crear una tabla duplicada y unifica la experiencia de chat

### Fase 2: Nuevos Componentes del Portal Socio

**2.1 Dashboard mejorado (`ResellerDashboard.tsx`)**
- Agregar metrica de "Plan de Soporte" leyendo de `support_subscriptions` via `business_id`
- Agregar alerta de "Licencias por vencer" con enlace directo
- Agregar alerta de "Tickets abiertos sin respuesta" 
- Mejorar accesos rapidos con badges de conteo

**2.2 Perfil de Empresa (nuevo tab)**
- Nuevo componente `ResellerProfileView.tsx` con formulario editable:
  - Razon social, NIT, telefono, email corporativo, ciudad, direccion
  - Datos del representante (solo lectura, de `reseller_applications`)
  - Boton "Guardar cambios" que actualiza `businesses`

**2.3 Chat Realtime en Tickets (`ResellerTicketsView.tsx`)**
- Reemplazar el dialog estatico por `TicketChatView` (reutilizar el componente de clientes adaptandolo)
- Crear version compartida del chat que reciba `ticketSource: 'client' | 'reseller'` como prop
- Suscripcion Realtime identica a la del portal de clientes

**2.4 Contratos (nuevo tab)**
- Reutilizar logica de `ClientContractsTab` adaptada para socio
- Leer contratos vinculados al `business_id` del socio

**2.5 Suscripcion de Soporte (nuevo tab)**
- Reutilizar estructura de `ClientSubscriptionTab` 
- Mostrar plan activo del socio desde `support_subscriptions`
- Mismos 3 planes (Autogestion, Tranquilidad, Socio Estrategico)

### Fase 3: Actualizacion de Layout y Navegacion

**3.1 Sidebar del socio (`ResellerLayout.tsx`)**
Agregar nuevos items de navegacion:
- "Mi Empresa" (nuevo) -> /socio/empresa
- "Suscripcion" (nuevo) -> /socio/suscripcion  
- "Contratos" (nuevo) -> /socio/contratos
- Los existentes se mantienen (Licencias, Entrenamientos, Tickets, Comisiones, Solicitar Demo)

**3.2 Rutas (`ResellerPage.tsx`)**
Agregar rutas para los nuevos componentes.

### Fase 4: Admin

**4.1 Actualizar `AdminTicketChatDialog`**
- Hacerlo compatible con `reseller_tickets` ademas de `client_tickets`
- Pasar `ticket_source` para filtrar mensajes correctamente

---

## Resumen de Archivos a Crear/Modificar

| Archivo | Accion |
|---|---|
| Migracion SQL | Crear: columna `ticket_source` en `ticket_messages`, RLS para socios |
| `ResellerDashboard.tsx` | Modificar: agregar metricas de soporte y alertas |
| `ResellerProfileView.tsx` | Crear: formulario de perfil de empresa |
| `ResellerTicketsView.tsx` | Modificar: reemplazar dialog por chat Realtime |
| `TicketChatView.tsx` | Modificar: hacerlo generico (client/reseller) |
| `ResellerContractsView.tsx` | Crear: lista de contratos con descarga PDF |
| `ResellerSubscriptionView.tsx` | Crear: planes de soporte para socios |
| `ResellerLayout.tsx` | Modificar: agregar 3 nuevos items de nav |
| `ResellerPage.tsx` | Modificar: agregar 3 nuevas rutas |
| `AdminTicketChatDialog.tsx` | Modificar: soporte para reseller_tickets |

## Secuencia

1. Migracion SQL (ticket_messages generico + RLS + auto-crear business para socio)
2. Adaptar TicketChatView para ser reutilizable
3. Crear los 3 nuevos componentes (Perfil, Contratos, Suscripcion)
4. Mejorar Dashboard existente
5. Actualizar Layout, rutas y admin

---

# Sistema CMS Híbrido — Documentación Completa

## Arquitectura

El CMS utiliza la tabla `page_content` para almacenar bloques de contenido editables sin tocar código. Cada bloque se identifica por `page_path` + `section_key` (índice único).

### Tabla: `page_content`
| Columna | Tipo | Descripción |
|---|---|---|
| `page_path` | text | Ruta de la página (ej: `/`, `/licencias`) |
| `section_key` | text | Identificador del bloque (ej: `hero_title`) |
| `content_type` | text | `text`, `markdown`, `image`, `html`, `json` |
| `text_value` | text | Contenido textual o HTML |
| `image_url` | text | URL de imagen (bucket `shared-resources`) |
| `image_alt` | text | Texto alt para SEO |
| `json_value` | jsonb | Datos estructurados (listas, tablas, configs) |
| `sort_order` | int | Orden de aparición |
| `is_active` | bool | Visible en el sitio público |

### RLS
- **Público**: solo lectura de bloques activos (`is_active = true`)
- **Admin**: CRUD completo via `has_role(auth.uid(), 'admin')`

## Hook: `usePageContent`

```tsx
import { usePageContent, getContent, getImageContent, getJsonContent } from "@/hooks/usePageContent";

// En el componente:
const { data: blocks } = usePageContent("/licencias");
const title = getContent(blocks, "hero_title", "Fallback por defecto");
const image = getImageContent(blocks, "hero_image", "/fallback.png");
const items = getJsonContent<string[]>(blocks, "benefits", ["item1", "item2"]);
```

## Interfaz Admin

Acceso: `/admin/contenido` → Gestor de Contenido (CMS)

Funcionalidades:
- Selector lateral de páginas agrupadas por categoría
- CRUD de bloques con editor por tipo (texto, Markdown, HTML, JSON, imagen)
- Subida de imágenes con optimización automática (WebP via edge function `optimize-image`)
- Preview de imágenes en línea
- Control de visibilidad y orden

## Páginas Integradas con CMS

### Home (`/`)
| section_key | Tipo | Componente | Descripción |
|---|---|---|---|
| `hero_badge` | text | HeroSection | Badge superior del hero |
| `hero_title` | html | HeroSection | Título H1 principal (soporta HTML) |
| `hero_subtitle` | text | HeroSection | Subtítulo descriptivo |
| `hero_cta_primary` | text | HeroSection | Texto del botón CTA primario |
| `hero_cta_secondary` | text | HeroSection | Texto del botón CTA secundario |
| `social_proof_*` | text | SocialProofBar | Estadísticas de confianza |
| `software_preview_*` | text/image | SoftwarePreviewSection | Preview del dashboard |
| `comparison_data` | json | ComparisonSection | Tabla comparativa (JSON) |
| `whyus_*` | text/json | WhyUsSection | Sección "Por qué elegirnos" |
| `features_*` | text | FeaturesSection | Características principales |
| `local_trust_*` | text | LocalTrustSection | Confianza local |
| `solutions_*` | text | SolutionsSection | Soluciones por industria |
| `connectpos_*` | text | ConnectPOSSection | Sección de conexión POS |
| `coverage_*` | text | CoverageSection | Cobertura nacional |
| `cta_*` | text | CTASection | Call-to-action final |

### Licencias (`/licencias`)
| section_key | Tipo | Descripción |
|---|---|---|
| `hero_title` | text | Título del hero |
| `hero_subtitle` | html | Subtítulo con HTML |
| `hero_badge` | text | Badge del hero |
| `benefits` | json | Lista de beneficios (string[]) |
| `ideal_for` | json | Mapa plan→descripción (Record<string,string>) |
| `crosssell_title` | text | Título cross-sell packs |
| `crosssell_subtitle` | text | Subtítulo cross-sell |
| `cta_title` | text | Título CTA final |
| `cta_subtitle` | text | Subtítulo CTA final |

### Planes (`/planes`)
| section_key | Tipo | Descripción |
|---|---|---|
| `hero_title` | text | Título principal (paso "choose") |
| `hero_subtitle` | text | Subtítulo (paso "choose") |
| `hero_title_alt` | text | Título alternativo (paso seleccionado) |
| `hero_subtitle_alt` | text | Subtítulo alternativo |

### Packs (`/packs`)
| section_key | Tipo | Descripción |
|---|---|---|
| `hero_badge` | text | Badge del hero |
| `hero_title` | html | Título H1 (soporta HTML/br) |
| `hero_subtitle` | html | Subtítulo con HTML |

### Módulos (`/modulos`)
| section_key | Tipo | Descripción |
|---|---|---|
| `hero_title` | text | Título H1 |
| `hero_subtitle` | text | Subtítulo descriptivo |

### Servicios (`/servicios`)
| section_key | Tipo | Descripción |
|---|---|---|
| `hero_title` | html | Título con gradient-text (HTML) |
| `hero_subtitle` | text | Subtítulo descriptivo |

### Soluciones (`/soluciones`)
| section_key | Tipo | Descripción |
|---|---|---|
| `hero_title` | text | Título H1 |
| `hero_subtitle` | text | Subtítulo descriptivo |

### Facturación Electrónica (`/facturacion-electronica`)
| section_key | Tipo | Descripción |
|---|---|---|
| `hero_title` | text | Título H1 |
| `hero_subtitle` | text | Subtítulo descriptivo |

### Nosotros (`/nosotros`)
| section_key | Tipo | Descripción |
|---|---|---|
| `hero_title` | html | Título con gradient-text (HTML) |
| `hero_subtitle` | text | Subtítulo descriptivo |

### Contacto (`/contacto`)
| section_key | Tipo | Descripción |
|---|---|---|
| `hero_title` | text | Título H1 |
| `hero_subtitle` | text | Subtítulo descriptivo |

### Comparar (`/comparar`)
| section_key | Tipo | Descripción |
|---|---|---|
| `hero_title` | text | Título H1 |
| `hero_subtitle` | text | Subtítulo descriptivo |

### Software POS Colombia (`/software-pos-colombia`)
| section_key | Tipo | Descripción |
|---|---|---|
| `hero_title` | text | Título H1 |
| `hero_subtitle` | text | Subtítulo descriptivo |

## Edge Function: `optimize-image`

- **Endpoint**: `POST /functions/v1/optimize-image`
- **Auth**: Bearer token de admin
- **Body**: FormData con `file`, `bucket`, `folder`
- **Respuesta**: `{ url: string }` — URL pública optimizada
- **Formato**: Conversión automática a WebP
- **Caché**: 1 año (`Cache-Control: public, max-age=31536000`)
- **Límite**: 5MB por imagen

## Convenciones de Nombrado

- **section_key**: `snake_case`, prefijado por sección (ej: `hero_title`, `cta_subtitle`, `features_card_1`)
- **page_path**: ruta exacta del router (ej: `/`, `/licencias`, `/packs`)
- **content_type**: usar `html` cuando se necesiten tags HTML en el contenido; `text` para strings planos

## Patrón de Implementación

```tsx
// 1. Importar hook y helpers
import { usePageContent, getContent } from "@/hooks/usePageContent";

// 2. En el componente, cargar bloques de la página
const { data: blocks } = usePageContent("/mi-pagina");

// 3. Usar getContent con fallback hardcodeado (el valor actual)
const titulo = getContent(blocks, "hero_title", "Valor actual hardcodeado");

// 4. Para HTML: usar dangerouslySetInnerHTML
<h1 dangerouslySetInnerHTML={{ __html: titulo }} />

// 5. Para JSON (listas, objetos):
const items = getJsonContent<string[]>(blocks, "features_list", ["item1", "item2"]);
```

## Registro de Páginas en Admin

El archivo `PageContentView.tsx` contiene `PAGE_REGISTRY` con todas las páginas registradas. Para agregar una nueva página al CMS:

1. Agregar entrada en `PAGE_REGISTRY` con `path`, `label` y `group`
2. Integrar `usePageContent(path)` en el componente de la página
3. Usar `getContent()` con fallbacks para cada sección editable
