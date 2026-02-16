import { useEffect, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { supabase } from "@/integrations/supabase/client";
import { CheckCircle2, XCircle, Clock, AlertTriangle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SEO } from "@/components/seo/SEO";

interface TransactionInfo {
  reference: string;
  status: string;
  amount_cents: number;
  payment_method: string | null;
  customer_name: string | null;
  customer_email: string | null;
}

const statusConfig: Record<string, { icon: React.ReactNode; title: string; description: string; color: string }> = {
  APPROVED: {
    icon: <CheckCircle2 className="h-16 w-16 text-green-500" />,
    title: "¡Pago Aprobado!",
    description: "Tu pago fue procesado exitosamente. Recibirás una confirmación por correo electrónico.",
    color: "text-green-600",
  },
  DECLINED: {
    icon: <XCircle className="h-16 w-16 text-destructive" />,
    title: "Pago Rechazado",
    description: "Tu pago no pudo ser procesado. Por favor intenta con otro método de pago o contacta a tu banco.",
    color: "text-destructive",
  },
  PENDING: {
    icon: <Clock className="h-16 w-16 text-yellow-500" />,
    title: "Pago Pendiente",
    description: "Tu pago está siendo procesado. Te notificaremos cuando se confirme.",
    color: "text-yellow-600",
  },
  VOIDED: {
    icon: <AlertTriangle className="h-16 w-16 text-muted-foreground" />,
    title: "Pago Anulado",
    description: "Esta transacción fue anulada.",
    color: "text-muted-foreground",
  },
  ERROR: {
    icon: <XCircle className="h-16 w-16 text-destructive" />,
    title: "Error en el Pago",
    description: "Ocurrió un error al procesar tu pago. Por favor intenta nuevamente.",
    color: "text-destructive",
  },
};

const formatCOP = (cents: number) =>
  new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", minimumFractionDigits: 0 }).format(cents / 100);

export default function PagoResultadoPage() {
  const [searchParams] = useSearchParams();
  const [transaction, setTransaction] = useState<TransactionInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  const reference = searchParams.get("id") || searchParams.get("reference");

  useEffect(() => {
    if (!reference) {
      setLoading(false);
      setNotFound(true);
      return;
    }

    const fetchTransaction = async () => {
      const { data, error } = await supabase
        .from("wompi_transactions")
        .select("reference, status, amount_cents, payment_method, customer_name, customer_email")
        .eq("reference", reference)
        .single();

      if (error || !data) {
        setNotFound(true);
      } else {
        setTransaction(data);
      }
      setLoading(false);
    };

    fetchTransaction();

    // Poll for status updates every 5s if PENDING
    const interval = setInterval(async () => {
      const { data } = await supabase
        .from("wompi_transactions")
        .select("reference, status, amount_cents, payment_method, customer_name, customer_email")
        .eq("reference", reference)
        .single();

      if (data && data.status !== "PENDING") {
        setTransaction(data);
        clearInterval(interval);
      } else if (data) {
        setTransaction(data);
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [reference]);

  const config = transaction ? statusConfig[transaction.status] || statusConfig.ERROR : null;

  return (
    <Layout>
      <SEO title="Resultado del Pago | SistecPOS" description="Estado de tu transacción" noindex />
      <div className="min-h-[60vh] flex items-center justify-center py-16 px-4">
        <div className="max-w-md w-full text-center space-y-6">
          {loading ? (
            <>
              <Loader2 className="h-16 w-16 animate-spin mx-auto text-primary" />
              <h1 className="text-xl font-semibold">Consultando estado del pago...</h1>
            </>
          ) : notFound ? (
            <>
              <AlertTriangle className="h-16 w-16 text-muted-foreground mx-auto" />
              <h1 className="text-xl font-semibold">Transacción no encontrada</h1>
              <p className="text-muted-foreground">No pudimos encontrar información sobre esta transacción.</p>
              <Button asChild>
                <Link to="/">Volver al inicio</Link>
              </Button>
            </>
          ) : transaction && config ? (
            <>
              {config.icon}
              <h1 className={`text-2xl font-bold ${config.color}`}>{config.title}</h1>
              <p className="text-muted-foreground">{config.description}</p>

              <div className="bg-card border rounded-lg p-4 space-y-2 text-sm text-left">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Referencia</span>
                  <span className="font-mono text-xs">{transaction.reference}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Monto</span>
                  <span className="font-semibold">{formatCOP(transaction.amount_cents)}</span>
                </div>
                {transaction.payment_method && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Método</span>
                    <span>{transaction.payment_method}</span>
                  </div>
                )}
                {transaction.customer_name && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Cliente</span>
                    <span>{transaction.customer_name}</span>
                  </div>
                )}
              </div>

              {transaction.status === "PENDING" && (
                <p className="text-xs text-muted-foreground flex items-center justify-center gap-1">
                  <Loader2 className="h-3 w-3 animate-spin" />
                  Actualizando automáticamente...
                </p>
              )}

              <div className="flex flex-col gap-2">
                <Button asChild>
                  <Link to="/">Volver al inicio</Link>
                </Button>
                <Button variant="outline" asChild>
                  <Link to="/contacto">¿Necesitas ayuda?</Link>
                </Button>
              </div>
            </>
          ) : null}
        </div>
      </div>
    </Layout>
  );
}
