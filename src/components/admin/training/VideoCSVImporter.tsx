import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Upload, FileSpreadsheet, AlertCircle, CheckCircle, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import * as XLSX from "xlsx";

interface ParsedVideo {
  title: string;
  category: string;
  video_url: string;
  video_type: string;
  duration: string | null;
  tags: string[];
  is_main: boolean;
  valid: boolean;
  error?: string;
}

const EXPECTED_HEADERS = ["title", "category", "video_url"];

function normalizeHeader(h: string): string {
  const map: Record<string, string> = {
    título: "title", titulo: "title", name: "title", nombre: "title",
    categoría: "category", categoria: "category",
    url: "video_url", video: "video_url", link: "video_url", enlace: "video_url",
    tipo: "video_type", type: "video_type",
    duración: "duration", duracion: "duration",
    tags: "tags", etiquetas: "tags",
    principal: "is_main", main: "is_main",
  };
  const key = h.trim().toLowerCase().replace(/[^a-záéíóúñü_]/gi, "");
  return map[key] || key;
}

function detectVideoType(url: string): string {
  if (!url) return "youtube";
  if (url.includes("loom.com")) return "loom";
  return "youtube";
}

function parseRows(rows: Record<string, any>[]): ParsedVideo[] {
  return rows.map((row) => {
    const title = (row.title || "").toString().trim();
    const category = (row.category || "Básicos").toString().trim();
    const video_url = (row.video_url || row.url || "").toString().trim();
    const video_type = (row.video_type || detectVideoType(video_url)).toString().trim();
    const duration = (row.duration || "").toString().trim() || null;
    const rawTags = (row.tags || "").toString().trim();
    const tags = rawTags ? rawTags.split(/[,;|]/).map((t: string) => t.trim().toLowerCase()).filter(Boolean) : [];
    const is_main = ["true", "1", "sí", "si", "yes"].includes((row.is_main || "").toString().trim().toLowerCase());

    const errors: string[] = [];
    if (!title) errors.push("Sin título");
    if (!video_url) errors.push("Sin URL");
    else if (!/^https?:\/\//.test(video_url)) errors.push("URL inválida");

    return {
      title, category, video_url, video_type, duration, tags, is_main,
      valid: errors.length === 0,
      error: errors.join(", "),
    };
  });
}

export default function VideoCSVImporter() {
  const [open, setOpen] = useState(false);
  const [parsed, setParsed] = useState<ParsedVideo[]>([]);
  const [importing, setImporting] = useState(false);
  const [fileName, setFileName] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);
  const qc = useQueryClient();

  const validCount = parsed.filter((p) => p.valid).length;
  const invalidCount = parsed.filter((p) => !p.valid).length;

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setFileName(file.name);

    try {
      const ext = file.name.split(".").pop()?.toLowerCase();
      if (ext === "csv") {
        const text = await file.text();
        const lines = text.split(/\r?\n/).filter((l) => l.trim());
        if (lines.length < 2) { toast.error("El archivo está vacío"); return; }
        const headers = lines[0].split(/[,;\t]/).map(normalizeHeader);
        const rows = lines.slice(1).map((line) => {
          const vals = line.split(/[,;\t]/);
          const obj: Record<string, string> = {};
          headers.forEach((h, i) => { obj[h] = vals[i] || ""; });
          return obj;
        });
        setParsed(parseRows(rows));
      } else if (ext === "xlsx" || ext === "xls") {
        const buf = await file.arrayBuffer();
        const wb = XLSX.read(buf, { type: "array" });
        const sheet = wb.Sheets[wb.SheetNames[0]];
        const json = XLSX.utils.sheet_to_json<Record<string, any>>(sheet, { defval: "" });
        const normalized = json.map((row) => {
          const obj: Record<string, any> = {};
          Object.entries(row).forEach(([k, v]) => { obj[normalizeHeader(k)] = v; });
          return obj;
        });
        setParsed(parseRows(normalized));
      } else {
        toast.error("Formato no soportado. Usa .csv o .xlsx");
      }
    } catch (err: any) {
      toast.error("Error al leer archivo: " + err.message);
    }
    if (fileRef.current) fileRef.current.value = "";
  };

  const handleImport = async () => {
    const valid = parsed.filter((p) => p.valid);
    if (valid.length === 0) return;
    setImporting(true);
    try {
      const rows = valid.map((v, i) => ({
        title: v.title,
        category: v.category,
        video_url: v.video_url,
        video_type: v.video_type,
        duration: v.duration,
        tags: v.tags,
        is_main: v.is_main,
        is_active: true,
        sort_order: i,
        approval_status: "pending",
        visible_to_customer: true,
        visible_to_reseller: true,
      }));
      const { error } = await supabase.from("training_videos").insert(rows);
      if (error) throw error;
      toast.success(`${valid.length} videos importados como pendientes`);
      qc.invalidateQueries({ queryKey: ["training-videos"] });
      setParsed([]);
      setFileName("");
      setOpen(false);
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setImporting(false);
    }
  };

  const removeRow = (idx: number) => setParsed((prev) => prev.filter((_, i) => i !== idx));

  return (
    <>
      <Button variant="outline" onClick={() => setOpen(true)} className="gap-2">
        <FileSpreadsheet className="h-4 w-4" />
        Importar CSV/Excel
      </Button>

      <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) { setParsed([]); setFileName(""); } }}>
        <DialogContent className="max-w-3xl max-h-[85vh] flex flex-col">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileSpreadsheet className="h-5 w-5 text-primary" />
              Importar Videos desde Archivo
            </DialogTitle>
            <DialogDescription>
              Sube un archivo .csv o .xlsx con columnas: <strong>título, categoría, url</strong> (obligatorias), tipo, duración, tags, principal (opcionales).
            </DialogDescription>
          </DialogHeader>

          {parsed.length === 0 ? (
            <label className="flex flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed border-primary/30 bg-primary/5 p-10 cursor-pointer hover:border-primary/60 hover:bg-primary/10 transition-all">
              <Upload className="h-10 w-10 text-primary/60" />
              <span className="text-sm font-medium text-muted-foreground">
                Arrastra o haz clic para seleccionar archivo
              </span>
              <span className="text-xs text-muted-foreground">.csv · .xlsx · .xls</span>
              <input ref={fileRef} type="file" accept=".csv,.xlsx,.xls" onChange={handleFile} className="hidden" />
            </label>
          ) : (
            <div className="flex-1 overflow-hidden flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className="gap-1"><FileSpreadsheet className="h-3 w-3" />{fileName}</Badge>
                  <Badge className="bg-green-600 gap-1"><CheckCircle className="h-3 w-3" />{validCount} válidos</Badge>
                  {invalidCount > 0 && <Badge variant="destructive" className="gap-1"><AlertCircle className="h-3 w-3" />{invalidCount} con errores</Badge>}
                </div>
                <Button variant="ghost" size="sm" onClick={() => { setParsed([]); setFileName(""); }}>Cambiar archivo</Button>
              </div>

              <div className="flex-1 overflow-auto rounded-lg border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-8">#</TableHead>
                      <TableHead>Título</TableHead>
                      <TableHead>Categoría</TableHead>
                      <TableHead>URL</TableHead>
                      <TableHead>Tags</TableHead>
                      <TableHead className="w-20">Estado</TableHead>
                      <TableHead className="w-10"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {parsed.map((row, i) => (
                      <TableRow key={i} className={row.valid ? "" : "bg-destructive/5"}>
                        <TableCell className="text-xs text-muted-foreground">{i + 1}</TableCell>
                        <TableCell className="font-medium text-sm max-w-[180px] truncate">{row.title || "—"}</TableCell>
                        <TableCell><Badge variant="secondary" className="text-xs">{row.category}</Badge></TableCell>
                        <TableCell className="max-w-[160px] truncate text-xs text-muted-foreground">{row.video_url || "—"}</TableCell>
                        <TableCell className="max-w-[120px]">
                          <div className="flex flex-wrap gap-0.5">
                            {row.tags.slice(0, 2).map((t) => (
                              <span key={t} className="rounded bg-primary/10 px-1 py-0.5 text-[10px] text-primary">{t}</span>
                            ))}
                            {row.tags.length > 2 && <span className="text-[10px] text-muted-foreground">+{row.tags.length - 2}</span>}
                          </div>
                        </TableCell>
                        <TableCell>
                          {row.valid ? (
                            <Badge className="bg-green-600 text-[10px]">OK</Badge>
                          ) : (
                            <Badge variant="destructive" className="text-[10px]" title={row.error}>{row.error}</Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          <button onClick={() => removeRow(i)} className="text-muted-foreground hover:text-destructive">
                            <X className="h-3.5 w-3.5" />
                          </button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          )}

          {parsed.length > 0 && (
            <DialogFooter className="gap-2">
              <p className="flex-1 text-xs text-muted-foreground">
                Los videos se importarán con estado <Badge variant="outline" className="text-[10px] border-yellow-500 text-yellow-600">Pendiente</Badge>
              </p>
              <Button variant="outline" onClick={() => setOpen(false)}>Cancelar</Button>
              <Button onClick={handleImport} disabled={validCount === 0 || importing}>
                {importing ? "Importando..." : `Importar ${validCount} videos`}
              </Button>
            </DialogFooter>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
