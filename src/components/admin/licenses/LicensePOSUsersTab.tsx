import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Plus, Trash2, Eye, EyeOff, UserPlus, Loader2, Link2, Unlink, Search, Building2, Monitor, Users } from "lucide-react";
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

interface ClientSession {
  id: string;
  pos_username: string;
  pos_store: string;
  last_success_at: string;
}

interface BusinessInfo {
  id: string;
  business_name: string;
  nit: string | null;
  phone: string | null;
  email: string | null;
  city: string | null;
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

  // Client sessions for linked users
  const [clientSessions, setClientSessions] = useState<Record<string, ClientSession[]>>({});
  const [loadingSessions, setLoadingSessions] = useState(false);

  // Business info for linked users
  const [businessInfo, setBusinessInfo] = useState<Record<string, BusinessInfo | null>>({});

  const load = async () => {
    setLoading(true);
    const { data, error } = await supabase.rpc("get_pos_users_for_license", {
      _license_id: licenseId,
    });
    if (error) {
      toast({ title: "Error al cargar usuarios POS", variant: "destructive" });
    } else {
      const posUsers = (data as POSUser[]) || [];
      setUsers(posUsers);
      // Load client sessions and business info for linked users
      loadLinkedUserData(posUsers);
    }
    setLoading(false);
  };

  const loadLinkedUserData = async (posUsers: POSUser[]) => {
    const linkedUserIds = posUsers.filter(u => u.user_id).map(u => u.user_id!);
    if (linkedUserIds.length === 0) return;

    setLoadingSessions(true);

    // Load client POS sessions for each linked user
    const sessionsMap: Record<string, ClientSession[]> = {};
    const businessMap: Record<string, BusinessInfo | null> = {};

    await Promise.all(linkedUserIds.map(async (userId) => {
      // Get client sessions
      try {
        const { data: sessions } = await supabase.rpc("get_client_pos_sessions", { _user_id: userId });
        if (sessions) sessionsMap[userId] = sessions as ClientSession[];
      } catch { /* ignore */ }

      // Get business info via profile
      try {
        const { data: profile } = await supabase
          .from("profiles")
          .select("business_id")
          .eq("user_id", userId)
          .maybeSingle();

        if (profile?.business_id) {
          const { data: biz } = await supabase
            .from("businesses")
            .select("id, business_name, nit, phone, email, city")
            .eq("id", profile.business_id)
            .maybeSingle();
          businessMap[userId] = biz as BusinessInfo | null;
        }
      } catch { /* ignore */ }
    }));

    setClientSessions(sessionsMap);
    setBusinessInfo(businessMap);
    setLoadingSessions(false);
  };

  useEffect(() => { load(); }, [licenseId]);

  const searchProfiles = useCallback(async (query: string, setter: (r: ProfileResult[]) => void, setLoading: (b: boolean) => void) => {
    if (query.length < 2) { setter([]); return; }
    setLoading(true);
    const { data } = await supabase.rpc("search_profiles", { _query: query, _limit: 8 });
    setter((data as ProfileResult[]) || []);
    setLoading(false);
  }, []);

  useEffect(() => {
    const t = setTimeout(() => searchProfiles(userSearch, setUserResults, setSearchingUsers), 300);
    return () => clearTimeout(t);
  }, [userSearch]);

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

  const linkedCount = users.filter(u => u.user_id).length;
  const activeSessionCount = Object.values(clientSessions).reduce((acc, s) => acc + s.length, 0);

