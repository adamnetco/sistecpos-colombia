import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  LayoutDashboard, ShoppingBag, Tag, FolderOpen, Hash,
  KeyRound, CreditCard, FileCheck, Handshake, Contact2,
  Package, Bot, Code2, BarChart3, FileText, Download,
  TicketCheck, GraduationCap, UserCog, Activity, ShieldCheck,
  MessageCircle, Settings2, BookOpen, Search, FileSignature, FolderOpen as ResourceIcon,
} from "lucide-react";

interface DocSection {
  icon: typeof LayoutDashboard;
  title: string;
  path: string;
  category: string;
  description: string;
  howTo: string[];
  tips: string[];
}

const docs: DocSection[] = [
  {
    icon: LayoutDashboard, title: "Resumen (Dashboard)", path: "/admin", category: "General",
    description: "Panel principal con métricas clave: leads nuevos, licencias activas, tickets abiertos, ingresos del mes y actividad reciente.",
    howTo: [
      "Revisa las tarjetas superiores para un vistazo rápido del estado del negocio.",
      "Los gráficos muestran tendencias de ventas y leads por periodo.",
      "Haz clic en cualquier métrica para ir directamente a la sección correspondiente.",
    ],
    tips: ["Consulta este dashboard diariamente para detectar anomalías temprano."],
  },
  {
    icon: ShoppingBag, title: "Productos", path: "/admin/productos", category: "Catálogo",
    description: "Gestión completa del catálogo de productos: hardware, software, servicios y consumibles. Incluye precios, imágenes, galería, videos, PDFs y feeds para Google Merchant.",
    howTo: [
      "Haz clic en 'Nuevo Producto' para crear uno. Completa: nombre, slug, tipo de producto, precio COP y descripción.",
      "Para agregar imágenes: pega la URL de la imagen principal y URLs de galería separadas por línea.",
      "Los videos se agregan como URLs de YouTube/Loom y se pueden previsualizar.",
      "Usa la importación/exportación XLSX para gestionar productos masivamente.",
      "El campo 'product_type' determina en qué página pública aparece el producto: 'hardware' → /productos, 'servicio' → /servicios, 'software' → /modulos, 'consumible' → /productos.",
    ],
    tips: [
      "Siempre completa meta_title y meta_description para mejorar el SEO.",
      "Los productos con is_featured=true aparecen destacados en la home.",
      "El campo SKU es importante para control de inventario y Google Shopping.",
    ],
  },
  {
    icon: Tag, title: "Marcas", path: "/admin/marcas", category: "Catálogo",
    description: "Administra las marcas de productos. Cada marca tiene un nombre, slug, logo y descripción.",
    howTo: [
      "Crea una marca con nombre y slug único.",
      "Asocia productos a marcas desde la edición del producto.",
    ],
    tips: ["Las marcas aparecen como filtro en la tienda pública."],
  },
  {
    icon: FolderOpen, title: "Categorías", path: "/admin/categorias", category: "Catálogo",
    description: "Organiza los productos por categorías. Cada categoría puede tener un ícono personalizado.",
    howTo: [
      "Crea categorías con nombre, slug y opcionalmente un ícono de Lucide.",
      "Asigna productos a categorías desde la edición del producto.",
    ],
    tips: ["Un producto sin categoría no aparecerá en filtros de categoría."],
  },
  {
    icon: Hash, title: "Etiquetas", path: "/admin/etiquetas", category: "Catálogo",
    description: "Sistema de etiquetas para clasificación transversal. Las etiquetas con 'seo_boost' mejoran el posicionamiento.",
    howTo: [
      "Crea etiquetas con nombre, slug, color y tipo de entidad (producto, artículo, etc.).",
      "Asocia etiquetas a productos desde el gestor de etiquetas del producto.",
    ],
    tips: ["Las etiquetas con seo_boost=true generan páginas de listado automáticas."],
  },
  {
    icon: KeyRound, title: "Licencias", path: "/admin/licencias", category: "Ventas",
    description: "Gestiona las licencias de software vendidas. Incluye estado, vencimiento, datos del cliente, clave de licencia y usuarios POS asociados.",
    howTo: [
      "Haz clic en 'Nueva Licencia' para registrar una venta.",
      "Completa: negocio, contacto, plan, precio pagado y fecha de vencimiento.",
      "Desde el detalle de una licencia puedes ver y gestionar los usuarios POS asociados.",
      "Los leads calificados se pueden convertir en licencias con el botón 'Convertir a Licencia'.",
    ],
    tips: [
      "Las licencias vencidas se marcan automáticamente. Configura alertas de vencimiento.",
      "La clave de licencia se genera automáticamente y no se puede editar.",
    ],
  },
  {
    icon: Tag, title: "Precios Licencias", path: "/admin/precios-licencias", category: "Ventas",
    description: "Define los planes de licencia (Emprendedor, Negocio, Empresarial, Vitalicia) con precios oficiales, de venta e implementación.",
    howTo: [
      "Edita cada plan para ajustar: precio oficial, precio de venta, precio de implementación y soporte mensual.",
      "Los cambios se reflejan automáticamente en /licencias y /planes.",
      "Puedes sincronizar precios desde FacilPOS si tienes la URL configurada.",
    ],
    tips: ["El campo 'max_cajas' y 'max_usuarios' limita lo que el cliente puede usar con cada plan."],
  },
  {
    icon: CreditCard, title: "Suscripciones", path: "/admin/suscripciones", category: "Ventas",
    description: "Planes de soporte mensual (Autogestión, Tranquilidad, Socio Estratégico). Estos son los servicios recurrentes de mantenimiento.",
    howTo: [
      "Crea o edita planes con: nombre, precio mensual, características y audiencia objetivo.",
      "Define si el plan es para clientes, socios o ambos.",
      "El plan marcado como 'popular' se destaca visualmente.",
    ],
    tips: ["Diferencia claramente entre licencia (pago único) y suscripción (pago mensual)."],
  },
  {
    icon: FileCheck, title: "Certificados", path: "/admin/certificados", category: "Ventas",
    description: "Gestiona solicitudes de certificados de firma digital. Incluye documentos adjuntos y estado del proceso.",
    howTo: [
      "Los clientes envían solicitudes desde la página pública. Aquí las gestionas.",
      "Revisa los documentos adjuntos (cédula, RUT, Cámara de Comercio).",
      "Cambia el estado: pendiente → en proceso → completado.",
    ],
    tips: ["Configura notificaciones automáticas de cambio de estado por WhatsApp."],
  },
  {
    icon: CreditCard, title: "Pagos", path: "/admin/pagos", category: "Ventas",
    description: "Historial de pagos recibidos vía Wompi. Incluye referencia, monto, estado y producto asociado.",
    howTo: ["Los pagos se registran automáticamente desde Wompi.", "Filtra por estado (aprobado, pendiente, rechazado) para hacer seguimiento."],
    tips: ["Los pagos rechazados pueden indicar problemas con tarjetas de los clientes."],
  },
  {
    icon: FileText, title: "Landing Ventas", path: "/admin/landing-ventas", category: "Ventas",
    description: "Crea páginas de venta compartibles con combos de productos, video, PDF, galería y cupones de descuento. Ideales para campañas y prospectos.",
    howTo: [
      "1. Haz clic en 'Nueva Landing' y completa el formulario con título, descripción, precios y contenido multimedia.",
      "2. Una vez creada, haz clic en el ícono de 📦 (Productos) para ASOCIAR los items que incluye el combo.",
      "3. En el gestor de items: selecciona el tipo (Producto, Licencia o Pack) → elige el item → haz clic en +.",
      "4. Los items asociados aparecerán en la página pública con su nombre y precio.",
      "5. Copia la URL con el botón de copiar y compártela por WhatsApp o redes.",
    ],
    tips: [
      "⚠️ Primero crea la landing, DESPUÉS asocia los productos. No puedes hacer ambas cosas al mismo tiempo.",
      "El precio de la landing es el precio TOTAL del combo. Los precios individuales de los items son informativos.",
      "El cupón de descuento debe existir previamente en la sección de Cupones.",
      "Usa la galería de imágenes para mostrar los productos incluidos visualmente.",
    ],
  },
  {
    icon: Contact2, title: "Contactos (CRM)", path: "/admin/contactos", category: "CRM",
    description: "Centro de gestión de todos los contactos: prospectos, clientes y leads. Incluye pipeline de ventas, scoring y actividades.",
    howTo: [
      "Los contactos se crean automáticamente desde formularios del sitio o captura del chatbot IA.",
      "Usa el pipeline para mover contactos entre etapas: Nuevo → Contactado → Calificado → Propuesta → Ganado/Perdido.",
      "Agrega notas y actividades desde el panel lateral de detalle.",
    ],
    tips: ["El lead_score se calcula según la interacción del contacto con el sitio."],
  },
  {
    icon: Handshake, title: "Socios (Resellers)", path: "/admin/socios", category: "CRM",
    description: "Gestiona las aplicaciones de socios comerciales, su estado y pipeline de incorporación.",
    howTo: [
      "Los socios aplican desde /representantes o /lp/representantes.",
      "Revisa la aplicación y cambia el estado: pendiente → aprobado → activo.",
      "Los socios aprobados pueden acceder al portal /socio con sus credenciales.",
    ],
    tips: ["Un socio activo puede crear demos y licencias para sus clientes."],
  },
  {
    icon: Package, title: "Proveedores", path: "/admin/proveedores", category: "CRM",
    description: "Directorio de proveedores de hardware y servicios. Permite asociar proveedores a licencias.",
    howTo: ["Crea proveedores con nombre, contacto y notas.", "Asocia un proveedor a una licencia para trazabilidad."],
    tips: ["Útil para saber a quién comprar cuando un cliente necesita hardware."],
  },
  {
    icon: BarChart3, title: "Analytics Tienda", path: "/admin/analytics", category: "Marketing",
    description: "Métricas de la tienda online: visitas, productos más vistos, conversiones y fuentes de tráfico.",
    howTo: ["Selecciona el periodo de análisis.", "Revisa los gráficos de tendencia y las tablas de productos más populares."],
    tips: ["Combina con Google Analytics para una visión completa."],
  },
  {
    icon: Bot, title: "Central IA", path: "/admin/central-ia", category: "Marketing",
    description: "Gestiona el chatbot IA: base de conocimiento, conversaciones, métricas, prompt studio y scraping de sitios.",
    howTo: [
      "Pestaña Conocimiento: agrega preguntas frecuentes y contenido que el chatbot puede usar para responder.",
      "Pestaña Conversaciones: revisa los chats del chatbot con visitantes.",
      "Pestaña Métricas: analiza la efectividad del chatbot (leads capturados, feedback).",
      "Pestaña Scraping: importa contenido de sitios web para alimentar la base de conocimiento.",
    ],
    tips: ["El chatbot captura leads automáticamente cuando detecta interés de compra."],
  },
  {
    icon: Code2, title: "Tracking", path: "/admin/tracking", category: "Marketing",
    description: "Gestiona scripts de seguimiento (Google Analytics, Meta Pixel, etc.) y configuración de cookies.",
    howTo: [
      "Agrega scripts de tracking con nombre, tipo (head/body) y código HTML/JS.",
      "Los scripts se inyectan automáticamente en todas las páginas.",
      "Configura el banner de cookies desde la pestaña de consentimiento.",
    ],
    tips: ["Siempre verifica que los scripts no ralenticen la carga de la página."],
  },
  {
    icon: FileText, title: "Artículos DIAN", path: "/admin/articulos-dian", category: "Marketing",
    description: "Gestiona artículos SEO sobre normativa DIAN y facturación electrónica. Generan tráfico orgánico relevante.",
    howTo: [
      "Crea artículos con título, slug, contenido (secciones JSON), FAQs y CTAs.",
      "Los artículos publicados aparecen en /guias-dian.",
      "Cada artículo tiene su propia landing con meta-datos SEO.",
    ],
    tips: ["Mantén los artículos actualizados cuando cambie la normativa DIAN."],
  },
  {
    icon: KeyRound, title: "Demos Activas", path: "/admin/demos-activas", category: "Soporte",
    description: "Visualiza y gestiona las demos activas de prospectos. Incluye datos de contacto, estado y días restantes.",
    howTo: [
      "Los prospectos solicitan demos desde /lp/demo.",
      "Aquí puedes ver las demos activas, extender vencimientos o convertir a licencia.",
    ],
    tips: ["Contacta a los prospectos 3-5 días antes de que venza su demo."],
  },
  {
    icon: UserCog, title: "Usuarios POS", path: "/admin/usuarios-pos", category: "Soporte",
    description: "Gestiona los usuarios registrados en el sistema POS por licencia. Control de accesos y roles.",
    howTo: [
      "Crea usuarios POS asociados a una licencia específica.",
      "Define rol (admin, cajero, etc.), tienda y credenciales.",
    ],
    tips: ["Verifica periódicamente que las credenciales POS sigan siendo válidas."],
  },
  {
    icon: TicketCheck, title: "Tickets", path: "/admin/tickets-clientes", category: "Soporte",
    description: "Sistema de tickets de soporte. Los clientes crean tickets desde su portal y tú los gestionas aquí.",
    howTo: [
      "Revisa tickets nuevos (estado: abierto).",
      "Responde desde el chat del ticket.",
      "Cambia el estado: abierto → en progreso → resuelto → cerrado.",
    ],
    tips: ["Prioriza tickets con prioridad 'alta' y 'urgente' primero."],
  },
  {
    icon: FileCheck, title: "Contratos", path: "/admin/contratos", category: "Soporte",
    description: "Gestión de contratos de soporte (SLA) asociados a negocios. Incluye PDFs firmados y vencimientos.",
    howTo: ["Crea contratos asociados a un negocio.", "Sube el PDF firmado y define fechas de vigencia."],
    tips: ["Configura alertas de vencimiento de contratos para renovaciones proactivas."],
  },
  {
    icon: Download, title: "Descargas", path: "/admin/descargas-clientes", category: "Soporte",
    description: "Gestiona los archivos disponibles para descarga: instaladores, drivers, manuales y utilidades.",
    howTo: [
      "Crea una descarga con título, URL del archivo, categoría y tipo.",
      "Los archivos aparecen en el portal de clientes y en /ayuda.",
    ],
    tips: ["Mantén siempre la última versión del instalador actualizada."],
  },
  {
    icon: GraduationCap, title: "Capacitación", path: "/admin/capacitacion", category: "Soporte",
    description: "Gestiona videos de capacitación organizados por módulo. Incluye contadores de vistas y importación CSV.",
    howTo: [
      "Agrega videos con título, URL (YouTube/Loom), módulo y descripción.",
      "Usa la importación CSV para agregar múltiples videos.",
      "Los videos aparecen en el portal de clientes.",
    ],
    tips: ["Organiza los videos por módulo para facilitar la búsqueda."],
  },
  {
    icon: FileSignature, title: "Artículos Soporte", path: "/admin/articulos-soporte", category: "Soporte",
    description: "Base de conocimiento para clientes. Artículos con Markdown avanzado, videos y checklists.",
    howTo: [
      "Crea artículos con título, slug, contenido Markdown y visibilidad (público/cliente/socio/admin).",
      "Los artículos públicos son compartibles como landing pages en /ayuda/:slug.",
      "Soporta Markdown: tablas, checklists, código, encabezados, etc.",
    ],
    tips: [
      "Cada artículo tiene un botón de 'copiar URL' para compartir fácilmente.",
      "Los artículos con más vistas son probablemente los más importantes — mantenlos actualizados.",
    ],
  },
  {
    icon: ResourceIcon, title: "Recursos", path: "/admin/recursos", category: "Soporte",
    description: "Gestión de recursos compartidos: documentos, plantillas y materiales de apoyo.",
    howTo: ["Sube recursos con título, categoría y URL.", "Los recursos se muestran según el rol del usuario."],
    tips: ["Útil para compartir material de ventas con los socios."],
  },
  {
    icon: Activity, title: "Actividad", path: "/admin/actividad", category: "Sistema",
    description: "Registro de actividad de usuarios en la plataforma. Útil para auditoría y seguimiento.",
    howTo: ["Filtra por usuario o por tipo de acción.", "Revisa la actividad reciente para detectar comportamientos anómalos."],
    tips: ["La actividad se registra automáticamente para usuarios autenticados."],
  },
  {
    icon: ShieldCheck, title: "Usuarios y Roles", path: "/admin/roles", category: "Sistema",
    description: "Centro integral de gestión: crea usuarios, asigna roles (Admin, Socio, Cliente, Público), administra empresas y asocia usuarios a negocios. Incluye UUIDs legibles con copia rápida.",
    howTo: [
      "Pestaña Usuarios: busca usuarios por nombre, email o ID. Filtra por rol. Usa 'Crear Usuario' para registrar cuentas manualmente.",
      "Para asignar un rol: en la columna 'Acciones' selecciona el rol deseado. Para quitarlo haz clic en la X del badge.",
      "Pestaña Empresas: crea empresas con razón social, NIT y propietario. Visualiza miembros asociados.",
      "Usa el botón 'Asociar' para vincular un usuario existente a una empresa.",
      "Pestaña Enlaces: copia URLs de registro por rol para compartir con prospectos.",
      "Los usuarios sin rol asignado son 'Públicos' — tienen acceso limitado a Mi POS y Entrenamientos hasta que se les apruebe.",
    ],
    tips: [
      "Los UUIDs se muestran abreviados (8 caracteres). Haz clic para copiar el UUID completo.",
      "Un usuario puede tener múltiples roles simultáneamente (ej: admin + reseller).",
      "El usuario maestro (eduardotp77@gmail.com) tiene roles protegidos que no se pueden modificar.",
      "Los usuarios 'Públicos' pueden acceder a entrenamientos marcados como público o cliente.",
    ],
  },
  {
    icon: MessageCircle, title: "Notif. WhatsApp", path: "/admin/notificaciones-wa", category: "Sistema",
    description: "Configuración de notificaciones automáticas por WhatsApp: templates, destinatarios y eventos trigger.",
    howTo: ["Configura las notificaciones que se envían al recibir leads, tickets o pagos."],
    tips: ["Verifica que el número de WhatsApp configurado sea correcto."],
  },
  {
    icon: Settings2, title: "Configuración", path: "/admin/configuracion", category: "Sistema",
    description: "Configuración general: FAQs dinámicas, listas misceláneas, SEO, navegación, historias de éxito, WhatsApp y secretos.",
    howTo: [
      "Pestaña General: configura datos básicos de la empresa.",
      "Pestaña Listas: gestiona las opciones de formularios (tipos de negocio, países, etc.).",
      "Pestaña FAQs: crea preguntas frecuentes que aparecen en varias páginas.",
      "Pestaña SEO: configura meta-datos globales y por página.",
      "Pestaña Navegación: gestiona los menús del sitio.",
      "Pestaña WhatsApp: configura el número y mensajes predeterminados.",
    ],
    tips: [
      "Las listas misceláneas alimentan los selectores de todo el sistema — si falta una opción, agrégala aquí.",
      "Los cambios en navegación se reflejan inmediatamente en el sitio.",
    ],
  },
];

