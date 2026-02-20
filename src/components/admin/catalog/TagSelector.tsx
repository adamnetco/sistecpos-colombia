/**
 * TagSelector – selector reutilizable de etiquetas para formularios de productos,
 * módulos, servicios, planes, suscripciones, etc.
 *
 * Uso:
 *   <TagSelector
 *     entityType="product"          // filtra las etiquetas por tipo de entidad
 *     selectedSlugs={tags}          // array de slugs actualmente seleccionados
 *     onChange={setSlugs}           // callback con nuevo array
 *   />
 *
 * También acepta modo libre (freeTags) para la lógica de tags de texto simple
 * que ya existía en PlanModulesManager.
 */

import { useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Hash, X, Plus, Tag, Sparkles } from "lucide-react";

interface CatalogTag {
  id: string;
  name: string;
  slug: string;
  color: string;
  entity_type: string;
  seo_boost: boolean;
}

function getTagColorClass(color: string) {
  const map: Record<string, string> = {
    blue: "bg-blue-100 text-blue-700",
    green: "bg-green-100 text-green-700",
    red: "bg-red-100 text-red-700",
    orange: "bg-orange-100 text-orange-700",
    purple: "bg-purple-100 text-purple-700",
    teal: "bg-teal-100 text-teal-700",
    indigo: "bg-indigo-100 text-indigo-700",
    cyan: "bg-cyan-100 text-cyan-700",
    gold: "bg-yellow-100 text-yellow-700",
    gray: "bg-gray-100 text-gray-700",
    default: "bg-muted text-muted-foreground",
  };
  return map[color] ?? map.default;
}

interface TagSelectorProps {
  /** Filtra las etiquetas del catálogo por tipo de entidad */
  entityType: "product" | "module" | "service" | "plan" | "subscription";
  /** Array de slugs seleccionados (modo catálogo) */
  selectedSlugs?: string[];
  onChange?: (slugs: string[]) => void;
  /** Modo libre: tags de texto simples (compatibilidad con módulos) */
  freeTags?: string[];
  onFreeTagsChange?: (tags: string[]) => void;
  /** Si se muestran ambos modos a la vez */
  showBoth?: boolean;
  className?: string;
}

export default function TagSelector({
  entityType,
  selectedSlugs = [],
  onChange,
  freeTags = [],
  onFreeTagsChange,
  showBoth = false,
  className = "",
}: TagSelectorProps) {
  const [input, setInput] = useState("");
  const [freeInput, setFreeInput] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const freeInputRef = useRef<HTMLInputElement>(null);

  // Carga etiquetas del catálogo filtradas por tipo
  const { data: catalogTags = [] } = useQuery({
    queryKey: ["catalog_tags_public", entityType],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("catalog_tags")
        .select("id, name, slug, color, entity_type, seo_boost")
        .eq("is_active", true)
        .or(`entity_type.eq.${entityType},entity_type.eq.all`)
        .order("sort_order");
      if (error) throw error;
      return data as CatalogTag[];
    },
  });

  // Filtrar las sugeridas por lo que el usuario escribe
  const suggestions = catalogTags.filter(t =>
    !selectedSlugs.includes(t.slug) &&
    (input === "" || t.name.toLowerCase().includes(input.toLowerCase()) || t.slug.includes(input.toLowerCase()))
  );

  const toggleSlug = (slug: string) => {
    if (!onChange) return;
    onChange(
      selectedSlugs.includes(slug)
        ? selectedSlugs.filter(s => s !== slug)
        : [...selectedSlugs, slug]
    );
  };

  const addFreeTag = () => {
    if (!onFreeTagsChange) return;
    const t = freeInput.trim().toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
    if (t && !freeTags.includes(t)) onFreeTagsChange([...freeTags, t]);
    setFreeInput("");
    freeInputRef.current?.focus();
  };

  const removeFreeTag = (tag: string) => onFreeTagsChange?.(freeTags.filter(t => t !== tag));

  const selectedTags = catalogTags.filter(t => selectedSlugs.includes(t.slug));
  const unselectedSuggestions = suggestions.slice(0, 12);

  return (
    <div className={`space-y-3 ${className}`}>
      {/* Modo catálogo: etiquetas predefinidas */}
      {(onChange !== undefined) && (
        <div className="rounded-lg border bg-card p-3 space-y-3">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground uppercase tracking-wide">
            <Tag className="h-3.5 w-3.5" />
            Etiquetas del catálogo
          </div>

          {/* Seleccionadas */}
          {selectedTags.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {selectedTags.map(t => (
                <button
                  key={t.slug}
                  type="button"
                  onClick={() => toggleSlug(t.slug)}
                  className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium transition-all hover:opacity-75 ${getTagColorClass(t.color)}`}
                >
                  {t.seo_boost && <Sparkles className="h-2.5 w-2.5" />}
                  <Hash className="h-2.5 w-2.5" />
                  {t.name}
                  <X className="h-2.5 w-2.5 ml-0.5" />
                </button>
              ))}
            </div>
          )}

          {/* Buscador + sugerencias */}
          <div>
            <Input
              ref={inputRef}
              value={input}
              onChange={e => setInput(e.target.value)}
              placeholder="Buscar etiqueta..."
              className="h-8 text-xs"
            />
          </div>

          {unselectedSuggestions.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {unselectedSuggestions.map(t => (
                <button
                  key={t.slug}
                  type="button"
                  onClick={() => toggleSlug(t.slug)}
                  className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium opacity-60 hover:opacity-100 transition-opacity border border-dashed border-muted-foreground/40"
                >
                  {t.seo_boost && <Sparkles className="h-2.5 w-2.5 text-primary" />}
                  <Plus className="h-2.5 w-2.5" />
                  {t.name}
                </button>
              ))}
            </div>
          )}

          {catalogTags.length === 0 && (
            <p className="text-[11px] text-muted-foreground">
              No hay etiquetas creadas para "{entityType}". Ve a Catálogo → Etiquetas para crear.
            </p>
          )}
        </div>
      )}

      {/* Modo libre: tags de texto */}
      {(onFreeTagsChange !== undefined) && (showBoth || onChange === undefined) && (
        <div className="rounded-lg border bg-card p-3 space-y-2">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground uppercase tracking-wide">
            <Hash className="h-3.5 w-3.5" />
            Tags libres para búsqueda
          </div>
          <div className="flex gap-2">
            <Input
              ref={freeInputRef}
              value={freeInput}
              onChange={e => setFreeInput(e.target.value)}
              onKeyDown={e => { if (e.key === "Enter") { e.preventDefault(); addFreeTag(); } }}
              placeholder="Ej: facturacion, pos, Colombia (Enter)"
              className="flex-1 h-8 text-xs"
            />
            <Button type="button" variant="outline" size="sm" onClick={addFreeTag} className="h-8">
              Agregar
            </Button>
          </div>
          {freeTags.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {freeTags.map(t => (
                <Badge key={t} variant="secondary" className="gap-1 text-xs pr-1">
                  #{t}
                  <button
                    type="button"
                    onClick={() => removeFreeTag(t)}
                    className="ml-0.5 hover:text-destructive transition-colors"
                  >
                    <X className="h-2.5 w-2.5" />
                  </button>
                </Badge>
              ))}
            </div>
          )}
          <p className="text-[11px] text-muted-foreground">
            Los tags libres se usan para búsquedas internas y filtros del catálogo
          </p>
        </div>
      )}
    </div>
  );
}
