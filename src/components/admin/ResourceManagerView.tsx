import { useState, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";
import { Upload, Copy, Trash2, Search, Image, FileText, File, Check, FolderOpen } from "lucide-react";

interface StorageFile {
  name: string;
  id: string;
  metadata: Record<string, any>;
  created_at: string;
}

const BUCKET = "shared-resources";

const formatSize = (bytes: number) => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

const getFileIcon = (mime: string) => {
  if (mime?.startsWith("image/")) return <Image className="h-5 w-5 text-blue-500" />;
  if (mime?.includes("pdf")) return <FileText className="h-5 w-5 text-red-500" />;
  return <File className="h-5 w-5 text-muted-foreground" />;
};

export default function ResourceManagerView() {
  const qc = useQueryClient();
  const [search, setSearch] = useState("");
  const [uploading, setUploading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [folder, setFolder] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const { data: files = [], isLoading } = useQuery({
    queryKey: ["shared-resources", folder],
    queryFn: async () => {
      const { data, error } = await supabase.storage
        .from(BUCKET)
        .list(folder || undefined, { limit: 500, sortBy: { column: "created_at", order: "desc" } });
      if (error) throw error;
      return (data || []).filter(f => f.name !== ".emptyFolderPlaceholder") as StorageFile[];
    },
  });

  const filtered = files.filter(f => {
    const q = search.toLowerCase();
    return !q || f.name.toLowerCase().includes(q);
  });

  const getPublicUrl = (name: string) => {
    const path = folder ? `${folder}/${name}` : name;
    const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
    return data.publicUrl;
  };

  const copyUrl = async (name: string) => {
    const url = getPublicUrl(name);
    await navigator.clipboard.writeText(url);
    setCopiedId(name);
    toast.success("URL copiada al portapapeles");
    setTimeout(() => setCopiedId(null), 2000);
  };

  const copyMarkdown = async (file: StorageFile) => {
    const url = getPublicUrl(file.name);
    const isImage = file.metadata?.mimetype?.startsWith("image/");
    const md = isImage ? `![${file.name}](${url})` : `[${file.name}](${url})`;
    await navigator.clipboard.writeText(md);
    toast.success("Markdown copiado");
  };

  const handleUpload = async (fileList: FileList | null) => {
    if (!fileList || fileList.length === 0) return;
    setUploading(true);
    let count = 0;
    for (const file of Array.from(fileList)) {
      if (file.size > 10 * 1024 * 1024) {
        toast.error(`${file.name}: máximo 10MB`);
        continue;
      }
      const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
      const path = folder ? `${folder}/${safeName}` : safeName;
      const { error } = await supabase.storage.from(BUCKET).upload(path, file, { upsert: true });
      if (error) {
        toast.error(`Error: ${file.name} - ${error.message}`);
      } else {
        count++;
      }
    }
    if (count > 0) {
      toast.success(`${count} archivo(s) subido(s)`);
      qc.invalidateQueries({ queryKey: ["shared-resources"] });
    }
    setUploading(false);
    if (inputRef.current) inputRef.current.value = "";
  };

  const handleDelete = async (name: string) => {
    const path = folder ? `${folder}/${name}` : name;
    const { error } = await supabase.storage.from(BUCKET).remove([path]);
    if (error) { toast.error(error.message); return; }
    toast.success("Archivo eliminado");
    qc.invalidateQueries({ queryKey: ["shared-resources"] });
  };

  const folders = ["", "imagenes", "documentos", "videos"];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <FolderOpen className="h-6 w-6 text-primary" />
            Recursos Compartidos
          </h1>
          <p className="text-muted-foreground text-sm">
            {files.length} archivos · Sube imágenes y PDFs para usar en artículos, capacitaciones y comunicaciones
          </p>
        </div>
        <div className="flex gap-2">
          <input
            ref={inputRef}
            type="file"
            multiple
            accept="image/*,.pdf,.doc,.docx,.xlsx"
            className="hidden"
            onChange={(e) => handleUpload(e.target.files)}
          />
          <Button onClick={() => inputRef.current?.click()} disabled={uploading} size="sm" className="gap-1.5">
            <Upload className="h-3.5 w-3.5" />
            {uploading ? "Subiendo..." : "Subir archivos"}
          </Button>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <div className="relative max-w-xs flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Buscar archivo..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10" />
        </div>
        <div className="flex gap-1">
          {folders.map(f => (
            <Button key={f || "root"} size="sm" variant={folder === f ? "default" : "outline"} onClick={() => setFolder(f)} className="text-xs capitalize">
              {f || "Raíz"}
            </Button>
          ))}
        </div>
      </div>

      <div className="p-3 rounded-lg border bg-muted/30 text-xs text-muted-foreground">
        <strong>Tip:</strong> Haz clic en <Copy className="inline h-3 w-3" /> para copiar la URL, o en <code className="bg-muted px-1 rounded">MD</code> para copiar como Markdown listo para pegar.
      </div>

      {isLoading ? (
        <p className="text-center py-8 text-muted-foreground">Cargando...</p>
      ) : filtered.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          <FolderOpen className="mx-auto mb-3 h-10 w-10 opacity-40" />
          <p>No hay archivos{search ? " que coincidan" : ""}. Sube archivos para comenzar.</p>
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filtered.map(file => {
            const isImage = file.metadata?.mimetype?.startsWith("image/");
            const url = getPublicUrl(file.name);
            return (
              <Card key={file.name} className="overflow-hidden group">
                <div className="h-32 bg-muted/50 flex items-center justify-center overflow-hidden">
                  {isImage ? (
                    <img src={url} alt={file.name} className="h-full w-full object-cover" loading="lazy" />
                  ) : (
                    getFileIcon(file.metadata?.mimetype)
                  )}
                </div>
                <CardContent className="p-3 space-y-2">
                  <p className="text-sm font-medium truncate" title={file.name}>{file.name}</p>
                  <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                    <Badge variant="outline" className="text-[10px]">{file.metadata?.mimetype?.split("/")[1] || "file"}</Badge>
                    <span>{formatSize(file.metadata?.size || 0)}</span>
                  </div>
                  <div className="flex gap-1">
                    <Button size="sm" variant="outline" className="flex-1 gap-1 text-xs h-7" onClick={() => copyUrl(file.name)}>
                      {copiedId === file.name ? <Check className="h-3 w-3 text-green-600" /> : <Copy className="h-3 w-3" />}
                      URL
                    </Button>
                    <Button size="sm" variant="outline" className="flex-1 gap-1 text-xs h-7" onClick={() => copyMarkdown(file)}>
                      <code className="text-[10px]">MD</code>
                    </Button>
                    <Button size="sm" variant="ghost" className="h-7 w-7 p-0" onClick={() => handleDelete(file.name)}>
                      <Trash2 className="h-3.5 w-3.5 text-destructive" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
