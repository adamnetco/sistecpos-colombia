

# Plan: Dominar SEO "Software POS Colombia"

## Diagnostico: Que falta

### 1. Pagina Pilar Nacional (CRITICA - No existe)
Falta la pagina mas importante para el keyword principal: **`/software-pos-colombia`**. Esta seria la pagina pilar que concentra autoridad y enlaza a todas las ciudades y soluciones.

**Contenido propuesto:**
- H1: "Software POS en Colombia: El Sistema Punto de Venta #1 para Tu Negocio"
- Seccion "Que es un Software POS" (contenido educativo para long-tail)
- Seccion "Facturacion Electronica DIAN" (keyword de alta intencion)
- Mapa visual de cobertura con las 23+ ciudades enlazadas
- Grid de los 24 tipos de negocio enlazados
- Comparativa resumida con CTA a `/comparativa-licencias`
- FAQ con schema markup (preguntas frecuentes sobre POS en Colombia)
- Testimonios nacionales

### 2. Pagina de Facturacion Electronica (No existe)
Keyword de alta intencion: **`/facturacion-electronica`**
- H1: "Facturacion Electronica DIAN con Software POS Integrado"
- Explicar la obligatoriedad DIAN
- Como SistecPOS cumple con la norma
- Interlinks a ciudades y soluciones

### 3. Sitemap Desincronizado con Datos Reales
El `sitemap.xml` tiene slugs que NO coinciden con `businessTypes.ts`:

| Sitemap (incorrecto) | businessTypes.ts (real) |
|---|---|
| `/soluciones/farmacias` | `droguerias` |
| `/soluciones/fruteria-heladeria` | `fruver` |
| `/soluciones/carniceria-avicola` | `carnicerias` |
| `/soluciones/cafeteria` | `cafeterias` |
| `/soluciones/repuestos-automotriz` | `lavaderos-autos` |
| `/soluciones/mayoristas` | No existe |
| `/soluciones/licorera` | No existe |
| `/soluciones/distribuidora` | `distribuidoras` |

Esto genera enlaces rotos que perjudican el SEO.

### 4. Interlinks Faltantes Entre Paginas
Actualmente las paginas estan aisladas. Se necesitan interlinks estrategicos:

- Cada pagina de ciudad debe enlazar a las soluciones mas relevantes de esa ciudad
- Cada pagina de solucion debe enlazar a las ciudades donde esta disponible
- La pagina de comparativa debe enlazar a la pillar page y viceversa
- Las paginas de productos deben enlazar a las soluciones que usan ese hardware

### 5. Schema JSON-LD (No implementado en paginas)
Falta structured data en:
- Paginas de ciudad: `LocalBusiness` schema
- Pagina de comparativa: `Product` + `AggregateRating`
- FAQ sections: `FAQPage` schema
- Home: `Organization` + `LocalBusiness`

### 6. Navbar sin enlace a Pagina Pilar
El menu no tiene enlace a "Software POS Colombia" ni a "Facturacion Electronica"

---

## Implementacion Tecnica

### Paso 1: Corregir sitemap.xml
Sincronizar todos los slugs del sitemap con los slugs reales de `businessTypes.ts`. Agregar las nuevas paginas pillar.

### Paso 2: Crear pagina `/software-pos-colombia`
Nueva pagina `src/pages/SoftwarePosColombiaPage.tsx` con:
- Hero optimizado para "Software POS Colombia"
- Seccion de ciudades con mapa de cobertura interactivo (links a cada `/software-pos/:city`)
- Grid de soluciones por industria (links a cada `/soluciones/:slug`)
- Seccion de facturacion electronica DIAN
- FAQ con schema JSON-LD integrado
- CTA a WhatsApp

### Paso 3: Crear pagina `/facturacion-electronica`
Nueva pagina `src/pages/FacturacionElectronicaPage.tsx` con:
- Contenido educativo sobre obligatoriedad DIAN
- Como funciona con SistecPOS
- Interlinks a soluciones y ciudades

### Paso 4: Agregar interlinks cruzados
- En `SoftwarePosLocalPage.tsx`: seccion "Soluciones disponibles en [ciudad]" con links a `/soluciones/:slug`
- En `SolucionNegocioPage.tsx`: seccion "Disponible en estas ciudades" con links a `/software-pos/:city`
- En `ComparativaLicenciasPage.tsx`: links a la pagina pillar
- Breadcrumbs en todas las subpaginas

### Paso 5: Implementar JSON-LD Schema
Crear componente `src/components/seo/JsonLd.tsx` reutilizable que inyecte:
- `LocalBusiness` en paginas de ciudad
- `FAQPage` en la pagina pillar y facturacion
- `Organization` en el home
- `BreadcrumbList` en todas las subpaginas

### Paso 6: Actualizar navegacion
- Agregar "Software POS Colombia" al Navbar
- Agregar "Facturacion Electronica" al Footer
- Agregar breadcrumbs visuales en paginas interiores

### Paso 7: Actualizar rutas en App.tsx
Agregar:
```text
/software-pos-colombia -> SoftwarePosColombiaPage
/facturacion-electronica -> FacturacionElectronicaPage
```

### Paso 8: Regenerar sitemap.xml
Con todos los slugs corregidos y las nuevas paginas incluidas.

---

## Copywriting SEO Propuesto

### Pagina Pillar - H1 y Meta
- **H1:** "Software POS en Colombia | Sistema Punto de Venta para Tu Negocio"
- **Meta Title:** "Software POS Colombia 2025 | Sistema Punto de Venta #1 | SistecPOS"
- **Meta Description:** "Software POS para negocios en Colombia con facturacion electronica DIAN, modo offline 8 dias y soporte en 23+ ciudades. Prueba gratis."

### Facturacion Electronica - H1 y Meta
- **H1:** "Facturacion Electronica DIAN con Software POS Integrado"
- **Meta Title:** "Facturacion Electronica DIAN | Software POS con FE | SistecPOS"
- **Meta Description:** "Cumple con la facturacion electronica DIAN desde tu software POS. Emite facturas, notas credito y documentos soporte. Cotiza gratis."

### FAQ Sugeridas (con schema)
1. "Que es un software POS y para que sirve?"
2. "Cuanto cuesta un software POS en Colombia?"
3. "Que software POS funciona sin internet?"
4. "Como implementar facturacion electronica DIAN?"
5. "Cual es el mejor software POS para restaurantes en Colombia?"
6. "Se puede usar un POS en el celular?"
7. "Que hardware necesito para un punto de venta?"

---

## Archivos a Crear
- `src/pages/SoftwarePosColombiaPage.tsx`
- `src/pages/FacturacionElectronicaPage.tsx`
- `src/components/seo/JsonLd.tsx`
- `src/components/seo/Breadcrumbs.tsx`

## Archivos a Modificar
- `src/App.tsx` (nuevas rutas)
- `public/sitemap.xml` (corregir slugs, agregar paginas)
- `src/components/layout/Navbar.tsx` (nuevos enlaces)
- `src/components/layout/Footer.tsx` (nuevos enlaces)
- `src/pages/SoftwarePosLocalPage.tsx` (interlinks a soluciones)
- `src/pages/SolucionNegocioPage.tsx` (interlinks a ciudades)
- `src/pages/ComparativaLicenciasPage.tsx` (interlinks)
- `src/pages/Index.tsx` (JSON-LD Organization)

