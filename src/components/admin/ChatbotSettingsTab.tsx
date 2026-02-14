import { useEffect, useState, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Plus, Trash2, Globe, Bot, Search, RefreshCw } from "lucide-react";

interface PageSetting {
  id: string;
  page_path: string;
  page_label: string;
  is_enabled: boolean;
}

/** All known public routes in the app — used to suggest pages */
const KNOWN_ROUTES: { path: string; label: string; category: string }[] = [
  // Principal
  { path: "/", label: "Inicio", category: "Principal" },
  { path: "/nosotros", label: "Nosotros", category: "Principal" },
  { path: "/contacto", label: "Contacto", category: "Principal" },
  // Productos
  { path: "/productos", label: "Productos (Tienda)", category: "Productos" },
  { path: "/comparativa-licencias", label: "Comparativa Licencias", category: "Productos" },
  { path: "/facturacion-electronica", label: "Facturación Electrónica", category: "Productos" },
  { path: "/software-pos-colombia", label: "Software POS Colombia", category: "Productos" },
  // Soluciones
  { path: "/soluciones", label: "Soluciones (Hub)", category: "Soluciones" },
  { path: "/soluciones/", label: "Soluciones por industria (/soluciones/*)", category: "Soluciones" },
  // Comparativas
  { path: "/comparar", label: "Comparar (Hub)", category: "Comparativas" },
  { path: "/comparar/", label: "Comparativas individuales (/comparar/*)", category: "Comparativas" },
  // Guías DIAN
  { path: "/guias-dian", label: "Guías DIAN (Hub)", category: "Guías DIAN" },
  { path: "/guias-dian/", label: "Artículos DIAN individuales (/guias-dian/*)", category: "Guías DIAN" },
  // Herramientas
  { path: "/herramientas/calculadora-uvt", label: "Calculadora UVT", category: "Herramientas" },
  { path: "/herramientas/validador-nit", label: "Validador NIT", category: "Herramientas" },
  // Casos de éxito
  { path: "/casos-de-exito", label: "Casos de Éxito (Hub)", category: "Casos de éxito" },
  { path: "/casos-de-exito/", label: "Detalle caso de éxito (/casos-de-exito/*)", category: "Casos de éxito" },
  // Otros
  { path: "/representantes", label: "Representantes", category: "Otros" },
  { path: "/lp/demo", label: "Landing Demo", category: "Landing Pages" },
  { path: "/lp/representantes", label: "Landing Representantes", category: "Landing Pages" },
];