  return (
    <div className="space-y-4">
      {/* Summary stats */}
      <div className="grid grid-cols-3 gap-2">
        <div className="rounded-lg border bg-card p-2 text-center">
          <Users className="h-4 w-4 mx-auto text-muted-foreground mb-1" />
          <p className="text-lg font-bold">{users.length}</p>
          <p className="text-[10px] text-muted-foreground">Usuarios POS</p>
        </div>
        <div className="rounded-lg border bg-card p-2 text-center">
          <Link2 className="h-4 w-4 mx-auto text-green-600 mb-1" />
          <p className="text-lg font-bold text-green-600">{linkedCount}</p>
          <p className="text-[10px] text-muted-foreground">Vinculados</p>
        </div>
        <div className="rounded-lg border bg-card p-2 text-center">
          <Monitor className="h-4 w-4 mx-auto text-primary mb-1" />
          <p className="text-lg font-bold text-primary">{activeSessionCount}</p>
          <p className="text-[10px] text-muted-foreground">Sesiones cliente</p>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold">Usuarios POS ({users.length})</h3>
        <Button size="sm" variant="outline" onClick={() => setShowForm(!showForm)}>
          {showForm ? "Cancelar" : <><UserPlus className="h-3.5 w-3.5 mr-1" /> Agregar</>}
        </Button>
      </div>

      {showForm && (
        <AddPOSUserForm
          form={form}
          setForm={setForm}
          selectedUser={selectedUser}
          userSearch={userSearch}
          setUserSearch={setUserSearch}
          userResults={userResults}
          searchingUsers={searchingUsers}
          showFormPassword={showFormPassword}
          setShowFormPassword={setShowFormPassword}
          saving={saving}
          onSelectUser={selectUser}
          onClearUser={clearSelectedUser}
          onAdd={handleAdd}
        />
      )}

      {loading ? (
        <div className="flex justify-center py-6"><Loader2 className="h-5 w-5 animate-spin text-muted-foreground" /></div>
      ) : users.length === 0 ? (
        <p className="text-sm text-muted-foreground text-center py-4">No hay usuarios POS registrados para esta licencia.</p>
      ) : (
        <div className="space-y-2">
          {users.map((u) => (
            <POSUserCard
              key={u.id}
              user={u}
              visiblePasswords={visiblePasswords}
              clientSessions={u.user_id ? clientSessions[u.user_id] || [] : []}
              businessInfo={u.user_id ? businessInfo[u.user_id] : null}
              loadingSessions={loadingSessions}
              linkingUserId={linkingUserId}
              linkSearch={linkSearch}
              linkResults={linkResults}
              searchingLink={searchingLink}
              onTogglePassword={() => togglePassword(u.id)}
              onToggleActive={() => toggleActive(u)}
              onDelete={() => handleDelete(u.id)}
              onUnlink={() => unlinkUser(u.id)}
              onStartLink={() => setLinkingUserId(linkingUserId === u.id ? null : u.id)}
              onLinkSearchChange={setLinkSearch}
              onLinkUser={(profile) => linkUserToPos(u.id, profile)}
              onCancelLink={() => { setLinkingUserId(null); setLinkSearch(""); setLinkResults([]); }}
            />
          ))}
        </div>
      )}
    </div>
  );
}

