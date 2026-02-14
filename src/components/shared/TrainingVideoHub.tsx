import { useState, useMemo } from "react";
import { mainTutorials, quickVideos, getYouTubeId, getLoomEmbedUrl, allCategories, type TrainingVideo } from "@/data/trainingVideos";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Search, Play, Clock, ExternalLink, Film, X, ChevronDown, ChevronUp } from "lucide-react";

function YouTubeEmbed({ videoId }: { videoId: string }) {
  return (
    <div className="relative w-full overflow-hidden rounded-xl" style={{ paddingBottom: "56.25%" }}>
      <iframe
        className="absolute inset-0 h-full w-full"
        src={`https://www.youtube.com/embed/${videoId}`}
        title="YouTube video"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
      />
    </div>
  );
}

function VideoCard({ video, onSelect }: { video: TrainingVideo; onSelect: (v: TrainingVideo) => void }) {
  const ytId = video.type === "youtube" ? getYouTubeId(video.video_url) : null;

  return (
    <button
      onClick={() => onSelect(video)}
      className="group relative flex flex-col overflow-hidden rounded-xl border bg-card text-left transition-all hover:shadow-lg hover:border-primary/40 hover:-translate-y-0.5"
    >
      {/* Thumbnail */}
      <div className="relative aspect-video w-full bg-muted overflow-hidden">
        {ytId ? (
          <img
            src={`https://img.youtube.com/vi/${ytId}/mqdefault.jpg`}
            alt={video.title}
            className="h-full w-full object-cover transition-transform group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-primary/20 to-accent/30">
            <Film className="h-10 w-10 text-primary/60" />
          </div>
        )}
        <div className="absolute inset-0 flex items-center justify-center bg-black/0 transition-all group-hover:bg-black/20">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg opacity-0 scale-75 transition-all group-hover:opacity-100 group-hover:scale-100">
            <Play className="h-5 w-5 ml-0.5" />
          </div>
        </div>
        {video.duration && (
          <span className="absolute bottom-2 right-2 rounded bg-black/80 px-1.5 py-0.5 text-[10px] font-mono text-white flex items-center gap-1">
            <Clock className="h-2.5 w-2.5" />{video.duration}
          </span>
        )}
      </div>
      {/* Info */}
      <div className="flex flex-1 flex-col gap-1.5 p-3">
        <h3 className="text-sm font-semibold leading-tight line-clamp-2 group-hover:text-primary transition-colors">{video.title}</h3>
        <Badge variant="secondary" className="self-start text-[10px] capitalize">{video.category}</Badge>
      </div>
    </button>
  );
}