export default function ChatbotSettingsTab() {
  const [pages, setPages] = useState<PageSetting[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState("");
  const [newPath, setNewPath] = useState("");
  const [newLabel, setNewLabel] = useState("");
  const { toast } = useToast();

  const load = async () => {
    setLoading(true);
    const { data } = await supabase
      .from("chatbot_settings")
      .select("*")
      .order("page_path");
    setPages((data as PageSetting[]) || []);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  // Map existing DB entries by path for quick lookup
  const pagesByPath = useMemo(() => {
    const map = new Map<string, PageSetting>();
    pages.forEach((p) => map.set(p.page_path, p));
    return map;
  }, [pages]);

  // Merge known routes with DB data
  const mergedRoutes = useMemo(() => {
    return KNOWN_ROUTES.map((route) => {
      const existing = pagesByPath.get(route.path);
      return {
        ...route,
        id: existing?.id || null,
        is_enabled: existing?.is_enabled ?? false,
        inDb: !!existing,
      };
    });
  }, [pagesByPath]);

  // Custom pages (in DB but not in KNOWN_ROUTES)
  const customPages = useMemo(() => {
    const knownPaths = new Set(KNOWN_ROUTES.map((r) => r.path));
    return pages.filter((p) => !knownPaths.has(p.page_path));
  }, [pages]);

  // Filter
  const filteredRoutes = useMemo(() => {
    if (!search.trim()) return mergedRoutes;
    const q = search.toLowerCase();
    return mergedRoutes.filter(
      (r) => r.label.toLowerCase().includes(q) || r.path.toLowerCase().includes(q) || r.category.toLowerCase().includes(q)
    );
  }, [mergedRoutes, search]);

  const filteredCustom = useMemo(() => {
    if (!search.trim()) return customPages;
    const q = search.toLowerCase();
    return customPages.filter(
      (p) => p.page_label.toLowerCase().includes(q) || p.page_path.toLowerCase().includes(q)
    );
  }, [customPages, search]);

  // Group by category
  const groupedRoutes = useMemo(() => {
    const groups: Record<string, typeof filteredRoutes> = {};
    filteredRoutes.forEach((r) => {
      if (!groups[r.category]) groups[r.category] = [];
      groups[r.category].push(r);
    });
    return groups;
  }, [filteredRoutes]);

  const toggleRoute = async (route: typeof mergedRoutes[0]) => {
    setSaving(true);
    try {
      if (route.inDb && route.id) {
        // Update existing
        await supabase.from("chatbot_settings").update({ is_enabled: !route.is_enabled }).eq("id", route.id);
      } else {
        // Insert new
        await supabase.from("chatbot_settings").insert({
          page_path: route.path,
          page_label: route.label,
          is_enabled: true,
        });
      }
      await load();
    } catch {
      toast({ title: "Error al guardar", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const toggleCustom = async (id: string, current: boolean) => {
    await supabase.from("chatbot_settings").update({ is_enabled: !current }).eq("id", id);
    setPages((prev) => prev.map((p) => (p.id === id ? { ...p, is_enabled: !current } : p)));
  };

  const removeCustom = async (id: string) => {
    if (!confirm("¿Eliminar esta página del chatbot?")) return;
    await supabase.from("chatbot_settings").delete().eq("id", id);
    setPages((prev) => prev.filter((p) => p.id !== id));
    toast({ title: "Página eliminada" });
  };

  const addCustom = async () => {
    if (!newPath.startsWith("/") || !newLabel.trim()) {
      toast({ title: "La ruta debe empezar con / y tener un nombre", variant: "destructive" });
      return;
    }
    const { error } = await supabase.from("chatbot_settings").insert({
      page_path: newPath,
      page_label: newLabel,
      is_enabled: true,
    });
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Página agregada" });
      setNewPath("");
      setNewLabel("");
      load();
    }
  };

  const enabledCount = pages.filter((p) => p.is_enabled).length;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bot className="h-5 w-5 text-primary" />
          Visibilidad del Chatbot
          <Badge variant="secondary" className="ml-auto text-xs">
            {enabledCount} página{enabledCount !== 1 ? "s" : ""} activa{enabledCount !== 1 ? "s" : ""}
          </Badge>
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Activa o desactiva el chatbot en cada página del sitio. Las rutas con <code className="bg-muted px-1 rounded text-xs">/ruta/</code> cubren todas las sub-páginas.
        </p>
      </CardHeader>

      <CardContent className="space-y-5">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar página..."
            className="pl-9 h-9"
          />
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-8">
            <RefreshCw className="h-5 w-5 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <>
            {/* Known routes grouped by category */}
            {Object.entries(groupedRoutes).map(([category, routes]) => (
              <div key={category}>
                <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                  {category}
                </h3>
                <div className="space-y-1.5">
                  {routes.map((route) => (
                    <div
                      key={route.path}
                      className={`flex items-center justify-between rounded-lg border px-4 py-2.5 transition-colors ${
                        route.is_enabled ? "bg-card border-primary/20" : "bg-muted/20 opacity-70"
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <Globe className="h-4 w-4 text-muted-foreground shrink-0" />
                        <div className="min-w-0">
                          <p className="text-sm font-medium truncate">{route.label}</p>
                          <p className="text-xs text-muted-foreground truncate">{route.path === "/" ? "/" : route.path}</p>
                        </div>
                      </div>
                      <Switch
                        checked={route.is_enabled}
                        onCheckedChange={() => toggleRoute(route)}
                        disabled={saving}
                      />
                    </div>
                  ))}
                </div>
              </div>
            ))}

            {/* Custom pages */}
            {filteredCustom.length > 0 && (
              <div>
                <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                  Personalizadas
                </h3>
                <div className="space-y-1.5">
                  {filteredCustom.map((p) => (
                    <div
                      key={p.id}
                      className={`flex items-center justify-between rounded-lg border px-4 py-2.5 transition-colors ${
                        p.is_enabled ? "bg-card border-primary/20" : "bg-muted/20 opacity-70"
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <Globe className="h-4 w-4 text-muted-foreground shrink-0" />
                        <div className="min-w-0">
                          <p className="text-sm font-medium truncate">{p.page_label}</p>
                          <p className="text-xs text-muted-foreground truncate">{p.page_path}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Switch
                          checked={p.is_enabled}
                          onCheckedChange={() => toggleCustom(p.id, p.is_enabled)}
                        />
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-7 w-7 text-destructive"
                          onClick={() => removeCustom(p.id)}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Add custom page */}
            <div className="pt-2 border-t">
              <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                Agregar página personalizada
              </h3>
              <div className="flex items-end gap-2 p-3 rounded-lg border bg-muted/30">
                <div className="flex-1">
                  <label className="text-xs text-muted-foreground mb-1 block">Ruta</label>
                  <Input
                    value={newPath}
                    onChange={(e) => setNewPath(e.target.value)}
                    placeholder="/mi-pagina"
                    className="h-8 text-xs"
                  />
                </div>
                <div className="flex-1">
                  <label className="text-xs text-muted-foreground mb-1 block">Nombre</label>
                  <Input
                    value={newLabel}
                    onChange={(e) => setNewLabel(e.target.value)}
                    placeholder="Mi Página"
                    className="h-8 text-xs"
                  />
                </div>
                <Button size="sm" onClick={addCustom} className="h-8">
                  <Plus className="h-3.5 w-3.5 mr-1" /> Agregar
                </Button>
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
