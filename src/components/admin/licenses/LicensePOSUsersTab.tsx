import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Plus, Trash2, Eye, EyeOff, UserPlus, Loader2, Link2, Unlink, Search } from "lucide-react";
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
  user_id: string | null;
}

interface ProfileResult {
  user_id: string;
  email: string | null;
  full_name: string | null;
  phone: string | null;
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
  const [showFormPassword, setShowFormPassword] = useState(false);
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
    user_id: null as string | null,
  });

  // User search state
  const [userSearch, setUserSearch] = useState("");
  const [userResults, setUserResults] = useState<ProfileResult[]>([]);
  const [searchingUsers, setSearchingUsers] = useState(false);
  const [selectedUser, setSelectedUser] = useState<ProfileResult | null>(null);

  // Link user search (for existing POS users)
  const [linkingUserId, setLinkingUserId] = useState<string | null>(null);
  const [linkSearch, setLinkSearch] = useState("");
  const [linkResults, setLinkResults] = useState<ProfileResult[]>([]);
  const [searchingLink, setSearchingLink] = useState(false);

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

  const searchProfiles = useCallback(async (query: string, setter: (r: ProfileResult[]) => void, setLoading: (b: boolean) => void) => {
    if (query.length < 2) { setter([]); return; }
    setLoading(true);
    const { data } = await supabase.rpc("search_profiles", { _query: query, _limit: 8 });
    setter((data as ProfileResult[]) || []);
    setLoading(false);
  }, []);

  // Debounced search for form
  useEffect(() => {
    const t = setTimeout(() => searchProfiles(userSearch, setUserResults, setSearchingUsers), 300);
    return () => clearTimeout(t);
  }, [userSearch]);

  // Debounced search for link
  useEffect(() => {
    const t = setTimeout(() => searchProfiles(linkSearch, setLinkResults, setSearchingLink), 300);
    return () => clearTimeout(t);
  }, [linkSearch]);

  const selectUser = (profile: ProfileResult) => {
    setSelectedUser(profile);
    setForm(prev => ({
      ...prev,
      user_id: profile.user_id,
      user_email: profile.email || prev.user_email,
      display_name: profile.full_name || prev.display_name,
    }));
    setUserSearch("");
    setUserResults([]);
  };

  const clearSelectedUser = () => {
    setSelectedUser(null);
    setForm(prev => ({ ...prev, user_id: null }));
  };

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
      _user_id: form.user_id || null,
    });
    if (error) {
      toast({ title: "Error: " + error.message, variant: "destructive" });
    } else {
      toast({ title: "Usuario POS registrado" });
      setForm({ pos_username: "", pos_store: businessName || "", pos_password: "", pos_role: "admin", user_email: "", display_name: "", notes: "", user_id: null });
      setSelectedUser(null);
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

  const linkUserToPos = async (posUserId: string, profile: ProfileResult) => {
    const { error } = await supabase.rpc("update_pos_user", {
      _id: posUserId,
      _user_id: profile.user_id,
      _user_email: profile.email,
      _display_name: profile.full_name,
      _clear_user_link: false,
    });

    if (error) {
      toast({ title: "Error al vincular", description: error.message, variant: "destructive" });
      return;
    }

    toast({ title: "Usuario vinculado" });
    setLinkingUserId(null);
    setLinkSearch("");
    setLinkResults([]);
    load();
  };

  const unlinkUser = async (posUserId: string) => {
    const { error } = await supabase.rpc("update_pos_user", {
      _id: posUserId,
      _clear_user_link: true,
    });

    if (error) {
      toast({ title: "Error al desvincular", description: error.message, variant: "destructive" });
      return;
    }

    toast({ title: "Usuario desvinculado" });
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
          {/* User association section */}
          <div className="rounded-lg border border-dashed border-primary/40 bg-primary/5 p-3 space-y-2">
            <Label className="text-xs font-semibold flex items-center gap-1.5">
              <Link2 className="h-3.5 w-3.5" /> Vincular con usuario de la plataforma (opcional)
            </Label>
            {selectedUser ? (
              <div className="flex items-center gap-2 bg-background rounded-md border p-2">
                <div className="flex-1 text-xs">
                  <span className="font-medium">{selectedUser.full_name || "Sin nombre"}</span>
                  <span className="text-muted-foreground ml-2">{selectedUser.email}</span>
                </div>
                <Button size="sm" variant="ghost" onClick={clearSelectedUser} className="h-6 w-6 p-0">
                  <Unlink className="h-3 w-3" />
                </Button>
              </div>
            ) : (
              <div className="relative">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                <Input
                  value={userSearch}
                  onChange={(e) => setUserSearch(e.target.value)}
                  placeholder="Buscar por email, nombre o teléfono..."
                  className="pl-8 text-xs h-9"
                />
                {searchingUsers && <Loader2 className="absolute right-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 animate-spin text-muted-foreground" />}
                {userResults.length > 0 && (
                  <div className="absolute z-10 mt-1 w-full rounded-md border bg-popover shadow-md max-h-40 overflow-y-auto">
                    {userResults.map((p) => (
                      <button
                        key={p.user_id}
                        onClick={() => selectUser(p)}
                        className="w-full text-left px-3 py-2 text-xs hover:bg-accent flex items-center gap-2"
                      >
                        <span className="font-medium">{p.full_name || "Sin nombre"}</span>
                        <span className="text-muted-foreground">{p.email}</span>
                        {p.phone && <span className="text-muted-foreground">· {p.phone}</span>}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

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
              <div className="relative">
                <Input value={form.pos_password} onChange={(e) => setForm({ ...form, pos_password: e.target.value })} type={showFormPassword ? "text" : "password"} placeholder="contraseña" className="pr-9" />
                <button type="button" onClick={() => setShowFormPassword(!showFormPassword)} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                  {showFormPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
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
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-medium">{u.display_name || u.pos_username}</span>
                    <Badge variant={u.is_active ? "default" : "secondary"} className="text-[10px]">
                      {u.pos_role}
                    </Badge>
                    {!u.is_active && <Badge variant="secondary" className="text-[10px]">Inactivo</Badge>}
                    {u.user_id ? (
                      <Badge variant="outline" className="text-[10px] gap-1 border-green-300 text-green-700 dark:border-green-700 dark:text-green-400">
                        <Link2 className="h-2.5 w-2.5" /> Vinculado
                      </Badge>
                    ) : (
                      <button
                        onClick={() => setLinkingUserId(linkingUserId === u.id ? null : u.id)}
                        className="text-[10px] text-primary hover:underline flex items-center gap-0.5"
                      >
                        <Link2 className="h-2.5 w-2.5" /> Vincular usuario
                      </button>
                    )}
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

                  {/* Inline link search for this POS user */}
                  {linkingUserId === u.id && (
                    <div className="mt-2 rounded border bg-muted/30 p-2 space-y-2">
                      <div className="relative">
                        <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-3 w-3 text-muted-foreground" />
                        <Input
                          value={linkSearch}
                          onChange={(e) => setLinkSearch(e.target.value)}
                          placeholder="Buscar usuario de la plataforma..."
                          className="pl-7 text-xs h-8"
                          autoFocus
                        />
                        {searchingLink && <Loader2 className="absolute right-2 top-1/2 -translate-y-1/2 h-3 w-3 animate-spin" />}
                      </div>
                      {linkResults.map((p) => (
                        <button
                          key={p.user_id}
                          onClick={() => linkUserToPos(u.id, p)}
                          className="w-full text-left px-2 py-1.5 text-xs hover:bg-accent rounded flex items-center gap-2"
                        >
                          <Link2 className="h-3 w-3 text-primary shrink-0" />
                          <span className="font-medium">{p.full_name || "Sin nombre"}</span>
                          <span className="text-muted-foreground">{p.email}</span>
                        </button>
                      ))}
                      <Button size="sm" variant="ghost" className="text-xs h-6" onClick={() => { setLinkingUserId(null); setLinkSearch(""); setLinkResults([]); }}>
                        Cancelar
                      </Button>
                    </div>
                  )}
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