export default function TrainingVideoHub() {
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [activeVideo, setActiveVideo] = useState<TrainingVideo | null>(null);
  const [showAllQuick, setShowAllQuick] = useState(false);

  const allVideos = useMemo(() => [...mainTutorials, ...quickVideos], []);

  const filteredMain = useMemo(() => {
    return mainTutorials.filter((v) => {
      const matchSearch = !search || v.title.toLowerCase().includes(search.toLowerCase());
      const matchCat = selectedCategory === "all" || v.category === selectedCategory;
      return matchSearch && matchCat;
    });
  }, [search, selectedCategory]);

  const filteredQuick = useMemo(() => {
    const f = quickVideos.filter((v) => {
      const matchSearch = !search || v.title.toLowerCase().includes(search.toLowerCase());
      const matchCat = selectedCategory === "all" || v.category === selectedCategory;
      return matchSearch && matchCat;
    });
    return showAllQuick ? f : f.slice(0, 12);
  }, [search, selectedCategory, showAllQuick]);

  const totalQuickFiltered = useMemo(() => {
    return quickVideos.filter((v) => {
      const matchSearch = !search || v.title.toLowerCase().includes(search.toLowerCase());
      const matchCat = selectedCategory === "all" || v.category === selectedCategory;
      return matchSearch && matchCat;
    }).length;
  }, [search, selectedCategory]);

  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    allVideos.forEach((v) => { counts[v.category] = (counts[v.category] || 0) + 1; });
    return counts;
  }, [allVideos]);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold md:text-3xl">Centro de Capacitación</h2>
        <p className="text-muted-foreground">
          {allVideos.length} video tutoriales para dominar tu sistema POS
        </p>
      </div>

      {/* Search */}
      <div className="relative mx-auto max-w-xl">
        <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Buscar tutorial... ej: facturación, inventario, caja"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="h-12 rounded-full pl-12 pr-10 text-base shadow-sm border-2 focus-visible:border-primary"
        />
        {search && (
          <button onClick={() => setSearch("")} className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Categories */}
      <div className="flex flex-wrap justify-center gap-2">
        <Button
          size="sm"
          variant={selectedCategory === "all" ? "default" : "outline"}
          onClick={() => setSelectedCategory("all")}
          className="rounded-full"
        >
          Todos ({allVideos.length})
        </Button>
        {allCategories.map((cat) => (
          <Button
            key={cat}
            size="sm"
            variant={selectedCategory === cat ? "default" : "outline"}
            onClick={() => setSelectedCategory(cat)}
            className="rounded-full capitalize"
          >
            {cat}
            <Badge variant="secondary" className="ml-1.5 text-[10px] px-1.5">{categoryCounts[cat] || 0}</Badge>
          </Button>
        ))}
      </div>

      {/* Active Video Player */}
      {activeVideo && (
        <div className="rounded-2xl border-2 border-primary/20 bg-card p-4 md:p-6 shadow-lg space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold">{activeVideo.title}</h3>
              <Badge variant="secondary" className="capitalize">{activeVideo.category}</Badge>
            </div>
            <Button variant="ghost" size="icon" onClick={() => setActiveVideo(null)}>
              <X className="h-5 w-5" />
            </Button>
          </div>
          {activeVideo.type === "youtube" && getYouTubeId(activeVideo.video_url) ? (
            <YouTubeEmbed videoId={getYouTubeId(activeVideo.video_url)!} />
          ) : (
            <div className="relative w-full overflow-hidden rounded-xl" style={{ paddingBottom: "56.25%" }}>
              <iframe
                className="absolute inset-0 h-full w-full"
                src={getLoomEmbedUrl(activeVideo.video_url)}
                allowFullScreen
              />
            </div>
          )}
        </div>
      )}

      {/* Main Tutorials */}
      {filteredMain.length > 0 && (
        <div>
          <div className="mb-4 flex items-center gap-2">
            <Play className="h-5 w-5 text-primary" />
            <h3 className="text-lg font-bold">Tutoriales Principales</h3>
            <Badge>{filteredMain.length}</Badge>
          </div>
          <div className="grid gap-4 grid-cols-2 sm:grid-cols-3 lg:grid-cols-4">
            {filteredMain.map((v) => (
              <VideoCard key={v.id} video={v} onSelect={setActiveVideo} />
            ))}
          </div>
        </div>
      )}

      {/* Quick Videos */}
      {filteredQuick.length > 0 && (
        <div>
          <div className="mb-4 flex items-center gap-2">
            <Film className="h-5 w-5 text-primary" />
            <h3 className="text-lg font-bold">Micro-Tutoriales</h3>
            <Badge>{totalQuickFiltered}</Badge>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {filteredQuick.map((v) => (
              <button
                key={v.id}
                onClick={() => setActiveVideo(v)}
                className="flex items-center gap-3 rounded-lg border bg-card p-3 text-left transition-all hover:shadow-md hover:border-primary/30 group"
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors">
                  <Play className="h-4 w-4 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate group-hover:text-primary transition-colors">{v.title}</p>
                  <span className="text-xs text-muted-foreground capitalize">{v.category}</span>
                </div>
                <ExternalLink className="h-3.5 w-3.5 shrink-0 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
              </button>
            ))}
          </div>
          {totalQuickFiltered > 12 && (
            <div className="mt-4 text-center">
              <Button variant="outline" onClick={() => setShowAllQuick(!showAllQuick)} className="gap-2">
                {showAllQuick ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                {showAllQuick ? "Mostrar menos" : `Ver todos (${totalQuickFiltered})`}
              </Button>
            </div>
          )}
        </div>
      )}

      {filteredMain.length === 0 && filteredQuick.length === 0 && (
        <div className="rounded-2xl border bg-card p-16 text-center">
          <Search className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
          <p className="text-lg font-medium">No se encontraron tutoriales</p>
          <p className="text-muted-foreground">Intenta con otra búsqueda o categoría</p>
        </div>
      )}
    </div>
  );
}
