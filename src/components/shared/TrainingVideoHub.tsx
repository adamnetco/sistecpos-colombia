import { useState, useMemo, useCallback, useEffect, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { mainTutorials, quickVideos, getYouTubeId, getLoomEmbedUrl, getLoomId } from "@/data/trainingVideos";
import { useChatbot } from "@/hooks/useChatbot";
import { useIncrementVideoView } from "@/hooks/useTrainingVideos";
import { useActivityTracker } from "@/hooks/useActivityTracker";
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

function YouTubeEmbed({ videoId, autoplay = false }: { videoId: string; autoplay?: boolean }) {
  return (
    <div className="relative w-full overflow-hidden rounded-xl" style={{ paddingBottom: "56.25%" }}>
      <iframe className="absolute inset-0 h-full w-full" src={`https://www.youtube.com/embed/${videoId}${autoplay ? "?autoplay=1" : ""}`}
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

function getVideoThumbnail(video: VideoItem): string | null {
  if (video.type === "youtube") {
    const ytId = getYouTubeId(video.video_url);
    return ytId ? `https://img.youtube.com/vi/${ytId}/mqdefault.jpg` : null;
  }
  const loomId = getLoomId(video.video_url);
  return loomId ? `https://cdn.loom.com/sessions/thumbnails/${loomId}-with-play.gif` : null;
}

function VideoCard({ video, onSelect, index }: { video: VideoItem; onSelect: (v: VideoItem) => void; index: number }) {
  const thumb = getVideoThumbnail(video);
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
        {thumb ? (
          <img src={thumb} alt={video.title}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110" loading="lazy"
            onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />
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
      <div className="flex flex-1 flex-col gap-1 p-2 sm:gap-1.5 sm:p-3">
        <h3 className="text-xs font-semibold leading-tight line-clamp-2 group-hover:text-primary transition-colors sm:text-sm">{video.title}</h3>
        <div className="flex flex-wrap gap-1 items-center">
          <Badge variant="secondary" className="text-[9px] capitalize sm:text-[10px]">{video.category}</Badge>
          {(video.tags || []).filter((t) => t.toLowerCase() !== video.category.toLowerCase()).slice(0, 1).map((t) => (
            <span key={t} className="hidden sm:inline-flex items-center rounded bg-primary/10 px-1.5 py-0.5 text-[9px] text-primary font-medium">
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
      className="flex items-center gap-2 rounded-lg border bg-card p-2 text-left transition-all hover:shadow-md hover:border-primary/30 group scroll-mt-24 sm:gap-3 sm:p-3"
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
  const [isDeepLink, setIsDeepLink] = useState(false);
  const [showAllQuick, setShowAllQuick] = useState(false);

  const location = useLocation();
  const hasScrolledRef = useRef(false);
  const playerRef = useRef<HTMLDivElement>(null);

  // Close chatbot when selecting a video
  let closeChatbot: (() => void) | undefined;
  try {
    const { setOpen } = useChatbot();
    closeChatbot = () => setOpen(false);
  } catch { /* ChatbotProvider not mounted */ }

  const { data: dbVideos } = useVideosFromDB(userRole);
  const incrementView = useIncrementVideoView();
  const { trackActivity } = useActivityTracker();
  const allVideos = useMemo(() => mapToVideoItems(dbVideos), [dbVideos]);

  // Reliable scroll to player — waits for ref to be mounted
  const scrollToPlayer = useCallback(() => {
    let attempts = 0;
    const tryScroll = () => {
      if (playerRef.current) {
        playerRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
      } else if (attempts < 10) {
        attempts++;
        requestAnimationFrame(tryScroll);
      }
    };
    requestAnimationFrame(tryScroll);
  }, []);

  const handleSelectVideo = useCallback((v: VideoItem) => {
    setActiveVideo(v);
    setIsDeepLink(false);
    incrementView.mutate(v.id);
    const portal = userRole === "reseller" ? "/socio" : "/clientes";
    trackActivity("video_view", portal, { video_title: v.title, video_id: v.id, category: v.category });
    const slug = videoSlug(v.title);
    window.history.replaceState(null, "", `#video-${slug}`);
    closeChatbot?.();
    scrollToPlayer();
  }, [incrementView, scrollToPlayer, closeChatbot, trackActivity, userRole]);

  // Auto-open video from URL hash (deep link)
  useEffect(() => {
    if (hasScrolledRef.current || allVideos.length === 0) return;
    const hash = location.hash.replace("#", "");
    if (!hash.startsWith("video-")) return;
    const target = allVideos.find((v) => `video-${videoSlug(v.title)}` === hash);
    if (target) {
      hasScrolledRef.current = true;
      if (!target.is_main) setShowAllQuick(true);
      // Small delay to let the component tree settle
      setTimeout(() => {
        setActiveVideo(target);
        setIsDeepLink(true);
        incrementView.mutate(target.id);
        closeChatbot?.();
        // Wait for AnimatePresence to mount the player
        setTimeout(scrollToPlayer, 300);
      }, 200);
    }
  }, [allVideos, location.hash, scrollToPlayer, closeChatbot]);

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
    <div className="space-y-4 px-1 sm:space-y-8 sm:px-0">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="text-center space-y-1">
        <h2 className="text-xl font-bold sm:text-2xl md:text-3xl">Centro de Capacitación</h2>
        <p className="text-sm text-muted-foreground">{allVideos.length} video tutoriales para dominar tu sistema POS</p>
      </motion.div>

      {/* Search */}
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.1 }} className="relative mx-auto max-w-xl">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground sm:left-4 sm:h-5 sm:w-5" />
        <Input placeholder="Buscar título, categoría o tag..." value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="h-10 rounded-full pl-10 pr-9 text-sm shadow-sm border-2 focus-visible:border-primary sm:h-12 sm:pl-12 sm:pr-10 sm:text-base" />
        {search && (
          <button onClick={() => setSearch("")} className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
            <X className="h-4 w-4" />
          </button>
        )}
      </motion.div>

      {/* Categories */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.15 }} className="flex flex-wrap justify-center gap-1.5 sm:gap-2">
        <Button size="sm" variant={selectedCategory === "all" ? "default" : "outline"} onClick={() => setSelectedCategory("all")} className="rounded-full text-xs h-7 px-2.5 sm:text-sm sm:h-8 sm:px-3">
          Todos ({allVideos.length})
        </Button>
        {allCategories.map((cat) => (
          <Button key={cat} size="sm" variant={selectedCategory === cat ? "default" : "outline"} onClick={() => setSelectedCategory(cat)} className="rounded-full capitalize text-xs h-7 px-2.5 sm:text-sm sm:h-8 sm:px-3">
            {cat}
            <Badge variant="secondary" className="ml-1 text-[9px] px-1 sm:ml-1.5 sm:text-[10px] sm:px-1.5">{categoryCounts[cat] || 0}</Badge>
          </Button>
        ))}
      </motion.div>

      {/* Tag cloud */}
      {topTags.length > 0 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }} className="flex flex-wrap justify-center gap-1 sm:gap-1.5">
          <span className="flex items-center gap-1 text-[10px] text-muted-foreground mr-0.5 sm:text-xs sm:mr-1"><Tag className="h-3 w-3" />Tags:</span>
          {topTags.map(([tag, count]) => (
            <button
              key={tag}
              onClick={() => setSelectedTag(selectedTag === tag ? null : tag)}
              className={`inline-flex items-center gap-0.5 rounded-full px-2 py-0.5 text-[10px] font-medium transition-all sm:gap-1 sm:px-2.5 sm:py-1 sm:text-xs ${
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
            ref={playerRef}
            initial={{ opacity: 0, y: 30, scale: 0.92 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            transition={{ type: "spring", stiffness: 260, damping: 24 }}
            className="relative rounded-xl border border-primary/30 bg-card p-2.5 sm:p-4 md:p-6 shadow-xl sm:shadow-2xl space-y-3 sm:space-y-4 scroll-mt-4 sm:rounded-2xl sm:border-2 sm:border-primary/40 sm:ring-2 sm:ring-primary/20 sm:ring-offset-2 sm:ring-offset-background"
          >
            {/* Animated glow effect */}
            <motion.div
              className="absolute -inset-0.5 sm:-inset-1 rounded-xl sm:rounded-2xl bg-gradient-to-r from-primary/15 via-primary/5 to-primary/15 sm:from-primary/20 sm:via-primary/10 sm:to-primary/20 blur-sm sm:blur-md -z-10"
              animate={{ opacity: [0.4, 0.8, 0.4] }}
              transition={{ duration: 2, repeat: 3, ease: "easeInOut" }}
            />
            <div className="flex items-start justify-between gap-3">
              <div className="space-y-1.5">
                <motion.h3
                  className="text-sm font-bold sm:text-lg"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.15 }}
                >
                  {activeVideo.title}
                </motion.h3>
                <div className="flex flex-wrap gap-1.5">
                  <Badge variant="secondary" className="capitalize">{activeVideo.category}</Badge>
                  {(activeVideo.tags || []).map((t) => (
                    <span key={t} className="inline-flex items-center rounded-full bg-primary/10 px-2 py-0.5 text-[10px] text-primary font-medium">{t}</span>
                  ))}
                </div>
              </div>
              <Button variant="ghost" size="icon" onClick={() => { setActiveVideo(null); setIsDeepLink(false); }}>
                <X className="h-5 w-5" />
              </Button>
            </div>
            {activeVideo.type === "youtube" && getYouTubeId(activeVideo.video_url) ? (
              <YouTubeEmbed videoId={getYouTubeId(activeVideo.video_url)!} autoplay={isDeepLink} />
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
          <div className="mb-3 flex items-center gap-2 sm:mb-4">
            <Play className="h-4 w-4 text-primary sm:h-5 sm:w-5" />
            <h3 className="text-base font-bold sm:text-lg">Tutoriales Principales</h3>
            <Badge className="text-[10px] sm:text-xs">{filteredMain.length}</Badge>
          </div>
          <div className="grid grid-cols-2 gap-2 sm:gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {filteredMain.map((v, i) => (
              <VideoCard key={v.id} video={v} onSelect={handleSelectVideo} index={i} />
            ))}
          </div>
        </motion.div>
      )}

      {/* Quick Videos */}
      {filteredQuick.length > 0 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}>
          <div className="mb-3 flex items-center gap-2 sm:mb-4">
            <Film className="h-4 w-4 text-primary sm:h-5 sm:w-5" />
            <h3 className="text-base font-bold sm:text-lg">Micro-Tutoriales</h3>
            <Badge className="text-[10px] sm:text-xs">{totalQuickFiltered}</Badge>
          </div>
          <div className="grid gap-1.5 sm:gap-3 sm:grid-cols-2 lg:grid-cols-3">
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
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="rounded-xl border bg-card p-8 text-center sm:rounded-2xl sm:p-16">
          <Search className="mx-auto mb-3 h-8 w-8 text-muted-foreground sm:mb-4 sm:h-12 sm:w-12" />
          <p className="text-sm font-medium sm:text-lg">No se encontraron tutoriales</p>
          <p className="text-xs text-muted-foreground mb-3 sm:text-base sm:mb-4">Intenta con otra búsqueda, categoría o tag</p>
          <Button variant="outline" size="sm" onClick={clearFilters}>Limpiar filtros</Button>
        </motion.div>
      )}
    </div>
  );
}
