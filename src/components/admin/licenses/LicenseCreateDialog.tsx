import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Plus } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { LICENSE_PLANS, planExpirationDate } from "@/data/licensePlans";

interface Props {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  onCreated: () => void;
}

export function LicenseCreateDialog({ open, onOpenChange, onCreated }: Props) {
  const { toast } = useToast();
  const [selectedPlan, setSelectedPlan] = useState(LICENSE_PLANS[0].value);
  const [price, setPrice] = useState(LICENSE_PLANS[0].defaultPriceCOP);

  const handlePlanChange = (value: string) => {
    setSelectedPlan(value);
    const plan = LICENSE_PLANS.find((p) => p.value === value);
    if (plan) setPrice(plan.defaultPriceCOP);
  };

  const handleAdd = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const planType = fd.get("plan_type") as string;
    const expiresAt = planExpirationDate(planType);

    const { error } = await supabase.from("licenses").insert({
      business_name: fd.get("business_name") as string,
      business_nit: (fd.get("business_nit") as string) || null,
      contact_name: fd.get("contact_name") as string,
      contact_email: (fd.get("contact_email") as string) || null,
      contact_phone: (fd.get("contact_phone") as string) || null,
      plan_type: planType,
      price_paid: Number(fd.get("price_paid")),
      expires_at: expiresAt,
      notes: (fd.get("notes") as string) || null,
    });

    if (error) {
      toast({ title: "Error al crear licencia", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Licencia creada exitosamente" });
      onOpenChange(false);
      onCreated();
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button><Plus className="mr-2 h-4 w-4" />Nueva Licencia</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader><DialogTitle>Crear Licencia</DialogTitle></DialogHeader>
        <form onSubmit={handleAdd} className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div><Label>Negocio *</Label><Input name="business_name" required /></div>
            <div><Label>NIT</Label><Input name="business_nit" placeholder="900.123.456-7" /></div>
          </div>
          <div><Label>Contacto *</Label><Input name="contact_name" required /></div>
          <div className="grid grid-cols-2 gap-3">
            <div><Label>Email</Label><Input name="contact_email" type="email" /></div>
            <div><Label>Teléfono</Label><Input name="contact_phone" /></div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Plan *</Label>
              <select
                name="plan_type"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                required
                value={selectedPlan}
                onChange={(e) => handlePlanChange(e.target.value)}
              >
                {LICENSE_PLANS.map((p) => (
                  <option key={p.value} value={p.value}>
                    {p.label} — {p.description}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <Label>Precio (COP) *</Label>
              <Input
                name="price_paid"
                type="number"
                required
                value={price}
                onChange={(e) => setPrice(Number(e.target.value))}
              />
              <p className="mt-1 text-xs text-muted-foreground">
                Sugerido: ${LICENSE_PLANS.find((p) => p.value === selectedPlan)?.defaultPriceCOP.toLocaleString("es-CO")} COP
              </p>
            </div>
          </div>
          <div><Label>Notas</Label><Textarea name="notes" rows={2} /></div>
          <Button type="submit" className="w-full">Crear Licencia</Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
