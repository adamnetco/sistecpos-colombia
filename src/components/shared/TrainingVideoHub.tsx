import { useState, useMemo, useCallback, useEffect, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { mainTutorials, quickVideos, getYouTubeId, getLoomEmbedUrl } from "@/data/trainingVideos";
import { useIncrementVideoView } from "@/hooks/useTrainingVideos";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Search, Play, Clock, ExternalLink, Film, X, ChevronDown, ChevronUp, Eye, Tag } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface VideoItem {
  id: string;
  title: string;
  category: string;
  video_url: string;
  type: "youtube" | "loom";
  duration?: string | null;
  is_main: boolean;
  view_count?: number;
  tags?: string[];
}

interface TrainingVideoHubProps {
  userRole?: "customer" | "reseller";
}

function useVideosFromDB(userRole?: "customer" | "reseller") {
  return useQuery({
    queryKey: ["training-videos", userRole],
    queryFn: async () => {
      const query: Record<string, any> = { is_active: true, approval_status: "approved" };
      if (userRole === "customer") query.visible_to_customer = true;
      if (userRole === "reseller") query.visible_to_reseller = true;

      const { data, error } = await supabase
        .from("training_videos")
        .select("*")
        .match(query)
        .order("sort_order", { ascending: true });
      if (error) throw error;
      return data;
    },
    staleTime: 30 * 1000,
    refetchOnWindowFocus: true,
  });
}

function mapToVideoItems(dbVideos: any[] | undefined): VideoItem[] {
  if (dbVideos && dbVideos.length > 0) {
    return dbVideos.map((v: any) => ({
      id: v.id, title: v.title, category: v.category, video_url: v.video_url,
      type: v.video_type as "youtube" | "loom", duration: v.duration,
      is_main: v.is_main, view_count: v.view_count ?? 0, tags: v.tags || [],
    }));
  }
  return [
    ...mainTutorials.map((v) => ({ ...v, is_main: true, tags: [] as string[] })),
    ...quickVideos.map((v) => ({ ...v, is_main: false, tags: [] as string[] })),
  ];
}

function YouTubeEmbed({ videoId }: { videoId: string }) {
  return (
    <div className="relative w-full overflow-hidden rounded-xl" style={{ paddingBottom: "56.25%" }}>
      <iframe className="absolute inset-0 h-full w-full" src={`https://www.youtube.com/embed/${videoId}`}
        title="YouTube video" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen />
    </div>
  );
}

