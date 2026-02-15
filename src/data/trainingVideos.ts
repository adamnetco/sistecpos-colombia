// Training videos data imported from capacitación source

export interface TrainingVideo {
  id: string;
  title: string;
  category: string;
  video_url: string;
  type: "youtube" | "loom";
  duration?: string;
  order: number;
}

export const mainTutorials: TrainingVideo[] = [
  { id: "yt-1", title: "Presentación", category: "Básicos", video_url: "https://www.youtube.com/watch?v=PHET-RZfg6c", type: "youtube", duration: "4:41", order: 1 },
  { id: "yt-2", title: "Configuración", category: "Básicos", video_url: "https://www.youtube.com/watch?v=NE4IWySqQc8", type: "youtube", duration: "39:34", order: 2 },
  { id: "yt-3", title: "Proveedores", category: "Compras", video_url: "https://www.youtube.com/watch?v=800d_w10-DU", type: "youtube", duration: "10:00", order: 3 },
  { id: "yt-4", title: "Inventario", category: "Inventario", video_url: "https://www.youtube.com/watch?v=gEHL69sTREw", type: "youtube", duration: "24:03", order: 4 },
  { id: "yt-5", title: "Ventas", category: "Ventas", video_url: "https://www.youtube.com/watch?v=Gkjdo5oDhYo", type: "youtube", duration: "33:37", order: 5 },
  { id: "yt-6", title: "Movimiento de Caja", category: "Caja", video_url: "https://www.youtube.com/watch?v=I-gI9STQN1I", type: "youtube", duration: "4:13", order: 6 },
  { id: "yt-7", title: "Empleados", category: "Configuración", video_url: "https://www.youtube.com/watch?v=l6x1yFkyqa4", type: "youtube", duration: "7:53", order: 7 },
  { id: "yt-8", title: "Clientes", category: "Ventas", video_url: "https://www.youtube.com/watch?v=tD3vBRH02ys", type: "youtube", duration: "5:42", order: 8 },
  { id: "yt-9", title: "Bodega", category: "Inventario", video_url: "https://www.youtube.com/watch?v=4cnV1nv0las", type: "youtube", duration: "10:00", order: 9 },
  { id: "yt-10", title: "Multi-Tienda", category: "Avanzado", video_url: "https://www.youtube.com/watch?v=X7vpvIqo8Ww", type: "youtube", duration: "10:27", order: 10 },
  { id: "yt-11", title: "Restaurante", category: "Avanzado", video_url: "https://www.youtube.com/watch?v=sxTHNU7TLk8", type: "youtube", duration: "10:56", order: 11 },
  { id: "yt-12", title: "Nuevas Funciones v5.1", category: "Actualizaciones", video_url: "https://www.youtube.com/watch?v=b5ZQlGjyreY", type: "youtube", duration: "42:06", order: 12 },
  { id: "yt-13", title: "Nuevas Funciones v5.2", category: "Actualizaciones", video_url: "https://www.youtube.com/watch?v=lTWOBeXBDtI", type: "youtube", duration: "25:20", order: 13 },
];

