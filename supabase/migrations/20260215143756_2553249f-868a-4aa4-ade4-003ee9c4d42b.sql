
-- Add tags array column to training_videos
ALTER TABLE public.training_videos ADD COLUMN IF NOT EXISTS tags text[] NOT NULL DEFAULT '{}';

-- Create GIN index for efficient tag search
CREATE INDEX IF NOT EXISTS idx_training_videos_tags ON public.training_videos USING GIN(tags);

-- Auto-populate tags based on title keywords and category
UPDATE public.training_videos SET tags = ARRAY(
  SELECT DISTINCT unnest FROM unnest(
    ARRAY[
      lower(category),
      CASE WHEN title ~* 'excel|importa' THEN 'excel' END,
      CASE WHEN title ~* 'factur|FE|resolución' THEN 'facturación electrónica' END,
      CASE WHEN title ~* 'impuesto|IVA|exento|saludable|retención' THEN 'impuestos' END,
      CASE WHEN title ~* 'serie|serial' THEN 'seriales' END,
      CASE WHEN title ~* 'impres|zona.*impresión|ticket|billete' THEN 'impresora' END,
      CASE WHEN title ~* 'crédito|cartera|abono|préstamo' THEN 'crédito' END,
      CASE WHEN title ~* 'producto|artículo|inventario' THEN 'productos' END,
      CASE WHEN title ~* 'cliente|tercero' THEN 'clientes' END,
      CASE WHEN title ~* 'proveedor|compra' THEN 'proveedores' END,
      CASE WHEN title ~* 'caja|apertura|cierre|movimiento' THEN 'caja' END,
      CASE WHEN title ~* 'precio|costo' THEN 'precios' END,
      CASE WHEN title ~* 'balanza|peso' THEN 'balanza' END,
      CASE WHEN title ~* 'restaurante|mesa|cocina|campana' THEN 'restaurante' END,
      CASE WHEN title ~* 'tienda|multi.*tienda|transferencia' THEN 'multi-tienda' END,
      CASE WHEN title ~* 'empleado|nómina|comisión' THEN 'empleados' END,
      CASE WHEN title ~* 'informe|reporte|estadística' THEN 'informes' END,
      CASE WHEN title ~* 'contab|cuenta|asiento|activo.*fijo' THEN 'contabilidad' END,
      CASE WHEN title ~* 'devolución|nota.*crédito' THEN 'devoluciones' END,
      CASE WHEN title ~* 'descuento|oferta|punto|regalo' THEN 'descuentos' END,
      CASE WHEN title ~* 'lote|vencimiento' THEN 'lotes' END,
      CASE WHEN title ~* 'bodega|almacén' THEN 'bodega' END,
      CASE WHEN title ~* 'QR|código.*barra|barcode' THEN 'códigos' END,
      CASE WHEN title ~* 'offline|sin.*conexión' THEN 'offline' END,
      CASE WHEN title ~* 'agenda|cita' THEN 'agenda' END,
      CASE WHEN title ~* 'receta|producción' THEN 'producción' END,
      CASE WHEN title ~* 'cotización|remisión' THEN 'cotización' END,
      CASE WHEN title ~* 'DIAN|documento.*soporte' THEN 'dian' END,
      CASE WHEN title ~* 'demo|crear.*demo' THEN 'demo' END,
      CASE WHEN title ~* 'soporte|solución|problema|error' THEN 'soporte' END
    ]
  ) WHERE unnest IS NOT NULL
);
