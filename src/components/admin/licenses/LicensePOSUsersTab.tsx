import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Plus, Trash2, Eye, EyeOff, UserPlus, Loader2 } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

interface POSUser {
  id: string;
  license_id: string;
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

interface Props {
  licenseId: string;
  businessName: string;
}

const POS_ROLES = ["admin", "cajero", "mesero", "bodeguero", "contador", "otro"];

export function LicensePOSUsersTab({ licenseId, businessName }: Props) {
  const [users, setUsers] = useState<POSUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [visiblePasswords, setVisiblePasswords] = useState<Set<string>>(new Set());
  const { toast } = useToast();
  const { user } = useAuth();

  const [form, setForm] = useState({
    pos_username: "",
    pos_store: businessName || "",
    pos_password: "",
    pos_role: "admin",
    user_email: "",
    display_name: "",
    notes: "",
  });

  const load = async () => {
    setLoading(true);
    const { data, error } = await supabase.rpc("get_pos_users_for_license", {
      _license_id: licenseId,
    });
    if (error) {
      toast({ title: "Error al cargar usuarios POS", variant: "destructive" });
    } else {
      setUsers((data as POSUser[]) || []);
    }
    setLoading(false);
  };

  useEffect(() => { load(); }, [licenseId]);

  const handleAdd = async () => {
    if (!form.pos_username || !form.pos_store || !form.pos_password) {
      toast({ title: "Usuario, empresa y contraseña son requeridos", variant: "destructive" });
      return;
    }
    setSaving(true);
    const { error } = await supabase.rpc("insert_pos_user", {
      _license_id: licenseId,
      _pos_username: form.pos_username,
      _pos_store: form.pos_store,
      _pos_password: form.pos_password,
      _pos_role: form.pos_role,
      _user_email: form.user_email || null,
      _display_name: form.display_name || null,
      _notes: form.notes || null,
      _registered_by: user?.id || null,
    });
    if (error) {
      toast({ title: "Error: " + error.message, variant: "destructive" });
    } else {
      toast({ title: "Usuario POS registrado" });
      setForm({ pos_username: "", pos_store: businessName || "", pos_password: "", pos_role: "admin", user_email: "", display_name: "", notes: "" });
      setShowForm(false);
      load();
    }
    setSaving(false);
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

  const togglePassword = (id: string) => {
    setVisiblePasswords((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const toggleActive = async (u: POSUser) => {
    await supabase.rpc("update_pos_user", { _id: u.id, _is_active: !u.is_active });
    load();
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold">Usuarios POS ({users.length})</h3>
        <Button size="sm" variant="outline" onClick={() => setShowForm(!showForm)}>
          {showForm ? "Cancelar" : <><UserPlus className="h-3.5 w-3.5 mr-1" /> Agregar</>}
        </Button>
      </div>

      {showForm && (
        <div className="rounded-lg border bg-muted/30 p-4 space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-xs">Usuario POS *</Label>
              <Input value={form.pos_username} onChange={(e) => setForm({ ...form, pos_username: e.target.value })} placeholder="usuario" />
            </div>
            <div>
              <Label className="text-xs">Empresa POS *</Label>
              <Input value={form.pos_store} onChange={(e) => setForm({ ...form, pos_store: e.target.value })} placeholder="empresa" />
            </div>
            <div>
              <Label className="text-xs">Contraseña POS *</Label>
              <Input value={form.pos_password} onChange={(e) => setForm({ ...form, pos_password: e.target.value })} type="password" placeholder="contraseña" />
            </div>
            <div>
              <Label className="text-xs">Rol POS</Label>
              <select
                value={form.pos_role}
                onChange={(e) => setForm({ ...form, pos_role: e.target.value })}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                {POS_ROLES.map((r) => <option key={r} value={r}>{r}</option>)}
              </select>
            </div>
            <div>
              <Label className="text-xs">Email del usuario</Label>
              <Input value={form.user_email} onChange={(e) => setForm({ ...form, user_email: e.target.value })} type="email" placeholder="correo@ejemplo.com" />
            </div>
            <div>
              <Label className="text-xs">Nombre</Label>
              <Input value={form.display_name} onChange={(e) => setForm({ ...form, display_name: e.target.value })} placeholder="Nombre visible" />
            </div>
          </div>
          <div>
            <Label className="text-xs">Notas</Label>
            <Input value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} placeholder="Observaciones internas..." />
          </div>
          <Button size="sm" onClick={handleAdd} disabled={saving}>
            {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin mr-1" /> : <Plus className="h-3.5 w-3.5 mr-1" />}
            Guardar usuario
          </Button>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-6"><Loader2 className="h-5 w-5 animate-spin text-muted-foreground" /></div>
      ) : users.length === 0 ? (
        <p className="text-sm text-muted-foreground text-center py-4">No hay usuarios POS registrados para esta licencia.</p>
      ) : (
        <div className="space-y-2">
          {users.map((u) => (
            <div key={u.id} className={`rounded-lg border p-3 text-sm ${u.is_active ? "bg-card" : "bg-muted/50 opacity-70"}`}>
              <div className="flex items-start justify-between gap-2">
                <div className="space-y-1 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{u.display_name || u.pos_username}</span>
                    <Badge variant={u.is_active ? "default" : "secondary"} className="text-[10px]">
                      {u.pos_role}
                    </Badge>
                    {!u.is_active && <Badge variant="secondary" className="text-[10px]">Inactivo</Badge>}
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-xs text-muted-foreground">
                    <span>👤 {u.pos_username}</span>
                    <span>🏢 {u.pos_store}</span>
                    <span className="flex items-center gap-1">
                      🔑 {visiblePasswords.has(u.id) ? u.pos_password : "••••••"}
                      <button onClick={() => togglePassword(u.id)} className="hover:text-foreground">
                        {visiblePasswords.has(u.id) ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                      </button>
                    </span>
                  </div>
                  {u.user_email && <p className="text-xs text-muted-foreground">📧 {u.user_email}</p>}
                  {u.notes && <p className="text-xs text-muted-foreground italic">📝 {u.notes}</p>}
                </div>
                <div className="flex gap-1 shrink-0">
                  <Button size="sm" variant="ghost" onClick={() => toggleActive(u)} title={u.is_active ? "Desactivar" : "Activar"}>
                    {u.is_active ? "⏸" : "▶"}
                  </Button>
                  <Button size="sm" variant="ghost" className="text-destructive" onClick={() => handleDelete(u.id)}>
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
