import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { ClipboardPaste, Wand2, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";

export interface ParsedLicense {
  license_key: string | null;
  pos_location: string | null;
  pos_plan_type: string | null;
  pos_invoice_count: number | null;
  pos_expires_at: string | null;
  pos_created_at: string | null;
  duration_days: number | null;
  billing_type: string | null;
}

interface Props {
  /** Called with the parsed result when the admin clicks "Aplicar". */
  onApply: (parsed: ParsedLicense, raw: string) => void;
  /** Compact heading variant. */
  compact?: boolean;
  /** Initial raw text. */
  initialRaw?: string;
  /** Hide the apply button (for read-only previews). */
  hideApply?: boolean;
}

const PLACEHOLDER = `Pega aquí el bloque que te entrega el proveedor. Ejemplo:

Ubicación: Tienda Principal   Tipo: Media
6129d58fdb654f46e0381e48af03d8f7
+ 0 facturas   2027-05-08 14:46:06
365 días
Fecha de creacion 2026-05-04 21:05:00
Tipo de licencia Anual
Licencia 6129d58fdb654f46e0381e48af03d8f7`;

export function LicenseRawPasteParser({ onApply, compact, initialRaw = "", hideApply }: Props) {
  const { toast } = useToast();
  const [raw, setRaw] = useState(initialRaw);
  const [parsed, setParsed] = useState<ParsedLicense | null>(null);
  const [parsing, setParsing] = useState(false);

  const parse = async () => {
    if (!raw.trim()) {
      toast({ title: "Pega primero los datos del proveedor", variant: "destructive" });
      return;
    }
    setParsing(true);
    const { data, error } = await supabase.rpc("parse_supplier_license", { _raw: raw });
    setParsing(false);
    if (error) {
      toast({ title: "No se pudo extraer", description: error.message, variant: "destructive" });
      return;
    }
    setParsed(data as unknown as ParsedLicense);
  };

  const isValid = parsed && parsed.license_key;

  return (
    <Card className={`p-3 space-y-3 border-dashed ${compact ? "" : "border-primary/30 bg-primary/5"}`}>
      {!compact && (
        <div className="flex items-start gap-2">
          <ClipboardPaste className="h-4 w-4 text-primary mt-0.5" />
          <div>
            <Label className="text-sm font-semibold">Cajón de pegado del proveedor</Label>
            <p className="text-xs text-muted-foreground">
              Pega el bloque tal cual te lo entrega el proveedor. Extraemos la clave, ubicación, vencimiento y tipo automáticamente.
            </p>
          </div>
        </div>
      )}

      <Textarea
        value={raw}
        onChange={(e) => setRaw(e.target.value)}
        placeholder={PLACEHOLDER}
        rows={compact ? 5 : 8}
        className="font-mono text-xs"
      />

      <div className="flex gap-2">
        <Button size="sm" variant="secondary" onClick={parse} disabled={parsing}>
          {parsing ? <Loader2 className="h-3.5 w-3.5 mr-1 animate-spin" /> : <Wand2 className="h-3.5 w-3.5 mr-1" />}
          Extraer datos
        </Button>
        {parsed && !hideApply && (
          <Button size="sm" disabled={!isValid} onClick={() => onApply(parsed, raw)}>
            <CheckCircle2 className="h-3.5 w-3.5 mr-1" /> Aplicar a la licencia
          </Button>
        )}
      </div>

      {parsed && (
        <div className="rounded-lg border bg-card p-3 text-xs space-y-1.5">
          {!isValid && (
            <div className="flex items-center gap-1.5 text-destructive">
              <AlertCircle className="h-3.5 w-3.5" />
              No se detectó una clave de licencia (32 caracteres hexadecimales). Revisa el texto pegado.
            </div>
          )}
          <Row label="Clave" value={parsed.license_key} mono />
          <Row label="Ubicación" value={parsed.pos_location} />
          <Row label="Tipo POS" value={parsed.pos_plan_type} />
          <Row label="Facturación" value={parsed.billing_type} />
          <Row label="Facturas" value={parsed.pos_invoice_count?.toString() ?? null} />
          <Row label="Creada" value={parsed.pos_created_at ? new Date(parsed.pos_created_at).toLocaleString("es-CO") : null} />
          <Row label="Vence" value={parsed.pos_expires_at ? new Date(parsed.pos_expires_at).toLocaleString("es-CO") : null} highlight />
          {parsed.duration_days != null && (
            <Badge variant="outline" className="text-[10px]">{parsed.duration_days} días</Badge>
          )}
        </div>
      )}
    </Card>
  );
}

function Row({ label, value, mono, highlight }: { label: string; value: string | null; mono?: boolean; highlight?: boolean }) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-muted-foreground w-20 shrink-0">{label}:</span>
      <span className={`${mono ? "font-mono" : ""} ${highlight ? "font-semibold text-primary" : ""} ${!value ? "text-muted-foreground italic" : ""}`}>
        {value || "—"}
      </span>
    </div>
  );
}
