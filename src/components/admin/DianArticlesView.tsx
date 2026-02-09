import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { toast } from "sonner";
import {
  FileText,
  Plus,
  Pencil,
  Trash2,
  Eye,
  Copy,
  GripVertical,
  Search,
  ExternalLink,
} from "lucide-react";

/* ── Icon options map ── */
const iconOptions = [
  "FileText", "AlertTriangle", "Calendar", "Clock", "FileCheck",
  "Gavel", "HelpCircle", "Key", "LogIn", "Globe",
  "Receipt", "RefreshCw", "Shield", "ShieldCheck",
];

/* ── Section block ── */
interface SectionBlock {
  title: string;
  content: string;
  bullets?: string[];
}

interface PainVsSolution {
  pain: string;
  solution: string;
}

interface FAQ {
  question: string;
  answer: string;
}

interface RelatedLink {
  label: string;
  href: string;
}

interface DianArticleRow {
  id: string;
  slug: string;
  keyword: string;
  meta_title: string;
  meta_description: string;
  hero_icon: string;
  hero_badge: string;
  h1: string;
  hero_subtitle: string;
  sections: SectionBlock[];
  pain_vs_solution: PainVsSolution[];
  cta_text: string;
  cta_whatsapp_message: string;
  faqs: FAQ[];
  related_links: RelatedLink[];
  is_published: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

/* ── Article templates ── */
const articleTemplates: Record<string, Partial<DianArticleRow>> = {
  guia_paso_a_paso: {
    hero_icon: "FileCheck",
    hero_badge: "Guía Tutorial",
    sections: [
      { title: "Requisitos previos", content: "Antes de comenzar, asegúrate de cumplir con los siguientes requisitos:", bullets: ["RUT actualizado", "Certificado digital vigente", "Acceso al portal Muisca"] },
      { title: "Paso a paso", content: "Sigue estos pasos para completar el proceso:", bullets: ["Paso 1: ...", "Paso 2: ...", "Paso 3: ..."] },
      { title: "Consejos importantes", content: "Ten en cuenta estas recomendaciones para evitar errores comunes." },
      { title: "La solución rápida: SistecPOS", content: "Con SistecPOS automatizas todo este proceso. Nuestro equipo gestiona la habilitación por ti.", bullets: ["Certificado incluido", "Capacitación presencial", "Soporte técnico local"] },
    ],
    pain_vs_solution: [
      { pain: "Proceso manual de X días", solution: "SistecPOS lo hace en horas" },
    ],
    cta_text: "Simplifica tu facturación electrónica",
    cta_whatsapp_message: "Hola, quiero ayuda con facturación electrónica DIAN",
    faqs: [
      { question: "¿Es obligatorio este trámite?", answer: "Sí, según la normativa vigente de la DIAN..." },
    ],
    related_links: [
      { label: "Facturación Electrónica", href: "/facturacion-electronica" },
    ],
  },
  comparativa: {
    hero_icon: "Shield",
    hero_badge: "Comparativa",
    sections: [
      { title: "¿Qué opciones existen?", content: "Existen varias alternativas para cumplir con la facturación electrónica..." },
      { title: "Comparativa detallada", content: "A continuación comparamos las principales opciones:", bullets: ["Opción A: ...", "Opción B: ...", "Opción C: ..."] },
      { title: "¿Por qué SistecPOS?", content: "SistecPOS ofrece la mejor relación precio-funcionalidad con soporte local.", bullets: ["Facturación ilimitada", "16 módulos especializados", "Soporte presencial"] },
    ],
    pain_vs_solution: [
      { pain: "Software costoso sin soporte local", solution: "SistecPOS desde $12 USD/mes con soporte presencial" },
    ],
    cta_text: "Elige la mejor opción para tu negocio",
    cta_whatsapp_message: "Hola, quiero comparar opciones de facturación electrónica",
    faqs: [],
    related_links: [],
  },
  problema_solucion: {
    hero_icon: "AlertTriangle",
    hero_badge: "Solución",
    sections: [
      { title: "El problema", content: "Muchos comerciantes enfrentan este problema frecuentemente..." },
      { title: "¿Por qué ocurre?", content: "La causa principal es..." },
      { title: "La solución definitiva", content: "Con SistecPOS, este problema se elimina por completo.", bullets: ["Beneficio 1", "Beneficio 2", "Beneficio 3"] },
    ],
    pain_vs_solution: [
      { pain: "Problema recurrente sin solución", solution: "SistecPOS lo resuelve automáticamente" },
    ],
    cta_text: "Resuelve este problema de una vez",
    cta_whatsapp_message: "Hola, tengo un problema con la DIAN y quiero resolverlo",
    faqs: [],
    related_links: [],
  },
};

const defaultForm: Omit<DianArticleRow, "id" | "created_at" | "updated_at"> = {
  slug: "",
  keyword: "",
  meta_title: "",
  meta_description: "",
  hero_icon: "FileText",
  hero_badge: "",
  h1: "",
  hero_subtitle: "",
  sections: [],
  pain_vs_solution: [],
  cta_text: "",
  cta_whatsapp_message: "",
  faqs: [],
  related_links: [],
  is_published: false,
  sort_order: 0,
};

export default function DianArticlesView() {
  const queryClient = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<DianArticleRow | null>(null);
  const [form, setForm] = useState(defaultForm);
  const [search, setSearch] = useState("");

  const { data: articles = [], isLoading } = useQuery({
    queryKey: ["admin_dian_articles"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("dian_articles")
        .select("*")
        .order("sort_order")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data || []) as unknown as DianArticleRow[];
    },
  });

