import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";

interface CertOrder {
  id: string;
  full_name: string;
  nit: string;
  email: string;
  phone: string;
  plan: string;
  price_cop: number;
  status: string;
  created_at: string;
}

const columns = [
  { key: "pending", title: "Pendiente", color: "border-yellow-400" },
  { key: "processing", title: "En Proceso", color: "border-primary" },
  { key: "completed", title: "Completado", color: "border-whatsapp" },
];

export default function CertificatesView() {
  const [orders, setOrders] = useState<CertOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const load = async () => {
    const { data } = await supabase.from("certificate_orders").select("*").order("created_at", { ascending: false });
    setOrders((data as CertOrder[]) || []);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const moveStatus = async (id: string, status: string) => {
    const { error } = await supabase.from("certificate_orders").update({ status }).eq("id", id);
    if (error) toast({ title: "Error", variant: "destructive" });
    else load();
  };

  const getByStatus = (status: string) => orders.filter((o) => o.status === status);

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold font-display">Órdenes de Certificados</h1>

      {loading ? (
        <div className="py-8 text-center text-muted-foreground">Cargando...</div>
      ) : (
        <div className="grid gap-4 md:grid-cols-3">
          {columns.map((col) => (
            <div key={col.key} className="space-y-3">
              <h2 className={`text-sm font-semibold border-b-2 ${col.color} pb-2`}>
                {col.title} ({getByStatus(col.key).length})
              </h2>
              {getByStatus(col.key).map((o) => (
                <Card key={o.id} className="cursor-pointer hover:shadow-md transition-shadow">
                  <CardContent className="p-4 space-y-2">
                    <div className="font-medium">{o.full_name}</div>
                    <div className="text-xs text-muted-foreground">NIT: {o.nit}</div>
                    <div className="text-xs text-muted-foreground">{o.email}</div>
                    <div className="flex items-center justify-between">
                      <Badge variant="outline" className="text-xs capitalize">{o.plan}</Badge>
                      <span className="text-xs font-bold">${o.price_cop.toLocaleString("es-CO")}</span>
                    </div>
                    <div className="flex gap-1 pt-1">
                      {col.key !== "pending" && (
                        <button
                          className="text-xs text-muted-foreground hover:text-foreground"
                          onClick={() => moveStatus(o.id, col.key === "completed" ? "processing" : "pending")}
                        >
                          ← Mover atrás
                        </button>
                      )}
                      {col.key !== "completed" && (
                        <button
                          className="ml-auto text-xs text-primary hover:underline"
                          onClick={() => moveStatus(o.id, col.key === "pending" ? "processing" : "completed")}
                        >
                          Avanzar →
                        </button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
              {getByStatus(col.key).length === 0 && (
                <div className="rounded-lg border border-dashed p-6 text-center text-xs text-muted-foreground">
                  Sin órdenes
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
