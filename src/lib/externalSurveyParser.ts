/**
 * Parser tolerante para el JSON que expone el panel franquiciado
 * (`javascript:show_encuesta('{...}')` o el JSON pelado, single o array).
 */
export type ExternalSurveyPayload = Record<string, any>;

export function parseExternalSurveyInput(raw: string): ExternalSurveyPayload[] {
  if (!raw) return [];
  let s = raw.trim();

  // Quitar prefijo bookmarklet "javascript:show_encuesta(" ... ")"
  const m = s.match(/show_encuesta\s*\(\s*(['"`])([\s\S]+?)\1\s*\)/);
  if (m) s = m[2];

  // Decodificar entidades JS comunes
  s = s.replace(/\\u([0-9a-fA-F]{4})/g, (_, h) => String.fromCharCode(parseInt(h, 16)));

  // Si vienen comillas escapadas tipo \" del HTML, normalizar
  if (s.includes('\\"') && !s.trim().startsWith('{') && !s.trim().startsWith('[')) {
    try { s = JSON.parse(`"${s}"`); } catch {}
  }

  s = s.trim();

  let parsed: any;
  try { parsed = JSON.parse(s); }
  catch (e: any) {
    throw new Error(`JSON inválido: ${e.message}`);
  }
  return Array.isArray(parsed) ? parsed : [parsed];
}

export const EXTERNAL_STATUS_LABELS: Record<string, string> = {
  "SIN CONTACTAR": "Sin contactar",
  "CONTACTADO": "Contactado",
  "INTERESADO": "Interesado",
  "DEMO": "Demo activa",
  "DEMO ACTIVA": "Demo activa",
  "CLIENTE": "Cliente",
  "DESCARTADO": "Descartado",
};

export interface SurveyFieldRow {
  label: string;
  value: string;
}

export function flattenSurveyForPreview(p: ExternalSurveyPayload): SurveyFieldRow[] {
  const fullName = [p.name, p.last_names].filter(Boolean).join(" ").trim();
  return [
    { label: "ID externo", value: String(p.id ?? "—") },
    { label: "Reseller", value: `${p.reseller_name ?? "—"} (#${p.reseller_id ?? "—"})` },
    { label: "Tienda", value: `${p.store ?? "—"} (#${p.store_id ?? "—"})` },
    { label: "Nombre", value: fullName || "—" },
    { label: "Email", value: p.email ?? "—" },
    { label: "Teléfono", value: p.phone ?? "—" },
    { label: "Ciudad / País", value: `${p.city ?? "—"} / ${p.country ?? "—"}` },
    { label: "Tipo de negocio", value: p.name_lang_key ?? "—" },
    { label: "Estado externo", value: EXTERNAL_STATUS_LABELS[String(p.status).toUpperCase()] ?? p.status ?? "—" },
    { label: "Día de demo", value: p.day_demo ?? "—" },
    { label: "Licencia", value: p.license ?? "—" },
    { label: "Token", value: p.token ?? "—" },
    { label: "Maneja software", value: p.manage_software ?? "—" },
    { label: "Software ideal", value: p.software_ideal ?? "—" },
    { label: "Motivo de cambio", value: p.change_software_description ?? "—" },
    { label: "Conoce inventario", value: p.know_inventory ?? "—" },
    { label: "Empleados", value: p.how_employees ?? "—" },
    { label: "Tiempo para sistematizar", value: p.in_time_systematize ?? "—" },
    { label: "Antigüedad del negocio", value: p.business_time ?? "—" },
    { label: "Ventas / día", value: p.nom_sale ?? "—" },
    { label: "Descripción", value: p.description ?? "—" },
  ];
}
