import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Filter, X, Search, Sparkles } from "lucide-react";

export interface ProductFiltersState {
  search: string;
  category: string;
  brand: string;
  priceRange: [number, number];
  offersOnly: boolean;
}

interface Props {
  filters: ProductFiltersState;
  onChange: (f: ProductFiltersState) => void;
  categories: { slug: string; name: string }[];
  brands: { name: string }[];
  maxPrice: number;
}

const formatPrice = (n: number) =>
  new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", minimumFractionDigits: 0 }).format(n);

export function ProductFilters({ filters, onChange, categories, brands, maxPrice }: Props) {
  const [open, setOpen] = useState(false);

  const set = <K extends keyof ProductFiltersState>(k: K, v: ProductFiltersState[K]) =>
    onChange({ ...filters, [k]: v });

  const activeCount = [
    filters.search,
    filters.category !== "all",
    filters.brand !== "all",
    filters.offersOnly,
    filters.priceRange[1] < maxPrice,
  ].filter(Boolean).length;

  const reset = () =>
    onChange({ search: "", category: "all", brand: "all", priceRange: [0, maxPrice], offersOnly: false });

  return (
    <div className="mb-8">
      {/* Compact bar */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar producto..."
            value={filters.search}
            onChange={(e) => set("search", e.target.value)}
            className="pl-9 h-10"
          />
        </div>

        <Button
          variant={open ? "default" : "outline"}
          size="sm"
          className="gap-1.5"
          onClick={() => setOpen(!open)}
        >
          <Filter className="h-4 w-4" />
          Filtros
          {activeCount > 0 && (
            <Badge className="ml-1 h-5 px-1.5 bg-primary-foreground text-primary text-[10px]">
              {activeCount}
            </Badge>
          )}
        </Button>

        {activeCount > 0 && (
          <Button variant="ghost" size="sm" onClick={reset} className="text-xs text-muted-foreground gap-1">
            <X className="h-3 w-3" /> Limpiar
          </Button>
        )}
      </div>

      {/* Expanded panel */}
      {open && (
        <div className="mt-4 p-4 rounded-xl border bg-card grid sm:grid-cols-2 lg:grid-cols-4 gap-4 animate-in slide-in-from-top-2 duration-200">
          <div>
            <Label className="text-xs font-medium mb-1.5 block">Categoría</Label>
            <Select value={filters.category} onValueChange={(v) => set("category", v)}>
              <SelectTrigger className="h-9 text-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas las categorías</SelectItem>
                {categories.map((c) => (
                  <SelectItem key={c.slug} value={c.slug}>
                    {c.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label className="text-xs font-medium mb-1.5 block">Marca</Label>
            <Select value={filters.brand} onValueChange={(v) => set("brand", v)}>
              <SelectTrigger className="h-9 text-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas las marcas</SelectItem>
                {brands.map((b) => (
                  <SelectItem key={b.name} value={b.name}>
                    {b.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label className="text-xs font-medium mb-1.5 block">
              Precio: {formatPrice(filters.priceRange[0])} – {formatPrice(filters.priceRange[1])}
            </Label>
            <Slider
              min={0}
              max={maxPrice}
              step={50000}
              value={filters.priceRange}
              onValueChange={(v) => set("priceRange", v as [number, number])}
              className="mt-3"
            />
          </div>

          <div className="flex items-center gap-3 self-end">
            <Switch
              id="offers"
              checked={filters.offersOnly}
              onCheckedChange={(v) => set("offersOnly", v)}
            />
            <Label htmlFor="offers" className="text-sm flex items-center gap-1 cursor-pointer">
              <Sparkles className="h-3.5 w-3.5 text-destructive" /> Solo ofertas
            </Label>
          </div>
        </div>
      )}
    </div>
  );
}
