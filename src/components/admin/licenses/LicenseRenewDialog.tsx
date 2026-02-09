import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";

interface Props {
  licenseId: string | null;
  currentExpiresAt: string | null;
  onClose: () => void;
  onRenewed: () => void;
}

export function LicenseRenewDialog({ licenseId, currentExpiresAt, onClose, onRenewed }: Props) {
  const [period, setPeriod] = useState("anual");
  const { toast } = useToast();

  const today = new Date().toISOString().split("T")[0];

  const handleRenew = async () => {
    if (!licenseId) return;

    const base = currentExpiresAt && currentExpiresAt > today
      ? new Date(currentExpiresAt)
      : new Date();

    if (period === "anual") base.setFullYear(base.getFullYear() + 1);
    else base.setMonth(base.getMonth() + 1);

    const { error } = await supabase
      .from("licenses")
      .update({ expires_at: base.toISOString().split("T")[0], status: "active" })
      .eq("id", licenseId);

    if (error) {
      toast({ title: "Error al renovar", variant: "destructive" });
    } else {
      toast({ title: "Licencia renovada" });
      onClose();
      onRenewed();
    }
  };

  return (
    <Dialog open={!!licenseId} onOpenChange={(o) => !o && onClose()}>
      <DialogContent>
        <DialogHeader><DialogTitle>Renovar Licencia</DialogTitle></DialogHeader>
        <div className="space-y-4">
          <div>
            <Label>Período</Label>
            <Select value={period} onValueChange={setPeriod}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="mensual">+1 Mes</SelectItem>
                <SelectItem value="anual">+1 Año</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button onClick={handleRenew} className="w-full">Confirmar Renovación</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
