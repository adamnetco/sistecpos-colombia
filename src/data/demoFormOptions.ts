// IMPORTANT: Synced 1:1 with the franchise prospect panel (licenciaspos.online).
// Do NOT add types or countries that the franchise panel doesn't accept —
// they will be rejected when the lead is forwarded.

export const BUSINESS_TYPES_DEMO = [
  "Almacen de Moda",
  "Almacén de tecnología",
  "Carnicerías, Fruver balanza de peso",
  "Casas de cambio",
  "Comidas Rapidas",
  "Compra y venta mercancía en general",
  "Consultorios Medicos o Veterinarios",
  "Distribuidoras TAT",
  "Fabricas",
  "Factura Electronica",
  "Farmacias",
  "Ferreteria",
  "Historia clinica",
  "Mini Market",
  "Multi-Tiendas",
  "Negocio Multiples Divisas",
  "Panadería",
  "Papelerías",
  "Restaurante",
  "Servicio técnico",
  "Spa y salones de belleza",
  "Tienda Online",
  "Todos los modulos",
] as const;

// Order matches the franchise panel dropdown exactly.
export const COUNTRIES = [
  "Argentina",
  "Bolivia",
  "Chile",
  "Colombia",
  "Costa Rica",
  "Cuba",
  "Ecuador",
  "El Salvador",
  "España",
  "Estados Unidos",
  "San Martín",
  "Guatemala",
  "Honduras",
  "México",
  "Nicaragua",
  "Panamá",
  "Paraguay",
  "Perú",
  "Puerto Rico",
  "República Dominicana",
  "Uruguay",
  "Venezuela",
] as const;

export const DAILY_SALES_OPTIONS = [
  "1-30",
  "31-50",
  "51-100",
  "101-200",
  "201-700",
] as const;

export const EMPLOYEE_COUNT_OPTIONS = [
  "Ninguno, atiendo yo mismo",
  "1",
  "2",
  "3 a 5",
  "6 a 10",
  "Más de 10",
] as const;

export const URGENCY_OPTIONS = [
  "1 semana, es muy importante para mí",
  "15 días, estoy evaluando opciones",
  "1 mes, no tengo prisa",
  "Solo estoy cotizando",
] as const;
