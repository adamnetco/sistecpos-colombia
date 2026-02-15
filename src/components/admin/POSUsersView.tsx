import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Search, Eye, EyeOff, Trash2, Download, Loader2 } from "lucide-react";
import { exportToCsv } from "@/lib/exportCsv";

interface POSUser {
  id: string;
  license_id: string;
  business_name: string;
  license_key: string;
  pos_username: string;
  pos_store: string;
  pos_password: string;
  pos_role: string;
  user_email: string | null;
  display_name: string | null;
  is_active: boolean;
  last_verified_at: string | null;
  notes: string | null;
  created_at: string;
}

export default function POSUsersView() {
  const [users, setUsers] = useState<POSUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [visiblePasswords, setVisiblePasswords] = useState<Set<string>>(new Set());
  const { toast } = useToast();

  const load = async () => {
    setLoading(true);
    const { data, error } = await supabase.rpc("get_all_pos_users");
    if (error) {
      toast({ title: "Error al cargar usuarios POS", variant: "destructive" });
    } else {
      setUsers((data as POSUser[]) || []);
    }
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const filtered = users.filter((u) => {
    const q = search.toLowerCase();
    return (
      u.business_name.toLowerCase().includes(q) ||
      u.pos_username.toLowerCase().includes(q) ||
      u.pos_store.toLowerCase().includes(q) ||
      (u.user_email || "").toLowerCase().includes(q) ||
      (u.display_name || "").toLowerCase().includes(q) ||
      u.license_key.toLowerCase().includes(q) ||
      u.pos_role.toLowerCase().includes(q)
    );
  });

  const togglePassword = (id: string) => {
    setVisiblePasswords((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase.rpc("delete_pos_user", { _id: id });
    if (error) {
      toast({ title: "Error al eliminar", variant: "destructive" });
    } else {
      toast({ title: "Usuario POS eliminado" });
      load();
    }
  };

  return (
    <div>
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold font-display">Usuarios POS</h1>
        <Button size="sm" variant="outline" onClick={() => exportToCsv(filtered.map(u => ({ ...u, pos_password: "***" })), [
          { key: "business_name", label: "Negocio" },
          { key: "pos_username", label: "Usuario POS" },
          { key: "pos_store", label: "Empresa POS" },
          { key: "pos_role", label: "Rol" },
          { key: "user_email", label: "Email" },
          { key: "display_name", label: "Nombre" },
          { key: "is_active", label: "Activo" },
        ], "usuarios-pos")}>
          <Download className="h-3.5 w-3.5 mr-1" /> Exportar
        </Button>
      </div>

      <div className="mb-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
        <StatCard label="Total" value={users.length} />
        <StatCard label="Activos" value={users.filter(u => u.is_active).length} className="text-green-600" />
        <StatCard label="Licencias" value={new Set(users.map(u => u.license_id)).size} className="text-primary" />
      </div>

      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Buscar por negocio, usuario, empresa, email, rol..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10"
        />
      </div>

      <div className="rounded-lg border bg-card overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-muted/50">
              <th className="px-4 py-3 text-left font-medium">Negocio</th>
              <th className="px-4 py-3 text-left font-medium">Usuario POS</th>
              <th className="px-4 py-3 text-left font-medium">Empresa</th>
              <th className="px-4 py-3 text-left font-medium">Contraseña</th>
              <th className="px-4 py-3 text-left font-medium">Rol</th>
              <th className="px-4 py-3 text-left font-medium">Email</th>
              <th className="px-4 py-3 text-left font-medium">Estado</th>
              <th className="px-4 py-3 text-left font-medium">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={8} className="py-8 text-center"><Loader2 className="h-5 w-5 animate-spin mx-auto text-muted-foreground" /></td></tr>
            ) : filtered.length === 0 ? (
              <tr><td colSpan={8} className="py-8 text-center text-muted-foreground">No hay usuarios POS registrados</td></tr>
            ) : (
              filtered.map((u) => (
                <tr key={u.id} className="border-b hover:bg-muted/30">
                  <td className="px-4 py-3">
                    <div className="font-medium">{u.business_name}</div>
                    <div className="text-xs text-muted-foreground font-mono">{u.license_key.slice(0, 8)}...</div>
                  </td>
                  <td className="px-4 py-3 font-mono text-xs">{u.pos_username}</td>
                  <td className="px-4 py-3 font-mono text-xs">{u.pos_store}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      <span className="font-mono text-xs">{visiblePasswords.has(u.id) ? u.pos_password : "••••••"}</span>
                      <button onClick={() => togglePassword(u.id)} className="text-muted-foreground hover:text-foreground">
                        {visiblePasswords.has(u.id) ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                      </button>
                    </div>
                  </td>
                  <td className="px-4 py-3"><Badge variant="outline" className="text-[10px]">{u.pos_role}</Badge></td>
                  <td className="px-4 py-3 text-xs">{u.user_email || "—"}</td>
                  <td className="px-4 py-3">
                    <Badge variant={u.is_active ? "default" : "secondary"} className="text-[10px]">
                      {u.is_active ? "Activo" : "Inactivo"}
                    </Badge>
                  </td>
                  <td className="px-4 py-3">
                    <Button size="sm" variant="ghost" className="text-destructive h-7 w-7 p-0" onClick={() => handleDelete(u.id)}>
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function StatCard({ label, value, className }: { label: string; value: number; className?: string }) {
  return (
    <div className="rounded-lg border bg-card p-3">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className={`text-2xl font-bold ${className || ""}`}>{value}</p>
    </div>
  );
}
