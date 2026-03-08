import { useEffect, useState, useMemo, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import {
  Search, Plus, Trash2, ShieldCheck, Crown, Globe, Copy, Check,
  Users, Building2, UserPlus, Eye, EyeOff, Mail, Phone, MapPin,
  Link2, ChevronRight, Pencil, ExternalLink,
} from "lucide-react";

type AppRole = "admin" | "customer" | "reseller";

interface UserWithRoles {
  user_id: string;
  email: string;
  full_name: string | null;
  phone: string | null;
  business_id: string | null;
  roles: { id: string; role: AppRole }[];
  created_at?: string;
}

interface Business {
  id: string;
  business_name: string;
  nit: string | null;
  phone: string | null;
  email: string | null;
  city: string | null;
  address: string | null;
  owner_user_id: string;
  created_at: string;
}

const ROLE_LABELS: Record<AppRole, string> = {
  admin: "Administrador",
  reseller: "Socio",
  customer: "Cliente",
};

const ROLE_COLORS: Record<AppRole, string> = {
  admin: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300",
  reseller: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300",
  customer: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300",
};

const MASTER_EMAIL = "eduardotp77@gmail.com";

/* ───── Short UUID display ───── */
function ShortUUID({ uuid }: { uuid: string }) {
  const [copied, setCopied] = useState(false);
  const short = uuid.slice(0, 8);
  const handleCopy = async () => {
    await navigator.clipboard.writeText(uuid);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };
  return (
    <button
      onClick={handleCopy}
      className="inline-flex items-center gap-1 font-mono text-[10px] text-muted-foreground hover:text-foreground transition-colors group"
      title={uuid}
    >
      <span className="bg-muted px-1.5 py-0.5 rounded">{short}…</span>
      {copied ? <Check className="h-3 w-3 text-green-500" /> : <Copy className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />}
    </button>
  );
}

/* ───── Shareable Link Card ───── */
function ShareableLinkCard({ label, path }: { label: string; path: string }) {
  const [copied, setCopied] = useState(false);
  const fullUrl = `${window.location.origin}${path}`;
  const handleCopy = async () => {
    await navigator.clipboard.writeText(fullUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <div className="flex items-center gap-2 rounded-lg border bg-muted/30 px-3 py-2">
      <div className="flex-1 min-w-0">
        <p className="text-xs font-medium">{label}</p>
        <p className="text-[10px] text-muted-foreground truncate">{path}</p>
      </div>
      <button onClick={handleCopy} className="shrink-0 rounded-md p-1.5 hover:bg-muted transition-colors" title="Copiar enlace">
        {copied ? <Check className="h-3.5 w-3.5 text-green-500" /> : <Copy className="h-3.5 w-3.5 text-muted-foreground" />}
      </button>
    </div>
  );
}

/* ═══════════════════════════════════════════
   MAIN COMPONENT
   ═══════════════════════════════════════════ */
export default function RolesManagerView() {
  const [users, setUsers] = useState<UserWithRoles[]>([]);
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [addingRole, setAddingRole] = useState<{ userId: string; role: AppRole } | null>(null);
  const { toast } = useToast();

  /* ── Create User Dialog State ── */
  const [createOpen, setCreateOpen] = useState(false);
  const [newUser, setNewUser] = useState({ email: "", full_name: "", password: "", phone: "" });
  const [creating, setCreating] = useState(false);

  /* ── Edit User Dialog State ── */
  const [editOpen, setEditOpen] = useState(false);
  const [editUser, setEditUser] = useState<{ user_id: string; full_name: string; phone: string; email: string } | null>(null);
  const [saving, setSaving] = useState(false);

  /* ── Create Business Dialog State ── */
  const [bizOpen, setBizOpen] = useState(false);
  const [newBiz, setNewBiz] = useState({ business_name: "", nit: "", phone: "", email: "", city: "", address: "", owner_user_id: "" });
  const [creatingBiz, setCreatingBiz] = useState(false);

  /* ── Associate User-Business Dialog ── */
  const [assocOpen, setAssocOpen] = useState(false);
  const [assocData, setAssocData] = useState({ user_id: "", business_id: "" });

  const load = useCallback(async () => {
    setLoading(true);
    const [{ data: profiles }, { data: roles }, { data: biz }] = await Promise.all([
      supabase.from("profiles").select("user_id, email, full_name, phone, business_id, created_at").order("created_at", { ascending: false }),
      supabase.from("user_roles").select("id, user_id, role"),
      supabase.from("businesses").select("*").order("business_name"),
    ]);

    if (!profiles) { setLoading(false); return; }

    const rolesMap = new Map<string, { id: string; role: AppRole }[]>();
    (roles || []).forEach((r) => {
      const list = rolesMap.get(r.user_id) || [];
      list.push({ id: r.id, role: r.role as AppRole });
      rolesMap.set(r.user_id, list);
    });

    setUsers(profiles.map((p) => ({
      user_id: p.user_id,
      email: p.email || "",
      full_name: p.full_name,
      phone: p.phone,
      business_id: p.business_id,
      roles: rolesMap.get(p.user_id) || [],
      created_at: p.created_at,
    })));
    setBusinesses((biz || []) as Business[]);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  /* ── Role operations ── */
  const addRole = async (userId: string, role: AppRole) => {
    setAddingRole({ userId, role });
    const { error } = await supabase.from("user_roles").insert({ user_id: userId, role });
    if (error) {
      toast({ title: error.code === "23505" ? "Este usuario ya tiene ese rol" : "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: `Rol "${ROLE_LABELS[role]}" asignado` });
    }
    setAddingRole(null);
    load();
  };

  const removeRole = async (roleId: string, role: AppRole) => {
    const { error } = await supabase.from("user_roles").delete().eq("id", roleId);
    if (error) {
      toast({ title: "Error al quitar rol", description: error.message, variant: "destructive" });
    } else {
      toast({ title: `Rol "${ROLE_LABELS[role]}" removido` });
    }
    load();
  };

  /* ── Create user ── */
  const handleCreateUser = async () => {
    if (!newUser.email || !newUser.password) {
      toast({ title: "Email y contraseña son obligatorios", variant: "destructive" });
      return;
    }
    setCreating(true);
    // Use edge function to create user via admin API
    const { data: { session } } = await supabase.auth.getSession();
    const res = await supabase.functions.invoke("create-user-admin", {
      body: { email: newUser.email, password: newUser.password, full_name: newUser.full_name, phone: newUser.phone },
    });
    if (res.error) {
      toast({ title: "Error al crear usuario", description: res.error.message, variant: "destructive" });
    } else {
      toast({ title: "Usuario creado exitosamente" });
      setNewUser({ email: "", full_name: "", password: "", phone: "" });
      setCreateOpen(false);
      setTimeout(() => load(), 1000); // wait for trigger
    }
    setCreating(false);
  };

  /* ── Create business ── */
  const handleCreateBiz = async () => {
    if (!newBiz.business_name || !newBiz.owner_user_id) {
      toast({ title: "Nombre y propietario son obligatorios", variant: "destructive" });
      return;
    }
    setCreatingBiz(true);
    const { error } = await supabase.from("businesses").insert({
      business_name: newBiz.business_name,
      nit: newBiz.nit || null,
      phone: newBiz.phone || null,
      email: newBiz.email || null,
      city: newBiz.city || null,
      address: newBiz.address || null,
      owner_user_id: newBiz.owner_user_id,
    });
    if (error) {
      toast({ title: "Error al crear empresa", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Empresa creada exitosamente" });
      setNewBiz({ business_name: "", nit: "", phone: "", email: "", city: "", address: "", owner_user_id: "" });
      setBizOpen(false);
      load();
    }
    setCreatingBiz(false);
  };

  /* ── Associate user to business ── */
  const handleAssociate = async () => {
    if (!assocData.user_id || !assocData.business_id) return;
    const { error } = await supabase.from("profiles").update({ business_id: assocData.business_id }).eq("user_id", assocData.user_id);
    if (error) {
      toast({ title: "Error al asociar", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Usuario asociado a empresa" });
      setAssocOpen(false);
      load();
    }
  };

  /* ── Edit user ── */
  const handleEditUser = async () => {
    if (!editUser) return;
    setSaving(true);
    const { error } = await supabase.from("profiles").update({
      full_name: editUser.full_name || null,
      phone: editUser.phone || null,
      email: editUser.email || null,
    }).eq("user_id", editUser.user_id);
    if (error) {
      toast({ title: "Error al actualizar", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Usuario actualizado" });
      setEditOpen(false);
      setEditUser(null);
      load();
    }
    setSaving(false);
  };

  const openEdit = (u: UserWithRoles) => {
    setEditUser({ user_id: u.user_id, full_name: u.full_name || "", phone: u.phone || "", email: u.email });
    setEditOpen(true);
  };


  const filtered = useMemo(() => {
    return users.filter((u) => {
      const q = search.toLowerCase();
      const matchesSearch = u.email.toLowerCase().includes(q) || (u.full_name || "").toLowerCase().includes(q) || u.user_id.includes(q);
      if (!matchesSearch) return false;
      if (roleFilter === "all") return true;
      if (roleFilter === "public") return u.roles.length === 0;
      return u.roles.some((r) => r.role === roleFilter);
    });
  }, [users, search, roleFilter]);

  const stats = useMemo(() => ({
    total: users.length,
    admins: users.filter(u => u.roles.some(r => r.role === "admin")).length,
    resellers: users.filter(u => u.roles.some(r => r.role === "reseller")).length,
    customers: users.filter(u => u.roles.some(r => r.role === "customer")).length,
    public: users.filter(u => u.roles.length === 0).length,
  }), [users]);

  const getBizName = (bizId: string | null) => {
    if (!bizId) return null;
    return businesses.find(b => b.id === bizId)?.business_name || null;
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2">
          <ShieldCheck className="h-6 w-6 text-primary" />
          <div>
            <h1 className="text-2xl font-bold font-display">Gestión de Usuarios y Roles</h1>
            <p className="text-sm text-muted-foreground">Administra usuarios, roles de acceso y empresas</p>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        {[
          { label: "Total", count: stats.total, color: "bg-muted" },
          { label: "Admins", count: stats.admins, color: "bg-red-100 dark:bg-red-900/20" },
          { label: "Socios", count: stats.resellers, color: "bg-blue-100 dark:bg-blue-900/20" },
          { label: "Clientes", count: stats.customers, color: "bg-green-100 dark:bg-green-900/20" },
          { label: "Públicos", count: stats.public, color: "bg-amber-100 dark:bg-amber-900/20" },
        ].map(s => (
          <Card key={s.label} className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setRoleFilter(s.label === "Total" ? "all" : s.label === "Admins" ? "admin" : s.label === "Socios" ? "reseller" : s.label === "Clientes" ? "customer" : "public")}>
            <CardContent className="p-3 text-center">
              <p className="text-2xl font-bold">{s.count}</p>
              <p className="text-xs text-muted-foreground">{s.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Tabs defaultValue="users" className="space-y-4">
        <TabsList className="h-auto gap-1">
          <TabsTrigger value="users" className="gap-2"><Users className="h-4 w-4" />Usuarios</TabsTrigger>
          <TabsTrigger value="businesses" className="gap-2"><Building2 className="h-4 w-4" />Empresas</TabsTrigger>
          <TabsTrigger value="links" className="gap-2"><Link2 className="h-4 w-4" />Enlaces</TabsTrigger>
        </TabsList>

        {/* ═══ USERS TAB ═══ */}
        <TabsContent value="users" className="space-y-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-1 gap-2">
              <div className="relative flex-1 sm:max-w-sm">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Buscar por nombre, email o ID..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
              </div>
              <Select value={roleFilter} onValueChange={setRoleFilter}>
                <SelectTrigger className="w-36">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="admin">Admins</SelectItem>
                  <SelectItem value="reseller">Socios</SelectItem>
                  <SelectItem value="customer">Clientes</SelectItem>
                  <SelectItem value="public">Públicos</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex gap-2">
              <Dialog open={assocOpen} onOpenChange={setAssocOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm" className="gap-2"><Building2 className="h-4 w-4" />Asociar</Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Asociar Usuario a Empresa</DialogTitle>
                    <DialogDescription>Vincula un usuario registrado a una empresa existente.</DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 py-2">
                    <div className="space-y-2">
                      <Label>Usuario</Label>
                      <Select value={assocData.user_id} onValueChange={v => setAssocData(p => ({ ...p, user_id: v }))}>
                        <SelectTrigger><SelectValue placeholder="Seleccionar usuario" /></SelectTrigger>
                        <SelectContent>
                          {users.map(u => (
                            <SelectItem key={u.user_id} value={u.user_id}>
                              {u.full_name || u.email} <span className="text-muted-foreground text-xs ml-1">({u.user_id.slice(0, 8)})</span>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Empresa</Label>
                      <Select value={assocData.business_id} onValueChange={v => setAssocData(p => ({ ...p, business_id: v }))}>
                        <SelectTrigger><SelectValue placeholder="Seleccionar empresa" /></SelectTrigger>
                        <SelectContent>
                          {businesses.map(b => (
                            <SelectItem key={b.id} value={b.id}>
                              {b.business_name} {b.nit && <span className="text-muted-foreground text-xs ml-1">NIT: {b.nit}</span>}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button onClick={handleAssociate} disabled={!assocData.user_id || !assocData.business_id}>Asociar</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
              <Dialog open={createOpen} onOpenChange={setCreateOpen}>
                <DialogTrigger asChild>
                  <Button size="sm" className="gap-2"><UserPlus className="h-4 w-4" />Crear Usuario</Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Crear Nuevo Usuario</DialogTitle>
                    <DialogDescription>El usuario se creará con perfil "Público" hasta que le asignes un rol.</DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 py-2">
                    <div className="space-y-2">
                      <Label>Email *</Label>
                      <Input type="email" value={newUser.email} onChange={e => setNewUser(p => ({ ...p, email: e.target.value }))} placeholder="usuario@email.com" />
                    </div>
                    <div className="space-y-2">
                      <Label>Nombre completo</Label>
                      <Input value={newUser.full_name} onChange={e => setNewUser(p => ({ ...p, full_name: e.target.value }))} placeholder="Juan Pérez" />
                    </div>
                    <div className="space-y-2">
                      <Label>Teléfono</Label>
                      <Input value={newUser.phone} onChange={e => setNewUser(p => ({ ...p, phone: e.target.value }))} placeholder="+57 300 123 4567" />
                    </div>
                    <div className="space-y-2">
                      <Label>Contraseña *</Label>
                      <Input type="password" value={newUser.password} onChange={e => setNewUser(p => ({ ...p, password: e.target.value }))} placeholder="Mínimo 6 caracteres" />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button onClick={handleCreateUser} disabled={creating}>{creating ? "Creando..." : "Crear Usuario"}</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </div>

          <div className="rounded-lg border bg-card overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="px-4 py-3 text-left font-medium">Usuario</th>
                  <th className="px-4 py-3 text-left font-medium hidden sm:table-cell">Empresa</th>
                  <th className="px-4 py-3 text-left font-medium">Roles</th>
                  <th className="px-4 py-3 text-left font-medium">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={4} className="py-8 text-center text-muted-foreground">Cargando...</td></tr>
                ) : filtered.length === 0 ? (
                  <tr><td colSpan={4} className="py-8 text-center text-muted-foreground">No se encontraron usuarios</td></tr>
                ) : (
                  filtered.map((u) => {
                    const isMaster = u.email.toLowerCase() === MASTER_EMAIL;
                    const existingRoles = new Set(u.roles.map(r => r.role));
                    const availableRoles = (["admin", "reseller", "customer"] as AppRole[]).filter(r => !existingRoles.has(r));
                    const bizName = getBizName(u.business_id);

                    return (
                      <tr key={u.user_id} className={`border-b hover:bg-muted/30 transition-colors ${isMaster ? "bg-amber-500/5" : ""}`}>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-1.5">
                            <span className="font-medium">{u.full_name || "Sin nombre"}</span>
                            {isMaster && <span title="Usuario Maestro"><Crown className="h-4 w-4 text-amber-500" /></span>}
                          </div>
                          <div className="text-xs text-muted-foreground">{u.email}</div>
                          <ShortUUID uuid={u.user_id} />
                          {u.phone && <div className="text-[10px] text-muted-foreground flex items-center gap-1 mt-0.5"><Phone className="h-2.5 w-2.5" />{u.phone}</div>}
                        </td>
                        <td className="px-4 py-3 hidden sm:table-cell">
                          {bizName ? (
                            <Badge variant="outline" className="gap-1 text-xs"><Building2 className="h-3 w-3" />{bizName}</Badge>
                          ) : (
                            <span className="text-xs text-muted-foreground">Sin empresa</span>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex flex-wrap gap-1.5">
                            {u.roles.length === 0 ? (
                              <Badge variant="outline" className="text-xs text-muted-foreground gap-1">
                                <Globe className="h-3 w-3" />Público
                              </Badge>
                            ) : (
                              u.roles.map((r) => (
                                <Badge key={r.id} variant="secondary" className={`${ROLE_COLORS[r.role]} gap-1 ${isMaster ? "pr-2" : "pr-1"}`}>
                                  {ROLE_LABELS[r.role]}
                                  {!isMaster && (
                                    <button onClick={() => removeRole(r.id, r.role)} className="ml-0.5 rounded-full p-0.5 hover:bg-black/10 dark:hover:bg-white/10 transition-colors" title={`Quitar ${ROLE_LABELS[r.role]}`}>
                                      <Trash2 className="h-3 w-3" />
                                    </button>
                                  )}
                                </Badge>
                              ))
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-1">
                            {!isMaster && (
                              <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => openEdit(u)} title="Editar usuario">
                                <Pencil className="h-3.5 w-3.5" />
                              </Button>
                            )}
                            {isMaster ? (
                              <span className="text-xs text-amber-600 dark:text-amber-400 font-medium">Protegido</span>
                            ) : availableRoles.length === 0 ? (
                              <span className="text-xs text-muted-foreground">Todos asignados</span>
                            ) : (
                              <Select onValueChange={(role) => addRole(u.user_id, role as AppRole)} disabled={!!addingRole && addingRole.userId === u.user_id}>
                                <SelectTrigger className="w-36 h-8 text-xs">
                                  <SelectValue placeholder="Asignar rol" />
                                </SelectTrigger>
                                <SelectContent>
                                  {availableRoles.map((r) => (
                                    <SelectItem key={r} value={r}>
                                      <div className="flex items-center gap-2"><Plus className="h-3 w-3" />{ROLE_LABELS[r]}</div>
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          <p className="text-xs text-muted-foreground text-right">{filtered.length} de {users.length} usuarios</p>
        </TabsContent>

        {/* ═══ BUSINESSES TAB ═══ */}
        <TabsContent value="businesses" className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">{businesses.length} empresas registradas</p>
            <Dialog open={bizOpen} onOpenChange={setBizOpen}>
              <DialogTrigger asChild>
                <Button size="sm" className="gap-2"><Plus className="h-4 w-4" />Nueva Empresa</Button>
              </DialogTrigger>
              <DialogContent className="max-w-lg">
                <DialogHeader>
                  <DialogTitle>Crear Empresa</DialogTitle>
                  <DialogDescription>Registra una nueva empresa y asóciala a un usuario propietario.</DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-2 sm:grid-cols-2">
                  <div className="space-y-2 sm:col-span-2">
                    <Label>Razón Social *</Label>
                    <Input value={newBiz.business_name} onChange={e => setNewBiz(p => ({ ...p, business_name: e.target.value }))} placeholder="Mi Negocio S.A.S" />
                  </div>
                  <div className="space-y-2">
                    <Label>NIT</Label>
                    <Input value={newBiz.nit} onChange={e => setNewBiz(p => ({ ...p, nit: e.target.value }))} placeholder="900.123.456-7" />
                  </div>
                  <div className="space-y-2">
                    <Label>Teléfono</Label>
                    <Input value={newBiz.phone} onChange={e => setNewBiz(p => ({ ...p, phone: e.target.value }))} placeholder="+57 300 123 4567" />
                  </div>
                  <div className="space-y-2">
                    <Label>Email</Label>
                    <Input type="email" value={newBiz.email} onChange={e => setNewBiz(p => ({ ...p, email: e.target.value }))} placeholder="contacto@empresa.com" />
                  </div>
                  <div className="space-y-2">
                    <Label>Ciudad</Label>
                    <Input value={newBiz.city} onChange={e => setNewBiz(p => ({ ...p, city: e.target.value }))} placeholder="Bogotá" />
                  </div>
                  <div className="space-y-2 sm:col-span-2">
                    <Label>Dirección</Label>
                    <Input value={newBiz.address} onChange={e => setNewBiz(p => ({ ...p, address: e.target.value }))} placeholder="Calle 123 #45-67" />
                  </div>
                  <div className="space-y-2 sm:col-span-2">
                    <Label>Usuario Propietario *</Label>
                    <Select value={newBiz.owner_user_id} onValueChange={v => setNewBiz(p => ({ ...p, owner_user_id: v }))}>
                      <SelectTrigger><SelectValue placeholder="Seleccionar propietario" /></SelectTrigger>
                      <SelectContent>
                        {users.map(u => (
                          <SelectItem key={u.user_id} value={u.user_id}>
                            {u.full_name || u.email} <span className="text-muted-foreground text-xs">({u.user_id.slice(0, 8)})</span>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <DialogFooter>
                  <Button onClick={handleCreateBiz} disabled={creatingBiz}>{creatingBiz ? "Creando..." : "Crear Empresa"}</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {businesses.map(biz => {
              const owner = users.find(u => u.user_id === biz.owner_user_id);
              const members = users.filter(u => u.business_id === biz.id);
              return (
                <Card key={biz.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4 space-y-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-semibold text-sm">{biz.business_name}</h3>
                        {biz.nit && <p className="text-xs text-muted-foreground">NIT: {biz.nit}</p>}
                      </div>
                      <ShortUUID uuid={biz.id} />
                    </div>
                    <div className="space-y-1 text-xs text-muted-foreground">
                      {biz.email && <div className="flex items-center gap-1.5"><Mail className="h-3 w-3" />{biz.email}</div>}
                      {biz.phone && <div className="flex items-center gap-1.5"><Phone className="h-3 w-3" />{biz.phone}</div>}
                      {biz.city && <div className="flex items-center gap-1.5"><MapPin className="h-3 w-3" />{biz.city}</div>}
                    </div>
                    <div className="border-t pt-2">
                      <p className="text-[10px] uppercase tracking-wider text-muted-foreground/70 mb-1">Propietario</p>
                      <p className="text-xs font-medium">{owner?.full_name || owner?.email || "No encontrado"}</p>
                    </div>
                    {members.length > 0 && (
                      <div>
                        <p className="text-[10px] uppercase tracking-wider text-muted-foreground/70 mb-1">Miembros ({members.length})</p>
                        <div className="space-y-1">
                          {members.slice(0, 3).map(m => (
                            <p key={m.user_id} className="text-xs">{m.full_name || m.email}</p>
                          ))}
                          {members.length > 3 && <p className="text-xs text-muted-foreground">+{members.length - 3} más</p>}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
            {businesses.length === 0 && (
              <div className="col-span-full py-12 text-center text-muted-foreground">No hay empresas registradas</div>
            )}
          </div>
        </TabsContent>

        {/* ═══ LINKS TAB ═══ */}
        <TabsContent value="links" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2"><Globe className="h-4 w-4 text-primary" />Enlaces de registro por rol</CardTitle>
              <CardDescription>Comparte estos enlaces para que nuevos usuarios se registren con un contexto específico. Luego asígnales el rol desde la pestaña Usuarios.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-2 sm:grid-cols-3">
                {[
                  { label: "Registro Cliente", path: "/auth?registro=cliente" },
                  { label: "Registro Socio", path: "/auth?registro=socio" },
                  { label: "Registro Admin", path: "/auth?registro=admin" },
                ].map(l => <ShareableLinkCard key={l.path} label={l.label} path={l.path} />)}
              </div>
            </CardContent>
          </Card>

          <Card className="border-amber-200 dark:border-amber-900/50 bg-amber-50 dark:bg-amber-950/20">
            <CardContent className="p-4">
              <h4 className="font-semibold text-sm mb-2">Alcance de cada perfil</h4>
              <div className="space-y-2 text-xs">
                <div className="flex gap-2">
                  <Badge className={ROLE_COLORS.admin}>Admin</Badge>
                  <span>Acceso total al panel /admin. Gestión completa de la plataforma.</span>
                </div>
                <div className="flex gap-2">
                  <Badge className={ROLE_COLORS.reseller}>Socio</Badge>
                  <span>Portal /socio: licencias, demos, comisiones, entrenamientos, tickets.</span>
                </div>
                <div className="flex gap-2">
                  <Badge className={ROLE_COLORS.customer}>Cliente</Badge>
                  <span>Portal /clientes: Mi POS, soporte, descargas, facturación, entrenamientos.</span>
                </div>
                <div className="flex gap-2">
                  <Badge variant="outline" className="text-xs"><Globe className="h-3 w-3 mr-1" />Público</Badge>
                  <span>Acceso limitado a Mi POS y Entrenamientos (público + cliente). Sin soporte ni facturación.</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* ═══ EDIT USER DIALOG ═══ */}
      <Dialog open={editOpen} onOpenChange={(open) => { setEditOpen(open); if (!open) setEditUser(null); }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Usuario</DialogTitle>
            <DialogDescription>Modifica los datos del perfil del usuario.</DialogDescription>
          </DialogHeader>
          {editUser && (
            <div className="space-y-4 py-2">
              <div className="space-y-2">
                <Label>Email</Label>
                <Input value={editUser.email} onChange={e => setEditUser(p => p ? { ...p, email: e.target.value } : p)} placeholder="usuario@email.com" />
              </div>
              <div className="space-y-2">
                <Label>Nombre completo</Label>
                <Input value={editUser.full_name} onChange={e => setEditUser(p => p ? { ...p, full_name: e.target.value } : p)} placeholder="Juan Pérez" />
              </div>
              <div className="space-y-2">
                <Label>Teléfono</Label>
                <Input value={editUser.phone} onChange={e => setEditUser(p => p ? { ...p, phone: e.target.value } : p)} placeholder="+57 300 123 4567" />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditOpen(false)}>Cancelar</Button>
            <Button onClick={handleEditUser} disabled={saving}>{saving ? "Guardando..." : "Guardar"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
