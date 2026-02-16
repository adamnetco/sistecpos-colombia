import { useState, useRef } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Download, Upload, FileSpreadsheet, ShoppingCart } from "lucide-react";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator, DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import * as XLSX from "xlsx";

interface Product {
  id: string;
  name: string;
  slug: string;
  sku: string | null;
  description: string | null;
  price_cop: number;
  original_price_cop: number | null;
  price_usd: number | null;
  original_price_usd: number | null;
  cost_cop: number | null;
  stock: number;
  is_active: boolean;
  is_offer: boolean;
  is_featured: boolean;
  product_type: string;
  image_url: string | null;
  gallery_urls?: string[];
  features?: string[];
  meta_title?: string | null;
  meta_description?: string | null;
  google_product_category?: string | null;
  gtin?: string | null;
  mpn?: string | null;
  brand_name?: string | null;
  condition?: string | null;
  availability?: string | null;
  shipping_weight_kg?: number | null;
  custom_label_0?: string | null;
  custom_label_1?: string | null;
  catalog_brands?: { name: string } | null;
  catalog_categories?: { name: string } | null;
}

interface ImportRow {
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

const BASE_URL = "https://sistecpos.com";

export default function ProductCSVTools({ products }: Props) {
  const qc = useQueryClient();
  const fileRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<ImportRow[]>([]);
  const [previewOpen, setPreviewOpen] = useState(false);

  // ─── Excel Export ───
  const exportExcel = () => {
    const rows = products.map(p => ({
      slug: p.slug,
      nombre: p.name,
      sku: p.sku || "",
      categoria: p.catalog_categories?.name || "",
      marca: p.catalog_brands?.name || "",
      tipo: p.product_type,
      precio_cop: p.price_cop,
      precio_original_cop: p.original_price_cop || "",
      precio_usd: p.price_usd || "",
      precio_original_usd: p.original_price_usd || "",
      costo_cop: p.cost_cop || "",
      stock: p.stock,
      activo: p.is_active ? "Sí" : "No",
      oferta: p.is_offer ? "Sí" : "No",
      destacado: p.is_featured ? "Sí" : "No",
      meta_title: p.meta_title || "",
      meta_description: p.meta_description || "",
      imagen: p.image_url || "",
    }));
    const ws = XLSX.utils.json_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Productos");
    // Auto-width columns
    ws["!cols"] = Object.keys(rows[0] || {}).map(k => ({ wch: Math.max(k.length, 15) }));
    XLSX.writeFile(wb, `productos-sistecpos-${new Date().toISOString().split("T")[0]}.xlsx`);
    toast.success(`${products.length} productos exportados a Excel`);
  };

  // ─── Google Merchant Feed Export (TSV) ───
  const exportMerchantFeed = () => {
    const activeProducts = products.filter(p => p.is_active && p.price_cop > 0);
    if (!activeProducts.length) { toast.error("No hay productos activos para exportar"); return; }

    const headers = [
      "id", "title", "description", "link", "image_link", "additional_image_link",
      "availability", "price", "sale_price", "brand", "gtin", "mpn",
      "condition", "google_product_category", "product_type",
      "shipping_weight", "custom_label_0", "custom_label_1",
    ];

    const rows = activeProducts.map(p => {
      const allImages = [...(p.gallery_urls || [])];
      return [
        p.sku || p.slug,
        p.meta_title || p.name,
        (p.meta_description || p.description || "").replace(/\t/g, " ").replace(/\n/g, " ").substring(0, 5000),
        `${BASE_URL}/productos/${p.slug}`,
        p.image_url || "",
        allImages.slice(0, 10).join(","),
        p.availability === "out_of_stock" ? "out of stock" : p.stock > 0 ? "in stock" : "out of stock",
        p.original_price_cop ? `${p.original_price_cop} COP` : `${p.price_cop} COP`,
        p.original_price_cop ? `${p.price_cop} COP` : "",
        p.brand_name || p.catalog_brands?.name || "SistecPOS",
        p.gtin || "",
        p.mpn || p.sku || "",
        p.condition || "new",
        p.google_product_category || "Electronics > Point of Sale Equipment",
        p.product_type || "hardware",
        p.shipping_weight_kg ? `${p.shipping_weight_kg} kg` : "",
        p.custom_label_0 || "",
        p.custom_label_1 || "",
      ];
    });

    const tsv = [headers, ...rows].map(r => r.map(v => String(v).replace(/\t/g, " ")).join("\t")).join("\n");
    const blob = new Blob(["\uFEFF" + tsv], { type: "text/tab-separated-values;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `google-merchant-feed-${new Date().toISOString().split("T")[0]}.tsv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success(`Feed Google Merchant exportado: ${activeProducts.length} productos`);
  };

  // ─── Google Merchant Feed Export (XML/RSS) ───
  const exportMerchantXML = () => {
    const activeProducts = products.filter(p => p.is_active && p.price_cop > 0);
    if (!activeProducts.length) { toast.error("No hay productos activos para exportar"); return; }

    const escXml = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

    const items = activeProducts.map(p => {
      const allImages = p.gallery_urls || [];
      const additionalImages = allImages.slice(0, 10).map(url => `      <g:additional_image_link>${escXml(url)}</g:additional_image_link>`).join("\n");
      const avail = p.availability === "out_of_stock" ? "out of stock" : p.stock > 0 ? "in stock" : "out of stock";

      return `    <item>
      <g:id>${escXml(p.sku || p.slug)}</g:id>
      <g:title>${escXml(p.meta_title || p.name)}</g:title>
      <g:description>${escXml((p.meta_description || p.description || "").substring(0, 5000))}</g:description>
      <g:link>${BASE_URL}/productos/${escXml(p.slug)}</g:link>
      <g:image_link>${escXml(p.image_url || "")}</g:image_link>
${additionalImages}
      <g:availability>${avail}</g:availability>
      <g:price>${p.original_price_cop || p.price_cop} COP</g:price>
      ${p.original_price_cop ? `<g:sale_price>${p.price_cop} COP</g:sale_price>` : ""}
      <g:brand>${escXml(p.brand_name || p.catalog_brands?.name || "SistecPOS")}</g:brand>
      ${p.gtin ? `<g:gtin>${escXml(p.gtin)}</g:gtin>` : ""}
      <g:mpn>${escXml(p.mpn || p.sku || p.slug)}</g:mpn>
      <g:condition>${p.condition || "new"}</g:condition>
      <g:google_product_category>${escXml(p.google_product_category || "Electronics > Point of Sale Equipment")}</g:google_product_category>
      <g:product_type>${escXml(p.product_type || "hardware")}</g:product_type>
      ${p.shipping_weight_kg ? `<g:shipping_weight>${p.shipping_weight_kg} kg</g:shipping_weight>` : ""}
      ${p.custom_label_0 ? `<g:custom_label_0>${escXml(p.custom_label_0)}</g:custom_label_0>` : ""}
      ${p.custom_label_1 ? `<g:custom_label_1>${escXml(p.custom_label_1)}</g:custom_label_1>` : ""}
    </item>`;
    }).join("\n");

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:g="http://base.google.com/ns/1.0">
  <channel>
    <title>SistecPOS - Equipos POS Colombia</title>
    <link>${BASE_URL}</link>
    <description>Catálogo de productos POS SistecPOS</description>
${items}
  </channel>
</rss>`;

    const blob = new Blob([xml], { type: "application/xml;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `google-merchant-feed-${new Date().toISOString().split("T")[0]}.xml`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success(`Feed XML exportado: ${activeProducts.length} productos`);
  };

  // ─── Excel Import ───
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const isExcel = file.name.endsWith(".xlsx") || file.name.endsWith(".xls");

    if (isExcel) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        const data = new Uint8Array(ev.target?.result as ArrayBuffer);
        const wb = XLSX.read(data, { type: "array" });
        const ws = wb.Sheets[wb.SheetNames[0]];
        const json = XLSX.utils.sheet_to_json<any>(ws);
        const parsed: ImportRow[] = json.map((row: any) => ({
          slug: row.slug || "",
          name: row.nombre || row.name || "",
          price_cop: parseInt(row.precio_cop || row.price_cop) || 0,
          original_price_cop: row.precio_original_cop || row.original_price_cop ? parseInt(row.precio_original_cop || row.original_price_cop) : null,
          price_usd: row.precio_usd || row.price_usd ? parseFloat(row.precio_usd || row.price_usd) : null,
          original_price_usd: row.precio_original_usd || row.original_price_usd ? parseFloat(row.precio_original_usd || row.original_price_usd) : null,
          cost_cop: row.costo_cop || row.cost_cop ? parseInt(row.costo_cop || row.cost_cop) : null,
          stock: parseInt(row.stock) || 0,
        })).filter((r: ImportRow) => r.slug);
        if (parsed.length) { setPreview(parsed); setPreviewOpen(true); }
        else toast.error("No se encontraron filas válidas con columna 'slug'");
      };
      reader.readAsArrayBuffer(file);
    } else {
      // CSV fallback
      const reader = new FileReader();
      reader.onload = (ev) => {
        const text = ev.target?.result as string;
        const parsed = parseCSV(text);
        if (parsed.length) { setPreview(parsed); setPreviewOpen(true); }
      };
      reader.readAsText(file, "UTF-8");
    }
    if (fileRef.current) fileRef.current.value = "";
  };

  const parseCSV = (text: string): ImportRow[] => {
    const lines = text.split("\n").filter(l => l.trim());
    if (lines.length < 2) return [];
    const parseRow = (line: string): string[] => {
      const values: string[] = []; let current = ""; let inQuotes = false;
      for (let i = 0; i < line.length; i++) {
        const ch = line[i];
        if (ch === '"') { if (inQuotes && line[i + 1] === '"') { current += '"'; i++; } else { inQuotes = !inQuotes; } }
        else if (ch === "," && !inQuotes) { values.push(current.trim()); current = ""; }
        else { current += ch; }
      }
      values.push(current.trim()); return values;
    };
    const headers = parseRow(lines[0]).map(h => h.toLowerCase().replace(/\s+/g, "_"));
    const slugIdx = headers.indexOf("slug"); const priceIdx = headers.indexOf("price_cop") >= 0 ? headers.indexOf("price_cop") : headers.indexOf("precio_cop");
    if (slugIdx === -1 || priceIdx === -1) { toast.error("El archivo debe tener columnas 'slug' y 'price_cop'/'precio_cop'"); return []; }
    const nameIdx = headers.findIndex(h => h === "name" || h === "nombre");
    const origIdx = headers.findIndex(h => h.includes("original_price_cop") || h.includes("precio_original_cop"));
    const usdIdx = headers.findIndex(h => h === "price_usd" || h === "precio_usd");
    const costIdx = headers.findIndex(h => h === "cost_cop" || h === "costo_cop");
    const stockIdx = headers.indexOf("stock");
    return lines.slice(1).map(line => {
      const vals = parseRow(line);
      return {
        slug: vals[slugIdx] || "", name: nameIdx >= 0 ? vals[nameIdx] || "" : "",
        price_cop: parseInt(vals[priceIdx]) || 0,
        original_price_cop: origIdx >= 0 && vals[origIdx] ? parseInt(vals[origIdx]) : null,
        price_usd: usdIdx >= 0 && vals[usdIdx] ? parseFloat(vals[usdIdx]) : null,
        original_price_usd: null, cost_cop: costIdx >= 0 && vals[costIdx] ? parseInt(vals[costIdx]) : null,
        stock: stockIdx >= 0 ? parseInt(vals[stockIdx]) || 0 : 0,
      };
    }).filter(r => r.slug);
  };

  const importMutation = useMutation({
    mutationFn: async (rows: ImportRow[]) => {
      let updated = 0;
      for (const row of rows) {
        const payload: any = { price_cop: row.price_cop };
        if (row.original_price_cop !== null) payload.original_price_cop = row.original_price_cop;
        if (row.price_usd !== null) payload.price_usd = row.price_usd;
        if (row.original_price_usd !== null) payload.original_price_usd = row.original_price_usd;
        if (row.cost_cop !== null) payload.cost_cop = row.cost_cop;
        if (row.stock > 0) payload.stock = row.stock;
        const { error } = await supabase.from("catalog_products").update(payload).eq("slug", row.slug);
        if (!error) updated++;
      }
      return updated;
    },
    onSuccess: (count) => {
      qc.invalidateQueries({ queryKey: ["catalog_products"] });
      toast.success(`${count} productos actualizados`);
      setPreviewOpen(false); setPreview([]);
    },
    onError: (e: any) => toast.error(e.message),
  });

  const formatCOP = (n: number) => new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", minimumFractionDigits: 0 }).format(n);

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm" className="gap-2">
            <FileSpreadsheet className="h-4 w-4" /> Herramientas
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuLabel>Importar / Exportar</DropdownMenuLabel>
          <DropdownMenuItem onClick={exportExcel}>
            <Download className="h-4 w-4 mr-2" /> Exportar Excel (.xlsx)
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => fileRef.current?.click()}>
            <Upload className="h-4 w-4 mr-2" /> Importar Excel / CSV
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuLabel>Google Merchant Center</DropdownMenuLabel>
          <DropdownMenuItem onClick={exportMerchantFeed}>
            <ShoppingCart className="h-4 w-4 mr-2" /> Exportar Feed TSV
          </DropdownMenuItem>
          <DropdownMenuItem onClick={exportMerchantXML}>
            <ShoppingCart className="h-4 w-4 mr-2" /> Exportar Feed XML (RSS)
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      <input ref={fileRef} type="file" accept=".xlsx,.xls,.csv,.txt" className="hidden" onChange={handleFileSelect} />

      <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
        <DialogContent className="max-w-4xl max-h-[85vh]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileSpreadsheet className="h-5 w-5 text-primary" />
              Vista Previa de Importación
            </DialogTitle>
          </DialogHeader>
          <div className="text-sm text-muted-foreground mb-2">
            Se actualizarán <Badge variant="secondary">{preview.length}</Badge> productos por slug. Solo precios y stock.
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
