import { useState, useRef } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Download, Upload, FileSpreadsheet } from "lucide-react";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";

interface Product {
  id: string;
  name: string;
  slug: string;
  sku: string | null;
  price_cop: number;
  original_price_cop: number | null;
  price_usd: number | null;
  original_price_usd: number | null;
  cost_cop: number | null;
  stock: number;
  is_active: boolean;
  is_offer: boolean;
  product_type: string;
  catalog_brands?: { name: string } | null;
  catalog_categories?: { name: string } | null;
}

interface CSVRow {
  slug: string;
  name: string;
  price_cop: number;
  original_price_cop: number | null;
  price_usd: number | null;
  original_price_usd: number | null;
  cost_cop: number | null;
  stock: number;
}

interface Props {
  products: Product[];
}

export default function ProductCSVTools({ products }: Props) {
  const qc = useQueryClient();
  const fileRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<CSVRow[]>([]);
  const [previewOpen, setPreviewOpen] = useState(false);

  const exportCSV = () => {
    const headers = ["slug", "name", "sku", "category", "brand", "product_type", "price_cop", "original_price_cop", "price_usd", "original_price_usd", "cost_cop", "stock", "is_active", "is_offer"];
    const rows = products.map(p => [
      p.slug, p.name, p.sku || "", p.catalog_categories?.name || "", p.catalog_brands?.name || "",
      p.product_type, p.price_cop, p.original_price_cop || "", p.price_usd || "", p.original_price_usd || "",
      p.cost_cop || "", p.stock, p.is_active ? "true" : "false", p.is_offer ? "true" : "false",
    ]);

    const csvContent = [headers, ...rows].map(r => r.map(v => `"${String(v).replace(/"/g, '""')}"`).join(",")).join("\n");
    const BOM = "\uFEFF";
    const blob = new Blob([BOM + csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `productos-sistecpos-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success(`${products.length} productos exportados`);
  };

  const parseCSV = (text: string): CSVRow[] => {
    const lines = text.split("\n").filter(l => l.trim());
    if (lines.length < 2) return [];
    
    const parseRow = (line: string): string[] => {
      const values: string[] = [];
      let current = "";
      let inQuotes = false;
      for (let i = 0; i < line.length; i++) {
        const ch = line[i];
        if (ch === '"') {
          if (inQuotes && line[i + 1] === '"') { current += '"'; i++; }
          else { inQuotes = !inQuotes; }
        } else if (ch === "," && !inQuotes) {
          values.push(current.trim()); current = "";
        } else { current += ch; }
      }
      values.push(current.trim());
      return values;
    };

    const headers = parseRow(lines[0]).map(h => h.toLowerCase().replace(/\s+/g, "_"));
    const slugIdx = headers.indexOf("slug");
    const nameIdx = headers.indexOf("name");
    const priceIdx = headers.indexOf("price_cop");
    const origPriceIdx = headers.indexOf("original_price_cop");
    const priceUsdIdx = headers.indexOf("price_usd");
    const origPriceUsdIdx = headers.indexOf("original_price_usd");
    const costIdx = headers.indexOf("cost_cop");
    const stockIdx = headers.indexOf("stock");

    if (slugIdx === -1 || priceIdx === -1) {
      toast.error("El CSV debe tener las columnas 'slug' y 'price_cop'");
      return [];
    }

    return lines.slice(1).map(line => {
      const vals = parseRow(line);
      return {
        slug: vals[slugIdx] || "",
        name: nameIdx >= 0 ? vals[nameIdx] || "" : "",
        price_cop: parseInt(vals[priceIdx]) || 0,
        original_price_cop: origPriceIdx >= 0 && vals[origPriceIdx] ? parseInt(vals[origPriceIdx]) : null,
        price_usd: priceUsdIdx >= 0 && vals[priceUsdIdx] ? parseFloat(vals[priceUsdIdx]) : null,
        original_price_usd: origPriceUsdIdx >= 0 && vals[origPriceUsdIdx] ? parseFloat(vals[origPriceUsdIdx]) : null,
        cost_cop: costIdx >= 0 && vals[costIdx] ? parseInt(vals[costIdx]) : null,
        stock: stockIdx >= 0 ? parseInt(vals[stockIdx]) || 0 : 0,
      };
    }).filter(r => r.slug);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const text = ev.target?.result as string;
      const parsed = parseCSV(text);
      if (parsed.length > 0) {
        setPreview(parsed);
        setPreviewOpen(true);
      }
    };
    reader.readAsText(file, "UTF-8");
    if (fileRef.current) fileRef.current.value = "";
  };

  const importMutation = useMutation({
    mutationFn: async (rows: CSVRow[]) => {
      let updated = 0;
      for (const row of rows) {
        const updatePayload: any = { price_cop: row.price_cop };
        if (row.original_price_cop !== null) updatePayload.original_price_cop = row.original_price_cop;
        if (row.price_usd !== null) updatePayload.price_usd = row.price_usd;
        if (row.original_price_usd !== null) updatePayload.original_price_usd = row.original_price_usd;
        if (row.cost_cop !== null) updatePayload.cost_cop = row.cost_cop;
        if (row.stock > 0) updatePayload.stock = row.stock;

        const { error } = await supabase
          .from("catalog_products")
          .update(updatePayload)
          .eq("slug", row.slug);
        if (!error) updated++;
      }
      return updated;
    },
    onSuccess: (count) => {
      qc.invalidateQueries({ queryKey: ["catalog_products"] });
      toast.success(`${count} productos actualizados`);
      setPreviewOpen(false);
      setPreview([]);
    },
    onError: (e: any) => toast.error(e.message),
  });

  const formatCOP = (n: number) => new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", minimumFractionDigits: 0 }).format(n);

  return (
    <>
      <div className="flex gap-2">
        <Button variant="outline" size="sm" onClick={exportCSV} className="gap-2">
          <Download className="h-4 w-4" /> Exportar CSV
        </Button>
        <Button variant="outline" size="sm" onClick={() => fileRef.current?.click()} className="gap-2">
          <Upload className="h-4 w-4" /> Importar CSV
        </Button>
        <input ref={fileRef} type="file" accept=".csv,.txt" className="hidden" onChange={handleFileSelect} />
      </div>

      <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
        <DialogContent className="max-w-4xl max-h-[85vh]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileSpreadsheet className="h-5 w-5 text-primary" />
              Vista Previa de Importación
            </DialogTitle>
          </DialogHeader>
          <div className="text-sm text-muted-foreground mb-2">
            Se actualizarán <Badge variant="secondary">{preview.length}</Badge> productos por su slug. Solo se actualizan precios y stock.
          </div>
          <div className="max-h-[50vh] overflow-auto border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Slug</TableHead>
                  <TableHead>Nombre</TableHead>
                  <TableHead className="text-right">Precio COP</TableHead>
                  <TableHead className="text-right">Original COP</TableHead>
                  <TableHead className="text-right">USD</TableHead>
                  <TableHead className="text-right">Stock</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {preview.map((r, i) => (
                  <TableRow key={i}>
                    <TableCell className="text-xs font-mono">{r.slug}</TableCell>
                    <TableCell className="text-sm">{r.name}</TableCell>
                    <TableCell className="text-right text-sm font-medium">{formatCOP(r.price_cop)}</TableCell>
                    <TableCell className="text-right text-sm text-muted-foreground">{r.original_price_cop ? formatCOP(r.original_price_cop) : "—"}</TableCell>
                    <TableCell className="text-right text-sm">{r.price_usd ? `$${r.price_usd}` : "—"}</TableCell>
                    <TableCell className="text-right text-sm">{r.stock}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setPreviewOpen(false)}>Cancelar</Button>
            <Button onClick={() => importMutation.mutate(preview)} disabled={importMutation.isPending}>
              {importMutation.isPending ? "Actualizando..." : `Actualizar ${preview.length} productos`}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
