import { useRef, useState } from "react";
import * as XLSX from "xlsx";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription,
} from "@/components/ui/dialog";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { Upload, FileSpreadsheet, Loader2, Building2, ShieldCheck } from "lucide-react";

/**
 * Columns produced by the franchise panel "Prospectos" export
 * (panel.accesopos.com / licenciaspos.online).
 *
 * Map → contacts table columns. The first match by EMAIL, then PHONE.
 */
const FRANCHISE_TAG = "franquicia_registrada";

interface FranchiseRow {
  fecha?: string;
  negocio?: string;
  tipo?: string;
  nombre?: string;
  telefono?: string;
  email?: string;
  pais?: string;
  franquicia?: string;
  software_actual?: string;
  motivo_cambio?: string;
  conoce_metricas?: string;
  mayor_inconveniente?: string;
  software_ideal?: string;
  ventas_dia?: string;
  empleados?: string;
  tiempo_sistematizar?: string;
  antiguedad_negocio?: string;
}

interface DiffRow {
  source: FranchiseRow;
  matched?: any;
  action: "create" | "update" | "skip";
  selected: boolean;
  changes: { field: string; from: any; to: any }[];
}

const HEADER_MAP: Record<string, keyof FranchiseRow> = {
  "Fecha": "fecha",
  "Negocio": "negocio",
  "Tipo de negocio": "tipo",
  "Nombres": "nombre",
  "Telefono": "telefono",
  "Teléfono": "telefono",
  "Correo": "email",
  "Email": "email",
  "Pais": "pais",
  "País": "pais",
  "Franquicia": "franquicia",
  "Actualmente maneja algún software?": "software_actual",
  "¿Por qué desea cambiarlo?": "motivo_cambio",
  "Actualmente sabe cómo están sus inventarios, ganancias, pérdidas, rotación de productos?": "conoce_metricas",
  "Cuál cree que es el mayor inconveniente que tiene por no haber sistematizado su negocio?": "mayor_inconveniente",
  "Que debería tener su software pos ideal ?": "software_ideal",
  "Cuantas ventas promedio hacer por día, no en dinero si no en cantidad de ventas?": "ventas_dia",
  "Cuántos empleados tiene?": "empleados",
  "En cuanto tiempo quiere sistematizar?": "tiempo_sistematizar",
  "Hace cuanto tiempo tiene el negocio?": "antiguedad_negocio",
};

function normalizePhone(p?: string) {
  if (!p) return "";
  return String(p).replace(/\D/g, "");
}

function buildNotes(r: FranchiseRow): string {
  const parts: string[] = ["📋 Importado desde panel Franquiciado"];
  if (r.fecha) parts.push(`Fecha registro: ${r.fecha}`);
  if (r.franquicia) parts.push(`Franquicia: ${r.franquicia}`);
  if (r.software_actual) parts.push(`Software actual: ${r.software_actual}`);
  if (r.motivo_cambio) parts.push(`Motivo cambio: ${r.motivo_cambio}`);
  if (r.conoce_metricas) parts.push(`Conoce métricas: ${r.conoce_metricas}`);
  if (r.mayor_inconveniente) parts.push(`Mayor inconveniente: ${r.mayor_inconveniente}`);
  if (r.software_ideal) parts.push(`Software ideal: ${r.software_ideal}`);
  if (r.ventas_dia) parts.push(`Ventas/día: ${r.ventas_dia}`);
  if (r.empleados) parts.push(`Empleados: ${r.empleados}`);
  if (r.tiempo_sistematizar) parts.push(`Urgencia: ${r.tiempo_sistematizar}`);
  if (r.antiguedad_negocio) parts.push(`Antigüedad: ${r.antiguedad_negocio}`);
  return parts.join("\n");
}

interface Props {
  onImported?: () => void;
}