function videoSlug(title: string) {
  return title
    .toLowerCase()
    .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function VideoCard({ video, onSelect, index }: { video: VideoItem; onSelect: (v: VideoItem) => void; index: number }) {
  const ytId = video.type === "youtube" ? getYouTubeId(video.video_url) : null;
  const anchor = `video-${videoSlug(video.title)}`;

  return (
    <motion.button
      id={anchor}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.03 }}
      whileHover={{ y: -4, scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={() => onSelect(video)}
      className="group relative flex flex-col overflow-hidden rounded-xl border bg-card text-left transition-shadow hover:shadow-xl hover:border-primary/40 scroll-mt-24"
    >
      <div className="relative aspect-video w-full bg-muted overflow-hidden">
        {ytId ? (
          <img src={`https://img.youtube.com/vi/${ytId}/mqdefault.jpg`} alt={video.title}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110" loading="lazy" />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-primary/20 to-accent/30">
            <Film className="h-10 w-10 text-primary/60" />
          </div>
        )}
        <div className="absolute inset-0 flex items-center justify-center bg-black/0 transition-all duration-300 group-hover:bg-black/30">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg opacity-0 group-hover:opacity-100 transition-opacity scale-75 group-hover:scale-100">
            <Play className="h-5 w-5 ml-0.5" />
          </div>
        </div>
        {video.duration && (
          <span className="absolute bottom-2 right-2 rounded-md bg-black/80 px-2 py-0.5 text-[10px] font-mono text-white flex items-center gap-1 backdrop-blur-sm">
            <Clock className="h-2.5 w-2.5" />{video.duration}
          </span>
        )}
        {(video.view_count ?? 0) > 0 && (
          <span className="absolute bottom-2 left-2 rounded-md bg-black/80 px-2 py-0.5 text-[10px] font-mono text-white flex items-center gap-1 backdrop-blur-sm">
            <Eye className="h-2.5 w-2.5" />{video.view_count}
          </span>
        )}
      </div>
      <div className="flex flex-1 flex-col gap-1.5 p-3">
        <h3 className="text-sm font-semibold leading-tight line-clamp-2 group-hover:text-primary transition-colors">{video.title}</h3>
        <div className="flex flex-wrap gap-1 items-center">
          <Badge variant="secondary" className="text-[10px] capitalize">{video.category}</Badge>
          {(video.tags || []).slice(0, 2).map((t) => (
            <span key={t} className="inline-flex items-center rounded bg-primary/10 px-1.5 py-0.5 text-[9px] text-primary font-medium">
              {t}
            </span>
          ))}
        </div>
      </div>
    </motion.button>
  );
}

function QuickVideoItem({ video, onSelect, index }: { video: VideoItem; onSelect: (v: VideoItem) => void; index: number }) {
  const anchor = `video-${videoSlug(video.title)}`;
  return (
    <motion.button
      id={anchor}
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.25, delay: index * 0.02 }}
      whileHover={{ x: 4 }}
      whileTap={{ scale: 0.98 }}
      onClick={() => onSelect(video)}
      className="flex items-center gap-3 rounded-lg border bg-card p-3 text-left transition-all hover:shadow-md hover:border-primary/30 group scroll-mt-24"
    >
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors">
        <Play className="h-4 w-4 text-primary" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium truncate group-hover:text-primary transition-colors">{video.title}</p>
        <div className="flex items-center gap-1.5">
          <span className="text-xs text-muted-foreground capitalize">{video.category}</span>
          {(video.tags || []).slice(0, 2).map((t) => (
            <span key={t} className="hidden sm:inline-flex items-center rounded bg-primary/10 px-1 py-0 text-[9px] text-primary font-medium">{t}</span>
          ))}
        </div>
      </div>
      <ExternalLink className="h-3.5 w-3.5 shrink-0 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
    </motion.button>
  );
}

