import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription, DialogTrigger,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Braces, Loader2, Sparkles, ClipboardPaste, FileJson } from "lucide-react";
import {
  parseExternalSurveyInput,
  flattenSurveyForPreview,
  type ExternalSurveyPayload,
} from "@/lib/externalSurveyParser";

interface Props {
  onImported?: () => void;
}

const SAMPLE = `javascript:show_encuesta('{"id":649,"reseller_id":85,"store":"laleyendaparrilla","name":"Andres","phone":"+573108147824","email":"demo@ventas.click","status":"SIN CONTACTAR","city":"Giron","country":"spanish","license":"8635140f970a623693a54e7af0665f9f","manage_software":"Si","software_ideal":"Ser rapido y facil","change_software_description":"Quiero mejorar","know_inventory":"No","how_employees":"1","in_time_systematize":"1 mes","business_time":"1 año(s)","nom_sale":"1-30","created_at":"2026-05-30 13:15:47","day_demo":"demo_day_14","token":"fcf36c...","name_lang_key":"Restaurante"}')`;

export function ExternalSurveyImportDialog({ onImported }: Props) {
  const [open, setOpen] = useState(false);
  const [raw, setRaw] = useState("");
  const [previews, setPreviews] = useState<ExternalSurveyPayload[] | null>(null);
  const [importing, setImporting] = useState(false);
  const { toast } = useToast();

  const handleParse = () => {
    try {
      const list = parseExternalSurveyInput(raw);
      if (!list.length) throw new Error("No se encontraron registros");
      setPreviews(list);
    } catch (e: any) {
      toast({ title: "No se pudo interpretar el JSON", description: e.message, variant: "destructive" });
    }
  };

  const handlePaste = async () => {
    try {
      const t = await navigator.clipboard.readText();
      setRaw(t);
    } catch {
      toast({ title: "Pega el contenido manualmente", description: "No hay permiso de portapapeles." });
    }
  };

  const runImport = async () => {
    if (!previews?.length) return;
    setImporting(true);
    let created = 0, updated = 0, failed = 0;
    for (const p of previews) {
      try {
        const { data, error } = await supabase.rpc("upsert_lead_from_external_json", { _payload: p as any });
        if (error) throw error;
        const action = (data as any)?.action;
        if (action === "created") created++;
        else if (action === "updated") updated++;
      } catch (e: any) {
        console.error("[ExternalSurveyImport] row failed", e, p);
        failed++;
      }
    }
    setImporting(false);
    setOpen(false);
    setRaw("");
    setPreviews(null);
    toast({
      title: "Importación completada",
      description: `${created} creados · ${updated} actualizados${failed ? ` · ${failed} con error` : ""}`,
    });
    onImported?.();
  };

  const reset = () => { setRaw(""); setPreviews(null); };

  return (
    <Dialog open={open} onOpenChange={(o) => { setOpen(o); if (!o) reset(); }}>
      <DialogTrigger asChild>
        <Button size="sm" variant="outline">
          <Braces className="h-3.5 w-3.5 mr-1" />
          Importar JSON Franquicia
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileJson className="h-5 w-5 text-primary" />
            Importar encuesta desde Panel Franquiciado
          </DialogTitle>
          <DialogDescription>
            Pega el contenido del enlace <code className="text-xs bg-muted px-1 rounded">show_encuesta(...)</code> que aparece en la fila del prospecto, o un JSON pelado (objeto único o array). El estado se asume con <Badge variant="secondary" className="gap-1"><Sparkles className="h-3 w-3" />demo activa</Badge> cuando incluye <code>day_demo</code>.
          </DialogDescription>
        </DialogHeader>

        {!previews ? (
          <div className="space-y-3 flex-1 overflow-auto">
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">Acepta: bookmarklet completo, JSON, o array de JSON.</span>
              <div className="flex gap-2">
                <Button size="sm" variant="ghost" onClick={handlePaste}>
                  <ClipboardPaste className="h-3.5 w-3.5 mr-1" /> Pegar
                </Button>
                <Button size="sm" variant="ghost" onClick={() => setRaw(SAMPLE)}>Ver ejemplo</Button>
              </div>
            </div>
            <Textarea
              value={raw}
              onChange={(e) => setRaw(e.target.value)}
              placeholder={`javascript:show_encuesta('{"id":649,...}')`}
              className="font-mono text-xs h-64"
            />
          </div>
        ) : (
          <div className="flex-1 overflow-auto space-y-4">
            <div className="text-xs text-muted-foreground">
              {previews.length} registro(s) listo(s) para sincronizar. Se actualizarán los campos faltantes sin sobrescribir datos existentes ni mover prospectos ya convertidos/perdidos.
            </div>
            {previews.map((p, i) => (
              <div key={i} className="border rounded-lg p-3 space-y-2 bg-card">
                <div className="flex items-center gap-2 text-sm font-medium">
                  <Badge>#{p.id}</Badge>
                  <span>{[p.name, p.last_names].filter(Boolean).join(" ") || "Sin nombre"}</span>
                  <span className="text-muted-foreground">· {p.store}</span>
                  <Badge variant="outline" className="ml-auto text-[10px]">{p.status}</Badge>
                </div>
                <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs">
                  {flattenSurveyForPreview(p).map((f) => (
                    <div key={f.label} className="flex gap-2">
                      <span className="text-muted-foreground min-w-[110px]">{f.label}:</span>
                      <span className="truncate" title={f.value}>{f.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        <DialogFooter>
          {!previews ? (
            <>
              <Button variant="outline" onClick={() => setOpen(false)}>Cancelar</Button>
              <Button onClick={handleParse} disabled={!raw.trim()}>
                Analizar
              </Button>
            </>
          ) : (
            <>
              <Button variant="outline" onClick={() => setPreviews(null)} disabled={importing}>Volver</Button>
              <Button onClick={runImport} disabled={importing}>
                {importing && <Loader2 className="h-4 w-4 mr-1 animate-spin" />}
                Sincronizar {previews.length} prospecto(s)
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