  const filtered = articles.filter(
    (a) =>
      a.h1.toLowerCase().includes(search.toLowerCase()) ||
      a.slug.toLowerCase().includes(search.toLowerCase()) ||
      a.keyword.toLowerCase().includes(search.toLowerCase())
  );

  const set = (key: string, value: any) => setForm((f) => ({ ...f, [key]: value }));

  const openNew = (templateKey?: string) => {
    setEditing(null);
    const template = templateKey ? articleTemplates[templateKey] : {};
    setForm({ ...defaultForm, ...template });
    setDialogOpen(true);
  };

  const openEdit = (a: DianArticleRow) => {
    setEditing(a);
    setForm({
      slug: a.slug,
      keyword: a.keyword,
      meta_title: a.meta_title,
      meta_description: a.meta_description,
      hero_icon: a.hero_icon,
      hero_badge: a.hero_badge,
      h1: a.h1,
      hero_subtitle: a.hero_subtitle,
      sections: a.sections || [],
      pain_vs_solution: a.pain_vs_solution || [],
      cta_text: a.cta_text,
      cta_whatsapp_message: a.cta_whatsapp_message,
      faqs: a.faqs || [],
      related_links: a.related_links || [],
      is_published: a.is_published,
      sort_order: a.sort_order,
    });
    setDialogOpen(true);
  };

  const duplicateArticle = (a: DianArticleRow) => {
    setEditing(null);
    setForm({
      slug: a.slug + "-copia",
      keyword: a.keyword,
      meta_title: a.meta_title,
      meta_description: a.meta_description,
      hero_icon: a.hero_icon,
      hero_badge: a.hero_badge,
      h1: a.h1 + " (Copia)",
      hero_subtitle: a.hero_subtitle,
      sections: a.sections || [],
      pain_vs_solution: a.pain_vs_solution || [],
      cta_text: a.cta_text,
      cta_whatsapp_message: a.cta_whatsapp_message,
      faqs: a.faqs || [],
      related_links: a.related_links || [],
      is_published: false,
      sort_order: a.sort_order + 1,
    });
    setDialogOpen(true);
  };