const categories = ["General", "Catálogo", "Ventas", "CRM", "Marketing", "Soporte", "Sistema"];

export default function AdminDocsView() {
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  const filtered = docs.filter(d => {
    const matchesSearch = !search || 
      d.title.toLowerCase().includes(search.toLowerCase()) ||
      d.description.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = !activeCategory || d.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <BookOpen className="h-6 w-6 text-primary" />
          Documentación del Panel
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Guía completa de cada sección del panel administrativo. Cómo usar cada módulo, consejos y flujos.
        </p>
      </div>

      {/* Search & Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar sección..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <div className="flex flex-wrap gap-1.5">
          <Badge
            variant={!activeCategory ? "default" : "outline"}
            className="cursor-pointer text-xs"
            onClick={() => setActiveCategory(null)}
          >
            Todas
          </Badge>
          {categories.map(cat => (
            <Badge
              key={cat}
              variant={activeCategory === cat ? "default" : "outline"}
              className="cursor-pointer text-xs"
              onClick={() => setActiveCategory(activeCategory === cat ? null : cat)}
            >
              {cat}
            </Badge>
          ))}
        </div>
      </div>

      {/* Docs Grid */}
      <ScrollArea className="h-[calc(100vh-260px)]">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 pb-4">
          {filtered.map(doc => (
            <Card key={doc.path} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-5">
                <div className="flex items-start gap-3 mb-3">
                  <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                    <doc.icon className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-sm">{doc.title}</h3>
                    <Badge variant="outline" className="text-[10px] mt-0.5">{doc.category}</Badge>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground mb-3 leading-relaxed">{doc.description}</p>
                
                <details className="group">
                  <summary className="text-xs font-semibold text-primary cursor-pointer hover:underline">
                    📖 Cómo usar ({doc.howTo.length} pasos)
                  </summary>
                  <ol className="mt-2 space-y-1.5 text-xs text-muted-foreground list-decimal list-inside">
                    {doc.howTo.map((step, i) => (
                      <li key={i} className="leading-relaxed">{step}</li>
                    ))}
                  </ol>
                </details>

                {doc.tips.length > 0 && (
                  <details className="group mt-2">
                    <summary className="text-xs font-semibold text-amber-600 cursor-pointer hover:underline">
                      💡 Tips ({doc.tips.length})
                    </summary>
                    <ul className="mt-2 space-y-1 text-xs text-muted-foreground">
                      {doc.tips.map((tip, i) => (
                        <li key={i} className="flex items-start gap-1.5">
                          <span className="text-amber-500 shrink-0">•</span>
                          {tip}
                        </li>
                      ))}
                    </ul>
                  </details>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}