/* ─── Add User Form (sub-component) ─── */
function AddPOSUserForm({ form, setForm, selectedUser, userSearch, setUserSearch, userResults, searchingUsers, showFormPassword, setShowFormPassword, saving, onSelectUser, onClearUser, onAdd }: any) {
  return (
    <div className="rounded-lg border bg-muted/30 p-4 space-y-3">
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
            <Button size="sm" variant="ghost" onClick={onClearUser} className="h-6 w-6 p-0">
              <Unlink className="h-3 w-3" />
            </Button>
          </div>
        ) : (
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
            <Input value={userSearch} onChange={(e: any) => setUserSearch(e.target.value)} placeholder="Buscar por email, nombre o teléfono..." className="pl-8 text-xs h-9" />
            {searchingUsers && <Loader2 className="absolute right-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 animate-spin text-muted-foreground" />}
            {userResults.length > 0 && (
              <div className="absolute z-10 mt-1 w-full rounded-md border bg-popover shadow-md max-h-40 overflow-y-auto">
                {userResults.map((p: any) => (
                  <button key={p.user_id} onClick={() => onSelectUser(p)} className="w-full text-left px-3 py-2 text-xs hover:bg-accent flex items-center gap-2">
                    <span className="font-medium">{p.full_name || "Sin nombre"}</span>
                    <span className="text-muted-foreground">{p.email}</span>
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
          <Input value={form.pos_username} onChange={(e: any) => setForm({ ...form, pos_username: e.target.value })} placeholder="usuario" />
        </div>
        <div>
          <Label className="text-xs">Empresa POS *</Label>
          <Input value={form.pos_store} onChange={(e: any) => setForm({ ...form, pos_store: e.target.value })} placeholder="empresa" />
        </div>
        <div>
          <Label className="text-xs">Contraseña POS *</Label>
          <div className="relative">
            <Input value={form.pos_password} onChange={(e: any) => setForm({ ...form, pos_password: e.target.value })} type={showFormPassword ? "text" : "password"} placeholder="contraseña" className="pr-9" />
            <button type="button" onClick={() => setShowFormPassword(!showFormPassword)} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
              {showFormPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
        </div>
        <div>
          <Label className="text-xs">Rol POS</Label>
          <select value={form.pos_role} onChange={(e: any) => setForm({ ...form, pos_role: e.target.value })} className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
            {POS_ROLES.map((r: string) => <option key={r} value={r}>{r}</option>)}
          </select>
        </div>
        <div>
          <Label className="text-xs">Email del usuario</Label>
          <Input value={form.user_email} onChange={(e: any) => setForm({ ...form, user_email: e.target.value })} type="email" placeholder="correo@ejemplo.com" />
        </div>
        <div>
          <Label className="text-xs">Nombre</Label>
          <Input value={form.display_name} onChange={(e: any) => setForm({ ...form, display_name: e.target.value })} placeholder="Nombre visible" />
        </div>
      </div>
      <div>
        <Label className="text-xs">Notas</Label>
        <Input value={form.notes} onChange={(e: any) => setForm({ ...form, notes: e.target.value })} placeholder="Observaciones internas..." />
      </div>
      <Button size="sm" onClick={onAdd} disabled={saving}>
        {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin mr-1" /> : <Plus className="h-3.5 w-3.5 mr-1" />}
        Guardar usuario
      </Button>
    </div>
  );
}

/* ─── POS User Card (sub-component) ─── */
function POSUserCard({
  user: u,
  visiblePasswords,
  clientSessions,
  businessInfo,
  loadingSessions,
  linkingUserId,
  linkSearch,
  linkResults,
  searchingLink,
  onTogglePassword,
  onToggleActive,
  onDelete,
  onUnlink,
  onStartLink,
  onLinkSearchChange,
  onLinkUser,
  onCancelLink,
}: {
  user: POSUser;
  visiblePasswords: Set<string>;
  clientSessions: ClientSession[];
  businessInfo: BusinessInfo | null | undefined;
  loadingSessions: boolean;
  linkingUserId: string | null;
  linkSearch: string;
  linkResults: ProfileResult[];
  searchingLink: boolean;
  onTogglePassword: () => void;
  onToggleActive: () => void;
  onDelete: () => void;
  onUnlink: () => void;
  onStartLink: () => void;
  onLinkSearchChange: (v: string) => void;
  onLinkUser: (p: ProfileResult) => void;
  onCancelLink: () => void;
}) {
  const formatDate = (d: string) => new Date(d).toLocaleDateString("es-CO", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });

  return (
    <div className={`rounded-lg border p-3 text-sm ${u.is_active ? "bg-card" : "bg-muted/50 opacity-70"}`}>
      <div className="flex items-start justify-between gap-2">
        <div className="space-y-1 flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-medium">{u.display_name || u.pos_username}</span>
            <Badge variant={u.is_active ? "default" : "secondary"} className="text-[10px]">{u.pos_role}</Badge>
            {!u.is_active && <Badge variant="secondary" className="text-[10px]">Inactivo</Badge>}
            {u.user_id ? (
              <div className="flex items-center gap-1">
                <Badge variant="outline" className="text-[10px] gap-1 border-green-300 text-green-700 dark:border-green-700 dark:text-green-400">
                  <Link2 className="h-2.5 w-2.5" /> Vinculado
                </Badge>
                <button onClick={onUnlink} className="text-[10px] text-muted-foreground hover:text-foreground" title="Desvincular usuario">
                  <Unlink className="h-3 w-3" />
                </button>
              </div>
            ) : (
              <button onClick={onStartLink} className="text-[10px] text-primary hover:underline flex items-center gap-0.5">
                <Link2 className="h-2.5 w-2.5" /> Vincular usuario
              </button>
            )}
          </div>
          <div className="grid grid-cols-3 gap-2 text-xs text-muted-foreground">
            <span>👤 {u.pos_username}</span>
            <span>🏢 {u.pos_store}</span>
            <span className="flex items-center gap-1">
              🔑 {visiblePasswords.has(u.id) ? u.pos_password : "••••••"}
              <button onClick={onTogglePassword} className="hover:text-foreground">
                {visiblePasswords.has(u.id) ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
              </button>
            </span>
          </div>
          {u.user_email && <p className="text-xs text-muted-foreground">📧 {u.user_email}</p>}
          {u.notes && <p className="text-xs text-muted-foreground italic">📝 {u.notes}</p>}

          {/* Business info for linked user */}
          {u.user_id && businessInfo && (
            <div className="mt-1.5 rounded border border-blue-200 dark:border-blue-800 bg-blue-50/50 dark:bg-blue-950/20 p-2 text-xs">
              <p className="font-semibold text-blue-700 dark:text-blue-400 flex items-center gap-1 mb-1">
                <Building2 className="h-3 w-3" /> Empresa vinculada
              </p>
              <div className="grid grid-cols-2 gap-1 text-blue-600 dark:text-blue-300">
                <span>{businessInfo.business_name}</span>
                {businessInfo.nit && <span>NIT: {businessInfo.nit}</span>}
                {businessInfo.city && <span>📍 {businessInfo.city}</span>}
                {businessInfo.email && <span>📧 {businessInfo.email}</span>}
              </div>
            </div>
          )}

          {/* Client POS sessions for linked user */}
          {u.user_id && clientSessions.length > 0 && (
            <div className="mt-1.5 rounded border border-green-200 dark:border-green-800 bg-green-50/50 dark:bg-green-950/20 p-2 text-xs">
              <p className="font-semibold text-green-700 dark:text-green-400 flex items-center gap-1 mb-1">
                <Monitor className="h-3 w-3" /> Sesiones desde portal cliente ({clientSessions.length})
              </p>
              {clientSessions.map(s => (
                <div key={s.id} className="flex items-center justify-between text-green-600 dark:text-green-300 py-0.5">
                  <span>{s.pos_username} @ {s.pos_store}</span>
                  <span className="text-[10px]">{formatDate(s.last_success_at)}</span>
                </div>
              ))}
            </div>
          )}

          {u.user_id && !loadingSessions && clientSessions.length === 0 && (
            <p className="text-[10px] text-muted-foreground mt-1">⚠️ Sin sesiones desde el portal de clientes</p>
          )}

          {/* Inline link search */}
          {linkingUserId === u.id && (
            <div className="mt-2 rounded border bg-muted/30 p-2 space-y-2">
              <div className="relative">
                <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-3 w-3 text-muted-foreground" />
                <Input
                  value={linkSearch}
                  onChange={(e) => onLinkSearchChange(e.target.value)}
                  placeholder="Buscar usuario de la plataforma..."
                  className="pl-7 text-xs h-8"
                  autoFocus
                />
                {searchingLink && <Loader2 className="absolute right-2 top-1/2 -translate-y-1/2 h-3 w-3 animate-spin" />}
              </div>
              {linkResults.map((p) => (
                <button key={p.user_id} onClick={() => onLinkUser(p)} className="w-full text-left px-2 py-1.5 text-xs hover:bg-accent rounded flex items-center gap-2">
                  <Link2 className="h-3 w-3 text-primary shrink-0" />
                  <span className="font-medium">{p.full_name || "Sin nombre"}</span>
                  <span className="text-muted-foreground">{p.email}</span>
                </button>
              ))}
              <Button size="sm" variant="ghost" className="text-xs h-6" onClick={onCancelLink}>Cancelar</Button>
            </div>
          )}
        </div>
        <div className="flex gap-1 shrink-0">
          <Button size="sm" variant="ghost" onClick={onToggleActive} title={u.is_active ? "Desactivar" : "Activar"}>
            {u.is_active ? "⏸" : "▶"}
          </Button>
          <Button size="sm" variant="ghost" className="text-destructive" onClick={onDelete}>
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>
    </div>
  );
}
