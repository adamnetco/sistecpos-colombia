import { useState, useMemo, useRef, useCallback } from "react";
import { useAllPageContent, useUpsertPageContent, useDeletePageContent, type PageContentBlock } from "@/hooks/usePageContent";
import { supabase } from "@/integrations/supabase/client";
import { CMS_PAGES, getSectionDef, getPageGroups, type CMSSectionDef, type CMSPageDef } from "@/data/cmsRegistry";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { toast } from "sonner";
import {
  Plus, Pencil, Trash2, FileText, Image, Code2, Search,
  Upload, Save, Type, Braces, LayoutGrid, ChevronDown, ChevronRight,
  Eye, EyeOff, Check, Home, KeyRound, Package, CreditCard, Wrench,
  Lightbulb, FileCheck, Users, Phone, GitCompare, MapPin, GraduationCap,
  ArrowUp, ArrowDown, Info,
} from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

/* ─── Icon map for page categories ─── */
const ICON_MAP: Record<string, React.ElementType> = {
  Home, KeyRound, Package, CreditCard, Wrench, Lightbulb, FileCheck,
  Users, Phone, GitCompare, MapPin, GraduationCap, LayoutGrid,
};

const CONTENT_TYPE_ICONS: Record<string, React.ElementType> = {
  text: Type, markdown: FileText, image: Image, html: Code2, json: Braces,
};

const CONTENT_TYPE_LABELS: Record<string, string> = {
  text: "Texto", markdown: "Markdown", image: "Imagen", html: "HTML", json: "JSON",
};

