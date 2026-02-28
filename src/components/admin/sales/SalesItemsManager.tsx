import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Plus, Trash2, Package, Shield, ShoppingCart, Search, GripVertical } from "lucide-react";
import { formatCOP } from "@/hooks/useLicensePricing";

interface SalesPageItem {
  id: string;
  sales_page_id: string;
  product_id: string | null;
  license_pricing_id: string | null;
  pack_id: string | null;
  item_type: string;
  custom_label: string | null;
  custom_price_cop: number | null;
  sort_order: number;
}

interface Props {
  pageId: string;
  items: SalesPageItem[];
  products: any[];
  licenses: any[];
  packs: any[];
  onAdd: (item: any) => void;
  onRemove: (id: string) => void;
}

const typeConfig = {
  product: { icon: ShoppingCart, label: "Producto", color: "bg-blue-500/10 text-blue-600" },
  license: { icon: Shield, label: "Licencia", color: "bg-primary/10 text-primary" },
  pack: { icon: Package, label: "Pack", color: "bg-cta/10 text-cta" },
};

export default function SalesItemsManager({ pageId, items, products, licenses, packs, onAdd, onRemove }: Props) {
  const [itemType, setItemType] = useState<"product" | "license" | "pack">("product");
  const [search, setSearch] = useState("");

  const getOptions = () => {
    const list = itemType === "product"
      ? products.map(p => ({ id: p.id, label: p.name, sub: p.product_type, price: p.price_cop }))
      : itemType === "license"
      ? licenses.map(l => ({ id: l.id, label: l.plan_label, sub: "Licencia anual", price: l.selling_price_cop }))
      : packs.map(p => ({ id: p.id, label: p.name, sub: "Pack comercial", price: p.price_cop }));

    const alreadyAdded = new Set(items.map(i => i.product_id || i.license_pricing_id || i.pack_id));
    return list
      .filter(o => !alreadyAdded.has(o.id))
      .filter(o => !search || o.label.toLowerCase().includes(search.toLowerCase()));
  };

  const handleAdd = (id: string) => {
    const payload: any = {
      sales_page_id: pageId,
      item_type: itemType,
      sort_order: items.length,
    };
    if (itemType === "product") payload.product_id = id;
    if (itemType === "license") payload.license_pricing_id = id;
    if (itemType === "pack") payload.pack_id = id;
    onAdd(payload);
    setSearch("");
  };

  const getItemInfo = (item: SalesPageItem) => {
    if (item.product_id) {
      const p = products.find(x => x.id === item.product_id);
      return { label: p?.name || "Producto eliminado", sub: p?.product_type || "", price: p?.price_cop, type: "product" as const };
    }
    if (item.license_pricing_id) {
      const l = licenses.find(x => x.id === item.license_pricing_id);
      return { label: l?.plan_label || "Licencia eliminada", sub: "Licencia", price: l?.selling_price_cop, type: "license" as const };
    }
    if (item.pack_id) {
      const p = packs.find(x => x.id === item.pack_id);
      return { label: p?.name || "Pack eliminado", sub: "Pack", price: p?.price_cop, type: "pack" as const };
    }
    return { label: item.custom_label || "Sin nombre", sub: "", price: null, type: "product" as const };
  };

  const options = getOptions();

  return (
    <div className="space-y-5">
      {/* Tipo selector */}
      <div className="flex gap-2">
        {(["product", "license", "pack"] as const).map(t => {
          const cfg = typeConfig[t];
          const Icon = cfg.icon;
          return (
            <Button
              key={t}
              variant={itemType === t ? "default" : "outline"}
              size="sm"
              className="gap-1.5"
              onClick={() => { setItemType(t); setSearch(""); }}
            >
              <Icon className="h-3.5 w-3.5" />
              {cfg.label}
            </Button>
          );
        })}
      </div>

      {/* Search + options */}
      <div className="space-y-2">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder={`Buscar ${typeConfig[itemType].label.toLowerCase()}...`}
            className="pl-9"
          />
        </div>

        {search.length > 0 || options.length <= 8 ? (
          <div className="max-h-48 overflow-y-auto space-y-1 border rounded-lg p-2 bg-muted/30">
            {options.length === 0 ? (
              <p className="text-xs text-muted-foreground text-center py-3">
                {search ? "Sin resultados" : "Todos los items ya están agregados"}
              </p>
            ) : (
              options.map(o => (
                <button
                  key={o.id}
                  onClick={() => handleAdd(o.id)}
                  className="w-full flex items-center justify-between p-2.5 rounded-md hover:bg-background transition-colors text-left group"
                >
                  <div className="min-w-0">
                    <p className="text-sm font-medium truncate">{o.label}</p>
                    <p className="text-xs text-muted-foreground">{o.sub}</p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    {o.price != null && (
                      <span className="text-xs font-semibold text-primary">{formatCOP(o.price)}</span>
                    )}
                    <Plus className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                </button>
              ))
            )}
          </div>
        ) : (
          <p className="text-xs text-muted-foreground">
            {options.length} {typeConfig[itemType].label.toLowerCase()}(s) disponibles — escribe para buscar
          </p>
        )}
      </div>

      {/* Added items */}
      <div className="space-y-1.5">
        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          {items.length} producto(s) asociados
        </p>
        {items.length === 0 ? (
          <Card className="border-dashed">
            <CardContent className="p-8 text-center text-muted-foreground text-sm">
              Usa los botones de arriba para asociar productos, licencias o packs a esta landing.
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-1.5">
            {items.map((item, idx) => {
              const info = getItemInfo(item);
              const cfg = typeConfig[info.type];
              const Icon = cfg.icon;
              return (
                <div
                  key={item.id}
                  className="flex items-center gap-3 p-3 rounded-lg border bg-background hover:bg-muted/30 transition-colors group"
                >
                  <GripVertical className="h-4 w-4 text-muted-foreground/40 shrink-0" />
                  <div className={`h-8 w-8 rounded-md flex items-center justify-center shrink-0 ${cfg.color}`}>
                    <Icon className="h-4 w-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{info.label}</p>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-[10px] capitalize h-4 px-1">{info.type}</Badge>
                      {info.sub && <span className="text-[10px] text-muted-foreground">{info.sub}</span>}
                    </div>
                  </div>
                  {info.price != null && (
                    <span className="text-xs font-semibold text-primary shrink-0">{formatCOP(info.price)}</span>
                  )}
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 text-destructive opacity-0 group-hover:opacity-100 transition-opacity shrink-0"
                    onClick={() => onRemove(item.id)}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
