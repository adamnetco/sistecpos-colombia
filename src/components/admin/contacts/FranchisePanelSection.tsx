import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Building2, ChevronDown, Copy, ExternalLink, RefreshCw, Store } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export interface FranchiseData {
  external_lead_id: number | null;
  external_reseller_id: number | null;
  external_reseller_name: string | null;
  external_store_id: number | null;
  pos_store: string | null;
  pos_store_internal: string | null;
  license_key_external: string | null;
  external_token: string | null;
  external_status: string | null;
  external_created_at: string | null;
  external_updated_at: string | null;
  external_payload: any;
}

interface Props {
  data: FranchiseData | null;
  onResync?: () => void;
}

export function FranchisePanelSection({ data, onResync }: Props) {
  const [open, setOpen] = useState(false);
  const { toast } = useToast();

  if (!data || !data.external_lead_id) return null;

  const activationUrl = data.license_key_external
    ? `https://licenciaspos.online/prospects/activeDemo/${data.external_token || data.license_key_external}`
    : null;

  const panelUrl = data.external_lead_id
    ? `https://licenciaspos.online/prospects/edit/${data.external_lead_id}`
    : null;

  const fmt = (d: string | null) => d ? new Date(d).toLocaleString("es-CO", { dateStyle: "short", timeStyle: "short" }) : "—";

  const copy = (txt: string, label: string) => {
    navigator.clipboard.writeText(txt);
    toast({ title: `${label} copiado` });
  };

  return (
    <Collapsible open={open} onOpenChange={setOpen}>
      <div className="rounded-lg border border-amber-200 bg-amber-50/40 dark:border-amber-900/40 dark:bg-amber-950/20">
        <CollapsibleTrigger asChild>
          <button className="w-full flex items-center gap-2 px-3 py-2 text-sm font-medium hover:bg-amber-100/40 dark:hover:bg-amber-900/20 rounded-t-lg">
            <Building2 className="h-4 w-4 text-amber-700 dark:text-amber-400" />
            Datos del Panel Franquiciado
            <Badge variant="outline" className="ml-1 text-[10px]">#{data.external_lead_id}</Badge>
            {data.external_status && (
              <Badge variant="secondary" className="text-[10px]">{data.external_status}</Badge>
            )}
            <ChevronDown className={`h-4 w-4 ml-auto transition-transform ${open ? "rotate-180" : ""}`} />
          </button>
        </CollapsibleTrigger>

        <CollapsibleContent className="px-3 pb-3 space-y-3">
          <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-xs">
            <Field label="Reseller" value={`${data.external_reseller_name || "—"}${data.external_reseller_id ? ` (#${data.external_reseller_id})` : ""}`} />
            <Field label="Store ID" value={data.external_store_id?.toString() || "—"} />
            <Field label="POS Store" value={data.pos_store || "—"} icon={<Store className="h-3 w-3" />} />
            <Field label="Internal" value={data.pos_store_internal || "—"} />
            <Field label="Creado" value={fmt(data.external_created_at)} />
            <Field label="Actualizado" value={fmt(data.external_updated_at)} />
          </div>

          {data.license_key_external && (
            <div className="rounded-md border bg-background p-2 text-xs space-y-1">
              <div className="font-medium text-muted-foreground">Licencia externa (hash)</div>
              <div className="flex items-center gap-2">
                <code className="flex-1 break-all bg-muted px-1.5 py-0.5 rounded">{data.license_key_external}</code>
                <Button size="icon" variant="ghost" className="h-6 w-6" onClick={() => copy(data.license_key_external!, "Hash")}>
                  <Copy className="h-3 w-3" />
                </Button>
              </div>
            </div>
          )}

          <div className="flex flex-wrap gap-2">
            {activationUrl && (
              <Button size="sm" variant="outline" asChild>
                <a href={activationUrl} target="_blank" rel="noreferrer">
                  <ExternalLink className="h-3 w-3 mr-1" /> Activar demo
                </a>
              </Button>
            )}
            {panelUrl && (
              <Button size="sm" variant="outline" asChild>
                <a href={panelUrl} target="_blank" rel="noreferrer">
                  <ExternalLink className="h-3 w-3 mr-1" /> Abrir en panel
                </a>
              </Button>
            )}
            {onResync && (
              <Button size="sm" variant="ghost" onClick={onResync}>
                <RefreshCw className="h-3 w-3 mr-1" /> Re-sincronizar
              </Button>
            )}
          </div>

          {data.external_payload && (
            <details className="text-xs">
              <summary className="cursor-pointer text-muted-foreground hover:text-foreground select-none">
                Ver payload crudo (JSON)
              </summary>
              <pre className="mt-2 max-h-64 overflow-auto bg-muted/60 p-2 rounded text-[10px] leading-tight">
                {JSON.stringify(data.external_payload, null, 2)}
              </pre>
              <Button
                size="sm"
                variant="ghost"
                className="mt-1"
                onClick={() => copy(JSON.stringify(data.external_payload), "Payload")}
              >
                <Copy className="h-3 w-3 mr-1" /> Copiar JSON
              </Button>
            </details>
          )}
        </CollapsibleContent>
      </div>
    </Collapsible>
  );
}

function Field({ label, value, icon }: { label: string; value: string; icon?: React.ReactNode }) {
  return (
    <div className="flex gap-2 min-w-0">
      <span className="text-muted-foreground min-w-[80px] flex items-center gap-1">{icon}{label}:</span>
      <span className="truncate" title={value}>{value}</span>
    </div>
  );
}