export default function PageContentView() {
  const { data: allBlocks = [], isLoading } = useAllPageContent();
  const upsertMut = useUpsertPageContent();
  const deleteMut = useDeletePageContent();

  const [selectedPage, setSelectedPage] = useState<string>("/");
  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingBlock, setEditingBlock] = useState<PageContentBlock | null>(null);
  const [editingDef, setEditingDef] = useState<CMSSectionDef | null>(null);

  // Page definition
  const pageDef = useMemo(() => CMS_PAGES.find((p) => p.path === selectedPage), [selectedPage]);
  const pageGroups = useMemo(() => getPageGroups(selectedPage), [selectedPage]);

  // Map blocks by section_key for quick lookup
  const blockMap = useMemo(() => {
    const map: Record<string, PageContentBlock> = {};
    allBlocks.filter((b) => b.page_path === selectedPage).forEach((b) => { map[b.section_key] = b; });
    return map;
  }, [allBlocks, selectedPage]);

  // Extra blocks (not in registry — custom)
  const customBlocks = useMemo(() => {
    if (!pageDef) return allBlocks.filter((b) => b.page_path === selectedPage);
    const registeredKeys = new Set(pageDef.sections.map((s) => s.key));
    return allBlocks.filter((b) => b.page_path === selectedPage && !registeredKeys.has(b.section_key));
  }, [allBlocks, selectedPage, pageDef]);

  const filteredCustom = useMemo(() => {
    if (!search) return customBlocks;
    const q = search.toLowerCase();
    return customBlocks.filter((b) => b.section_key.toLowerCase().includes(q) || b.text_value?.toLowerCase().includes(q));
  }, [customBlocks, search]);

  // Categories
  const categories = useMemo(() => {
    const cats: Record<string, CMSPageDef[]> = {};
    CMS_PAGES.forEach((p) => {
      if (!cats[p.category]) cats[p.category] = [];
      cats[p.category].push(p);
    });
    return cats;
  }, []);

  const blockCount = useMemo(() => {
    const counts: Record<string, number> = {};
    allBlocks.forEach((b) => { counts[b.page_path] = (counts[b.page_path] || 0) + 1; });
    return counts;
  }, [allBlocks]);

  const openEdit = (def: CMSSectionDef, block: PageContentBlock | null) => {
    setEditingDef(def);
    setEditingBlock(block);
    setDialogOpen(true);
  };

  const openCustomEdit = (block: PageContentBlock) => {
    setEditingDef(null);
    setEditingBlock(block);
    setDialogOpen(true);
  };

  const openNew = () => {
    setEditingDef(null);
    setEditingBlock(null);
    setDialogOpen(true);
  };

  const handleDelete = (block: PageContentBlock) => {
    const label = getSectionDef(block.page_path, block.section_key)?.label || block.section_key;
    if (!confirm(`¿Eliminar "${label}"?`)) return;
    deleteMut.mutate(block.id, {
      onSuccess: () => toast.success("Bloque eliminado"),
      onError: (e: any) => toast.error(e.message),
    });
  };

  const PageIcon = ICON_MAP[pageDef?.icon || "LayoutGrid"] || LayoutGrid;

  return (
    <TooltipProvider>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <LayoutGrid className="h-6 w-6 text-primary" />
              Gestor de Contenido
            </h1>
            <p className="text-sm text-muted-foreground">
              Edita cada sección de tu sitio web como en WordPress — sin tocar código
            </p>
          </div>
          <Button onClick={openNew} variant="outline" className="gap-2">
            <Plus className="h-4 w-4" /> Bloque Personalizado
          </Button>
        </div>

        <div className="grid lg:grid-cols-[260px_1fr] gap-6">
          {/* ─── Sidebar: Page Selector ─── */}
          <Card className="border shadow-sm h-fit sticky top-4">
            <CardContent className="p-0">
              <div className="p-3 border-b">
                <div className="relative">
                  <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                  <Input placeholder="Buscar página..." className="pl-8 h-8 text-sm" value={search} onChange={(e) => setSearch(e.target.value)} />
                </div>
              </div>
              <div className="max-h-[65vh] overflow-y-auto">
                {Object.entries(categories).map(([cat, pages]) => (
                  <div key={cat}>
                    <div className="px-3 py-2 text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60 bg-muted/40">
                      {cat}
                    </div>
                    {pages.map((p) => {
                      const Icon = ICON_MAP[p.icon] || LayoutGrid;
                      const isActive = selectedPage === p.path;
                      return (
                        <button
                          key={p.path}
                          onClick={() => { setSelectedPage(p.path); setSearch(""); }}
                          className={`w-full flex items-center gap-2.5 px-3 py-2 text-sm transition-all ${
                            isActive
                              ? "bg-primary/10 text-primary font-semibold border-l-3 border-primary"
                              : "text-foreground hover:bg-muted/50"
                          }`}
                        >
                          <Icon className="h-3.5 w-3.5 shrink-0" />
                          <span className="truncate flex-1 text-left">{p.label}</span>
                          {blockCount[p.path] ? (
                            <Badge variant="secondary" className="text-[9px] h-4 px-1.5 font-mono">
                              {blockCount[p.path]}
                            </Badge>
                          ) : (
                            <span className="text-[9px] text-muted-foreground/40">0</span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* ─── Main Content Area ─── */}
          <div className="space-y-6">
            {/* Page header */}
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
                <PageIcon className="h-5 w-5 text-primary" />
              </div>
              <div className="flex-1">
                <h2 className="text-lg font-bold">{pageDef?.label || selectedPage}</h2>
                <p className="text-xs text-muted-foreground font-mono">{selectedPage}</p>
              </div>
            </div>

            {isLoading ? (
              <div className="space-y-4">{[1, 2, 3].map((i) => <Skeleton key={i} className="h-24 w-full rounded-xl" />)}</div>
            ) : pageDef ? (
              <>
                {/* Registered sections grouped */}
                {pageGroups.map((groupName) => {
                  const groupSections = pageDef.sections.filter((s) => s.group === groupName);
                  return (
                    <SectionGroup
                      key={groupName}
                      groupName={groupName}
                      sections={groupSections}
                      blockMap={blockMap}
                      onEdit={openEdit}
                      onDelete={handleDelete}
                      pagePath={selectedPage}
                      upsertMut={upsertMut}
                    />
                  );
                })}

                {/* Custom blocks */}
                {filteredCustom.length > 0 && (
                  <SectionGroup
                    groupName="🔧 Bloques Personalizados"
                    sections={[]}
                    blockMap={{}}
                    onEdit={() => {}}
                    onDelete={handleDelete}
                    pagePath={selectedPage}
                    upsertMut={upsertMut}
                    customBlocks={filteredCustom}
                    onCustomEdit={openCustomEdit}
                  />
                )}
              </>
            ) : (
              /* Fallback for unregistered pages */
              <div className="space-y-3">
                {allBlocks
                  .filter((b) => b.page_path === selectedPage)
                  .filter((b) => !search || b.section_key.includes(search) || b.text_value?.includes(search))
                  .map((block) => (
                    <InlineBlockCard key={block.id} block={block} onEdit={() => openCustomEdit(block)} onDelete={() => handleDelete(block)} />
                  ))}
                {allBlocks.filter((b) => b.page_path === selectedPage).length === 0 && (
                  <EmptyState onAdd={openNew} />
                )}
              </div>
            )}
          </div>
        </div>

        {/* Edit Dialog */}
        <ContentBlockDialog
          open={dialogOpen}
          onOpenChange={setDialogOpen}
          editingBlock={editingBlock}
          sectionDef={editingDef}
          pagePath={selectedPage}
          onSave={(data) => {
            upsertMut.mutate(data, {
              onSuccess: () => {
                toast.success(editingBlock ? "✅ Contenido actualizado" : "✅ Bloque creado");
                setDialogOpen(false);
              },
              onError: (e: any) => toast.error(e.message),
            });
          }}
          saving={upsertMut.isPending}
        />
      </div>
    </TooltipProvider>
  );
}

/* ─── Section Group (collapsible like WP) ─── */
function SectionGroup({
  groupName, sections, blockMap, onEdit, onDelete, pagePath, upsertMut,
  customBlocks, onCustomEdit,
}: {
  groupName: string;
  sections: CMSSectionDef[];
  blockMap: Record<string, PageContentBlock>;
  onEdit: (def: CMSSectionDef, block: PageContentBlock | null) => void;
  onDelete: (block: PageContentBlock) => void;
  pagePath: string;
  upsertMut: any;
  customBlocks?: PageContentBlock[];
  onCustomEdit?: (block: PageContentBlock) => void;
}) {
  const [open, setOpen] = useState(true);

  const hasContent = sections.some((s) => blockMap[s.key]);
  const filledCount = sections.filter((s) => blockMap[s.key]).length;

  return (
    <Collapsible open={open} onOpenChange={setOpen}>
      <Card className="border shadow-sm overflow-hidden">
        <CollapsibleTrigger asChild>
          <button className="w-full flex items-center gap-3 px-4 py-3 bg-muted/30 hover:bg-muted/50 transition-colors text-left">
            {open ? <ChevronDown className="h-4 w-4 text-muted-foreground" /> : <ChevronRight className="h-4 w-4 text-muted-foreground" />}
            <span className="font-semibold text-sm flex-1">{groupName}</span>
            {sections.length > 0 && (
              <Badge variant={filledCount === sections.length ? "default" : "secondary"} className="text-[10px] h-5">
                {filledCount}/{sections.length}
              </Badge>
            )}
          </button>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <div className="divide-y">
            {sections.map((def) => {
              const block = blockMap[def.key];
              return (
                <SectionRow
                  key={def.key}
                  def={def}
                  block={block}
                  onEdit={() => onEdit(def, block)}
                  onDelete={block ? () => onDelete(block) : undefined}
                />
              );
            })}
            {customBlocks?.map((block) => (
              <InlineBlockRow key={block.id} block={block} onEdit={() => onCustomEdit?.(block)} onDelete={() => onDelete(block)} />
            ))}
          </div>
        </CollapsibleContent>
      </Card>
    </Collapsible>
  );
}

/* ─── Section Row (registered section) ─── */
function SectionRow({
  def, block, onEdit, onDelete,
}: {
  def: CMSSectionDef;
  block: PageContentBlock | undefined;
  onEdit: () => void;
  onDelete?: () => void;
}) {
  const TypeIcon = CONTENT_TYPE_ICONS[def.type] || Type;
  const hasValue = !!block;
  const isActive = block?.is_active !== false;

  return (
    <div className="flex items-center gap-3 px-4 py-3 hover:bg-muted/20 transition-colors group">
      <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${hasValue ? "bg-primary/10" : "bg-muted/50"}`}>
        <TypeIcon className={`h-4 w-4 ${hasValue ? "text-primary" : "text-muted-foreground/50"}`} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="font-medium text-sm">{def.label}</span>
          {!isActive && block && <Badge variant="secondary" className="text-[9px]">Oculto</Badge>}
          {hasValue && <Check className="h-3 w-3 text-green-500" />}
        </div>
        <p className="text-xs text-muted-foreground truncate">
          {block
            ? (def.type === "image" ? (block.image_alt || block.image_url || "Imagen configurada") : (block.text_value?.slice(0, 80) || "Configurado"))
            : def.description
          }
        </p>
      </div>
      <Tooltip>
        <TooltipTrigger asChild>
          <Info className="h-3.5 w-3.5 text-muted-foreground/40 hidden group-hover:block cursor-help" />
        </TooltipTrigger>
        <TooltipContent side="left" className="max-w-xs">
          <p className="text-xs"><strong>Clave:</strong> <code className="text-primary">{def.key}</code></p>
          <p className="text-xs mt-1">{def.description}</p>
        </TooltipContent>
      </Tooltip>
      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <Button variant="ghost" size="sm" className="h-7 px-2 gap-1" onClick={onEdit}>
          <Pencil className="h-3 w-3" />
          {hasValue ? "Editar" : "Agregar"}
        </Button>
        {onDelete && block && (
          <Button variant="ghost" size="sm" className="h-7 px-2 text-destructive hover:text-destructive" onClick={onDelete}>
            <Trash2 className="h-3 w-3" />
          </Button>
        )}
      </div>
    </div>
  );
}

/* ─── Custom block row ─── */
function InlineBlockRow({ block, onEdit, onDelete }: { block: PageContentBlock; onEdit: () => void; onDelete: () => void }) {
  const TypeIcon = CONTENT_TYPE_ICONS[block.content_type] || Type;
  return (
    <div className="flex items-center gap-3 px-4 py-3 hover:bg-muted/20 transition-colors group">
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-amber-500/10">
        <TypeIcon className="h-4 w-4 text-amber-600" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <code className="text-sm font-mono font-medium">{block.section_key}</code>
          <Badge variant="outline" className="text-[9px]">{CONTENT_TYPE_LABELS[block.content_type]}</Badge>
        </div>
        <p className="text-xs text-muted-foreground truncate">{block.text_value || "(sin valor)"}</p>
      </div>
      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <Button variant="ghost" size="sm" className="h-7 px-2" onClick={onEdit}><Pencil className="h-3 w-3" /></Button>
        <Button variant="ghost" size="sm" className="h-7 px-2 text-destructive" onClick={onDelete}><Trash2 className="h-3 w-3" /></Button>
      </div>
    </div>
  );
}

/* ─── Inline block card (for unregistered pages) ─── */
function InlineBlockCard({ block, onEdit, onDelete }: { block: PageContentBlock; onEdit: () => void; onDelete: () => void }) {
  const TypeIcon = CONTENT_TYPE_ICONS[block.content_type] || Type;
  return (
    <Card className="border shadow-sm hover:shadow-md transition-shadow group">
      <CardContent className="p-4 flex items-start gap-3">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10">
          <TypeIcon className="h-4 w-4 text-primary" />
        </div>
        <div className="flex-1 min-w-0">
          <code className="text-sm font-mono font-semibold">{block.section_key}</code>
          <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{block.text_value || "(vacío)"}</p>
        </div>
        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onEdit}><Pencil className="h-4 w-4" /></Button>
          <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={onDelete}><Trash2 className="h-4 w-4" /></Button>
        </div>
      </CardContent>
    </Card>
  );
}

/* ─── Empty state ─── */
function EmptyState({ onAdd }: { onAdd: () => void }) {
  return (
    <Card className="border-dashed border-2">
      <CardContent className="p-12 text-center text-muted-foreground">
        <FileText className="h-12 w-12 mx-auto mb-3 opacity-20" />
        <p className="font-medium">Sin contenido personalizado</p>
        <p className="text-sm mt-1">Esta página aún no tiene bloques de contenido configurados</p>
        <Button onClick={onAdd} variant="outline" className="mt-4 gap-2">
          <Plus className="h-4 w-4" /> Agregar contenido
        </Button>
      </CardContent>
    </Card>
  );
}

/* ─── Edit/Create Dialog ─── */
function ContentBlockDialog({
  open, onOpenChange, editingBlock, sectionDef, pagePath, onSave, saving,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  editingBlock: PageContentBlock | null;
  sectionDef: CMSSectionDef | null;
  pagePath: string;
  onSave: (data: any) => void;
  saving: boolean;
}) {
  const [form, setForm] = useState<Record<string, any>>({});
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const isRegistered = !!sectionDef;
  const dialogTitle = sectionDef
    ? `Editar: ${sectionDef.label}`
    : editingBlock
      ? `Editar: ${editingBlock.section_key}`
      : "Nuevo Bloque Personalizado";

  const contentType = sectionDef?.type || form.content_type || "text";

  const handleOpen = (v: boolean) => {
    if (v) {
      if (editingBlock) {
        setForm({ ...editingBlock, content_type: contentType });
      } else {
        setForm({
          page_path: pagePath,
          section_key: sectionDef?.key || "",
          content_type: sectionDef?.type || "text",
          text_value: "",
          image_url: "",
          image_alt: "",
          json_value: null,
          sort_order: 0,
          is_active: true,
        });
      }
    }
    onOpenChange(v);
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) { toast.error("Máximo 5MB"); return; }
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("bucket", "shared-resources");
      formData.append("folder", `cms${pagePath.replace(/\//g, "_")}`);
      const { data: { session } } = await supabase.auth.getSession();
      const resp = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/optimize-image`, {
        method: "POST",
        headers: { Authorization: `Bearer ${session?.access_token}` },
        body: formData,
      });
      if (!resp.ok) throw new Error((await resp.json()).error || "Upload failed");
      const result = await resp.json();
      setForm((f) => ({ ...f, image_url: result.url, content_type: "image" }));
      toast.success("Imagen subida");
    } catch (err: any) { toast.error(err.message); }
    finally { setUploading(false); }
  };

  const handleSubmit = () => {
    const key = sectionDef?.key || form.section_key;
    if (!key) { toast.error("La clave de sección es obligatoria"); return; }
    onSave({
      page_path: form.page_path || pagePath,
      section_key: key,
      content_type: contentType,
      text_value: form.text_value || null,
      image_url: form.image_url || null,
      image_alt: form.image_alt || null,
      json_value: form.json_value || null,
      sort_order: form.sort_order || 0,
      is_active: form.is_active ?? true,
    });
  };

  return (
    <Dialog open={open} onOpenChange={handleOpen}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Pencil className="h-4 w-4 text-primary" />
            {dialogTitle}
          </DialogTitle>
          {sectionDef && (
            <p className="text-sm text-muted-foreground mt-1">{sectionDef.description}</p>
          )}
        </DialogHeader>

        <div className="grid gap-4 mt-2">
          {/* Section key — only show for custom blocks */}
          {!isRegistered && (
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <Label>Clave de sección *</Label>
                <Input
                  value={form.section_key || ""}
                  onChange={(e) => setForm((f) => ({ ...f, section_key: e.target.value }))}
                  placeholder="ej: hero_title"
                  disabled={!!editingBlock}
                  className="font-mono"
                />
              </div>
              <div>
                <Label>Tipo de contenido</Label>
                <Select value={form.content_type || "text"} onValueChange={(v) => setForm((f) => ({ ...f, content_type: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {Object.entries(CONTENT_TYPE_LABELS).map(([val, label]) => (
                      <SelectItem key={val} value={val}>{label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}

          {/* Registered section info badge */}
          {isRegistered && (
            <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-primary/5 border border-primary/10">
              <Info className="h-4 w-4 text-primary shrink-0" />
              <div className="text-xs">
                <span className="font-medium">Clave:</span> <code className="text-primary">{sectionDef.key}</code>
                <span className="mx-2">·</span>
                <span className="font-medium">Tipo:</span> {CONTENT_TYPE_LABELS[sectionDef.type]}
              </div>
            </div>
          )}

          {/* Content editor */}
          {(contentType === "text" || contentType === "html") && (
            <div>
              <Label>{contentType === "html" ? "Contenido HTML" : "Texto"}</Label>
              <Textarea
                value={form.text_value || ""}
                onChange={(e) => setForm((f) => ({ ...f, text_value: e.target.value }))}
                rows={contentType === "html" ? 6 : 3}
                className={contentType === "html" ? "font-mono text-sm" : ""}
                placeholder={contentType === "html" ? '<span class="gradient-text">Texto destacado</span>' : "Escribe el texto..."}
              />
              {contentType === "html" && (
                <p className="text-[11px] text-muted-foreground mt-1">
                  Soporta HTML. Usa <code>&lt;span class="gradient-text"&gt;</code> para texto con gradiente.
                </p>
              )}
            </div>
          )}

          {contentType === "markdown" && (
            <div>
              <Label>Contenido Markdown</Label>
              <Textarea
                value={form.text_value || ""}
                onChange={(e) => setForm((f) => ({ ...f, text_value: e.target.value }))}
                rows={8}
                className="font-mono text-sm"
                placeholder="## Título&#10;&#10;Párrafo con **negrita**"
              />
            </div>
          )}

          {contentType === "image" && (
            <div className="space-y-3">
              <div>
                <Label>Imagen</Label>
                <div className="flex gap-2 mt-1">
                  <Input
                    value={form.image_url || ""}
                    onChange={(e) => setForm((f) => ({ ...f, image_url: e.target.value }))}
                    placeholder="URL o sube una imagen..."
                    className="flex-1"
                  />
                  <input ref={fileRef} type="file" accept="image/*" onChange={handleUpload} className="hidden" />
                  <Button variant="outline" onClick={() => fileRef.current?.click()} disabled={uploading} className="gap-2">
                    <Upload className="h-4 w-4" /> {uploading ? "Subiendo..." : "Subir"}
                  </Button>
                </div>
              </div>
              {form.image_url && (
                <img src={form.image_url} alt={form.image_alt || ""} className="max-h-40 rounded-lg border object-contain" />
              )}
              <div>
                <Label>Texto alternativo (alt)</Label>
                <Input value={form.image_alt || ""} onChange={(e) => setForm((f) => ({ ...f, image_alt: e.target.value }))} placeholder="Descripción para SEO" />
              </div>
            </div>
          )}

          {contentType === "json" && (
            <div>
              <Label>Datos JSON</Label>
              <Textarea
                value={typeof form.json_value === "string" ? form.json_value : JSON.stringify(form.json_value, null, 2) || ""}
                onChange={(e) => {
                  try { setForm((f) => ({ ...f, json_value: JSON.parse(e.target.value) })); }
                  catch { setForm((f) => ({ ...f, json_value: e.target.value })); }
                }}
                rows={8}
                className="font-mono text-sm"
              />
              <p className="text-[11px] text-muted-foreground mt-1">JSON válido. Se valida al guardar.</p>
            </div>
          )}

          {/* Visibility controls */}
          <div className="flex flex-wrap items-center gap-6 pt-2 border-t">
            <label className="flex items-center gap-2 text-sm cursor-pointer">
              <Switch checked={form.is_active ?? true} onCheckedChange={(v) => setForm((f) => ({ ...f, is_active: v }))} />
              {form.is_active ? (
                <span className="flex items-center gap-1 text-green-600"><Eye className="h-3.5 w-3.5" /> Visible</span>
              ) : (
                <span className="flex items-center gap-1 text-muted-foreground"><EyeOff className="h-3.5 w-3.5" /> Oculto</span>
              )}
            </label>
            <div className="w-40">
              <Label className="text-xs">Visibilidad por dispositivo</Label>
              <Select value={form.visible_on || "all"} onValueChange={(v) => setForm((f) => ({ ...f, visible_on: v }))}>
                <SelectTrigger className="h-8 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">📱💻 Todos</SelectItem>
                  <SelectItem value="desktop">💻 Solo escritorio</SelectItem>
                  <SelectItem value="mobile">📱 Solo móvil</SelectItem>
                  <SelectItem value="hidden">🚫 Oculto en todos</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {!isRegistered && (
              <div className="w-24">
                <Label className="text-xs">Orden</Label>
                <Input type="number" value={form.sort_order ?? 0} onChange={(e) => setForm((f) => ({ ...f, sort_order: Number(e.target.value) }))} className="h-8" />
              </div>
            )}
          </div>

          <Button onClick={handleSubmit} disabled={saving} className="w-full gap-2 mt-2">
            <Save className="h-4 w-4" />
            {saving ? "Guardando..." : editingBlock ? "Guardar Cambios" : "Crear Bloque"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
