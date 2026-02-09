import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { dianArticles } from "@/data/dianArticles";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Download } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

/* Map LucideIcon component to its string name for DB storage */
const iconComponentToName: Record<string, string> = {};
import {
  AlertTriangle, Calendar, Clock, FileCheck, FileText, Gavel,
  HelpCircle, Key, LogIn, Globe, Receipt, RefreshCw, Shield, ShieldCheck,
} from "lucide-react";
const iconEntries: [string, any][] = [
  ["AlertTriangle", AlertTriangle], ["Calendar", Calendar], ["Clock", Clock],
  ["FileCheck", FileCheck], ["FileText", FileText], ["Gavel", Gavel],
  ["HelpCircle", HelpCircle], ["Key", Key], ["LogIn", LogIn],
  ["Globe", Globe], ["Receipt", Receipt], ["RefreshCw", RefreshCw],
  ["Shield", Shield], ["ShieldCheck", ShieldCheck],
];
iconEntries.forEach(([name, comp]) => { iconComponentToName[comp.displayName || name] = name; });

/* Cluster assignment based on the hardcoded hub slugs */
const clusterMap: Record<string, string> = {
  "facturacion-gratuita-dian": "facturador_gratuito",
  "facturador-gratuito-dian-no-funciona": "facturador_gratuito",
  "como-facturar-electronicamente-gratis-dian": "facturador_gratuito",
  "registro-facturador-gratuito-dian": "facturador_gratuito",
  "micrositio-facturacion-electronica-dian": "facturador_gratuito",
  "habilitar-facturacion-electronica-dian": "habilitacion_normativa",
  "resolucion-facturacion-electronica-2025": "habilitacion_normativa",
  "calendario-tributario-dian-2026": "habilitacion_normativa",
  "sanciones-no-facturar-electronicamente": "habilitacion_normativa",
  "limite-uvt-pos-2026": "habilitacion_normativa",
  "documento-soporte-electronico-dian": "habilitacion_normativa",
  "firma-digital-dian-gratis": "firma_digital",
  "certificados-digitales-facturacion-electronica": "firma_digital",
  "andes-scd-vs-gse": "firma_digital",
  "obtener-firma-electronica-dian": "firma_digital",
  "renovacion-certificado-digital-dian": "firma_digital",
  "facturacion-electronica-pymes-colombia": "comercial",
  "software-inventario-facturacion-electronica": "comercial",
  "top-10-software-pos-colombia": "comercial",
};

function getIconName(iconComp: any): string {
  // Try displayName first, then check the map
  if (iconComp.displayName && iconComponentToName[iconComp.displayName]) {
    return iconComponentToName[iconComp.displayName];
  }
  // Fallback: match by reference
  for (const [name, comp] of iconEntries) {
    if (comp === iconComp) return name;
  }
  return "FileText";
}

interface Props {
  existingSlugs: Set<string>;
}

export function DianImportButton({ existingSlugs }: Props) {
  const queryClient = useQueryClient();
  const newArticles = dianArticles.filter((a) => !existingSlugs.has(a.slug));

  const importMutation = useMutation({
    mutationFn: async () => {
      const rows = newArticles.map((a, idx) => ({
        slug: a.slug,
        keyword: a.keyword,
        meta_title: a.metaTitle,
        meta_description: a.metaDescription,
        hero_icon: getIconName(a.heroIcon),
        hero_badge: a.heroBadge,
        h1: a.h1,
        hero_subtitle: a.heroSubtitle,
        sections: a.sections as any,
        pain_vs_solution: a.painVsSolution as any,
        cta_text: a.ctaText,
        cta_whatsapp_message: a.ctaWhatsappMessage,
        faqs: a.faqs as any,
        related_links: a.relatedLinks as any,
        is_published: true,
        sort_order: idx,
        cluster: clusterMap[a.slug] || "otros",
      }));

      const { error } = await supabase.from("dian_articles").insert(rows);
      if (error) throw error;
      return rows.length;
    },
    onSuccess: (count) => {
      toast.success(`${count} artículos importados exitosamente`);
      queryClient.invalidateQueries({ queryKey: ["admin_dian_articles"] });
    },
    onError: (e: any) => toast.error("Error al importar: " + e.message),
  });

  if (newArticles.length === 0) return null;

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button size="sm" variant="outline" className="gap-1.5">
          <Download className="h-3.5 w-3.5" />
          Importar {newArticles.length} artículos
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Importar artículos estáticos</AlertDialogTitle>
          <AlertDialogDescription>
            Se importarán <strong>{newArticles.length}</strong> artículos desde el archivo estático (dianArticles.ts) a la base de datos.
            Los artículos que ya existen en la DB no serán duplicados. Cada artículo se asignará automáticamente a su cluster correspondiente.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancelar</AlertDialogCancel>
          <AlertDialogAction
            onClick={() => importMutation.mutate()}
            disabled={importMutation.isPending}
          >
            {importMutation.isPending ? "Importando..." : "Importar todo"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
