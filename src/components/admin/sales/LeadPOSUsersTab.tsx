import { useEffect, useState, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import {
  Plus, Trash2, Eye, EyeOff, UserPlus, Loader2, Users,
  LogIn, CheckCircle2, XCircle, AlertCircle, Copy, MessageCircle,
  Pencil, Save, X,
} from "lucide-react";
import { buildWhatsAppUrl, WHATSAPP_DEFAULT_NUMBER } from "@/hooks/useWhatsAppConfig";
import { useAuth } from "@/hooks/useAuth";

interface LeadPOSUser {
  id: string;
  lead_id: string;
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
  leadId: string;
  storeName: string; // POS short store name
  contactPhone?: string | null;
  // Defaults to seed the form from the primary credentials sent
  defaultUsername?: string | null;
  defaultPassword?: string | null;
}

const POS_ROLES = ["superadmin", "admin", "cajero", "mesero", "bodeguero", "contador", "otro"];

export function LeadPOSUsersTab({ leadId, storeName, contactPhone, defaultUsername, defaultPassword }: Props) {
  const { toast } = useToast();
  const { user } = useAuth();
  const [users, setUsers] = useState<LeadPOSUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [visiblePasswords, setVisiblePasswords] = useState<Set<string>>(new Set());
  const [showFormPassword, setShowFormPassword] = useState(false);

  const [form, setForm] = useState({
    pos_username: defaultUsername || "",
    pos_password: defaultPassword || "",
    pos_role: "admin",
    user_email: "",
    display_name: "",
    notes: "",
  });

  const [verifyingId, setVerifyingId] = useState<string | null>(null);
  const [verifyStatus, setVerifyStatus] = useState<Record<string, "success" | "error" | null>>({});

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({ pos_username: "", pos_password: "", pos_role: "", display_name: "", notes: "" });
  const [savingEdit, setSavingEdit] = useState(false);

  const loginFormRef = useRef<HTMLFormElement>(null);

  const load = async () => {
    setLoading(true);
    const { data, error } = await supabase.rpc("get_pos_users_for_lead", { _lead_id: leadId });
    if (error) {
      toast({ title: "Error al cargar usuarios POS", variant: "destructive" });
    } else {
      setUsers((data as LeadPOSUser[]) || []);
    }
    setLoading(false);
  };

  useEffect(() => { load(); }, [leadId]);

  // Refresh defaults when they become available (e.g. once credentials are sent)
  useEffect(() => {
    setForm((p) => ({
      ...p,
      pos_username: p.pos_username || defaultUsername || "",
      pos_password: p.pos_password || defaultPassword || "",
    }));
  }, [defaultUsername, defaultPassword]);

  const handleAdd = async () => {
    if (!form.pos_username || !form.pos_password) {
      toast({ title: "Usuario y contraseña son requeridos", variant: "destructive" });
      return;
    }
    setSaving(true);
    const { error } = await supabase.rpc("insert_pos_user_for_lead", {
      _lead_id: leadId,
      _pos_username: form.pos_username,
      _pos_store: storeName,
      _pos_password: form.pos_password,
      _pos_role: form.pos_role,
      _user_email: form.user_email || null,
      _display_name: form.display_name || null,
      _notes: form.notes || null,
      _registered_by: user?.id || null,
    });
    setSaving(false);
    if (error) {
      toast({ title: "Error: " + error.message, variant: "destructive" });
    } else {
      toast({ title: "Usuario POS registrado" });
      setForm({ pos_username: "", pos_password: "", pos_role: "admin", user_email: "", display_name: "", notes: "" });
      setShowForm(false);
      load();
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("¿Eliminar este usuario POS?")) return;
    const { error } = await supabase.rpc("delete_pos_user", { _id: id });
    if (error) toast({ title: "Error al eliminar", variant: "destructive" });
    else { toast({ title: "Usuario POS eliminado" }); load(); }
  };

  const togglePassword = (id: string) =>
    setVisiblePasswords((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });

  const toggleActive = async (u: LeadPOSUser) => {
    await supabase.rpc("update_pos_user", { _id: u.id, _is_active: !u.is_active });
    load();
  };

  const startEdit = (u: LeadPOSUser) => {
    setEditingId(u.id);
    setEditForm({
      pos_username: u.pos_username, pos_password: u.pos_password, pos_role: u.pos_role,
      display_name: u.display_name || "", notes: u.notes || "",
    });
  };
  const cancelEdit = () => setEditingId(null);

  const handleSaveEdit = async (u: LeadPOSUser) => {
    setSavingEdit(true);
    const { error } = await supabase.rpc("update_pos_user", {
      _id: u.id,
      _pos_username: editForm.pos_username || undefined,
      _pos_password: editForm.pos_password || undefined,
      _pos_role: editForm.pos_role || undefined,
      _display_name: editForm.display_name || undefined,
      _notes: editForm.notes || undefined,
    } as any);
    setSavingEdit(false);
    if (error) toast({ title: "Error al actualizar", description: error.message, variant: "destructive" });
    else { toast({ title: "Usuario POS actualizado" }); setEditingId(null); load(); }
  };

  const buildCredentialMessage = (u: LeadPOSUser) =>
    `*Acceso al POS SistecPOS*\n\nLink: https://sistecpos.com/clientes/#pos\n\nUsuario: ${u.pos_username}\nTienda: ${storeName || u.pos_store}\nClave: ${u.pos_password}`;

  const handleCopyCredentials = async (u: LeadPOSUser) => {
    const text = `Acceso al POS SistecPOS\n\nLink: https://sistecpos.com/clientes/#pos\n\nUsuario: ${u.pos_username}\nTienda: ${storeName || u.pos_store}\nClave: ${u.pos_password}`;
    try { await navigator.clipboard.writeText(text); toast({ title: "Credenciales copiadas al portapapeles" }); }
    catch { toast({ title: "Error al copiar", variant: "destructive" }); }
  };

  const handleWhatsAppCredentials = (u: LeadPOSUser) => {
    const phone = (contactPhone || WHATSAPP_DEFAULT_NUMBER).replace(/\D/g, "");
    window.open(buildWhatsAppUrl(phone, buildCredentialMessage(u)), "_blank");
  };

  const handlePosLogin = (u: LeadPOSUser) => {
    const f = loginFormRef.current;
    if (!f) return;
    (f.querySelector('[name="username"]') as HTMLInputElement).value = u.pos_username;
    (f.querySelector('[name="store"]') as HTMLInputElement).value = storeName || u.pos_store;
    (f.querySelector('[name="password"]') as HTMLInputElement).value = u.pos_password;
    (f.querySelector('[name="remember_user"]') as HTMLInputElement).value = "1";
    f.submit();
  };

  const handleVerifyUser = async (u: LeadPOSUser) => {
    setVerifyingId(u.id);
    setVerifyStatus((p) => ({ ...p, [u.id]: null }));
    try {
      const { data, error } = await supabase.functions.invoke("validate-pos-login", {
        body: { username: u.pos_username, password: u.pos_password, store: storeName || u.pos_store, consent: false },
      });
      if (error) {
        setVerifyStatus((p) => ({ ...p, [u.id]: "error" }));
        toast({ title: "Error al verificar", description: error.message, variant: "destructive" });
      } else if (data?.success) {
        setVerifyStatus((p) => ({ ...p, [u.id]: "success" }));
        toast({ title: "✅ Credenciales verificadas" });
      } else {
        setVerifyStatus((p) => ({ ...p, [u.id]: "error" }));
        toast({ title: "⚠️ No se pudo verificar", description: data?.message || "Credenciales incorrectas.", variant: "destructive" });
      }
    } catch {
      setVerifyStatus((p) => ({ ...p, [u.id]: "error" }));
      toast({ title: "Error de conexión", variant: "destructive" });
    } finally {
      setVerifyingId(null);
    }
  };

  return (
    <div className="space-y-3">
      <form ref={loginFormRef} method="POST" action="https://softwarepos.online/index.php/login/index/1" target="_blank" className="hidden">
        <input name="username" /><input name="store" /><input name="password" /><input name="remember_user" />
      </form>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Users className="h-4 w-4 text-muted-foreground" />
          <h4 className="text-sm font-semibold">Usuarios POS del prospecto ({users.length})</h4>
        </div>
        <Button size="sm" variant="outline" onClick={() => setShowForm(!showForm)}>
          {showForm ? "Cancelar" : <><UserPlus className="h-3.5 w-3.5 mr-1" /> Agregar</>}
        </Button>
      </div>

      <p className="text-[11px] text-muted-foreground">
        Tienda POS: <strong>{storeName || "(sin nombre corto)"}</strong>. Estos usuarios se migran automáticamente a la licencia al convertir el demo.
      </p>

      {showForm && (
        <div className="rounded-lg border bg-muted/30 p-3 space-y-2">
          <div className="grid grid-cols-2 gap-2">
            <div>
              <Label className="text-xs">Usuario POS *</Label>
              <Input value={form.pos_username} onChange={(e) => setForm({ ...form, pos_username: e.target.value })} placeholder="usuario" />
            </div>
            <div>
              <Label className="text-xs">Contraseña *</Label>
              <div className="relative">
                <Input value={form.pos_password} onChange={(e) => setForm({ ...form, pos_password: e.target.value })} type={showFormPassword ? "text" : "password"} placeholder="contraseña" className="pr-9" />
                <button type="button" onClick={() => setShowFormPassword(!showFormPassword)} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground">
                  {showFormPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
            <div>
              <Label className="text-xs">Rol</Label>
              <select value={form.pos_role} onChange={(e) => setForm({ ...form, pos_role: e.target.value })} className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
                {POS_ROLES.map((r) => <option key={r} value={r}>{r}</option>)}
              </select>
            </div>
            <div>
              <Label className="text-xs">Nombre visible</Label>
              <Input value={form.display_name} onChange={(e) => setForm({ ...form, display_name: e.target.value })} placeholder="Nombre" />
            </div>
          </div>
          <div>
            <Label className="text-xs">Notas</Label>
            <Input value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} placeholder="Observaciones..." />
          </div>
          <Button size="sm" onClick={handleAdd} disabled={saving}>
            {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin mr-1" /> : <Plus className="h-3.5 w-3.5 mr-1" />}
            Guardar usuario
          </Button>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-4"><Loader2 className="h-5 w-5 animate-spin text-muted-foreground" /></div>
      ) : users.length === 0 ? (
        <p className="text-xs text-muted-foreground text-center py-3">Sin usuarios POS extra. Agrega los que el cliente esté usando realmente.</p>
      ) : (
        <div className="space-y-2">
          {users.map((u) => (
            <div key={u.id} className="rounded-lg border bg-card p-2.5 space-y-2">
              <div className="flex items-center justify-between flex-wrap gap-1">
                <div className="flex items-center gap-2 min-w-0">
                  <span className="text-sm font-medium truncate">{u.pos_username}</span>
                  <span className="text-xs text-muted-foreground truncate">@{storeName || u.pos_store}</span>
                  <Badge variant={u.is_active ? "default" : "secondary"} className="text-[10px]">{u.pos_role}</Badge>
                  {!u.is_active && <Badge variant="outline" className="text-[10px] text-destructive">Inactivo</Badge>}
                </div>
                <div className="flex items-center gap-1 flex-wrap">
                  {verifyStatus[u.id] === "success" && <CheckCircle2 className="h-4 w-4 text-emerald-500" />}
                  {verifyStatus[u.id] === "error" && <XCircle className="h-4 w-4 text-destructive" />}
                  <Button size="sm" variant="ghost" className="h-7 text-[10px] gap-1" onClick={() => handleVerifyUser(u)} disabled={verifyingId === u.id} title="Verificar credenciales">
                    {verifyingId === u.id ? <Loader2 className="h-3 w-3 animate-spin" /> : <AlertCircle className="h-3 w-3" />} Verificar
                  </Button>
                  <Button size="sm" variant="outline" className="h-7 text-[10px] gap-1" onClick={() => handlePosLogin(u)} title="Iniciar sesión POS">
                    <LogIn className="h-3 w-3" /> POS
                  </Button>
                  <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => handleCopyCredentials(u)} title="Copiar credenciales">
                    <Copy className="h-3 w-3" />
                  </Button>
                  <Button size="icon" variant="ghost" className="h-7 w-7 text-green-600" onClick={() => handleWhatsAppCredentials(u)} title="Enviar por WhatsApp">
                    <MessageCircle className="h-3 w-3" />
                  </Button>
                  <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => togglePassword(u.id)}>
                    {visiblePasswords.has(u.id) ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                  </Button>
                  <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => startEdit(u)} title="Editar">
                    <Pencil className="h-3 w-3" />
                  </Button>
                  <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => toggleActive(u)}>
                    {u.is_active ? <span className="text-[10px]">🟢</span> : <span className="text-[10px]">🔴</span>}
                  </Button>
                  <Button size="icon" variant="ghost" className="h-7 w-7 text-destructive" onClick={() => handleDelete(u.id)}>
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </div>

              {visiblePasswords.has(u.id) && editingId !== u.id && (
                <div className="text-xs font-mono bg-muted/50 rounded px-2 py-1">{u.pos_password}</div>
              )}

              {editingId === u.id && (
                <div className="rounded-lg border border-primary/30 bg-primary/5 p-2 space-y-2">
                  <div className="grid grid-cols-2 gap-2">
                    <div><Label className="text-[10px]">Usuario</Label>
                      <Input value={editForm.pos_username} onChange={(e) => setEditForm((p) => ({ ...p, pos_username: e.target.value }))} className="h-7 text-xs" /></div>
                    <div><Label className="text-[10px]">Clave</Label>
                      <Input value={editForm.pos_password} onChange={(e) => setEditForm((p) => ({ ...p, pos_password: e.target.value }))} className="h-7 text-xs" /></div>
                    <div><Label className="text-[10px]">Rol</Label>
                      <select value={editForm.pos_role} onChange={(e) => setEditForm((p) => ({ ...p, pos_role: e.target.value }))} className="h-7 w-full text-xs rounded border border-input bg-background px-2">
                        {POS_ROLES.map((r) => <option key={r} value={r}>{r}</option>)}
                      </select></div>
                    <div><Label className="text-[10px]">Nombre visible</Label>
                      <Input value={editForm.display_name} onChange={(e) => setEditForm((p) => ({ ...p, display_name: e.target.value }))} className="h-7 text-xs" /></div>
                  </div>
                  <div><Label className="text-[10px]">Notas</Label>
                    <Input value={editForm.notes} onChange={(e) => setEditForm((p) => ({ ...p, notes: e.target.value }))} className="h-7 text-xs" /></div>
                  <div className="flex gap-2">
                    <Button size="sm" className="h-7 text-xs gap-1" onClick={() => handleSaveEdit(u)} disabled={savingEdit}>
                      {savingEdit ? <Loader2 className="h-3 w-3 animate-spin" /> : <Save className="h-3 w-3" />} Guardar
                    </Button>
                    <Button size="sm" variant="ghost" className="h-7 text-xs gap-1" onClick={cancelEdit}>
                      <X className="h-3 w-3" /> Cancelar
                    </Button>
                  </div>
                </div>
              )}

              {u.notes && <p className="text-[10px] text-muted-foreground italic">{u.notes}</p>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
