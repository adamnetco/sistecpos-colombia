

# Auditoría del Sitio y Mejoras del Portal de Socios

## 1. Problema: Ruta /analytics da 404

La ruta `/analytics` NO existe como pagina publica. La pagina de Analytics de la tienda vive en `/admin/analytics` y requiere sesion de administrador. No hay ninguna ruta publica registrada en `App.tsx` para `/analytics`.

**Solucion:** Agregar un redirect `/analytics` -> `/admin/analytics` en `App.tsx` para que si alguien navega directamente, sea redirigido al panel admin donde se valida el acceso.

## 2. Rutas del Portal de Socios

Las rutas del portal de socios son `/socio/*`, NO `/reseller/*`. Las rutas correctas son:
- `/socio` - Dashboard
- `/socio/licencias` - Licencias
- `/socio/entrenamientos` - Entrenamientos
- `/socio/tickets` - Tickets
- `/socio/comisiones` - Comisiones

Todas funcionan correctamente en el codigo. Solo que la URL base es `/socio`, no `/reseller`.

## 3. Mejoras del Portal de Socios

### 3.1 Licencias (`/socio/licencias`)
- Agregar **contadores resumen** en la parte superior (Total, Activas, Vencidas, Por vencer en 30 dias)
- Agregar boton de **Exportar CSV** (reutilizando `exportCsv.ts`)
- Agregar **filtro por estado** (Todas, Activas, Vencidas, Suspendidas)

### 3.2 Entrenamientos (`/socio/entrenamientos`)
- Agregar **filtro por categoria** (tabs o select)
- Mostrar **badge de conteo** por categoria
- Agregar indicador de **contenido nuevo** si el entrenamiento fue creado hace menos de 7 dias

### 3.3 Tickets (`/socio/tickets`)
- Agregar **filtro por estado** (Todos, Abiertos, Resueltos)
- Mostrar **badge de conteo** de tickets abiertos en el encabezado
- Agregar **fecha de respuesta** cuando el admin responde

### 3.4 Comisiones (`/socio/comisiones`)
- Agregar **resumen total** de comisiones estimadas basado en licencias vendidas vs reglas de comision
- Agregar una seccion de **historial de pagos** (tabla `reseller_commission_payments` nueva)
- Mostrar **estado de pago** (Pendiente, Pagado) con totales

### 3.5 Dashboard (`/socio`)
- Agregar card de **Licencias por vencer** (proximos 30 dias) con alerta visual
- Agregar **accesos rapidos** a las secciones mas usadas
- Mostrar **comisiones pendientes** en el KPI

## 4. Cambios Tecnicos

| Archivo | Cambio |
|---------|--------|
| `src/App.tsx` | Redirect `/analytics` -> `/admin/analytics` |
| `src/components/reseller/ResellerLicensesView.tsx` | Cards KPI, filtro por estado, exportar CSV |
| `src/components/reseller/ResellerTrainingsView.tsx` | Filtro por categoria, badge "nuevo" |
| `src/components/reseller/ResellerTicketsView.tsx` | Filtro por estado, conteo abiertos, fecha respuesta |
| `src/components/reseller/ResellerCommissionsView.tsx` | Resumen estimado, seccion historial de pagos |
| `src/components/reseller/ResellerDashboard.tsx` | Card licencias por vencer, accesos rapidos, comisiones pendientes |
| SQL Migration | Crear tabla `reseller_commission_payments` (id, reseller_id, amount, period, status, paid_at, notes) con RLS |

## 5. Nueva tabla: reseller_commission_payments

```text
reseller_commission_payments
  id (uuid, PK)
  reseller_id (uuid, FK -> reseller_applications)
  amount (numeric, NOT NULL)
  period (text, e.g. "2026-01")
  status (text, default 'pending': pending/paid)
  paid_at (timestamptz, nullable)
  notes (text, nullable)
  created_at (timestamptz, default now())
```

Con politicas RLS:
- Socios pueden leer sus propios registros
- Admins tienen acceso completo

