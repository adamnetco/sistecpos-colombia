import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Zap, Clock, CheckCircle2, Tag, X } from "lucide-react";

interface Coupon {
  id: string;
  code: string;
  plan_key: string;
  discount_type: string;
  discount_value: number;
  original_price_cop: number;
  discounted_price_cop: number;
  expires_at: string;
}

interface Props {
  planKey?: string | null;
  initialCode?: string | null;
  onCouponApplied?: (coupon: Coupon | null) => void;
}

const formatCOP = (n: number) =>
  new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", minimumFractionDigits: 0 }).format(n);

function useCountdown(expiresAt: string | null) {
  const [remaining, setRemaining] = useState<{ h: number; m: number; s: number } | null>(null);

  useEffect(() => {
    if (!expiresAt) return;
    const tick = () => {
      const diff = new Date(expiresAt).getTime() - Date.now();
      if (diff <= 0) { setRemaining({ h: 0, m: 0, s: 0 }); return; }
      const h = Math.floor(diff / 3600000);
      const m = Math.floor((diff % 3600000) / 60000);
      const s = Math.floor((diff % 60000) / 1000);
      setRemaining({ h, m, s });
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [expiresAt]);

  return remaining;
}

export function CouponBanner({ planKey, initialCode, onCouponApplied }: Props) {
  const [inputCode, setInputCode] = useState(initialCode || "");
  const [coupon, setCoupon] = useState<Coupon | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [autoApplied, setAutoApplied] = useState(false);

  const countdown = useCountdown(coupon?.expires_at || null);

  const applyCoupon = useCallback(async (code: string) => {
    if (!code.trim()) return;
    setLoading(true);
    setError(null);

    let query = supabase
      .from("discount_coupons")
      .select("*")
      .eq("code", code.trim().toUpperCase())
      .eq("is_active", true)
      .is("used_at", null)
      .gt("expires_at", new Date().toISOString())
      .single();

    const { data, error: err } = await query;

    setLoading(false);

    if (err || !data) {
      setError("Cupón inválido, vencido o ya utilizado.");
      setCoupon(null);
      onCouponApplied?.(null);
      return;
    }

    // If planKey filter is set, validate it matches
    if (planKey && data.plan_key !== planKey) {
      setError(`Este cupón aplica solo para el Plan ${data.plan_key}. Navega al plan correcto.`);
      setCoupon(null);
      onCouponApplied?.(null);
      return;
    }

    setCoupon(data as Coupon);
    onCouponApplied?.(data as Coupon);
  }, [planKey, onCouponApplied]);

  // Auto-apply from URL
  useEffect(() => {
    if (initialCode && !autoApplied) {
      setAutoApplied(true);
      applyCoupon(initialCode);
    }
  }, [initialCode, autoApplied, applyCoupon]);

  const removeCoupon = () => {
    setCoupon(null);
    setInputCode("");
    setError(null);
    onCouponApplied?.(null);
  };

  const savings = coupon ? coupon.original_price_cop - coupon.discounted_price_cop : 0;
  const isExpiringSoon = coupon && countdown && (countdown.h < 2);

  if (coupon) {
    return (
      <div className="rounded-xl border-2 border-primary bg-primary/5 p-4 space-y-3">
        {/* Countdown urgency */}
        {countdown && (
          <div className={`flex items-center justify-center gap-2 rounded-lg px-4 py-2 ${isExpiringSoon ? "bg-destructive/10 border border-destructive/30" : "bg-muted"}`}>
            <Clock className={`h-4 w-4 ${isExpiringSoon ? "text-destructive animate-pulse" : "text-muted-foreground"}`} />
            <span className={`text-sm font-bold tabular-nums ${isExpiringSoon ? "text-destructive" : "text-foreground"}`}>
              {String(countdown.h).padStart(2, "0")}:{String(countdown.m).padStart(2, "0")}:{String(countdown.s).padStart(2, "0")}
            </span>
            <span className={`text-xs ${isExpiringSoon ? "text-destructive" : "text-muted-foreground"}`}>
              {isExpiringSoon ? "⚡ ¡Tu descuento vence pronto!" : "para que venza tu descuento"}
            </span>
          </div>
        )}

        {/* Applied coupon */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-green-600" />
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-sm">Cupón aplicado:</span>
                <code className="font-mono text-sm bg-primary/10 text-primary px-2 py-0.5 rounded">{coupon.code}</code>
              </div>
              <p className="text-xs text-muted-foreground">
                {coupon.discount_type === "percentage"
                  ? `${coupon.discount_value}% de descuento`
                  : `${formatCOP(coupon.discount_value)} de descuento`}
              </p>
            </div>
          </div>
          <button onClick={removeCoupon} className="text-muted-foreground hover:text-foreground transition-colors">
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Price comparison */}
        <div className="rounded-lg bg-background border p-3 flex items-center justify-between">
          <div>
            <p className="text-xs text-muted-foreground line-through">{formatCOP(coupon.original_price_cop)}</p>
            <p className="text-2xl font-black text-primary">{formatCOP(coupon.discounted_price_cop)}</p>
          </div>
          <Badge variant="destructive" className="text-sm px-3 py-1">
            ¡Ahorras {formatCOP(savings)}!
          </Badge>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-dashed border-muted-foreground/30 p-4 space-y-3">
      <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
        <Tag className="h-4 w-4" />
        ¿Tienes un código de descuento?
      </div>
      <div className="flex gap-2">
        <Input
          placeholder="Ej: NEG-ABC123"
          value={inputCode}
          onChange={(e) => setInputCode(e.target.value.toUpperCase())}
          onKeyDown={(e) => e.key === "Enter" && applyCoupon(inputCode)}
          className="font-mono"
        />
        <Button
          onClick={() => applyCoupon(inputCode)}
          disabled={loading || !inputCode.trim()}
          size="sm"
          className="gap-1 shrink-0"
        >
          {loading ? <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" /> : <Zap className="h-4 w-4" />}
          Aplicar
        </Button>
      </div>
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}