export default function TrainingVideoHub({ userRole }: TrainingVideoHubProps) {
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [activeVideo, setActiveVideo] = useState<VideoItem | null>(null);
  const [showAllQuick, setShowAllQuick] = useState(false);

  const location = useLocation();
  const hasScrolledRef = useRef(false);

  const { data: dbVideos } = useVideosFromDB(userRole);
  const incrementView = useIncrementVideoView();
  const allVideos = useMemo(() => mapToVideoItems(dbVideos), [dbVideos]);

  const handleSelectVideo = useCallback((v: VideoItem) => {
    setActiveVideo(v);
    incrementView.mutate(v.id);
    // Update hash without scroll
    const slug = videoSlug(v.title);
    window.history.replaceState(null, "", `#video-${slug}`);
  }, [incrementView]);

  // Auto-open video from URL hash (deep link)
  useEffect(() => {
    if (hasScrolledRef.current || allVideos.length === 0) return;
    const hash = location.hash.replace("#", "");
    if (!hash.startsWith("video-")) return;
    const target = allVideos.find((v) => `video-${videoSlug(v.title)}` === hash);
    if (target) {
      hasScrolledRef.current = true;
      // Ensure quick videos are visible if needed
      if (!target.is_main) setShowAllQuick(true);
      setTimeout(() => {
        setActiveVideo(target);
        incrementView.mutate(target.id);
        const el = document.getElementById(hash);
        el?.scrollIntoView({ behavior: "smooth", block: "center" });
      }, 400);
    }
  }, [allVideos, location.hash]);

  const allCategories = useMemo(() =>
    Array.from(new Set(allVideos.map((v) => v.category))).sort(),
    [allVideos]
  );

  // Collect top tags across all videos for the tag cloud
  const topTags = useMemo(() => {
    const tagCount: Record<string, number> = {};
    allVideos.forEach((v) => (v.tags || []).forEach((t) => { tagCount[t] = (tagCount[t] || 0) + 1; }));
    return Object.entries(tagCount).sort((a, b) => b[1] - a[1]).slice(0, 20);
  }, [allVideos]);

  const matchesFilters = useCallback((v: VideoItem) => {
    const q = search.toLowerCase();
    const matchSearch = !q || v.title.toLowerCase().includes(q) || v.category.toLowerCase().includes(q) || (v.tags || []).some((t) => t.includes(q));
    const matchCat = selectedCategory === "all" || v.category === selectedCategory;
    const matchTag = !selectedTag || (v.tags || []).includes(selectedTag);
    return matchSearch && matchCat && matchTag;
  }, [search, selectedCategory, selectedTag]);

  const mainVideos = useMemo(() => allVideos.filter((v) => v.is_main), [allVideos]);
  const quickVideosList = useMemo(() => allVideos.filter((v) => !v.is_main), [allVideos]);

  const filteredMain = useMemo(() =>
    mainVideos.filter(matchesFilters).sort((a, b) => (b.view_count ?? 0) - (a.view_count ?? 0)),
    [mainVideos, matchesFilters]
  );

  const totalQuickFiltered = useMemo(() => quickVideosList.filter(matchesFilters).length, [quickVideosList, matchesFilters]);

  const filteredQuick = useMemo(() => {
    const f = quickVideosList.filter(matchesFilters).sort((a, b) => (b.view_count ?? 0) - (a.view_count ?? 0));
    return showAllQuick ? f : f.slice(0, 12);
  }, [quickVideosList, matchesFilters, showAllQuick]);

  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    allVideos.forEach((v) => { counts[v.category] = (counts[v.category] || 0) + 1; });
    return counts;
  }, [allVideos]);

  const clearFilters = () => { setSearch(""); setSelectedCategory("all"); setSelectedTag(null); };
  const hasActiveFilters = search || selectedCategory !== "all" || selectedTag;

  return (
    <div className="space-y-8">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="text-center space-y-2">
        <h2 className="text-2xl font-bold md:text-3xl">Centro de Capacitación</h2>
        <p className="text-muted-foreground">{allVideos.length} video tutoriales para dominar tu sistema POS</p>
      </motion.div>

      {/* Search */}
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.1 }} className="relative mx-auto max-w-xl">
        <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
        <Input placeholder="Buscar por título, categoría o tag... ej: excel, crédito, impresora" value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="h-12 rounded-full pl-12 pr-10 text-base shadow-sm border-2 focus-visible:border-primary" />
        {search && (
          <button onClick={() => setSearch("")} className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
            <X className="h-4 w-4" />
          </button>
        )}
      </motion.div>

      {/* Categories */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.15 }} className="flex flex-wrap justify-center gap-2">
        <Button size="sm" variant={selectedCategory === "all" ? "default" : "outline"} onClick={() => setSelectedCategory("all")} className="rounded-full">
          Todos ({allVideos.length})
        </Button>
        {allCategories.map((cat) => (
          <Button key={cat} size="sm" variant={selectedCategory === cat ? "default" : "outline"} onClick={() => setSelectedCategory(cat)} className="rounded-full capitalize">
            {cat}
            <Badge variant="secondary" className="ml-1.5 text-[10px] px-1.5">{categoryCounts[cat] || 0}</Badge>
          </Button>
        ))}
      </motion.div>

      {/* Tag cloud */}
      {topTags.length > 0 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }} className="flex flex-wrap justify-center gap-1.5">
          <span className="flex items-center gap-1 text-xs text-muted-foreground mr-1"><Tag className="h-3 w-3" />Tags:</span>
          {topTags.map(([tag, count]) => (
            <button
              key={tag}
              onClick={() => setSelectedTag(selectedTag === tag ? null : tag)}
              className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium transition-all ${
                selectedTag === tag
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "bg-muted/80 text-muted-foreground hover:bg-primary/10 hover:text-primary"
              }`}
            >
              {tag}
              <span className="text-[10px] opacity-60">({count})</span>
            </button>
          ))}
        </motion.div>
      )}

      {/* Active filters indicator */}
      {hasActiveFilters && (
        <div className="flex justify-center">
          <Button variant="ghost" size="sm" onClick={clearFilters} className="text-muted-foreground gap-1.5">
            <X className="h-3.5 w-3.5" />Limpiar filtros
          </Button>
        </div>
      )}

      {/* Active Video Player */}
      <AnimatePresence>
        {activeVideo && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="rounded-2xl border-2 border-primary/20 bg-card p-4 md:p-6 shadow-lg space-y-4"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="space-y-1.5">
                <h3 className="text-lg font-bold">{activeVideo.title}</h3>
                <div className="flex flex-wrap gap-1.5">
                  <Badge variant="secondary" className="capitalize">{activeVideo.category}</Badge>
                  {(activeVideo.tags || []).map((t) => (
                    <span key={t} className="inline-flex items-center rounded-full bg-primary/10 px-2 py-0.5 text-[10px] text-primary font-medium">{t}</span>
                  ))}
                </div>
              </div>
              <Button variant="ghost" size="icon" onClick={() => setActiveVideo(null)}>
                <X className="h-5 w-5" />
              </Button>
            </div>
            {activeVideo.type === "youtube" && getYouTubeId(activeVideo.video_url) ? (
              <YouTubeEmbed videoId={getYouTubeId(activeVideo.video_url)!} />
            ) : (
              <div className="relative w-full overflow-hidden rounded-xl" style={{ paddingBottom: "56.25%" }}>
                <iframe className="absolute inset-0 h-full w-full" src={getLoomEmbedUrl(activeVideo.video_url)} allowFullScreen />
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Tutorials */}
      {filteredMain.length > 0 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.25 }}>
          <div className="mb-4 flex items-center gap-2">
            <Play className="h-5 w-5 text-primary" />
            <h3 className="text-lg font-bold">Tutoriales Principales</h3>
            <Badge>{filteredMain.length}</Badge>
          </div>
          <div className="grid gap-4 grid-cols-2 sm:grid-cols-3 lg:grid-cols-4">
            {filteredMain.map((v, i) => (
              <VideoCard key={v.id} video={v} onSelect={handleSelectVideo} index={i} />
            ))}
          </div>
        </motion.div>
      )}

      {/* Quick Videos */}
      {filteredQuick.length > 0 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}>
          <div className="mb-4 flex items-center gap-2">
            <Film className="h-5 w-5 text-primary" />
            <h3 className="text-lg font-bold">Micro-Tutoriales</h3>
            <Badge>{totalQuickFiltered}</Badge>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {filteredQuick.map((v, i) => (
              <QuickVideoItem key={v.id} video={v} onSelect={handleSelectVideo} index={i} />
            ))}
          </div>
          <AnimatePresence>
            {totalQuickFiltered > 12 && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-4 text-center">
                <Button variant="outline" onClick={() => setShowAllQuick(!showAllQuick)} className="gap-2">
                  {showAllQuick ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                  {showAllQuick ? "Mostrar menos" : `Ver todos (${totalQuickFiltered})`}
                </Button>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      )}

      {filteredMain.length === 0 && filteredQuick.length === 0 && (
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="rounded-2xl border bg-card p-16 text-center">
          <Search className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
          <p className="text-lg font-medium">No se encontraron tutoriales</p>
          <p className="text-muted-foreground mb-4">Intenta con otra búsqueda, categoría o tag</p>
          <Button variant="outline" onClick={clearFilters}>Limpiar filtros</Button>
        </motion.div>
      )}
    </div>
  );
}
