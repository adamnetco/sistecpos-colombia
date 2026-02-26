
-- Seed misc_lists with standard system keys
INSERT INTO misc_lists (list_key, label, description, items, sort_order) VALUES
  ('business_types', 'Tipos de Negocio', 'Tipos de negocio disponibles en formularios de demo y leads', ARRAY['Restaurante','Tienda / Mini Market','Supermercado','Ferretería','Droguería / Farmacia','Papelería','Licorería','Panadería / Cafetería','Bar / Discoteca','Peluquería / Barbería','Veterinaria','Óptica','Gimnasio','Hotel / Hostal','Lavandería','Taller Mecánico','Otro'], 1),
  ('countries', 'Países', 'Lista de países en formularios', ARRAY['Colombia','Ecuador','Perú','Venezuela','Panamá','México','Chile','Argentina','República Dominicana','Costa Rica','Guatemala','Honduras','El Salvador','Bolivia','Paraguay','Uruguay','Otro'], 2),
  ('urgency_levels', 'Niveles de Urgencia', 'Opciones de urgencia para leads', ARRAY['Inmediata (esta semana)','Próximas 2 semanas','Este mes','Explorando opciones'], 3),
  ('employee_counts', 'Rango de Empleados', 'Cantidad de empleados en formularios', ARRAY['Solo yo','2 a 5','6 a 15','16 a 50','Más de 50'], 4),
  ('daily_sales_ranges', 'Rango de Ventas Diarias', 'Opciones de rango de ventas diarias', ARRAY['Menos de $200.000','$200.000 - $500.000','$500.000 - $1.000.000','$1.000.000 - $3.000.000','Más de $3.000.000'], 5),
  ('product_types', 'Tipos de Producto (Catálogo)', 'Tipos de producto para catalog_products', ARRAY['hardware','software','servicio','consumible','physical'], 6),
  ('ticket_priorities', 'Prioridades de Tickets', 'Niveles de prioridad para tickets de soporte', ARRAY['baja','normal','alta','urgente'], 7),
  ('ticket_statuses', 'Estados de Tickets', 'Estados de tickets de soporte', ARRAY['open','in_progress','waiting','resolved','closed'], 8),
  ('lead_statuses', 'Estados de Leads', 'Ciclo de vida de prospectos', ARRAY['new','contacted','qualified','demo_scheduled','demo_completed','proposal_sent','negotiation','won','lost'], 9),
  ('license_plan_types', 'Tipos de Plan de Licencia', 'Planes disponibles para licencias', ARRAY['basica','intermedia','premium','vitalicia'], 10),
  ('contact_types', 'Tipos de Contacto', 'Tipos de contacto en el CRM', ARRAY['prospect','customer','partner','supplier'], 11),
  ('pipeline_stages', 'Etapas del Pipeline', 'Fases del embudo de ventas', ARRAY['new','contacted','qualified','proposal','negotiation','client','lost'], 12),
  ('support_article_categories', 'Categorías de Artículos Ayuda', 'Categorías para artículos de soporte', ARRAY['inicio','configuración','facturación','inventario','reportes','impresoras','errores','integraciones'], 13),
  ('download_categories', 'Categorías de Descargas', 'Categorías para archivos descargables', ARRAY['general','impresoras','drivers','manuales','herramientas'], 14),
  ('download_file_types', 'Tipos de Archivo (Descargas)', 'Tipos de archivo en la sección descargas', ARRAY['installer','manual','driver','tool','other'], 15)
ON CONFLICT (list_key) DO NOTHING;
