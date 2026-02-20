import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useReseller } from "@/hooks/useReseller";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Building2, Save, User } from "lucide-react";

interface BusinessData {
  id: string;
  business_name: string;
  nit: string | null;
  email: string | null;
  phone: string | null;
  city: string | null;
  address: string | null;
}

export default function ResellerProfileView() {
  const { user } = useAuth();
  const { reseller } = useReseller();
  const { toast } = useToast();
  const [business, setBusiness] = useState<BusinessData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    business_name: "",
    nit: "",
    email: "",
    phone: "",
    city: "",
    address: "",
  });

  useEffect(() => {
    if (!user) return;
    const load = async () => {
      // Try to find existing business for this user
      const { data } = await supabase
        .from("businesses")
        .select("*")
        .eq("owner_user_id", user.id)
        .limit(1)
        .maybeSingle();

      if (data) {
        setBusiness(data as BusinessData);
        setForm({
          business_name: data.business_name || "",
          nit: data.nit || "",
          email: data.email || "",
          phone: data.phone || "",
          city: data.city || "",
          address: data.address || "",
        });
      } else if (reseller) {
        // Auto-create business from reseller data
        const newBiz = {
          owner_user_id: user.id,
          business_name: reseller.full_name,
          email: reseller.email,
          phone: reseller.phone,
          city: reseller.city,
        };
        const { data: created, error } = await supabase
          .from("businesses")
          .insert(newBiz)
          .select()
          .single();

        if (created) {
          setBusiness(created as BusinessData);
          setForm({
            business_name: created.business_name || "",
            nit: created.nit || "",
            email: created.email || "",
            phone: created.phone || "",
            city: created.city || "",
            address: created.address || "",
          });
        }
        if (error) console.error("Error creating business:", error);
      }
      setLoading(false);
    };
    load();
  }, [user, reseller]);

  const handleSave = async () => {
    if (!business) return;
    setSaving(true);
    const { error } = await supabase
      .from("businesses")
      .update({
        business_name: form.business_name,
        nit: form.nit || null,
        email: form.email || null,
        phone: form.phone || null,
        city: form.city || null,
        address: form.address || null,
      })
      .eq("id", business.id);

    if (error) {
      toast({ title: "Error al guardar", variant: "destructive" });
    } else {
      toast({ title: "Perfil actualizado ✅" });
    }
    setSaving(false);
  };

  if (loading) {
    return <div className="space-y-4">{[1, 2, 3].map(i => <Skeleton key={i} className="h-16 w-full" />)}</div>;
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold font-display flex items-center gap-2">
        <Building2 className="h-6 w-6 text-primary" />
        Mi Empresa
      </h1>

      {/* Business form */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Datos de la Empresa</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label>Razón Social *</Label>
              <Input value={form.business_name} onChange={e => setForm(f => ({ ...f, business_name: e.target.value }))} />
            </div>
            <div>
              <Label>NIT</Label>
              <Input value={form.nit} onChange={e => setForm(f => ({ ...f, nit: e.target.value }))} placeholder="900.123.456-7" />
            </div>
            <div>
              <Label>Email Corporativo</Label>
              <Input type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} />
            </div>
            <div>
              <Label>Teléfono</Label>
              <Input value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} />
            </div>
            <div>
              <Label>Ciudad</Label>
              <Input value={form.city} onChange={e => setForm(f => ({ ...f, city: e.target.value }))} />
            </div>
            <div>
              <Label>Dirección</Label>
              <Input value={form.address} onChange={e => setForm(f => ({ ...f, address: e.target.value }))} />
            </div>
          </div>
          <Button onClick={handleSave} disabled={saving || !form.business_name}>
            <Save className="mr-2 h-4 w-4" />{saving ? "Guardando..." : "Guardar Cambios"}
          </Button>
        </CardContent>
      </Card>

      {/* Representative info (read-only) */}
      {reseller && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm flex items-center gap-2">
              <User className="h-4 w-4" />Datos del Representante
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 sm:grid-cols-2 text-sm">
              <div><span className="text-muted-foreground">Nombre:</span> <span className="font-medium">{reseller.full_name}</span></div>
              <div><span className="text-muted-foreground">Email:</span> <span className="font-medium">{reseller.email}</span></div>
              <div><span className="text-muted-foreground">Teléfono:</span> <span className="font-medium">{reseller.phone}</span></div>
              <div><span className="text-muted-foreground">Ciudad:</span> <span className="font-medium">{reseller.city}</span></div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