  const saveMutation = useMutation({
    mutationFn: async () => {
      const payload = {
        ...form,
        sections: form.sections as any,
        pain_vs_solution: form.pain_vs_solution as any,
        faqs: form.faqs as any,
        related_links: form.related_links as any,
      };
      if (editing) {
        const { error } = await supabase.from("dian_articles").update(payload).eq("id", editing.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("dian_articles").insert(payload);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      toast.success(editing ? "Artículo actualizado" : "Artículo creado");
      queryClient.invalidateQueries({ queryKey: ["admin_dian_articles"] });
      setDialogOpen(false);
    },
    onError: (e: any) => toast.error(e.message),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("dian_articles").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Artículo eliminado");
      queryClient.invalidateQueries({ queryKey: ["admin_dian_articles"] });
    },
  });

  /* ── Section helpers ── */
  const addSection = () => set("sections", [...form.sections, { title: "", content: "", bullets: [] }]);
  const updateSection = (idx: number, key: string, val: any) => {
    const updated = [...form.sections];
    (updated[idx] as any)[key] = val;
    set("sections", updated);
  };
  const removeSection = (idx: number) => set("sections", form.sections.filter((_, i) => i !== idx));

  const addPainVsSolution = () => set("pain_vs_solution", [...form.pain_vs_solution, { pain: "", solution: "" }]);
  const updatePVS = (idx: number, key: string, val: string) => {
    const updated = [...form.pain_vs_solution];
    (updated[idx] as any)[key] = val;
    set("pain_vs_solution", updated);
  };
  const removePVS = (idx: number) => set("pain_vs_solution", form.pain_vs_solution.filter((_, i) => i !== idx));

  const addFaq = () => set("faqs", [...form.faqs, { question: "", answer: "" }]);
  const updateFaq = (idx: number, key: string, val: string) => {
    const updated = [...form.faqs];
    (updated[idx] as any)[key] = val;
    set("faqs", updated);
  };
  const removeFaq = (idx: number) => set("faqs", form.faqs.filter((_, i) => i !== idx));

  const addRelatedLink = () => set("related_links", [...form.related_links, { label: "", href: "" }]);
  const updateLink = (idx: number, key: string, val: string) => {
    const updated = [...form.related_links];
    (updated[idx] as any)[key] = val;
    set("related_links", updated);
  };
  const removeLink = (idx: number) => set("related_links", form.related_links.filter((_, i) => i !== idx));

  return (
    <div>
      <div className="mb-6 flex items-center gap-3">
        <FileText className="h-6 w-6 text-primary" />
        <div>
          <h1 className="text-2xl font-bold font-display">Artículos DIAN</h1>
          <p className="text-sm text-muted-foreground">
            Gestiona las guías y artículos del ecosistema DIAN con bloques dinámicos
          </p>
        </div>
      </div>

      {/* Toolbar */}
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-xs">
            {articles.filter((a) => a.is_published).length} publicados / {articles.length} total
          </Badge>
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
            <Input
              placeholder="Buscar artículos..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-8 h-9 w-60"
            />
          </div>
        </div>
        <div className="flex gap-2">
          <Select onValueChange={(v) => openNew(v)}>
            <SelectTrigger className="h-9 w-48">
              <SelectValue placeholder="Usar plantilla..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="guia_paso_a_paso">📋 Guía Paso a Paso</SelectItem>
              <SelectItem value="comparativa">⚖️ Comparativa</SelectItem>
              <SelectItem value="problema_solucion">🔧 Problema → Solución</SelectItem>
            </SelectContent>
          </Select>
          <Button size="sm" onClick={() => openNew()}>
            <Plus className="h-3.5 w-3.5 mr-1" /> Nuevo Artículo
          </Button>
        </div>
      </div>

      {/* List */}
      {isLoading ? (
        <div className="py-8 text-center text-muted-foreground">Cargando...</div>
      ) : filtered.length === 0 ? (
        <div className="py-12 text-center">
          <FileText className="h-12 w-12 mx-auto text-muted-foreground/50 mb-3" />
          <p className="text-muted-foreground">No hay artículos DIAN</p>
          <p className="text-xs text-muted-foreground mt-1">
            Crea guías, tutoriales y comparativas para el ecosistema DIAN
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((a) => (
            <Card key={a.id} className={`border-0 shadow-sm ${!a.is_published ? "opacity-60" : ""}`}>
              <CardContent className="p-4 flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <Badge variant="secondary" className="text-[10px]">{a.hero_badge || "Sin badge"}</Badge>
                    <Badge variant="outline" className="text-[10px]">/{a.slug}</Badge>
                    {a.is_published ? (
                      <Badge className="text-[10px] bg-primary/10 text-primary">Publicado</Badge>
                    ) : (
                      <Badge variant="destructive" className="text-[10px]">Borrador</Badge>
                    )}
                    <span className="text-[10px] text-muted-foreground">
                      {a.sections?.length || 0} secciones · {a.faqs?.length || 0} FAQs
                    </span>
                  </div>
                  <h3 className="font-medium text-sm line-clamp-1">{a.h1}</h3>
                  <p className="text-xs text-muted-foreground mt-1 line-clamp-1">{a.meta_description}</p>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-8 w-8"
                    asChild
                  >
                    <a href={`/guias-dian/${a.slug}`} target="_blank" rel="noopener noreferrer">
                      <Eye className="h-3.5 w-3.5" />
                    </a>
                  </Button>
                  <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => duplicateArticle(a)}>
                    <Copy className="h-3.5 w-3.5" />
                  </Button>
                  <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => openEdit(a)}>
                    <Pencil className="h-3.5 w-3.5" />
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-8 w-8 text-destructive"
                    onClick={() => {
                      if (confirm("¿Eliminar este artículo?")) deleteMutation.mutate(a.id);
                    }}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Editor Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editing ? "Editar Artículo" : "Nuevo Artículo DIAN"}</DialogTitle>
            <DialogDescription>
              Configura los bloques de contenido, SEO, FAQs y CTAs del artículo.
            </DialogDescription>
          </DialogHeader>

          <Accordion type="multiple" defaultValue={["meta", "hero", "sections"]} className="space-y-2">
            {/* META / SEO */}
            <AccordionItem value="meta">
              <AccordionTrigger className="text-sm font-semibold">🔍 SEO & Meta</AccordionTrigger>
              <AccordionContent className="space-y-3 pt-2">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label className="text-xs">Slug (URL) *</Label>
                    <Input value={form.slug} onChange={(e) => set("slug", e.target.value)} placeholder="mi-guia-dian" className="h-9" />
                  </div>
                  <div>
                    <Label className="text-xs">Keyword principal</Label>
                    <Input value={form.keyword} onChange={(e) => set("keyword", e.target.value)} placeholder="facturación electrónica dian" className="h-9" />
                  </div>
                </div>
                <div>
                  <Label className="text-xs">Meta Title (≤60 chars)</Label>
                  <Input value={form.meta_title} onChange={(e) => set("meta_title", e.target.value)} className="h-9" />
                  <p className="text-[10px] text-muted-foreground mt-0.5">{form.meta_title.length}/60</p>
                </div>
                <div>
                  <Label className="text-xs">Meta Description (≤160 chars)</Label>
                  <Textarea value={form.meta_description} onChange={(e) => set("meta_description", e.target.value)} rows={2} />
                  <p className="text-[10px] text-muted-foreground mt-0.5">{form.meta_description.length}/160</p>
                </div>
              </AccordionContent>
            </AccordionItem>

            {/* HERO */}
            <AccordionItem value="hero">
              <AccordionTrigger className="text-sm font-semibold">🎯 Hero</AccordionTrigger>
              <AccordionContent className="space-y-3 pt-2">
                <div>
                  <Label className="text-xs">H1 *</Label>
                  <Input value={form.h1} onChange={(e) => set("h1", e.target.value)} className="h-9" />
                </div>
                <div>
                  <Label className="text-xs">Subtítulo del Hero</Label>
                  <Textarea value={form.hero_subtitle} onChange={(e) => set("hero_subtitle", e.target.value)} rows={2} />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label className="text-xs">Badge</Label>
                    <Input value={form.hero_badge} onChange={(e) => set("hero_badge", e.target.value)} placeholder="Guía Tutorial" className="h-9" />
                  </div>
                  <div>
                    <Label className="text-xs">Icono</Label>
                    <Select value={form.hero_icon} onValueChange={(v) => set("hero_icon", v)}>
                      <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {iconOptions.map((icon) => (
                          <SelectItem key={icon} value={icon}>{icon}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>

            {/* SECTIONS */}
            <AccordionItem value="sections">
              <AccordionTrigger className="text-sm font-semibold">📄 Secciones de Contenido ({form.sections.length})</AccordionTrigger>
              <AccordionContent className="space-y-4 pt-2">
                {form.sections.map((sec, idx) => (
                  <Card key={idx} className="border shadow-none">
                    <CardContent className="p-3 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-medium text-muted-foreground flex items-center gap-1">
                          <GripVertical className="h-3 w-3" /> Sección {idx + 1}
                        </span>
                        <Button size="icon" variant="ghost" className="h-6 w-6" onClick={() => removeSection(idx)}>
                          <Trash2 className="h-3 w-3 text-destructive" />
                        </Button>
                      </div>
                      <Input
                        value={sec.title}
                        onChange={(e) => updateSection(idx, "title", e.target.value)}
                        placeholder="Título de la sección"
                        className="h-8 text-sm"
                      />
                      <Textarea
                        value={sec.content}
                        onChange={(e) => updateSection(idx, "content", e.target.value)}
                        placeholder="Contenido del párrafo..."
                        rows={3}
                        className="text-sm"
                      />
                      <div>
                        <Label className="text-[10px] text-muted-foreground">Bullets (uno por línea)</Label>
                        <Textarea
                          value={(sec.bullets || []).join("\n")}
                          onChange={(e) =>
                            updateSection(idx, "bullets", e.target.value.split("\n").filter(Boolean))
                          }
                          placeholder="Bullet 1&#10;Bullet 2&#10;Bullet 3"
                          rows={3}
                          className="text-xs font-mono"
                        />
                      </div>
                    </CardContent>
                  </Card>
                ))}
                <Button variant="outline" size="sm" onClick={addSection} className="w-full">
                  <Plus className="h-3.5 w-3.5 mr-1" /> Agregar Sección
                </Button>
              </AccordionContent>
            </AccordionItem>

            {/* PAIN vs SOLUTION */}
            <AccordionItem value="pvs">
              <AccordionTrigger className="text-sm font-semibold">⚡ Dolor vs Solución ({form.pain_vs_solution.length})</AccordionTrigger>
              <AccordionContent className="space-y-3 pt-2">
                {form.pain_vs_solution.map((item, idx) => (
                  <div key={idx} className="grid grid-cols-[1fr_1fr_auto] gap-2 items-start">
                    <Input
                      value={item.pain}
                      onChange={(e) => updatePVS(idx, "pain", e.target.value)}
                      placeholder="Problema..."
                      className="h-8 text-xs"
                    />
                    <Input
                      value={item.solution}
                      onChange={(e) => updatePVS(idx, "solution", e.target.value)}
                      placeholder="Solución SistecPOS..."
                      className="h-8 text-xs"
                    />
                    <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => removePVS(idx)}>
                      <Trash2 className="h-3 w-3 text-destructive" />
                    </Button>
                  </div>
                ))}
                <Button variant="outline" size="sm" onClick={addPainVsSolution}>
                  <Plus className="h-3.5 w-3.5 mr-1" /> Agregar
                </Button>
              </AccordionContent>
            </AccordionItem>

            {/* CTA */}
            <AccordionItem value="cta">
              <AccordionTrigger className="text-sm font-semibold">📲 CTA WhatsApp</AccordionTrigger>
              <AccordionContent className="space-y-3 pt-2">
                <div>
                  <Label className="text-xs">Texto del CTA</Label>
                  <Input value={form.cta_text} onChange={(e) => set("cta_text", e.target.value)} className="h-9" />
                </div>
                <div>
                  <Label className="text-xs">Mensaje WhatsApp</Label>
                  <Input value={form.cta_whatsapp_message} onChange={(e) => set("cta_whatsapp_message", e.target.value)} className="h-9" />
                </div>
              </AccordionContent>
            </AccordionItem>

            {/* FAQS */}
            <AccordionItem value="faqs">
              <AccordionTrigger className="text-sm font-semibold">❓ FAQs ({form.faqs.length})</AccordionTrigger>
              <AccordionContent className="space-y-3 pt-2">
                {form.faqs.map((faq, idx) => (
                  <Card key={idx} className="border shadow-none">
                    <CardContent className="p-3 space-y-2">
                      <div className="flex justify-between">
                        <span className="text-[10px] text-muted-foreground">FAQ {idx + 1}</span>
                        <Button size="icon" variant="ghost" className="h-6 w-6" onClick={() => removeFaq(idx)}>
                          <Trash2 className="h-3 w-3 text-destructive" />
                        </Button>
                      </div>
                      <Input
                        value={faq.question}
                        onChange={(e) => updateFaq(idx, "question", e.target.value)}
                        placeholder="Pregunta..."
                        className="h-8 text-sm"
                      />
                      <Textarea
                        value={faq.answer}
                        onChange={(e) => updateFaq(idx, "answer", e.target.value)}
                        placeholder="Respuesta..."
                        rows={2}
                        className="text-sm"
                      />
                    </CardContent>
                  </Card>
                ))}
                <Button variant="outline" size="sm" onClick={addFaq}>
                  <Plus className="h-3.5 w-3.5 mr-1" /> Agregar FAQ
                </Button>
              </AccordionContent>
            </AccordionItem>

            {/* RELATED LINKS */}
            <AccordionItem value="links">
              <AccordionTrigger className="text-sm font-semibold">🔗 Enlaces Relacionados ({form.related_links.length})</AccordionTrigger>
              <AccordionContent className="space-y-3 pt-2">
                {form.related_links.map((link, idx) => (
                  <div key={idx} className="grid grid-cols-[1fr_1fr_auto] gap-2 items-start">
                    <Input
                      value={link.label}
                      onChange={(e) => updateLink(idx, "label", e.target.value)}
                      placeholder="Etiqueta..."
                      className="h-8 text-xs"
                    />
                    <Input
                      value={link.href}
                      onChange={(e) => updateLink(idx, "href", e.target.value)}
                      placeholder="/guias-dian/..."
                      className="h-8 text-xs"
                    />
                    <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => removeLink(idx)}>
                      <Trash2 className="h-3 w-3 text-destructive" />
                    </Button>
                  </div>
                ))}
                <Button variant="outline" size="sm" onClick={addRelatedLink}>
                  <Plus className="h-3.5 w-3.5 mr-1" /> Agregar Enlace
                </Button>
              </AccordionContent>
            </AccordionItem>
          </Accordion>

          {/* Publishing controls */}
          <div className="flex items-center justify-between border-t pt-4 mt-4">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Switch checked={form.is_published} onCheckedChange={(v) => set("is_published", v)} />
                <Label className="text-xs">Publicado</Label>
              </div>
              <div className="w-20">
                <Label className="text-xs">Orden</Label>
                <Input type="number" value={form.sort_order} onChange={(e) => set("sort_order", parseInt(e.target.value) || 0)} className="h-8" />
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancelar</Button>
            <Button
              onClick={() => saveMutation.mutate()}
              disabled={!form.slug || !form.h1 || saveMutation.isPending}
            >
              {saveMutation.isPending ? "Guardando..." : editing ? "Actualizar" : "Crear Artículo"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
