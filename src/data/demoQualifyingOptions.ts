// Opciones literales del paso 3 de licenciaspos.online — mantener IDÉNTICAS
// para que las respuestas se puedan copiar y pegar 1:1 en el panel externo.

export const SALES_PER_DAY = [
  "1-30",
  "31-60",
  "61-100",
  "+100",
] as const;

export const EMPLOYEES = [
  "Ninguno atiendo yo mismo",
  "1-3",
  "4-10",
  "+10",
] as const;

export const TIME_TO_SYSTEMATIZE = [
  "1 semana es muy importante para mi sistematizar",
  "1 mes",
  "3 meses",
  "6 meses",
  "Solo estoy mirando",
] as const;

export const BUSINESS_AGE_PERIOD = ["Meses", "Años"] as const;
