import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "sonner";
import { Plus, X, Upload, Search, Globe, Puzzle, Gift, Lock, ChevronUp, ChevronDown } from "lucide-react";

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  editing: any | null;
  onSaved: () => void;
}

const defaultForm = {
  name: "", slug: "", sku: "", brand_id: "", category_id: "",
  description: "", long_description: "",
  price_cop: 0, original_price_cop: 0, price_usd: 0, original_price_usd: 0, cost_cop: 0,
  image_url: "", gallery_urls: [] as string[], stock: 0, is_active: true, is_featured: false, is_offer: false,
  product_type: "hardware", sort_order: 0,
  features: [] as string[], includes: [] as string[],
  specifications: [] as { label: string; value: string }[],
  video_urls: [] as string[],
  pdf_urls: [] as { name: string; url: string }[],
  // SEO fields
  meta_title: "", meta_description: "",
  // Google Merchant fields
  google_product_category: "", gtin: "", mpn: "", brand_name: "",
  condition: "new", availability: "in_stock",
  shipping_weight_kg: 0, custom_label_0: "", custom_label_1: "",
};

export default function ProductFormDialog({ open, onOpenChange, editing, onSaved }: Props) {
  const [form, setForm] = useState(defaultForm);
  const [newFeature, setNewFeature] = useState("");
  const [newInclude, setNewInclude] = useState("");
  const [newSpecLabel, setNewSpecLabel] = useState("");
  const [newSpecValue, setNewSpecValue] = useState("");
  const [newVideoUrl, setNewVideoUrl] = useState("");
  const [newPdfName, setNewPdfName] = useState("");
  const [uploading, setUploading] = useState(false);

  const { data: brands = [] } = useQuery({
    queryKey: ["catalog_brands_select"],
    queryFn: async () => {
      const { data } = await supabase.from("catalog_brands").select("id, name").order("name");
      return data || [];
    },
  });

  const { data: categories = [] } = useQuery({
    queryKey: ["catalog_categories_select"],
    queryFn: async () => {
      const { data } = await supabase.from("catalog_categories").select("id, name").order("sort_order");
      return data || [];
    },
  });

  useEffect(() => {
    if (editing) {
      setForm({
        name: editing.name, slug: editing.slug, sku: editing.sku || "",
        brand_id: editing.brand_id || "", category_id: editing.category_id || "",
        description: editing.description || "", long_description: editing.long_description || "",
        price_cop: editing.price_cop, original_price_cop: editing.original_price_cop || 0,
        price_usd: editing.price_usd || 0, original_price_usd: editing.original_price_usd || 0,
        cost_cop: editing.cost_cop || 0, image_url: editing.image_url || "",
        gallery_urls: editing.gallery_urls || [],
        stock: editing.stock, is_active: editing.is_active, is_featured: editing.is_featured,
        is_offer: editing.is_offer, product_type: editing.product_type, sort_order: editing.sort_order,
        features: editing.features || [], includes: editing.includes || [],
        specifications: editing.specifications || [],
        video_urls: editing.video_urls || [],
        pdf_urls: (editing.pdf_urls as any[]) || [],
        meta_title: editing.meta_title || "",
        meta_description: editing.meta_description || "",
        google_product_category: editing.google_product_category || "",
        gtin: editing.gtin || "", mpn: editing.mpn || "",
        brand_name: editing.brand_name || "",
        condition: editing.condition || "new",
        availability: editing.availability || "in_stock",
        shipping_weight_kg: editing.shipping_weight_kg || 0,
        custom_label_0: editing.custom_label_0 || "",
        custom_label_1: editing.custom_label_1 || "",
      });
    } else {
      setForm(defaultForm);
    }
  }, [editing, open]);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const ext = file.name.split(".").pop();
    const path = `products/${Date.now()}.${ext}`;
    const { error } = await supabase.storage.from("product-images").upload(path, file);
    if (error) { toast.error("Error subiendo imagen"); setUploading(false); return; }
    const { data: urlData } = supabase.storage.from("product-images").getPublicUrl(path);
    setForm(f => ({ ...f, image_url: urlData.publicUrl }));
    setUploading(false);
    toast.success("Imagen subida");
  };

  const saveMutation = useMutation({
    mutationFn: async () => {
      const slug = form.slug || form.name.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
      const payload: any = {
        name: form.name, slug, sku: form.sku || null,
        brand_id: form.brand_id || null, category_id: form.category_id || null,
        description: form.description || null, long_description: form.long_description || null,
        price_cop: form.price_cop, original_price_cop: form.original_price_cop || null,
        price_usd: form.price_usd || null, original_price_usd: form.original_price_usd || null,
        cost_cop: form.cost_cop || null, image_url: form.image_url || null,
        gallery_urls: form.gallery_urls, features: form.features,
        specifications: form.specifications, includes: form.includes,
        video_urls: form.video_urls, pdf_urls: form.pdf_urls,
        stock: form.stock, is_active: form.is_active, is_featured: form.is_featured,
        is_offer: form.is_offer, product_type: form.product_type, sort_order: form.sort_order,
        meta_title: form.meta_title || null,
        meta_description: form.meta_description || null,
        google_product_category: form.google_product_category || null,
        gtin: form.gtin || null, mpn: form.mpn || null,
        brand_name: form.brand_name || null,
        condition: form.condition || "new",
        availability: form.availability || "in_stock",
        shipping_weight_kg: form.shipping_weight_kg || null,
        custom_label_0: form.custom_label_0 || null,
        custom_label_1: form.custom_label_1 || null,
      };
      if (editing) {
        const { error } = await supabase.from("catalog_products").update(payload).eq("id", editing.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("catalog_products").insert(payload);
        if (error) throw error;
      }
    },
    onSuccess: () => { toast.success(editing ? "Producto actualizado" : "Producto creado"); onSaved(); },
    onError: (e: any) => toast.error(e.message),
  });

  const set = (key: string, value: any) => setForm(f => ({ ...f, [key]: value }));

  const titleLen = (form.meta_title || "").length;
  const descLen = (form.meta_description || "").length;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] p-0">
        <DialogHeader className="px-6 pt-6">
          <DialogTitle>{editing ? "Editar Producto" : "Nuevo Producto"}</DialogTitle>
        </DialogHeader>
        <ScrollArea className="max-h-[70vh] px-6">
          <Tabs defaultValue="general" className="space-y-4 pb-6">
            <TabsList className="flex-wrap h-auto gap-1">
              <TabsTrigger value="general">General</TabsTrigger>
              <TabsTrigger value="media">Multimedia</TabsTrigger>
              <TabsTrigger value="pricing">Precios</TabsTrigger>
              <TabsTrigger value="details">Detalles</TabsTrigger>
              <TabsTrigger value="modules" className="gap-1"><Puzzle className="h-3 w-3" />Módulos</TabsTrigger>
              <TabsTrigger value="seo" className="gap-1"><Search className="h-3 w-3" />SEO</TabsTrigger>
              <TabsTrigger value="merchant" className="gap-1"><Globe className="h-3 w-3" />Merchant</TabsTrigger>
            </TabsList>

            {/* === GENERAL TAB === */}
            <TabsContent value="general" className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <Label>Nombre *</Label>
                  <Input value={form.name} onChange={e => set("name", e.target.value)} placeholder="Impresora Térmica 80mm" />
                </div>
                <div>
                  <Label>Slug</Label>
                  <Input value={form.slug} onChange={e => set("slug", e.target.value)} placeholder="Auto-generado" />
                </div>
                <div>
                  <Label>SKU</Label>
                  <Input value={form.sku} onChange={e => set("sku", e.target.value)} placeholder="IMP-80MM-001" />
                </div>
                <div>
                  <Label>Categoría</Label>
                  <Select value={form.category_id} onValueChange={v => set("category_id", v)}>
                    <SelectTrigger><SelectValue placeholder="Seleccionar..." /></SelectTrigger>
                    <SelectContent>
                      {categories.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Marca</Label>
                  <Select value={form.brand_id} onValueChange={v => set("brand_id", v)}>
                    <SelectTrigger><SelectValue placeholder="Seleccionar..." /></SelectTrigger>
                    <SelectContent>
                      {brands.map(b => <SelectItem key={b.id} value={b.id}>{b.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Tipo</Label>
                  <Select value={form.product_type} onValueChange={v => set("product_type", v)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="hardware">Hardware</SelectItem>
                      <SelectItem value="software">Software</SelectItem>
                      <SelectItem value="servicio">Servicio</SelectItem>
                      <SelectItem value="certificado">Certificado</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Stock</Label>
                  <Input type="number" value={form.stock} onChange={e => set("stock", parseInt(e.target.value) || 0)} />
                </div>
              </div>
              <div className="space-y-4">
                <div>
                  <Label>Descripción Corta</Label>
                  <Textarea value={form.description} onChange={e => set("description", e.target.value)} rows={2} />
                </div>
                <div>
                  <Label>Descripción Larga</Label>
                  <Textarea value={form.long_description} onChange={e => set("long_description", e.target.value)} rows={4} />
                </div>
              </div>
              <Separator />
              <div className="flex flex-wrap gap-6">
                <div className="flex items-center gap-2">
                  <Switch checked={form.is_active} onCheckedChange={v => set("is_active", v)} />
                  <Label>Activo</Label>
                </div>
                <div className="flex items-center gap-2">
                  <Switch checked={form.is_featured} onCheckedChange={v => set("is_featured", v)} />
                  <Label>Destacado</Label>
                </div>
                <div className="flex items-center gap-2">
                  <Switch checked={form.is_offer} onCheckedChange={v => set("is_offer", v)} />
                  <Label>Oferta</Label>
                </div>
                <div className="w-20">
                  <Label>Orden</Label>
                  <Input type="number" value={form.sort_order} onChange={e => set("sort_order", parseInt(e.target.value) || 0)} />
                </div>
              </div>
            </TabsContent>

            {/* === MEDIA TAB === */}
            <TabsContent value="media" className="space-y-4">
              {/* Main Image */}
              <div>
                <Label>Imagen Principal</Label>
                <div className="flex items-center gap-4 mt-2">
                  {form.image_url ? (
                    <div className="relative h-24 w-24 rounded-lg overflow-hidden border">
                      <img src={form.image_url} alt="Preview" className="h-full w-full object-cover" />
                      <button onClick={() => set("image_url", "")} className="absolute top-1 right-1 bg-destructive text-destructive-foreground rounded-full p-0.5"><X className="h-3 w-3" /></button>
                    </div>
                  ) : (
                    <label className="h-24 w-24 rounded-lg border-2 border-dashed flex flex-col items-center justify-center cursor-pointer hover:border-primary transition-colors">
                      <Upload className="h-5 w-5 text-muted-foreground" />
                      <span className="text-[10px] text-muted-foreground mt-1">Subir</span>
                      <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
                    </label>
                  )}
                  <div className="flex-1">
                    <Input value={form.image_url} onChange={e => set("image_url", e.target.value)} placeholder="O pegar URL..." />
                  </div>
                </div>
              </div>
              {/* Gallery */}
              <div>
                <Label>Galería de Imágenes ({form.gallery_urls.length})</Label>
                <p className="text-xs text-muted-foreground mb-2">Agrega varias fotos del producto</p>
                <div className="flex gap-2 mt-1">
                  <Input placeholder="Pegar URL de imagen adicional..." onKeyDown={e => {
                    if (e.key === "Enter") { const val = (e.target as HTMLInputElement).value.trim(); if (val) { set("gallery_urls", [...form.gallery_urls, val]); (e.target as HTMLInputElement).value = ""; } }
                  }} />
                  <label className="cursor-pointer shrink-0">
                    <Button variant="outline" size="sm" asChild><span><Upload className="h-4 w-4 mr-1" />Subir</span></Button>
                    <input type="file" accept="image/*" multiple className="hidden" onChange={async (e) => {
                      const files = e.target.files; if (!files) return;
                      const newUrls: string[] = [];
                      for (const file of Array.from(files)) {
                        const ext = file.name.split(".").pop();
                        const path = `products/gallery/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
                        const { error } = await supabase.storage.from("product-images").upload(path, file);
                        if (!error) { const { data: urlData } = supabase.storage.from("product-images").getPublicUrl(path); newUrls.push(urlData.publicUrl); }
                      }
                      if (newUrls.length) { set("gallery_urls", [...form.gallery_urls, ...newUrls]); toast.success(`${newUrls.length} imagen(es) subida(s)`); }
                    }} />
                  </label>
                </div>
                {form.gallery_urls.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-3">
                    {form.gallery_urls.map((url, i) => (
                      <div key={i} className="relative h-20 w-20 rounded-lg overflow-hidden border group">
                        <img src={url} alt={`Gallery ${i + 1}`} className="h-full w-full object-cover" />
                        <button onClick={() => set("gallery_urls", form.gallery_urls.filter((_, j) => j !== i))} className="absolute top-0.5 right-0.5 bg-destructive text-destructive-foreground rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"><X className="h-3 w-3" /></button>
                        <div className="absolute bottom-0 left-0 right-0 bg-black/50 text-white text-[9px] text-center py-0.5">{i + 1}</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <Separator />
              {/* Videos */}
              <div>
                <Label>Videos Demostrativos</Label>
                <div className="flex gap-2 mt-2">
                  <Input value={newVideoUrl} onChange={e => setNewVideoUrl(e.target.value)} placeholder="https://youtube.com/watch?v=..." onKeyDown={e => { if (e.key === "Enter" && newVideoUrl.trim()) { set("video_urls", [...form.video_urls, newVideoUrl.trim()]); setNewVideoUrl(""); } }} />
                  <Button variant="outline" size="icon" onClick={() => { if (newVideoUrl.trim()) { set("video_urls", [...form.video_urls, newVideoUrl.trim()]); setNewVideoUrl(""); } }}><Plus className="h-4 w-4" /></Button>
                </div>
                <div className="flex flex-wrap gap-2 mt-2">
                  {form.video_urls.map((v, i) => (
                    <span key={i} className="inline-flex items-center gap-1.5 bg-muted px-2.5 py-1.5 rounded-md text-xs max-w-xs group">
                      🎥 <span className="truncate max-w-[200px]">{v}</span>
                      <button
                        type="button"
                        onClick={() => set("video_urls", form.video_urls.filter((_, j) => j !== i))}
                        className="shrink-0 rounded-full p-0.5 hover:bg-destructive hover:text-destructive-foreground transition-colors"
                        title="Eliminar video"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    </span>
                  ))}
                </div>
              </div>
              {/* PDFs */}
              <div>
                <Label>Catálogos / PDFs</Label>
                <div className="flex gap-2 mt-2">
                  <Input value={newPdfName} onChange={e => setNewPdfName(e.target.value)} placeholder="Nombre del PDF" className="flex-1" />
                  <label className="cursor-pointer">
                    <Button variant="outline" size="sm" asChild><span><Upload className="h-4 w-4 mr-1" />Subir PDF</span></Button>
                    <input type="file" accept=".pdf" className="hidden" onChange={async (e) => {
                      const file = e.target.files?.[0]; if (!file) return;
                      const path = `pdfs/${Date.now()}-${file.name}`;
                      const { error } = await supabase.storage.from("product-docs").upload(path, file);
                      if (error) { toast.error("Error subiendo PDF"); return; }
                      const { data: urlData } = supabase.storage.from("product-docs").getPublicUrl(path);
                      set("pdf_urls", [...form.pdf_urls, { name: newPdfName || file.name, url: urlData.publicUrl }]);
                      setNewPdfName(""); toast.success("PDF subido");
                    }} />
                  </label>
                </div>
                <div className="flex flex-wrap gap-2 mt-2">
                  {form.pdf_urls.map((p, i) => (
                    <span key={i} className="inline-flex items-center gap-1 bg-muted px-2 py-1 rounded text-xs">📄 {p.name}<button onClick={() => set("pdf_urls", form.pdf_urls.filter((_, j) => j !== i))}><X className="h-3 w-3" /></button></span>
                  ))}
                </div>
              </div>
            </TabsContent>

            {/* === PRICING TAB === */}
            <TabsContent value="pricing" className="space-y-4">
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div><Label>Precio COP *</Label><Input type="number" value={form.price_cop} onChange={e => set("price_cop", parseInt(e.target.value) || 0)} /></div>
                <div><Label>Precio Original COP</Label><Input type="number" value={form.original_price_cop} onChange={e => set("original_price_cop", parseInt(e.target.value) || 0)} /></div>
                <div><Label>Costo COP</Label><Input type="number" value={form.cost_cop} onChange={e => set("cost_cop", parseInt(e.target.value) || 0)} /></div>
                <div><Label>Precio USD</Label><Input type="number" step="0.01" value={form.price_usd} onChange={e => set("price_usd", parseFloat(e.target.value) || 0)} /></div>
                <div><Label>Precio Original USD</Label><Input type="number" step="0.01" value={form.original_price_usd} onChange={e => set("original_price_usd", parseFloat(e.target.value) || 0)} /></div>
              </div>
            </TabsContent>

            {/* === DETAILS TAB === */}
            <TabsContent value="details" className="space-y-5">
              {/* Features */}
              <div>
                <Label className="font-semibold">Características</Label>
                <div className="flex gap-2 mt-2">
                  <Input value={newFeature} onChange={e => setNewFeature(e.target.value)} placeholder="Nueva característica" onKeyDown={e => { if (e.key === "Enter" && newFeature.trim()) { set("features", [...form.features, newFeature.trim()]); setNewFeature(""); } }} />
                  <Button variant="outline" size="icon" onClick={() => { if (newFeature.trim()) { set("features", [...form.features, newFeature.trim()]); setNewFeature(""); } }}><Plus className="h-4 w-4" /></Button>
                </div>
                <div className="mt-2 space-y-1">
                  {form.features.map((f, i) => (
                    <div key={i} className="group flex items-center gap-2 bg-muted/60 border rounded-lg px-3 py-1.5 text-sm">
                      <span className="flex-1 truncate">{f}</span>
                      <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button type="button" disabled={i === 0} onClick={() => { const a=[...form.features];[a[i],a[i-1]]=[a[i-1],a[i]];set("features",a); }} className="p-0.5 rounded hover:bg-muted disabled:opacity-30"><ChevronUp className="h-3.5 w-3.5" /></button>
                        <button type="button" disabled={i === form.features.length-1} onClick={() => { const a=[...form.features];[a[i],a[i+1]]=[a[i+1],a[i]];set("features",a); }} className="p-0.5 rounded hover:bg-muted disabled:opacity-30"><ChevronDown className="h-3.5 w-3.5" /></button>
                        <button type="button" onClick={() => set("features", form.features.filter((_,j)=>j!==i))} className="p-0.5 ml-1 rounded hover:bg-destructive hover:text-destructive-foreground"><X className="h-3 w-3" /></button>
                      </div>
                      <span className="text-[10px] text-muted-foreground w-4 text-right">{i+1}</span>
                    </div>
                  ))}
                </div>
              </div>
              {/* Specifications */}
              <div>
                <Label className="font-semibold">Especificaciones Técnicas</Label>
                <div className="flex gap-2 mt-2">
                  <Input value={newSpecLabel} onChange={e => setNewSpecLabel(e.target.value)} placeholder="Etiqueta" className="flex-1" />
                  <Input value={newSpecValue} onChange={e => setNewSpecValue(e.target.value)} placeholder="Valor" className="flex-1" />
                  <Button variant="outline" size="icon" onClick={() => { if (newSpecLabel.trim() && newSpecValue.trim()) { set("specifications", [...form.specifications, { label: newSpecLabel.trim(), value: newSpecValue.trim() }]); setNewSpecLabel(""); setNewSpecValue(""); } }}><Plus className="h-4 w-4" /></Button>
                </div>
                <div className="mt-2 space-y-1">
                  {form.specifications.map((s: any, i: number) => (
                    <div key={i} className="group flex items-center gap-2 bg-muted/60 border rounded-lg px-3 py-1.5 text-xs">
                      <span className="font-medium shrink-0">{s.label}:</span>
                      <span className="flex-1 truncate text-muted-foreground">{s.value}</span>
                      <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button type="button" disabled={i===0} onClick={() => { const a=[...form.specifications];[a[i],a[i-1]]=[a[i-1],a[i]];set("specifications",a); }} className="p-0.5 rounded hover:bg-muted disabled:opacity-30"><ChevronUp className="h-3.5 w-3.5" /></button>
                        <button type="button" disabled={i===form.specifications.length-1} onClick={() => { const a=[...form.specifications];[a[i],a[i+1]]=[a[i+1],a[i]];set("specifications",a); }} className="p-0.5 rounded hover:bg-muted disabled:opacity-30"><ChevronDown className="h-3.5 w-3.5" /></button>
                        <button type="button" onClick={() => set("specifications", form.specifications.filter((_,j)=>j!==i))} className="p-0.5 ml-1 rounded hover:bg-destructive hover:text-destructive-foreground"><X className="h-3 w-3" /></button>
                      </div>
                      <span className="text-[10px] text-muted-foreground w-4 text-right">{i+1}</span>
                    </div>
                  ))}
                </div>
              </div>
              {/* Includes */}
              <div>
                <Label className="font-semibold">¿Qué incluye?</Label>
                <div className="flex gap-2 mt-2">
                  <Input value={newInclude} onChange={e => setNewInclude(e.target.value)} placeholder="Elemento incluido" onKeyDown={e => { if (e.key === "Enter" && newInclude.trim()) { set("includes", [...form.includes, newInclude.trim()]); setNewInclude(""); } }} />
                  <Button variant="outline" size="icon" onClick={() => { if (newInclude.trim()) { set("includes", [...form.includes, newInclude.trim()]); setNewInclude(""); } }}><Plus className="h-4 w-4" /></Button>
                </div>
                <div className="mt-2 space-y-1">
                  {form.includes.map((f, i) => (
                    <div key={i} className="group flex items-center gap-2 bg-muted/60 border rounded-lg px-3 py-1.5 text-sm">
                      <span className="flex-1 truncate">{f}</span>
                      <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button type="button" disabled={i===0} onClick={() => { const a=[...form.includes];[a[i],a[i-1]]=[a[i-1],a[i]];set("includes",a); }} className="p-0.5 rounded hover:bg-muted disabled:opacity-30"><ChevronUp className="h-3.5 w-3.5" /></button>
                        <button type="button" disabled={i===form.includes.length-1} onClick={() => { const a=[...form.includes];[a[i],a[i+1]]=[a[i+1],a[i]];set("includes",a); }} className="p-0.5 rounded hover:bg-muted disabled:opacity-30"><ChevronDown className="h-3.5 w-3.5" /></button>
                        <button type="button" onClick={() => set("includes", form.includes.filter((_,j)=>j!==i))} className="p-0.5 ml-1 rounded hover:bg-destructive hover:text-destructive-foreground"><X className="h-3 w-3" /></button>
                      </div>
                      <span className="text-[10px] text-muted-foreground w-4 text-right">{i+1}</span>
                    </div>
                  ))}
                </div>
              </div>
            </TabsContent>

            {/* === MODULES TAB === */}
            <TabsContent value="modules" className="space-y-4">
              <PlanModulesTab productId={editing?.id} />
            </TabsContent>

            {/* === SEO TAB === */}
            <TabsContent value="seo" className="space-y-4">
              <div className="space-y-1.5">
                <div className="flex justify-between">
                  <Label>Meta Title</Label>
                  <span className={`text-xs ${titleLen > 60 ? "text-destructive" : "text-muted-foreground"}`}>{titleLen}/60</span>
                </div>
                <Input value={form.meta_title} onChange={e => set("meta_title", e.target.value)} placeholder="Título SEO del producto" />
                {titleLen > 60 && <p className="text-xs text-destructive">Recomendado: máximo 60 caracteres</p>}
              </div>
              <div className="space-y-1.5">
                <div className="flex justify-between">
                  <Label>Meta Description</Label>
                  <span className={`text-xs ${descLen > 160 ? "text-destructive" : "text-muted-foreground"}`}>{descLen}/160</span>
                </div>
                <Textarea value={form.meta_description} onChange={e => set("meta_description", e.target.value)} placeholder="Descripción para Google" rows={3} />
                {descLen > 160 && <p className="text-xs text-destructive">Recomendado: máximo 160 caracteres</p>}
              </div>
              {/* SERP Preview */}
              <Card className="bg-muted/30">
                <CardHeader className="pb-2 pt-3 px-4">
                  <CardTitle className="text-xs uppercase tracking-wider text-muted-foreground">Vista previa en Google</CardTitle>
                </CardHeader>
                <CardContent className="px-4 pb-3">
                  <p className="text-[#1a0dab] text-base font-medium truncate">{form.meta_title || form.name || "Título del producto"}</p>
                  <p className="text-[#006621] text-xs truncate">https://sistecpos.com/productos/{form.slug || "slug"}</p>
                  <p className="text-[#545454] text-sm line-clamp-2">{form.meta_description || form.description || "Descripción..."}</p>
                </CardContent>
              </Card>
            </TabsContent>

            {/* === GOOGLE MERCHANT TAB === */}
            <TabsContent value="merchant" className="space-y-4">
              <p className="text-sm text-muted-foreground">Campos para el feed de Google Merchant Center. Completa los que apliquen.</p>
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <Label>Categoría de Producto Google</Label>
                  <Input value={form.google_product_category} onChange={e => set("google_product_category", e.target.value)} placeholder="Ej: Electronics > Printers > Receipt Printers" />
                  <p className="text-xs text-muted-foreground mt-1">
                    <a href="https://www.google.com/basepages/producttype/taxonomy-with-ids.es-419.txt" target="_blank" rel="noopener" className="underline">Ver taxonomía de Google</a>
                  </p>
                </div>
                <div>
                  <Label>GTIN / EAN</Label>
                  <Input value={form.gtin} onChange={e => set("gtin", e.target.value)} placeholder="7701234567890" />
                </div>
                <div>
                  <Label>MPN (Ref. fabricante)</Label>
                  <Input value={form.mpn} onChange={e => set("mpn", e.target.value)} placeholder="SAT-X6266" />
                </div>
                <div>
                  <Label>Nombre de Marca</Label>
                  <Input value={form.brand_name} onChange={e => set("brand_name", e.target.value)} placeholder="SAT, DigitalPOS..." />
                </div>
                <div>
                  <Label>Condición</Label>
                  <Select value={form.condition} onValueChange={v => set("condition", v)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="new">Nuevo</SelectItem>
                      <SelectItem value="refurbished">Reacondicionado</SelectItem>
                      <SelectItem value="used">Usado</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Disponibilidad</Label>
                  <Select value={form.availability} onValueChange={v => set("availability", v)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="in_stock">En stock</SelectItem>
                      <SelectItem value="out_of_stock">Agotado</SelectItem>
                      <SelectItem value="preorder">Pre-orden</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Peso envío (kg)</Label>
                  <Input type="number" step="0.01" value={form.shipping_weight_kg} onChange={e => set("shipping_weight_kg", parseFloat(e.target.value) || 0)} />
                </div>
                <div>
                  <Label>Custom Label 0</Label>
                  <Input value={form.custom_label_0} onChange={e => set("custom_label_0", e.target.value)} placeholder="Ej: promo-navidad" />
                </div>
                <div>
                  <Label>Custom Label 1</Label>
                  <Input value={form.custom_label_1} onChange={e => set("custom_label_1", e.target.value)} placeholder="Ej: margen-alto" />
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </ScrollArea>
        <DialogFooter className="px-6 pb-6">
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
          <Button onClick={() => saveMutation.mutate()} disabled={!form.name || saveMutation.isPending}>
            {saveMutation.isPending ? "Guardando..." : editing ? "Actualizar" : "Crear Producto"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/* ─── PLAN MODULES TAB ─── */
function PlanModulesTab({ productId }: { productId?: string }) {
  const { data: allModules = [] } = useQuery({
    queryKey: ["plan_modules_public"],
    queryFn: async () => {
      const { data } = await supabase.from("plan_modules").select("*").order("sort_order");
      return data || [];
    },
  });

  const { data: linked = [], refetch } = useQuery({
    queryKey: ["product_modules", productId],
    enabled: !!productId,
    queryFn: async () => {
      const { data } = await supabase
        .from("catalog_product_modules")
        .select("module_id")
        .eq("product_id", productId!);
      return (data || []).map((r: any) => r.module_id as string);
    },
  });

  const toggle = async (moduleId: string, checked: boolean) => {
    if (!productId) { toast.info("Guarda el producto primero para asociar módulos"); return; }
    if (checked) {
      await supabase.from("catalog_product_modules").insert({ product_id: productId, module_id: moduleId });
    } else {
      await supabase.from("catalog_product_modules").delete().eq("product_id", productId).eq("module_id", moduleId);
    }
    refetch();
  };

  if (!productId) {
    return (
      <div className="rounded-lg border border-dashed p-6 text-center text-sm text-muted-foreground">
        <Puzzle className="h-8 w-8 mx-auto mb-2 opacity-30" />
        Guarda el producto primero para asociarle módulos de plan.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <p className="text-sm text-muted-foreground">
        Selecciona los módulos relacionados con este producto. Aparecerán en las tarjetas de precios de licencias.
      </p>
      {allModules.map((m: any) => {
        const isLinked = linked.includes(m.id);
        return (
          <div key={m.id} className="flex items-start gap-3 p-3 rounded-lg border hover:bg-muted/30 transition-colors">
            <Checkbox
              id={`mod-${m.id}`}
              checked={isLinked}
              onCheckedChange={(v) => toggle(m.id, !!v)}
              className="mt-0.5"
            />
            <label htmlFor={`mod-${m.id}`} className="flex-1 cursor-pointer space-y-1">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-medium text-sm">{m.name}</span>
                {m.is_free ? (
                  <Badge className="bg-primary/10 text-primary border-0 text-xs gap-1">
                    <Gift className="h-3 w-3" /> Incluido
                  </Badge>
                ) : (
                  <Badge variant="secondary" className="text-xs gap-1">
                    <Lock className="h-3 w-3" /> Add-on
                  </Badge>
                )}
              </div>
              {m.description && (
                <p className="text-xs text-muted-foreground">{m.description}</p>
              )}
            </label>
          </div>
        );
      })}
    </div>
  );
}
