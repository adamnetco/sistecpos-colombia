import { useParams, Link } from "react-router-dom";
import { useSupportArticleBySlug, useIncrementArticleView } from "@/hooks/useSupportArticles";
import { Layout } from "@/components/layout/Layout";
import { SEO } from "@/components/seo/SEO";
import { Breadcrumbs } from "@/components/seo/Breadcrumbs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { motion } from "framer-motion";
import {
  ArrowLeft, Calendar, Eye, Video, Share2, Copy, BookOpen, Tag,
} from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { useEffect } from "react";
import { toast } from "sonner";

export default function AyudaArticlePage() {
  const { slug } = useParams<{ slug: string }>();
  const { data: article, isLoading } = useSupportArticleBySlug(slug || "");
  const incrementView = useIncrementArticleView();

  useEffect(() => {
    if (article) incrementView.mutate(article.id);
  }, [article?.id]);

  const shareUrl = `${window.location.origin}/ayuda/${slug}`;
  const copyLink = () => {
    navigator.clipboard.writeText(shareUrl);
    toast.success("Enlace copiado al portapapeles");
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="container px-4 py-20 max-w-4xl mx-auto">
          <Skeleton className="h-10 w-3/4 mb-4" />
          <Skeleton className="h-6 w-1/2 mb-8" />
          <Skeleton className="h-96 w-full" />
        </div>
      </Layout>
    );
  }

  if (!article) {
    return (
      <Layout>
        <div className="container px-4 py-20 text-center">
          <BookOpen className="h-16 w-16 mx-auto text-muted-foreground/30 mb-4" />
          <h1 className="text-2xl font-bold mb-2">Artículo no encontrado</h1>
          <p className="text-muted-foreground mb-6">El artículo que buscas no existe o ha sido retirado.</p>
          <Button asChild>
            <Link to="/ayuda"><ArrowLeft className="h-4 w-4 mr-1" />Volver a Ayuda</Link>
          </Button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <SEO
        title={`${article.title} | Ayuda SistecPOS`}
        description={article.excerpt || `Guía: ${article.title}`}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Article",
            headline: article.title,
            description: article.excerpt || article.title,
            datePublished: article.created_at,
            dateModified: (article as any).updated_at || article.created_at,
            author: { "@type": "Person", name: article.author_name || "SistecPOS" },
            publisher: {
              "@type": "Organization",
              name: "SistecPOS",
              logo: { "@type": "ImageObject", url: "https://sistecpos.com/lovable-uploads/43a24c53-78c0-4ca3-b642-99a376d90a0f.png" },
            },
            image: article.cover_image_url || undefined,
            mainEntityOfPage: `https://sistecpos.com/ayuda/${slug}`,
            articleSection: article.category,
            keywords: article.tags?.join(", "),
          }),
        }}
      />
      <Breadcrumbs items={[{ label: "Ayuda", href: "/ayuda" }, { label: article.title }]} />

      <article className="py-12 md:py-20">
        <div className="container px-4 max-w-4xl mx-auto">
          {/* Header */}
          <motion.header initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
            <div className="flex flex-wrap items-center gap-2 mb-4">
              <Badge variant="secondary" className="capitalize">{article.category}</Badge>
              {article.tags?.map(t => (
                <Badge key={t} variant="outline" className="text-xs gap-1">
                  <Tag className="h-2.5 w-2.5" />{t}
                </Badge>
              ))}
            </div>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold leading-tight mb-3">{article.title}</h1>
            {article.excerpt && (
              <p className="text-lg text-muted-foreground">{article.excerpt}</p>
            )}
            <div className="flex flex-wrap items-center gap-4 mt-4 text-sm text-muted-foreground">
              <span className="flex items-center gap-1">
                <Calendar className="h-3.5 w-3.5" />
                {new Date(article.created_at).toLocaleDateString("es-CO", { year: "numeric", month: "long", day: "numeric" })}
              </span>
              <span className="flex items-center gap-1">
                <Eye className="h-3.5 w-3.5" />{article.view_count} vistas
              </span>
              {article.author_name && (
                <span>Por {article.author_name}</span>
              )}
              <Button variant="outline" size="sm" className="gap-1 ml-auto" onClick={copyLink}>
                <Copy className="h-3 w-3" />Copiar enlace
              </Button>
            </div>
          </motion.header>

          {/* Video */}
          {article.video_url && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}
              className="mb-8 rounded-2xl overflow-hidden border shadow-sm"
            >
              <div className="aspect-video bg-muted">
                <iframe
                  src={article.video_url.includes("youtube") ? article.video_url.replace("watch?v=", "embed/") : article.video_url}
                  className="w-full h-full"
                  allowFullScreen
                  title={article.title}
                />
              </div>
            </motion.div>
          )}

          {/* Cover Image */}
          {article.cover_image_url && !article.video_url && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}
              className="mb-8 rounded-2xl overflow-hidden border"
            >
              <img src={article.cover_image_url} alt={article.title} className="w-full object-cover max-h-[400px]" />
            </motion.div>
          )}

          {/* Content */}
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
            className="prose prose-lg dark:prose-invert max-w-none
              prose-headings:scroll-mt-20 prose-headings:font-bold
              prose-h2:text-xl prose-h2:mt-10 prose-h2:mb-4 prose-h2:border-b prose-h2:pb-2
              prose-h3:text-lg prose-h3:mt-8
              prose-a:text-primary prose-a:no-underline hover:prose-a:underline
              prose-img:rounded-xl prose-img:shadow-md
              prose-table:border prose-th:bg-muted prose-th:p-3 prose-td:p-3
              prose-pre:bg-muted prose-pre:rounded-xl prose-pre:p-4
              prose-code:text-primary prose-code:bg-primary/10 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded
              prose-blockquote:border-l-primary prose-blockquote:bg-primary/5 prose-blockquote:py-1 prose-blockquote:px-4 prose-blockquote:rounded-r-lg
              prose-li:marker:text-primary"
          >
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              components={{
                input: ({ type, checked, ...props }) => {
                  if (type === "checkbox") return <input type="checkbox" checked={checked} readOnly className="mr-2 accent-primary" />;
                  return <input type={type} {...props} />;
                },
                table: ({ children }) => (
                  <div className="overflow-x-auto my-6 rounded-lg border">
                    <table className="w-full">{children}</table>
                  </div>
                ),
              }}
            >
              {article.content}
            </ReactMarkdown>
          </motion.div>

          {/* Footer */}
          <div className="mt-12 pt-8 border-t flex flex-wrap items-center justify-between gap-4">
            <Button variant="outline" asChild>
              <Link to="/ayuda"><ArrowLeft className="h-4 w-4 mr-1" />Todos los artículos</Link>
            </Button>
            <Button variant="outline" size="sm" className="gap-1" onClick={copyLink}>
              <Share2 className="h-3.5 w-3.5" />Compartir
            </Button>
          </div>
        </div>
      </article>
    </Layout>
  );
}
