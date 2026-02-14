import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Layout } from "@/components/layout/Layout";
import { SEO } from "@/components/seo/SEO";
import { Download, ExternalLink, FileDown, HelpCircle, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

interface DownloadItem {
  id: string;
  title: string;
  description: string | null;
  download_url: string;
  file_type: string;
  category: string;
}

export default function AyudaPage() {
  const [downloads, setDownloads] = useState<DownloadItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase
      .from("client_downloads")
      .select("*")
      .eq("is_active", true)
      .order("sort_order")
      .then(({ data }) => {
        setDownloads((data as DownloadItem[]) || []);
        setLoading(false);
      });
  }, []);

  const grouped = downloads.reduce<Record<string, DownloadItem[]>>((acc, d) => {
    (acc[d.category] = acc[d.category] || []).push(d);
    return acc;
  }, {});

  return (
    <Layout>
      <SEO
        title="Ayuda y Descargas | SistecPOS"
        description="Descarga el instalador del servidor de impresoras, herramientas y manuales de SistecPOS."
      />

      <section className="py-16 md:py-24">
        <div className="container px-4">
          <div className="mx-auto max-w-4xl">
            <div className="mb-12 text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10">
                <HelpCircle className="h-8 w-8 text-primary" />
              </div>
              <h1 className="text-3xl font-bold md:text-4xl">Ayuda y Descargas</h1>
              <p className="mt-3 text-lg text-muted-foreground">
                Descarga herramientas, instaladores y material de apoyo para tu sistema POS.
              </p>
            </div>

            {loading ? (
              <div className="flex h-32 items-center justify-center">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
              </div>
            ) : downloads.length === 0 ? (
              <div className="rounded-lg border bg-card p-16 text-center">
                <FileDown className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
                <p className="text-muted-foreground">Próximamente estarán disponibles las descargas.</p>
              </div>
            ) : (
              <div className="space-y-10">
                {Object.entries(grouped).map(([category, items]) => (
                  <div key={category}>
                    <h2 className="mb-4 text-xl font-semibold capitalize">{category}</h2>
                    <div className="grid gap-4 sm:grid-cols-2">
                      {items.map((d) => (
                        <div key={d.id} className="flex items-start gap-4 rounded-lg border bg-card p-5 transition-shadow hover:shadow-md">
                          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/10">
                            <Download className="h-6 w-6 text-primary" />
                          </div>
                          <div className="flex-1 space-y-1">
                            <h3 className="font-semibold">{d.title}</h3>
                            {d.description && <p className="text-sm text-muted-foreground">{d.description}</p>}
                            <span className="inline-block text-xs text-muted-foreground capitalize">{d.file_type}</span>
                          </div>
                          <Button size="sm" asChild>
                            <a href={d.download_url} target="_blank" rel="noopener noreferrer" className="gap-1">
                              <ExternalLink className="h-3 w-3" />
                              Descargar
                            </a>
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Support CTA */}
            <div className="mt-16 rounded-2xl bg-muted/50 p-8 text-center">
              <h2 className="text-xl font-bold mb-2">¿Necesitas ayuda?</h2>
              <p className="text-muted-foreground mb-6">Inicia sesión en el portal de clientes para crear un ticket de soporte.</p>
              <div className="flex flex-wrap justify-center gap-4">
                <Button asChild>
                  <Link to="/clientes">Ir al Portal de Clientes</Link>
                </Button>
                <Button variant="outline" className="gap-2" asChild>
                  <a href="https://wa.me/573176268307?text=Hola,%20necesito%20ayuda%20con%20mi%20sistema%20POS" target="_blank" rel="noopener noreferrer">
                    <MessageCircle className="h-4 w-4" />
                    WhatsApp
                  </a>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
}
