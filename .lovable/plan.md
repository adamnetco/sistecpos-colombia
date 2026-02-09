

## Plan: Corregir contenido factual del cluster Firma Digital en Guías DIAN

### Problema
El sitio afirma incorrectamente que la DIAN no ofrece certificado de firma digital gratuito. La DIAN SI lo ofrece mediante convenio con GSE para quienes usan su Software Gratuito. Esto afecta la credibilidad del sitio y puede impactar negativamente el SEO (Google penaliza contenido inexacto en temas YMYL).

### Cambios en `src/data/dianArticles.ts`

#### 1. Artículo `firma-digital-dian-gratis` (el más afectado)

- **Sección "¿La DIAN ofrece firma digital gratis?"**: Reescribir completamente. Cambiar de "No" a "Sí, pero con limitaciones". Explicar que la DIAN otorga un certificado sin costo a través de convenios con GSE, exclusivamente para quienes usan el Software Solución Gratuita.
- **Agregar nueva sección**: "Cómo solicitar el certificado gratuito paso a paso" con los 5 pasos: Habilitación, Selección del Modo, Solicitud del Certificado, Validación con el Certificador, e Instalación.
- **Agregar nueva sección**: "Datos clave del certificado gratuito" con vigencia (1-2 años), renovación gratuita (hasta 3 meses antes), y requisito del RUT actualizado.
- **Ajustar sección SistecPOS**: El argumento comercial pasa de "no existe gratis" a "existe gratis pero solo con el software básico de la DIAN que carece de inventario, reportes, multi-tienda, POS y soporte técnico personalizado".
- **Actualizar FAQs**: Agregar pregunta sobre la diferencia entre el certificado gratuito DIAN y un certificado comercial.
- **Actualizar `painVsSolution`**: Cambiar los dolores a las limitaciones reales del software gratuito DIAN (sin inventario, sin reportes, sin POS, sin soporte) en vez de decir que no existe opción gratuita.

#### 2. Artículo `certificados-digitales-facturacion-electronica`

- **Agregar sección**: "Opción gratuita: certificado vía Software DIAN" explicando que existe esta vía pero limitada al software básico de la DIAN.
- **Actualizar bullets de precios**: Agregar línea "Software Gratuito DIAN + GSE: $0 COP (solo con el facturador básico de la DIAN)".

#### 3. Artículo `obtener-firma-electronica-dian`

- **Agregar "Paso 0"**: Antes de los pasos actuales, mencionar que si el usuario planea usar el Software Gratuito de la DIAN, puede obtener el certificado sin costo siguiendo el flujo de solicitud en el portal DIAN.
- **Aclarar en la sección de proveedores**: Que GSE también emite certificados gratuitos a través del convenio con la DIAN.

#### 4. Artículo `andes-scd-vs-gse`

- **Agregar mención en sección GSE**: Que GSE tiene un convenio con la DIAN para emitir certificados gratuitos a quienes usan el Software Solución Gratuita.
- **Actualizar bullet de precios GSE**: Agregar "GSE vía convenio DIAN (Software Gratuito): $0 COP".

### Enfoque comercial actualizado (honesto y efectivo)

En todas las secciones de SistecPOS, el argumento cambia a:

> "La DIAN ofrece un certificado gratuito, pero solo funciona con su software básico que no incluye: control de inventario, reportes de ventas, punto de venta (POS), soporte técnico personalizado, gestión multi-tienda ni integraciones avanzadas. Con SistecPOS tienes todo esto MAS el certificado incluido."

### Impacto
- Corrige desinformación factual en 4 artículos
- Mejora la credibilidad SEO (contenido YMYL preciso)
- Mantiene el argumento comercial de SistecPOS de forma honesta
- Sin cambios en componentes ni estructura, solo datos en `dianArticles.ts`

