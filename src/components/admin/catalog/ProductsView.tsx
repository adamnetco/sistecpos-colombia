import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { toast } from "sonner";
import {
  Plus, Pencil, Trash2, Package, Search, Image, Eye, EyeOff,
  Star, Sparkles, Grid3X3, List, Puzzle, Hash,
} from "lucide-react";
import ProductFormDialog from "./ProductFormDialog";
import ProductCSVTools from "./ProductCSVTools";
import PlanModulesManager from "./PlanModulesManager";
import TagsView from "./TagsView";

interface Product {
  id: string;
  name: string;
  slug: string;
  sku: string | null;
  brand_id: string | null;
  category_id: string | null;
  description: string | null;
  long_description: string | null;
  price_cop: number;
  original_price_cop: number | null;
  price_usd: number | null;
  original_price_usd: number | null;
  cost_cop: number | null;
  image_url: string | null;
  gallery_urls: string[];
  features: string[];
  specifications: any[];
  includes: string[];
  stock: number;
  is_active: boolean;
  is_featured: boolean;
  is_offer: boolean;
  product_type: string;
  sort_order: number;
  created_at: string;
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

export default function ProductsView() {
  const qc = useQueryClient();
  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [viewMode, setViewMode] = useState<"table" | "grid">("table");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Product | null>(null);

  const { data: products = [], isLoading } = useQuery({
    queryKey: ["catalog_products"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("catalog_products")
        .select("*, catalog_brands(name), catalog_categories(name)")
        .order("sort_order")
        .limit(500);
      if (error) throw error;
      return data as Product[];
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("catalog_products").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["catalog_products"] });
      toast.success("Producto eliminado");
    },
    onError: (e: any) => toast.error(e.message),
  });

  const toggleActive = useMutation({
    mutationFn: async ({ id, is_active }: { id: string; is_active: boolean }) => {
      const { error } = await supabase.from("catalog_products").update({ is_active }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["catalog_products"] });
      toast.success("Estado actualizado");
    },
  });

  const filtered = products.filter(p => {
    const matchSearch = !search || p.name.toLowerCase().includes(search.toLowerCase()) || (p.sku || "").toLowerCase().includes(search.toLowerCase());
    const matchType = filterType === "all" || p.product_type === filterType;
    return matchSearch && matchType;
  });

  const formatCOP = (n: number) => new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", minimumFractionDigits: 0 }).format(n);

  const handleEdit = (p: Product) => { setEditing(p); setDialogOpen(true); };
  const handleNew = () => { setEditing(null); setDialogOpen(true); };

  const stats = {
    total: products.length,
    active: products.filter(p => p.is_active).length,
    offers: products.filter(p => p.is_offer).length,
    featured: products.filter(p => p.is_featured).length,
  };

  return (
    <div className="space-y-6">
      <Tabs defaultValue="products">
        <TabsList className="gap-1">
          <TabsTrigger value="products" className="gap-1.5">
            <Package className="h-4 w-4" /> Productos
          </TabsTrigger>
          <TabsTrigger value="modules" className="gap-1.5">
            <Puzzle className="h-4 w-4" /> Módulos de Plan
          </TabsTrigger>
          <TabsTrigger value="tags" className="gap-1.5">
            <Hash className="h-4 w-4" /> Etiquetas
          </TabsTrigger>
        </TabsList>

        <TabsContent value="products" className="space-y-6 mt-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Package className="h-6 w-6 text-primary" />
            Productos
          </h1>
          <p className="text-sm text-muted-foreground">Gestiona tu catálogo de productos, precios e inventario</p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <ProductCSVTools products={filtered} />
          <Button onClick={handleNew} className="gap-2">
            <Plus className="h-4 w-4" /> Nuevo Producto
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Total", value: stats.total, icon: Package },
          { label: "Activos", value: stats.active, icon: Eye },
          { label: "Ofertas", value: stats.offers, icon: Sparkles },
          { label: "Destacados", value: stats.featured, icon: Star },
        ].map(s => (
          <Card key={s.label} className="border-0 shadow-card">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <s.icon className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{s.value}</p>
                <p className="text-xs text-muted-foreground">{s.label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Buscar por nombre o SKU..."
            className="pl-9"
          />
        </div>
        <Select value={filterType} onValueChange={setFilterType}>
          <SelectTrigger className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            <SelectItem value="hardware">Hardware</SelectItem>
            <SelectItem value="software">Software</SelectItem>
            <SelectItem value="servicio">Servicio</SelectItem>
            <SelectItem value="consumible">Consumible</SelectItem>
            <SelectItem value="certificado">Certificado</SelectItem>
          </SelectContent>
        </Select>
        <div className="flex border rounded-lg overflow-hidden">
          <Button
            variant={viewMode === "table" ? "default" : "ghost"}
            size="icon"
            onClick={() => setViewMode("table")}
            className="rounded-none"
          >
            <List className="h-4 w-4" />
          </Button>
          <Button
            variant={viewMode === "grid" ? "default" : "ghost"}
            size="icon"
            onClick={() => setViewMode("grid")}
            className="rounded-none"
          >
            <Grid3X3 className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-16 w-full" />)}
        </div>
      ) : filtered.length === 0 ? (
        <Card className="border-0 shadow-card">
          <CardContent className="p-12 text-center text-muted-foreground">
            <Package className="h-12 w-12 mx-auto mb-3 opacity-30" />
            <p>No se encontraron productos.</p>
          </CardContent>
        </Card>
      ) : viewMode === "table" ? (
        <Card className="border-0 shadow-card">
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Imagen</TableHead>
                  <TableHead>Producto</TableHead>
                  <TableHead>Categoría</TableHead>
                  <TableHead>Marca</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead className="text-right">Precio COP</TableHead>
                  <TableHead>Stock</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map(p => (
                  <TableRow key={p.id}>
                    <TableCell>
                      {p.image_url ? (
                        <img src={p.image_url} alt={p.name} className="h-10 w-10 rounded-lg object-cover bg-muted" />
                      ) : (
                        <div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center">
                          <Image className="h-4 w-4 text-muted-foreground" />
                        </div>
                      )}
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium text-sm">{p.name}</p>
                        {p.sku && <p className="text-xs text-muted-foreground">SKU: {p.sku}</p>}
                      </div>
                    </TableCell>
                    <TableCell className="text-sm">{p.catalog_categories?.name || "—"}</TableCell>
                    <TableCell className="text-sm">{p.catalog_brands?.name || "—"}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="text-xs capitalize">{p.product_type}</Badge>
                    </TableCell>
                    <TableCell className="text-right font-medium text-sm">
                      {formatCOP(p.price_cop)}
                      {p.original_price_cop && (
                        <p className="text-xs text-muted-foreground line-through">{formatCOP(p.original_price_cop)}</p>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge variant={p.stock > 0 ? "default" : "destructive"} className="text-xs">
                        {p.stock}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Switch
                          checked={p.is_active}
                          onCheckedChange={v => toggleActive.mutate({ id: p.id, is_active: v })}
                        />
                        {p.is_offer && <Sparkles className="h-3 w-3 text-primary" />}
                        {p.is_featured && <Star className="h-3 w-3 text-primary" />}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button variant="ghost" size="icon" onClick={() => handleEdit(p)}>
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost" size="icon"
                          className="text-destructive hover:text-destructive"
                          onClick={() => { if (confirm("¿Eliminar este producto?")) deleteMutation.mutate(p.id); }}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      ) : (
        /* Grid View */
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filtered.map(p => (
            <Card key={p.id} className="border-0 shadow-card hover:shadow-card-hover transition-all overflow-hidden">
              <div className="relative aspect-square bg-muted flex items-center justify-center">
                {p.image_url ? (
                  <img src={p.image_url} alt={p.name} className="h-full w-full object-cover" />
                ) : (
                  <Package className="h-12 w-12 text-muted-foreground/30" />
                )}
                {p.is_offer && (
                  <Badge className="absolute top-2 right-2 bg-destructive text-destructive-foreground">
                    <Sparkles className="h-3 w-3 mr-1" /> Oferta
                  </Badge>
                )}
                {!p.is_active && (
                  <div className="absolute inset-0 bg-background/60 flex items-center justify-center">
                    <Badge variant="secondary"><EyeOff className="h-3 w-3 mr-1" /> Inactivo</Badge>
                  </div>
                )}
              </div>
              <CardContent className="p-4">
                <p className="font-semibold text-sm truncate">{p.name}</p>
                <p className="text-xs text-muted-foreground">{p.catalog_categories?.name} • {p.catalog_brands?.name || "Sin marca"}</p>
                <div className="flex items-baseline justify-between mt-2">
                  <p className="font-bold text-primary">{formatCOP(p.price_cop)}</p>
                  <Badge variant={p.stock > 0 ? "outline" : "destructive"} className="text-xs">
                    Stock: {p.stock}
                  </Badge>
                </div>
                <div className="flex gap-1 mt-3">
                  <Button variant="outline" size="sm" className="flex-1" onClick={() => handleEdit(p)}>
                    <Pencil className="h-3 w-3 mr-1" /> Editar
                  </Button>
                  <Button
                    variant="ghost" size="sm"
                    className="text-destructive"
                    onClick={() => { if (confirm("¿Eliminar?")) deleteMutation.mutate(p.id); }}
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <ProductFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        editing={editing}
        onSaved={() => {
          qc.invalidateQueries({ queryKey: ["catalog_products"] });
          setDialogOpen(false);
          setEditing(null);
        }}
      />
        </TabsContent>

        <TabsContent value="modules" className="mt-4">
          <PlanModulesManager />
        </TabsContent>

        <TabsContent value="tags" className="mt-4">
          <TagsView />
        </TabsContent>
      </Tabs>
    </div>
  );
}