export const quickVideos: TrainingVideo[] = [
  { id: "lm-1", title: "Facturas electrónicas emitidas", category: "Facturación", video_url: "https://www.loom.com/share/5564f4605df24925b80c0a3f4fac32ff", type: "loom", order: 1 },
  { id: "lm-2", title: "Devoluciones", category: "Ventas", video_url: "https://www.loom.com/share/ba72f039656f49e48a67d8f5fe660636", type: "loom", order: 2 },
  { id: "lm-3", title: "Información completa del billete", category: "Caja", video_url: "https://www.loom.com/share/d79b9ec158d94d41ac7c5bdf30d65195", type: "loom", order: 3 },
  { id: "lm-4", title: "Cambio de nombre de factura", category: "Facturación", video_url: "https://www.loom.com/share/27f39c14db9948669a09ff45afcf452b", type: "loom", order: 4 },
  { id: "lm-5", title: "Modificar con Excel", category: "Inventario", video_url: "https://www.loom.com/share/911cfda8a0c241db86585fdb9ce87771", type: "loom", order: 5 },
  { id: "lm-6", title: "Modificar productos sin importador", category: "Inventario", video_url: "https://www.loom.com/share/4a276c2809474aa3914cb1d04481d001", type: "loom", order: 6 },
  { id: "lm-7", title: "Cómo eliminar una venta", category: "Ventas", video_url: "https://www.loom.com/share/dee24ca164a541058d36bf84fc352f5a", type: "loom", order: 7 },
  { id: "lm-8", title: "Productos exentos de impuesto", category: "Facturación", video_url: "https://www.loom.com/share/23a382c20b7546139e74b3341dcbe3da", type: "loom", order: 8 },
  { id: "lm-9", title: "Editar productos con Excel", category: "Inventario", video_url: "https://www.loom.com/share/bd1810a663954ce8a7da38e23428a4b0", type: "loom", order: 9 },
  { id: "lm-10", title: "Eliminar productos", category: "Inventario", video_url: "https://www.loom.com/share/e19cc0d6b49c48f2bdbbfd958c1bb532", type: "loom", order: 10 },
  { id: "lm-11", title: "Casa de cambio (parte 1)", category: "Avanzado", video_url: "https://www.loom.com/share/2248063392d5445ca4e1223fe42e4304", type: "loom", order: 11 },
  { id: "lm-12", title: "Casa de cambio (parte 2)", category: "Avanzado", video_url: "https://www.loom.com/share/04c526a00ba7483897d18b1d7dbf010c", type: "loom", order: 12 },
  { id: "lm-13", title: "Balanza emulador Moresco", category: "Configuración", video_url: "https://www.loom.com/share/5a78e07c345441ee94d1502add09085f", type: "loom", order: 13 },
  { id: "lm-14", title: "Programa de balanza", category: "Configuración", video_url: "https://www.loom.com/share/5caf9a3c116b46608f236ab5c97e101a", type: "loom", order: 14 },
  { id: "lm-15", title: "Métodos de pago", category: "Ventas", video_url: "https://www.loom.com/share/eaae3b244e9c491a82239370f6612ff1", type: "loom", order: 15 },
  { id: "lm-16", title: "Diferentes presentaciones de salida", category: "Configuración", video_url: "https://www.loom.com/share/c1f15a518a0e4bf4be90e899c674bf6d", type: "loom", order: 16 },
  { id: "lm-17", title: "Crédito a clientes", category: "Ventas", video_url: "https://www.loom.com/share/5cad6bdf676843758cbbbc12655cd037", type: "loom", order: 17 },
  { id: "lm-18", title: "Modificar resolución de facturación electrónica", category: "Facturación", video_url: "https://www.loom.com/share/2a71e982a05d4f75854a5773100085cb", type: "loom", order: 18 },
  { id: "lm-19", title: "Asociar nueva resolución FE", category: "Facturación", video_url: "https://www.loom.com/share/19d33c1675b64a7f97b97e33f7a9513c", type: "loom", order: 19 },
  { id: "lm-20", title: "Decimales", category: "Configuración", video_url: "https://www.loom.com/share/3b9ecfaa518f4e76afa6b6cf77c87e25", type: "loom", order: 20 },
  { id: "lm-21", title: "Tarjetas de regalo", category: "Ventas", video_url: "https://www.loom.com/share/08170a244628427aba6aeeaa1469a2ee", type: "loom", order: 21 },
  { id: "lm-22", title: "Restaurantes", category: "Avanzado", video_url: "https://www.loom.com/share/135d66ab15424d60aa640be01c1263fc", type: "loom", order: 22 },
  { id: "lm-23", title: "Facturación electrónica (parte 1)", category: "Facturación", video_url: "https://www.loom.com/share/9033977dd0a648a7a83aff7a8742ca3e", type: "loom", order: 23 },
  { id: "lm-24", title: "Facturación electrónica (parte 2)", category: "Facturación", video_url: "https://www.loom.com/share/7b6813ff1ede46b3a08b29a5f32340a8", type: "loom", order: 24 },
  { id: "lm-25", title: "Sin permisos para el módulo", category: "Configuración", video_url: "https://www.loom.com/share/b9d6b1f9d9fb4a3fb02003db807fc51e", type: "loom", order: 25 },
  { id: "lm-26", title: "Módulo campana", category: "Avanzado", video_url: "https://www.loom.com/share/3905615a67d0428d890453ea400dcf82", type: "loom", order: 26 },
  { id: "lm-27", title: "Tipos de facturación", category: "Facturación", video_url: "https://www.loom.com/share/8164dd2eebe744fe80ef8ceeb45deb08", type: "loom", order: 27 },
  { id: "lm-28", title: "Cotización", category: "Ventas", video_url: "https://www.loom.com/share/b298059850924746be9cfe5154bfae25", type: "loom", order: 28 },
  { id: "lm-29", title: "Edición de inventario por importador", category: "Inventario", video_url: "https://www.loom.com/share/d350ec917c78487d8c64633aca0dfbcf", type: "loom", order: 29 },
  { id: "lm-30", title: "Agregar seriales desde compras", category: "Compras", video_url: "https://www.loom.com/share/02c7372ffe7f4452bd5697568e650870", type: "loom", order: 30 },
  { id: "lm-31", title: "Tipos de precios de niveles", category: "Ventas", video_url: "https://www.loom.com/share/8b2c077267ef44608956c7e9bf29d8a6", type: "loom", order: 31 },
  { id: "lm-32", title: "Créditos proveedores", category: "Compras", video_url: "https://www.loom.com/share/166c9f94c4cc418daa9cd0779569d4b9", type: "loom", order: 32 },
  { id: "lm-33", title: "Subcategoría con fecha de vencimiento", category: "Inventario", video_url: "https://www.loom.com/share/50b3e3031fa24db08fb8a69a73dcbeca", type: "loom", order: 33 },
  { id: "lm-34", title: "Eliminar abono línea de crédito", category: "Ventas", video_url: "https://www.loom.com/share/3522406cbfde449a9d2a1321bf1cbc86", type: "loom", order: 34 },
  { id: "lm-35", title: "Transferencia entre tiendas con series", category: "Inventario", video_url: "https://www.loom.com/share/8e5d123bbe4444a5ae3cf694d789760a", type: "loom", order: 35 },
  { id: "lm-36", title: "Compras con seriales", category: "Compras", video_url: "https://www.loom.com/share/dfa7f186934c4f739101023d51bec9cc", type: "loom", order: 36 },
  { id: "lm-37", title: "Sistema de puntos", category: "Ventas", video_url: "https://www.loom.com/share/58e9b21fb7454e69ad9674e31d6a08c4", type: "loom", order: 37 },
  { id: "lm-38", title: "Informe de ventas", category: "Informes", video_url: "https://www.loom.com/share/dcb314e560ef40dcb5c6b4d29a984bfc", type: "loom", order: 38 },
  { id: "lm-39", title: "Comparar inventario", category: "Inventario", video_url: "https://www.loom.com/share/c113666120a045469d19355e5248bd45", type: "loom", order: 39 },
  { id: "lm-40", title: "Alarma producto bajo stock y por vencer", category: "Inventario", video_url: "https://www.loom.com/share/2a1736ca23f84464b1577e0fc75e50a0", type: "loom", order: 40 },
  { id: "lm-41", title: "Modificar precios desde compra", category: "Compras", video_url: "https://www.loom.com/share/1756b3013e444684a09ada5bff93b898", type: "loom", order: 41 },
  { id: "lm-42", title: "Lotes con fecha de vencimiento", category: "Inventario", video_url: "https://www.loom.com/share/5bdc7268336642e092cdac18e44c00a6", type: "loom", order: 42 },
  { id: "lm-43", title: "Creación de empleados", category: "Configuración", video_url: "https://www.loom.com/share/b3874aa7f11043a7ae1bc7b18d9a0b54", type: "loom", order: 43 },
  { id: "lm-44", title: "Configuración artículo con serie", category: "Inventario", video_url: "https://www.loom.com/share/1aa23e061d0b46058b9af821707aeb1f", type: "loom", order: 44 },
  { id: "lm-45", title: "Resolución con facturas pendientes", category: "Facturación", video_url: "https://www.loom.com/share/c618219585f74aa68ad31e722ef1041d", type: "loom", order: 45 },
  { id: "lm-46", title: "Balanza autoetiquetadora", category: "Configuración", video_url: "https://www.loom.com/share/b4d606b1642d4c80b585b1e7742cf150", type: "loom", order: 46 },
  { id: "lm-47", title: "Corregir precio de venta en inventario", category: "Inventario", video_url: "https://www.loom.com/share/a844ed601c814142b1071ebb5105f63d", type: "loom", order: 47 },
  { id: "lm-48", title: "Modo quiosco impresión directa", category: "Avanzado", video_url: "https://www.loom.com/share/b4deacfb44e4452e9bcd63a337570e62", type: "loom", order: 48 },
  { id: "lm-49", title: "División de cuentas", category: "Ventas", video_url: "https://www.loom.com/share/5296118740d043c8bc294caa2c0a3fca", type: "loom", order: 49 },
  { id: "lm-50", title: "Registro por QR", category: "Avanzado", video_url: "https://www.loom.com/share/f112b02dc9cf460ab46f5ccf20043f7e", type: "loom", order: 50 },
  { id: "lm-51", title: "Cargar impuestos en la compra", category: "Compras", video_url: "https://www.loom.com/share/c97172ab5abe48c7a2eb4426eb80a9b0", type: "loom", order: 51 },
  { id: "lm-52", title: "Configuración impuesto saludable", category: "Facturación", video_url: "https://www.loom.com/share/c3cce30e25b3479d808fa9e3f1db1279", type: "loom", order: 52 },
  { id: "lm-53", title: "Zonas de impresión (parte 1)", category: "Configuración", video_url: "https://www.loom.com/share/598f70e66b184970b177683c567fd2e5", type: "loom", order: 53 },
  { id: "lm-54", title: "Zonas de impresión (parte 2)", category: "Configuración", video_url: "https://www.loom.com/share/6b4987f44b014ac58cfbae1bcffe868e", type: "loom", order: 54 },
  { id: "lm-55", title: "Guardar configuración de impresoras", category: "Configuración", video_url: "https://www.loom.com/share/6820c4bd60b44e6a85968cd5eba744e4", type: "loom", order: 55 },
  { id: "lm-56", title: "Visera de mesa", category: "Avanzado", video_url: "https://www.loom.com/share/dc1b152f449c4cb4aa50785e24cda9cf", type: "loom", order: 56 },
  { id: "lm-57", title: "Conceptos ingresos y egresos", category: "Caja", video_url: "https://www.loom.com/share/39b98f3234a74b3c951660339a3e7aef", type: "loom", order: 57 },
  { id: "lm-58", title: "Activos fijos", category: "Contabilidad", video_url: "https://www.loom.com/share/472bc562ceeb4c6daa8bde76144dbac8", type: "loom", order: 58 },
  { id: "lm-59", title: "Cartera proveedor", category: "Compras", video_url: "https://www.loom.com/share/5cf1eef018c24422aee6a519d6661000", type: "loom", order: 59 },
  { id: "lm-60", title: "Cartera de cliente", category: "Ventas", video_url: "https://www.loom.com/share/92525da5d7f14ba1bdf46cef6cae33ac", type: "loom", order: 60 },
  { id: "lm-61", title: "Catálogo de cuentas", category: "Contabilidad", video_url: "https://www.loom.com/share/fec8f052a02a43a3a367a0f13a1e13e4", type: "loom", order: 61 },
  { id: "lm-62", title: "Documento de soporte", category: "Facturación", video_url: "https://www.loom.com/share/29ec6fbe3f8e464a8238419a1159fbf9", type: "loom", order: 62 },
  { id: "lm-63", title: "Gastos", category: "Caja", video_url: "https://www.loom.com/share/78770abeac17452c8de4bcba87e050c4", type: "loom", order: 63 },
  { id: "lm-64", title: "Movimientos diarios", category: "Caja", video_url: "https://www.loom.com/share/a9d3974712ad429ab7130bc3cc2aa48e", type: "loom", order: 64 },
  { id: "lm-65", title: "Préstamos empleados", category: "Avanzado", video_url: "https://www.loom.com/share/a21aae2924c9467fb0206c3eb3e461cd", type: "loom", order: 65 },
  { id: "lm-66", title: "Retenciones", category: "Facturación", video_url: "https://www.loom.com/share/9c56a67b04f14d2e9ae6026a32ba945a", type: "loom", order: 66 },
  { id: "lm-67", title: "Nómina", category: "Avanzado", video_url: "https://www.loom.com/share/8134d29f3b86481ea9800eb65f206e27", type: "loom", order: 67 },
  { id: "lm-68", title: "Impuestos", category: "Facturación", video_url: "https://www.loom.com/share/be6e8cc737514a578975c2cab69fd184", type: "loom", order: 68 },
  { id: "lm-69", title: "Orden de remisiones", category: "Ventas", video_url: "https://www.loom.com/share/f91c2d4f8f994282828ec3a51e98a658", type: "loom", order: 69 },
  { id: "lm-70", title: "Activación costo de transporte", category: "Compras", video_url: "https://www.loom.com/share/0c7c3f18a7b548018615dfc23707d64b", type: "loom", order: 70 },
  { id: "lm-71", title: "Facturando en dos monedas", category: "Facturación", video_url: "https://www.loom.com/share/3d8ded35f64f486baf1ea5b949911c21", type: "loom", order: 71 },
  { id: "lm-72", title: "Transferencias tienda a tienda", category: "Inventario", video_url: "https://www.loom.com/share/d9541ac1bdaf42ae9282d8164bf9d589", type: "loom", order: 72 },
  { id: "lm-73", title: "Creación de categorías propias", category: "Inventario", video_url: "https://www.loom.com/share/c0ec5d0aed604f3290c9717b82ea418f", type: "loom", order: 73 },
  { id: "lm-74", title: "Apertura y cierre de caja", category: "Caja", video_url: "https://www.loom.com/share/648f0a1a8210494face822996a0e19ee", type: "loom", order: 74 },
  { id: "lm-75", title: "Eliminar una venta", category: "Ventas", video_url: "https://www.loom.com/share/f6bca81d70fe479a85a8c2ddf0f03cc5", type: "loom", order: 75 },
  { id: "lm-76", title: "Cambio de precios desde compras", category: "Compras", video_url: "https://www.loom.com/share/2c03917c29634da0a5681596d8dac5cc", type: "loom", order: 76 },
  { id: "lm-77", title: "Asociar empleado a caja", category: "Configuración", video_url: "https://www.loom.com/share/2df5b90b145d44f4bb841464bb1e857f", type: "loom", order: 77 },
  { id: "lm-78", title: "Recuperar puntos", category: "Ventas", video_url: "https://www.loom.com/share/862cbd33466e4a4d80989b45b2ecf408", type: "loom", order: 78 },
  { id: "lm-79", title: "Población", category: "Configuración", video_url: "https://www.loom.com/share/c63b3e7ee9654f3c8d8783e5d8fea00d", type: "loom", order: 79 },
  { id: "lm-80", title: "Cómo realizar una nota de crédito", category: "Facturación", video_url: "https://www.loom.com/share/d73d814850144269a091be25628defbb", type: "loom", order: 80 },
  { id: "lm-81", title: "Modo offline", category: "Avanzado", video_url: "https://www.loom.com/share/f59b87cc920841a1b03cb8c087532ca3", type: "loom", order: 81 },
  { id: "lm-82", title: "Cómo funciona la tienda virtual", category: "Avanzado", video_url: "https://www.loom.com/share/84d2df788dea40b1b6ecd9fceccc1adf", type: "loom", order: 82 },
  { id: "lm-83", title: "Historia clínica", category: "Avanzado", video_url: "https://www.loom.com/share/226af86a0a4445388b9d56e84fb79bb6", type: "loom", order: 83 },
  { id: "lm-84", title: "Proceso de producción", category: "Avanzado", video_url: "https://www.loom.com/share/d79dd7dd7e604831b0d697c74e062f8d", type: "loom", order: 84 },
  { id: "lm-85", title: "Proceso para facturación electrónica", category: "Facturación", video_url: "https://www.loom.com/share/d887255549d24e369a43daa6e4c4f15d", type: "loom", order: 85 },
  { id: "lm-86", title: "Módulo de agenda", category: "Avanzado", video_url: "https://www.loom.com/share/5f7a3a1a4d254bf196816aab656d56de", type: "loom", order: 86 },
  { id: "lm-87", title: "Gestión de varios empleados", category: "Configuración", video_url: "https://www.loom.com/share/57c7ae71ce6343eaa0ff92654d549449", type: "loom", order: 87 },
  { id: "lm-88", title: "Importador con unidades de medida", category: "Inventario", video_url: "https://www.loom.com/share/7a3239aaf613448c9697a4266d0347ef", type: "loom", order: 88 },
  { id: "lm-89", title: "Gestión de recetas", category: "Avanzado", video_url: "https://www.loom.com/share/a755c4f524fa41ddb6cf2017a454e720", type: "loom", order: 89 },
  { id: "lm-90", title: "Plantilla para importar artículos", category: "Inventario", video_url: "https://www.loom.com/share/4983d12226de4cedaf494c2d14426594", type: "loom", order: 90 },
  { id: "lm-91", title: "Línea de crédito para clientes", category: "Ventas", video_url: "https://www.loom.com/share/2d152b1488c843259b46f4b2e31b21bc", type: "loom", order: 91 },
  { id: "lm-92", title: "Variaciones en el inventario", category: "Inventario", video_url: "https://www.loom.com/share/4753a38b252a46cb8511e068ca32e49f", type: "loom", order: 92 },
  { id: "lm-93", title: "Gestión de terceros", category: "Configuración", video_url: "https://www.loom.com/share/28b97e5da0354f0f919b538e69840849", type: "loom", order: 93 },
  { id: "lm-94", title: "Generar y acceder a informes", category: "Informes", video_url: "https://www.loom.com/share/776f06f4a34a41b0bb70fc65bb959b7a", type: "loom", order: 94 },
  { id: "lm-95", title: "Módulo de soporte", category: "Avanzado", video_url: "https://www.loom.com/share/bb6573f6e1214d638c4b8d9c6e28482c", type: "loom", order: 95 },
  { id: "lm-96", title: "Módulo visor", category: "Avanzado", video_url: "https://www.loom.com/share/3949bc7acfd24224b09e423440bfc622", type: "loom", order: 96 },
  { id: "lm-97", title: "Módulo tiendas", category: "Avanzado", video_url: "https://www.loom.com/share/0c2e14e375d240fdabadfb9b95e64480", type: "loom", order: 97 },
  { id: "lm-98", title: "Módulo de facturación electrónica", category: "Facturación", video_url: "https://www.loom.com/share/3dcb905f0bfe4c15bbd6af801615f051", type: "loom", order: 98 },
  { id: "lm-99", title: "Módulo de rutas", category: "Avanzado", video_url: "https://www.loom.com/share/ee6d53115f1143fdab8f35caf60c7f8d", type: "loom", order: 99 },
  { id: "lm-100", title: "Registro y gestión de gastos", category: "Caja", video_url: "https://www.loom.com/share/9bb44fb9dc914d239de134527b4069e3", type: "loom", order: 100 },
  { id: "lm-101", title: "Módulo soporte técnico", category: "Avanzado", video_url: "https://www.loom.com/share/9a1fc189e7bb493fb1e1a19d9ef51734", type: "loom", order: 101 },
  { id: "lm-102", title: "Propinas en restaurante", category: "Avanzado", video_url: "https://www.loom.com/share/55f38007eaed411ea83cd09542f11dc0", type: "loom", order: 102 },
  { id: "lm-103", title: "Orden de remisiones (detallado)", category: "Ventas", video_url: "https://www.loom.com/share/5e65df701d0e4681946fb9b7328b5e07", type: "loom", order: 103 },
  { id: "lm-104", title: "Pagos de licencia", category: "Configuración", video_url: "https://www.loom.com/share/a169ea0cee5b46c59a749c02cfead762", type: "loom", order: 104 },
  { id: "lm-105", title: "Uso de atributos", category: "Inventario", video_url: "https://www.loom.com/share/b382bd65476e4a1ba9608ef3ea1e916c", type: "loom", order: 105 },
  { id: "lm-106", title: "Módulo de notificaciones", category: "Avanzado", video_url: "https://www.loom.com/share/9ac5b958391a47afaea5661e3106282d", type: "loom", order: 106 },
  { id: "lm-107", title: "Aumentar inventario importando Excel", category: "Inventario", video_url: "https://www.loom.com/share/b24060622e594da0a46f6674dfa64c8f", type: "loom", order: 107 },
  { id: "lm-108", title: "Módulo de compras", category: "Compras", video_url: "https://www.loom.com/share/f2512ddf0f094a57b2332d264dd2adcb", type: "loom", order: 108 },
  { id: "lm-109", title: "Error que impide completar venta", category: "Solución de problemas", video_url: "https://www.loom.com/share/3314253692834593b83eddeae8b2e8d8", type: "loom", order: 109 },
  { id: "lm-110", title: "Cómo descargar AnyDesk", category: "Solución de problemas", video_url: "https://www.loom.com/share/cdbd8403141949febf967bba9d9b0a80", type: "loom", order: 110 },
  { id: "lm-111", title: "Error al asociar nueva resolución", category: "Solución de problemas", video_url: "https://www.loom.com/share/4d5168e9013143e88426d8541c9982d5", type: "loom", order: 111 },
  { id: "lm-112", title: "Cambiar usuario y contraseña", category: "Configuración", video_url: "https://www.loom.com/share/7a0394c2e00c4ac8b233c68add22e452", type: "loom", order: 112 },
  { id: "lm-113", title: "Gastos de efectivo en caja", category: "Caja", video_url: "https://www.loom.com/share/45c568896cde4e16b3789cabe4ba1c36", type: "loom", order: 113 },
  { id: "lm-114", title: "Ingreso de efectivo en caja", category: "Caja", video_url: "https://www.loom.com/share/fd09f8359150475a8fc3d313d742ce0c", type: "loom", order: 114 },
  { id: "lm-115", title: "Venta y devolución factura simplificada", category: "Ventas", video_url: "https://www.loom.com/share/f435a58f99a548819850a81ccda6cf78", type: "loom", order: 115 },
  { id: "lm-116", title: "Transferir efectivo entre cajas", category: "Caja", video_url: "https://www.loom.com/share/965ffed2dcb049a487b2e79f17cf9898", type: "loom", order: 116 },
  { id: "lm-117", title: "Artículos con número de serie", category: "Inventario", video_url: "https://www.loom.com/share/841448ae7f0a45a1b3557957924a1120", type: "loom", order: 117 },
  { id: "lm-118", title: "Resolución en ticket de venta", category: "Facturación", video_url: "https://www.loom.com/share/6ffadea805b44bb8b1e25fa47d71d78e", type: "loom", order: 118 },
];

export function getYouTubeId(url: string): string | null {
  const match = url.match(/(?:v=|\/)([\w-]{11})(?:\?|&|$)/);
  return match ? match[1] : null;
}

export function getLoomEmbedUrl(url: string): string {
  return url.replace("/share/", "/embed/");
}

export function getLoomId(url: string): string | null {
  const match = url.match(/loom\.com\/(?:share|embed)\/([\w]+)/);
  return match ? match[1] : null;
}

export const allCategories = Array.from(
  new Set([...mainTutorials, ...quickVideos].map((v) => v.category))
).sort();
