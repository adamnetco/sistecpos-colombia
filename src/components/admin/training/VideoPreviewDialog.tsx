import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, XCircle, ExternalLink, Clock, Tag, Users, ShieldCheck } from "lucide-react";

interface VideoPreviewDialogProps {
  video: {
    id: string;
    title: string;
    category: string;
    video_url: string;
    video_type: string;
    duration: string | null;
    approval_status: string;
    tags: string[];
    visible_to_customer: boolean;
    visible_to_reseller: boolean;
    view_count: number;
  } | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onApprove: (id: string) => void;
  onReject: (id: string) => void;
}

function getEmbedUrl(url: string, type: string): string | null {
  if (type === "loom") {
    const match = url.match(/loom\.com\/share\/([a-zA-Z0-9]+)/);
    return match ? `https://www.loom.com/embed/${match[1]}` : null;
  }
  // YouTube
  const patterns = [
    /youtube\.com\/watch\?v=([^&]+)/,
    /youtu\.be\/([^?]+)/,
    /youtube\.com\/embed\/([^?]+)/,
  ];
  for (const p of patterns) {
    const m = url.match(p);
    if (m) return `https://www.youtube.com/embed/${m[1]}`;
  }
  return null;
}

export default function VideoPreviewDialog({ video, open, onOpenChange, onApprove, onReject }: VideoPreviewDialogProps) {
  if (!video) return null;

  const embedUrl = getEmbedUrl(video.video_url, video.video_type);
  const isPending = video.approval_status === "pending";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-lg pr-6">
            <span className="truncate">{video.title}</span>
            {video.approval_status === "approved" && <Badge className="bg-green-600 shrink-0">Aprobado</Badge>}
            {video.approval_status === "rejected" && <Badge variant="destructive" className="shrink-0">Rechazado</Badge>}
            {isPending && <Badge variant="outline" className="border-yellow-500 text-yellow-600 shrink-0">Pendiente</Badge>}
          </DialogTitle>
        </DialogHeader>

        {/* Video embed */}
        <div className="aspect-video rounded-lg overflow-hidden bg-black/5 border">
          {embedUrl ? (
            <iframe
              src={embedUrl}
              className="w-full h-full"
              allow="autoplay; fullscreen; picture-in-picture"
              allowFullScreen
              title={video.title}
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center gap-2 text-muted-foreground">
              <p className="text-sm">No se pudo incrustar el video</p>
              <a href={video.video_url} target="_blank" rel="noopener noreferrer" className="text-primary text-sm flex items-center gap-1 hover:underline">
                Abrir en nueva pestaña <ExternalLink className="h-3 w-3" />
              </a>
            </div>
          )}
        </div>

        {/* Meta info */}
        <div className="flex flex-wrap items-center gap-2 text-sm">
          <Badge variant="secondary">{video.category}</Badge>
          {video.duration && (
            <span className="flex items-center gap-1 text-muted-foreground text-xs"><Clock className="h-3 w-3" />{video.duration}</span>
          )}
          <span className="text-xs text-muted-foreground">{video.view_count} vistas</span>
          <span className="mx-1">·</span>
          {video.visible_to_customer && <Badge variant="outline" className="text-[10px] gap-0.5"><Users className="h-2.5 w-2.5" />Cliente</Badge>}
          {video.visible_to_reseller && <Badge variant="outline" className="text-[10px] gap-0.5"><ShieldCheck className="h-2.5 w-2.5" />Socio</Badge>}
        </div>

        {video.tags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {video.tags.map((t) => (
              <span key={t} className="inline-flex items-center rounded bg-primary/10 px-1.5 py-0.5 text-[10px] text-primary font-medium">
                <Tag className="h-2 w-2 mr-0.5" />{t}
              </span>
            ))}
          </div>
        )}

        {isPending && (
          <DialogFooter className="gap-2 sm:gap-2">
            <Button variant="destructive" onClick={() => onReject(video.id)} className="gap-1">
              <XCircle className="h-4 w-4" />Rechazar
            </Button>
            <Button onClick={() => onApprove(video.id)} className="gap-1 bg-green-600 hover:bg-green-700">
              <CheckCircle className="h-4 w-4" />Aprobar
            </Button>
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
}