export function ProspectsImportDialog({ onImported }: Props) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [open, setOpen] = useState(false);
  const [diffs, setDiffs] = useState<DiffRow[]>([]);
  const [parsing, setParsing] = useState(false);
  const [importing, setImporting] = useState(false);
  const { toast } = useToast();

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setParsing(true);
    try {
      const buf = await file.arrayBuffer();
      const wb = XLSX.read(buf, { type: "array" });
      const ws = wb.Sheets[wb.SheetNames[0]];
      const rawRows: any[] = XLSX.utils.sheet_to_json(ws, { defval: "" });

      const rows: FranchiseRow[] = rawRows.map(raw => {
        const out: FranchiseRow = {};
        for (const [k, v] of Object.entries(raw)) {
          const key = HEADER_MAP[k.trim()];
          if (key && v != null && v !== "") (out as any)[key] = String(v).trim();
        }
        return out;
      }).filter(r => r.email || r.telefono || r.nombre);

      if (!rows.length) {
        toast({ title: "Archivo vacío", description: "El Excel no tiene filas con email/teléfono/nombre.", variant: "destructive" });
        setParsing(false);
        return;
      }

      // Match against existing contacts
      const emails = rows.map(r => r.email?.toLowerCase()).filter(Boolean) as string[];
      const phones = rows.map(r => normalizePhone(r.telefono)).filter(Boolean);

      const { data: existing } = await supabase
        .from("contacts")
        .select("id, full_name, email, phone, business_name, business_type, city, notes, tags, pipeline_stage")
        .or([
          emails.length ? `email.in.(${emails.map(e => `"${e}"`).join(",")})` : "",
          phones.length ? `phone.in.(${phones.map(p => `"${p}"`).join(",")})` : "",
        ].filter(Boolean).join(","));

      const byEmail = new Map<string, any>();
      const byPhone = new Map<string, any>();
      (existing || []).forEach(c => {
        if (c.email) byEmail.set(c.email.toLowerCase(), c);
        if (c.phone) byPhone.set(normalizePhone(c.phone), c);
      });

      const diffRows: DiffRow[] = rows.map(r => {
        const match = (r.email && byEmail.get(r.email.toLowerCase())) || (r.telefono && byPhone.get(normalizePhone(r.telefono))) || null;
        const newFields: Record<string, any> = {
          full_name: r.nombre || "",
          email: r.email || null,
          phone: normalizePhone(r.telefono) || null,
          business_name: r.negocio || null,
          business_type: r.tipo || null,
          city: r.pais || null,
        };
        const changes: DiffRow["changes"] = [];
        if (match) {
          for (const [f, v] of Object.entries(newFields)) {
            const cur = (match as any)[f];
            if (v && v !== cur) changes.push({ field: f, from: cur, to: v });
          }
          // Always re-tag as franchise
          const tags: string[] = match.tags || [];
          if (!tags.includes(FRANCHISE_TAG)) changes.push({ field: "tags", from: tags.join(","), to: [...tags, FRANCHISE_TAG].join(",") });
        }
        return {
          source: r,
          matched: match,
          action: !match ? "create" : changes.length ? "update" : "skip",
          selected: !match || changes.length > 0,
          changes,
        };
      });

      setDiffs(diffRows);
      setOpen(true);
    } catch (err: any) {
      toast({ title: "Error leyendo archivo", description: err.message, variant: "destructive" });
    } finally {
      setParsing(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  const toggle = (i: number) => setDiffs(prev => prev.map((d, idx) => idx === i ? { ...d, selected: !d.selected } : d));
  const toggleAll = (val: boolean) => setDiffs(prev => prev.map(d => d.action === "skip" ? d : { ...d, selected: val }));

  const runImport = async () => {
    setImporting(true);
    let created = 0, updated = 0, failed = 0;
    for (const d of diffs) {
      if (!d.selected || d.action === "skip") continue;
      const r = d.source;
      try {
        if (d.action === "create") {
          const { error } = await supabase.from("contacts").insert({
            full_name: r.nombre || "Sin nombre",
            email: r.email || null,
            phone: normalizePhone(r.telefono) || null,
            business_name: r.negocio || null,
            business_type: r.tipo || null,
            city: r.pais || null,
            source: "panel_franquiciado",
            contact_type: "prospect",
            pipeline_stage: "qualified",
            notes: buildNotes(r),
            tags: [FRANCHISE_TAG],
          });
          if (error) throw error;
          created++;
        } else {
          const patch: any = {};
          d.changes.forEach(c => {
            if (c.field === "tags") {
              const t: string[] = d.matched.tags || [];
              if (!t.includes(FRANCHISE_TAG)) patch.tags = [...t, FRANCHISE_TAG];
            } else {
              patch[c.field] = c.to;
            }
          });
          // Append/update notes traceability
          const existingNotes = d.matched.notes || "";
          if (!existingNotes.includes("Importado desde panel Franquiciado")) {
            patch.notes = (existingNotes ? existingNotes + "\n\n" : "") + buildNotes(r);
          }
          const { error } = await supabase.from("contacts").update(patch).eq("id", d.matched.id);
          if (error) throw error;
          updated++;
        }
      } catch (e) {
        console.error("Import row error:", e);
        failed++;
      }
    }
    setImporting(false);
    setOpen(false);
    setDiffs([]);
    toast({
      title: "Importación completada",
      description: `${created} creados · ${updated} actualizados${failed ? ` · ${failed} con error` : ""}`,
    });
    onImported?.();
  };

  const stats = {
    create: diffs.filter(d => d.action === "create").length,
    update: diffs.filter(d => d.action === "update").length,
    skip: diffs.filter(d => d.action === "skip").length,
    selected: diffs.filter(d => d.selected && d.action !== "skip").length,
  };

  return (
    <>
      <Button size="sm" variant="outline" onClick={() => fileRef.current?.click()} disabled={parsing}>
        {parsing ? <Loader2 className="h-3.5 w-3.5 mr-1 animate-spin" /> : <Upload className="h-3.5 w-3.5 mr-1" />}
        Importar Prospectos (Excel)
      </Button>
      <input
        ref={fileRef}
        type="file"
        accept=".xlsx,.xls"
        className="hidden"
        onChange={handleFile}
      />

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-5xl max-h-[90vh] flex flex-col">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileSpreadsheet className="h-5 w-5 text-primary" />
              Vista previa de importación — Panel Franquiciado
            </DialogTitle>
            <DialogDescription>
              Revisa los cambios antes de aplicarlos. Los contactos importados quedan etiquetados como{" "}
              <Badge variant="secondary" className="gap-1"><ShieldCheck className="h-3 w-3" /> franquicia_registrada</Badge>{" "}
              para trazabilidad.
            </DialogDescription>
          </DialogHeader>

          <div className="flex items-center gap-3 text-xs">
            <Badge className="bg-emerald-500/10 text-emerald-700 border-emerald-200">{stats.create} nuevos</Badge>
            <Badge className="bg-amber-500/10 text-amber-700 border-amber-200">{stats.update} a actualizar</Badge>
            <Badge variant="secondary">{stats.skip} sin cambios</Badge>
            <span className="ml-auto text-muted-foreground">
              Seleccionados: <strong className="text-foreground">{stats.selected}</strong>
            </span>
            <Button size="sm" variant="ghost" onClick={() => toggleAll(true)}>Todo</Button>
            <Button size="sm" variant="ghost" onClick={() => toggleAll(false)}>Nada</Button>
          </div>

          <div className="flex-1 overflow-auto border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-8"></TableHead>
                  <TableHead>Nombre</TableHead>
                  <TableHead>Email / Tel</TableHead>
                  <TableHead>Negocio</TableHead>
                  <TableHead>País</TableHead>
                  <TableHead>Acción</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {diffs.map((d, i) => (
                  <TableRow key={i} className={d.action === "skip" ? "opacity-50" : ""}>
                    <TableCell>
                      <Checkbox
                        checked={d.selected}
                        disabled={d.action === "skip"}
                        onCheckedChange={() => toggle(i)}
                      />
                    </TableCell>
                    <TableCell className="font-medium">{d.source.nombre || "—"}</TableCell>
                    <TableCell className="text-xs">
                      <div>{d.source.email || "—"}</div>
                      <div className="text-muted-foreground">{d.source.telefono || "—"}</div>
                    </TableCell>
                    <TableCell className="text-xs">
                      <div className="flex items-center gap-1"><Building2 className="h-3 w-3" />{d.source.negocio || "—"}</div>
                      <div className="text-muted-foreground">{d.source.tipo || "—"}</div>
                    </TableCell>
                    <TableCell className="text-xs">{d.source.pais || "—"}</TableCell>
                    <TableCell>
                      {d.action === "create" && <Badge className="bg-emerald-500/10 text-emerald-700">Crear</Badge>}
                      {d.action === "update" && (
                        <div>
                          <Badge className="bg-amber-500/10 text-amber-700">Actualizar</Badge>
                          <div className="text-[10px] text-muted-foreground mt-1">
                            {d.changes.length} cambio(s)
                          </div>
                        </div>
                      )}
                      {d.action === "skip" && <Badge variant="secondary">Igual</Badge>}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)} disabled={importing}>Cancelar</Button>
            <Button onClick={runImport} disabled={importing || stats.selected === 0}>
              {importing && <Loader2 className="h-4 w-4 mr-1 animate-spin" />}
              Aplicar {stats.selected} cambio(s)
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
