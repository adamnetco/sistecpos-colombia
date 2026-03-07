import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Search, Plus, Trash2, ShieldCheck, Crown, Globe, Copy, Check } from "lucide-react";
import { useToast as useToastSonner } from "@/hooks/use-toast";

type AppRole = "admin" | "customer" | "reseller";

interface UserWithRoles {
  user_id: string;
  email: string;
  full_name: string | null;
  roles: { id: string; role: AppRole }[];
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
      <button
        onClick={handleCopy}
        className="shrink-0 rounded-md p-1.5 hover:bg-muted transition-colors"
        title="Copiar enlace"
      >
        {copied ? <Check className="h-3.5 w-3.5 text-green-500" /> : <Copy className="h-3.5 w-3.5 text-muted-foreground" />}
      </button>
    </div>
  );
}

export default function RolesManagerView() {
  const [users, setUsers] = useState<UserWithRoles[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [addingRole, setAddingRole] = useState<{ userId: string; role: AppRole } | null>(null);
  const { toast } = useToast();

  const load = async () => {
    setLoading(true);

    // Get all profiles
    const { data: profiles } = await supabase
      .from("profiles")
      .select("user_id, email, full_name")
      .order("created_at", { ascending: false });

    // Get all roles
    const { data: roles } = await supabase
      .from("user_roles")
      .select("id, user_id, role");

    if (!profiles) {
      setLoading(false);
      return;
    }

    const rolesMap = new Map<string, { id: string; role: AppRole }[]>();
    (roles || []).forEach((r) => {
      const list = rolesMap.get(r.user_id) || [];
      list.push({ id: r.id, role: r.role as AppRole });
      rolesMap.set(r.user_id, list);
    });

    const merged: UserWithRoles[] = profiles.map((p) => ({
      user_id: p.user_id,
      email: p.email || "",
      full_name: p.full_name,
      roles: rolesMap.get(p.user_id) || [],
    }));

    setUsers(merged);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const addRole = async (userId: string, role: AppRole) => {
    setAddingRole({ userId, role });
    const { error } = await supabase.from("user_roles").insert({ user_id: userId, role });
    if (error) {
      if (error.code === "23505") {
        toast({ title: "Este usuario ya tiene ese rol" });
      } else {
        toast({ title: "Error al agregar rol", description: error.message, variant: "destructive" });
      }
    } else {
      toast({ title: `Rol "${ROLE_LABELS[role]}" asignado correctamente` });
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

  const filtered = users.filter((u) => {
    const q = search.toLowerCase();
    return (
      u.email.toLowerCase().includes(q) ||
      (u.full_name || "").toLowerCase().includes(q)
    );
  });

  return (
    <div>
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2">
          <ShieldCheck className="h-6 w-6 text-primary" />
          <h1 className="text-2xl font-bold font-display">Gestión de Roles</h1>
        </div>
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por nombre o email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      <div className="rounded-lg border bg-card overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-muted/50">
              <th className="px-4 py-3 text-left font-medium">Usuario</th>
              <th className="px-4 py-3 text-left font-medium">Roles actuales</th>
              <th className="px-4 py-3 text-left font-medium">Agregar rol</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={3} className="py-8 text-center text-muted-foreground">Cargando...</td></tr>
            ) : filtered.length === 0 ? (
              <tr><td colSpan={3} className="py-8 text-center text-muted-foreground">No se encontraron usuarios</td></tr>
            ) : (
              filtered.map((u) => {
                const isMaster = u.email.toLowerCase() === MASTER_EMAIL;
                const existingRoles = new Set(u.roles.map((r) => r.role));
                const availableRoles = (["admin", "reseller", "customer"] as AppRole[]).filter(
                  (r) => !existingRoles.has(r)
                );

                return (
                  <tr key={u.user_id} className={`border-b hover:bg-muted/30 transition-colors ${isMaster ? "bg-amber-500/5" : ""}`}>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5">
                        <span className="font-medium">{u.full_name || "Sin nombre"}</span>
                        {isMaster && <span title="Usuario Maestro"><Crown className="h-4 w-4 text-amber-500" /></span>}
                      </div>
                      <div className="text-xs text-muted-foreground">{u.email}</div>
                      {isMaster && <span className="text-[10px] font-semibold text-amber-600 dark:text-amber-400">MAESTRO · Protegido</span>}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-1.5">
                        {u.roles.length === 0 ? (
                          <Badge variant="outline" className="text-xs text-muted-foreground gap-1">
                            <Globe className="h-3 w-3" />
                            Público
                          </Badge>
                        ) : (
                          u.roles.map((r) => (
                            <Badge
                              key={r.id}
                              variant="secondary"
                              className={`${ROLE_COLORS[r.role]} gap-1 ${isMaster ? "pr-2" : "pr-1"}`}
                            >
                              {ROLE_LABELS[r.role]}
                              {!isMaster && (
                                <button
                                  onClick={() => removeRole(r.id, r.role)}
                                  className="ml-0.5 rounded-full p-0.5 hover:bg-black/10 dark:hover:bg-white/10 transition-colors"
                                  title={`Quitar rol ${ROLE_LABELS[r.role]}`}
                                >
                                  <Trash2 className="h-3 w-3" />
                                </button>
                              )}
                            </Badge>
                          ))
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      {isMaster ? (
                        <span className="text-xs text-amber-600 dark:text-amber-400 font-medium">Roles protegidos</span>
                      ) : availableRoles.length === 0 ? (
                        <span className="text-xs text-muted-foreground">Todos asignados</span>
                      ) : (
                        <div className="flex items-center gap-2">
                          <Select
                            onValueChange={(role) => addRole(u.user_id, role as AppRole)}
                            disabled={!!addingRole && addingRole.userId === u.user_id}
                          >
                            <SelectTrigger className="w-40 h-8 text-xs">
                              <SelectValue placeholder="Seleccionar rol" />
                            </SelectTrigger>
                            <SelectContent>
                              {availableRoles.map((r) => (
                                <SelectItem key={r} value={r}>
                                  <div className="flex items-center gap-2">
                                    <Plus className="h-3 w-3" />
                                    {ROLE_LABELS[r]}
                                  </div>
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Shareable registration links */}
      <div className="mt-6 rounded-lg border bg-card p-4 space-y-3">
        <h3 className="text-sm font-semibold flex items-center gap-2">
          <Globe className="h-4 w-4 text-primary" />
          Enlaces de registro por rol
        </h3>
        <p className="text-xs text-muted-foreground">Comparte estos enlaces para que nuevos usuarios se registren. Luego asígnales el rol desde aquí.</p>
        <div className="grid gap-2 sm:grid-cols-3">
          {([
            { role: "cliente", label: "Clientes", path: "/auth?registro=cliente" },
            { role: "socio", label: "Socios", path: "/auth?registro=socio" },
            { role: "admin", label: "Administradores", path: "/auth?registro=admin" },
          ]).map(({ role, label, path }) => (
            <ShareableLinkCard key={role} label={label} path={path} />
          ))}
        </div>
      </div>

      <div className="mt-4 rounded-lg border border-amber-200 bg-amber-50 dark:border-amber-900/50 dark:bg-amber-950/20 p-4">
        <p className="text-sm text-amber-800 dark:text-amber-200">
          <strong>Nota:</strong> Los cambios de rol son inmediatos. Un usuario con rol <strong>Administrador</strong> tiene acceso total al panel /admin.
          El rol <strong>Socio</strong> da acceso a /socio y <strong>Cliente</strong> a /clientes. Los usuarios <strong>sin roles</strong> aparecen como "Público".
        </p>
      </div>
    </div>
  );
}
