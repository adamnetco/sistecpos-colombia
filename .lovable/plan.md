

# Plan: Integracion de Wompi como Pasarela de Pagos

## Resumen

Integrar Wompi Colombia como pasarela de pagos en todo el sitio, habilitando pagos en linea con tarjeta de credito/debito, PSE, Nequi, boton Bancolombia y Daviplata. Esto reemplaza el flujo actual de transferencia bancaria manual.

## Flujos afectados

1. **Certificados digitales** (`CertificatePurchaseDialog`): Actualmente solicita documentos y envia notificacion WhatsApp para pago manual.
2. **Tienda de productos / Carrito** (`CartDrawer`): Actualmente envia cotizacion por WhatsApp sin pago en linea.

## Enfoque tecnico: Wompi Checkout Widget

Wompi ofrece un widget de checkout (JS embebido) que maneja todo el flujo de pago de forma segura, incluyendo seleccion de metodo de pago, tokenizacion de tarjetas, redireccion PSE, etc. Este es el enfoque mas simple y seguro.

**Flujo:**

1. El usuario llena formulario (datos + documentos en certificados, o carrito en tienda).
2. Se crea un registro en la BD con status `pending`.
3. Se genera una referencia unica de pago y se abre el widget de Wompi.
4. Wompi procesa el pago y envia un webhook a un Edge Function.
5. El Edge Function valida la firma del evento, actualiza el status del pago/orden a `approved` o `declined`.
6. El frontend muestra confirmacion al usuario.

## Implementacion paso a paso

### 1. Almacenar llaves de API como secretos

- **WOMPI_PUBLIC_KEY**: Llave publica (usada en el frontend para el widget, se almacena como variable VITE).
- **WOMPI_PRIVATE_KEY**: Llave privada (usada en el Edge Function para validar webhooks).
- **WOMPI_EVENTS_SECRET**: Secreto de eventos para validar la firma de los webhooks.
- **WOMPI_ENVIRONMENT**: `sandbox` o `production`.

### 2. Tabla `wompi_transactions` (nueva)

```text
wompi_transactions
  id                uuid PK
  reference         text NOT NULL UNIQUE  -- referencia unica enviada a Wompi
  wompi_id          text                  -- ID de transaccion devuelto por Wompi
  amount_cents      integer NOT NULL      -- monto en centavos COP
  currency          text DEFAULT 'COP'
  status            text DEFAULT 'PENDING' -- PENDING, APPROVED, DECLINED, VOIDED, ERROR
  payment_method    text                  -- CARD, PSE, NEQUI, BANCOLOMBIA_TRANSFER
  customer_email    text
  customer_name     text
  customer_phone    text
  -- FK opcionales para vincular con ordenes existentes
  certificate_order_id  uuid (FK -> certificate_orders)
  cart_quote_id         text              -- referencia al carrito/cotizacion
  metadata          jsonb DEFAULT '{}'
  wompi_response    jsonb DEFAULT '{}'    -- respuesta completa de Wompi para auditoria
  created_at        timestamptz
  updated_at        timestamptz
```

RLS: Admins lectura total; insert publico para el Edge Function (via service role).

### 3. Edge Function `wompi-checkout` (nueva)

Responsabilidades:
- Recibir datos del frontend (items, monto, referencia, datos del cliente).
- Generar la referencia unica de pago.
- Generar la firma de integridad (`integrity signature`) usando SHA256 con la llave privada.
- Crear el registro en `wompi_transactions`.
- Devolver al frontend: referencia, firma, llave publica, monto en centavos.

### 4. Edge Function `wompi-webhook` (nueva)

Responsabilidades:
- Recibir el evento POST de Wompi.
- Validar la firma del evento usando `WOMPI_EVENTS_SECRET`.
- Actualizar `wompi_transactions` con el status final y la respuesta completa.
- Si el pago es para un certificado: actualizar `certificate_orders.status` y crear registro en `payments`.
- Si el pago es para productos del carrito: crear registro en `payments`.
- Enviar notificacion WhatsApp al equipo de ventas (reutilizando logica existente).

### 5. Componente `WompiCheckoutButton` (nuevo)

Un componente React reutilizable que:
- Carga el script de Wompi (`https://checkout.wompi.co/widget.js`).
- Recibe props: monto, referencia, email, datos del cliente.
- Al hacer clic, invoca el Edge Function `wompi-checkout` para obtener la firma.
- Abre el widget de Wompi con los parametros recibidos.
- Escucha el evento de cierre del widget y redirige o muestra estado.

### 6. Modificar `CertificatePurchaseDialog`

- Despues de subir documentos y crear la orden, mostrar el boton `WompiCheckoutButton` en lugar de solo mostrar "te contactaremos".
- La orden se crea con status `pending` y se vincula al pago via `certificate_order_id`.

### 7. Modificar `CartDrawer`

- Agregar un segundo boton "Pagar en linea" junto al boton de WhatsApp existente.
- Al hacer clic, invoca `WompiCheckoutButton` con el total del carrito.
- Mantener la opcion de cotizacion por WhatsApp como alternativa.

### 8. Pagina de resultado de pago (nueva ruta)

- Crear `/pago/resultado` que muestre el estado del pago (aprobado, rechazado, pendiente).
- Wompi redirige aqui despues del pago con la referencia en la URL.
- La pagina consulta `wompi_transactions` por referencia para mostrar el estado.

---

## Archivos a crear/modificar

| Archivo | Accion |
|---------|--------|
| `supabase/functions/wompi-checkout/index.ts` | Crear - genera firma y referencia |
| `supabase/functions/wompi-webhook/index.ts` | Crear - recibe eventos de Wompi |
| `src/components/payments/WompiCheckoutButton.tsx` | Crear - widget de pago |
| `src/pages/PagoResultadoPage.tsx` | Crear - pagina de resultado |
| `src/components/certificados/CertificatePurchaseDialog.tsx` | Modificar - agregar pago en linea |
| `src/components/cart/CartDrawer.tsx` | Modificar - agregar boton pagar |
| `src/App.tsx` | Modificar - agregar ruta `/pago/resultado` |
| `supabase/config.toml` | Modificar - agregar nuevas funciones |
| Migracion SQL | Crear tabla `wompi_transactions` |

## Secretos requeridos

Se solicitaran al usuario antes de implementar:
1. **WOMPI_PUBLIC_KEY** - Llave publica de Wompi
2. **WOMPI_PRIVATE_KEY** - Llave privada de Wompi  
3. **WOMPI_EVENTS_SECRET** - Secreto para validar webhooks
4. **WOMPI_ENVIRONMENT** - `sandbox` o `production`

