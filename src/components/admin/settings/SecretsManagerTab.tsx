import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import {
  Loader2, Save, Eye, EyeOff, Key, MessageCircle,
  Mail, CreditCard, ShieldCheck, Bot, RefreshCw, AlertTriangle
} from "lucide-react";

interface SecretConfig {
  key: string;
  label: string;
  description: string;
  placeholder: string;
  group: string;
  icon: React.ReactNode;
  sensitive: boolean;
}

const SECRET_CONFIGS: SecretConfig[] = [
  // CallMeBot
  {
    key: "secret_callmebot_phone",
    label: "CallMeBot — Teléfono WhatsApp",
    description: "Número de WhatsApp con código de país. Ej: 573001234567",
    placeholder: "573001234567",
    group: "WhatsApp / CallMeBot",
    icon: <MessageCircle className="h-4 w-4" />,
    sensitive: false,
  },
  {
    key: "secret_callmebot_apikey",
    label: "CallMeBot — API Key",
    description: "Clave de API obtenida al registrarse en api.callmebot.com/whatsapp.php",
    placeholder: "1234567",
    group: "WhatsApp / CallMeBot",
    icon: <Key className="h-4 w-4" />,
    sensitive: true,
  },
  // Resend
  {
    key: "secret_resend_api_key",
    label: "Resend — API Key",
    description: "Clave de API de Resend para envío de correos transaccionales (resend.com)",
    placeholder: "re_xxxxxxxxxxxx",
    group: "Email / Resend",
    icon: <Mail className="h-4 w-4" />,
    sensitive: true,
  },
  // Wompi
  {
    key: "secret_wompi_public_key",
    label: "Wompi — Llave Pública",
    description: "pub_prod_... o pub_test_... desde el dashboard de Wompi",
    placeholder: "pub_prod_xxxxxxxxxxxxxxxxxxxxxxxx",
    group: "Pagos / Wompi",
    icon: <CreditCard className="h-4 w-4" />,
    sensitive: false,
  },
  {
    key: "secret_wompi_private_key",
    label: "Wompi — Llave Privada",
    description: "prv_prod_... desde el dashboard de Wompi",
    placeholder: "prv_prod_xxxxxxxxxxxxxxxxxxxxxxxx",
    group: "Pagos / Wompi",
    icon: <Key className="h-4 w-4" />,
    sensitive: true,
  },
  {
    key: "secret_wompi_integrity_secret",
    label: "Wompi — Secreto de Integridad",
    description: "Secreto para firmar transacciones (hash SHA256)",
    placeholder: "prod_integrity_xxxxxxxxxxxxxxxxxxxxxxxx",
    group: "Pagos / Wompi",
    icon: <ShieldCheck className="h-4 w-4" />,
    sensitive: true,
  },
  {
    key: "secret_wompi_events_secret",
    label: "Wompi — Secreto de Eventos",
    description: "Secreto para validar webhooks de Wompi",
    placeholder: "prod_events_xxxxxxxxxxxxxxxxxxxxxxxx",
    group: "Pagos / Wompi",
    icon: <ShieldCheck className="h-4 w-4" />,
    sensitive: true,
  },
  // Google
  {
    key: "secret_google_client_id",
    label: "Google — Client ID",
    description: "Client ID de OAuth 2.0 desde Google Cloud Console",
    placeholder: "xxxxxxxxxxxx-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx.apps.googleusercontent.com",
    group: "Google OAuth",
    icon: <Key className="h-4 w-4" />,
    sensitive: false,
  },
  {
    key: "secret_google_client_secret",
    label: "Google — Client Secret",
    description: "Client Secret de OAuth 2.0 desde Google Cloud Console",
    placeholder: "GOCSPX-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx",
    group: "Google OAuth",
    icon: <Key className="h-4 w-4" />,
    sensitive: true,
  },
  // reCAPTCHA
  {
    key: "secret_recaptcha_site_key",
    label: "reCAPTCHA — Site Key (pública)",
    description: "Clave pública de Google reCAPTCHA v3 que va en el HTML del frontend (render=...)",
    placeholder: "6Lxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx",
    group: "Seguridad",
    icon: <ShieldCheck className="h-4 w-4" />,
    sensitive: false,
  },
  {
    key: "secret_recaptcha_secret_key",
    label: "reCAPTCHA — Secret Key (privada)",
    description: "Clave secreta de Google reCAPTCHA v3 para validación en el servidor",
    placeholder: "6Lxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx",
    group: "Seguridad",
    icon: <ShieldCheck className="h-4 w-4" />,
    sensitive: true,
  },
];

const GROUPS = [...new Set(SECRET_CONFIGS.map((s) => s.group))];

function groupIcon(group: string) {
  if (group.includes("WhatsApp")) return <MessageCircle className="h-4 w-4" />;
  if (group.includes("Email")) return <Mail className="h-4 w-4" />;
  if (group.includes("Pagos")) return <CreditCard className="h-4 w-4" />;
  if (group.includes("Google")) return <Bot className="h-4 w-4" />;
  return <ShieldCheck className="h-4 w-4" />;
}

interface SecretRowProps {
  config: SecretConfig;
  storedValue: string;
  onSave: (key: string, value: string) => Promise<void>;
}

function SecretRow({ config, storedValue, onSave }: SecretRowProps) {
  const [value, setValue] = useState(storedValue);
  const [visible, setVisible] = useState(false);
  const [saving, setSaving] = useState(false);
  const isDirty = value !== storedValue;

  const handleSave = async () => {
    setSaving(true);
    await onSave(config.key, value);
    setSaving(false);
  };

  const displayValue = () => {
    if (!storedValue) return "";
    if (!config.sensitive) return storedValue;
    if (visible) return storedValue;
    return storedValue.slice(0, 4) + "•".repeat(Math.min(storedValue.length - 4, 20)) + (storedValue.length > 8 ? storedValue.slice(-4) : "");
  };

  return (
    <div className="flex flex-col gap-2 py-4 border-b last:border-0">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-medium text-sm">{config.label}</span>
            {storedValue ? (
              <Badge variant="outline" className="text-xs border-green-300 dark:border-green-700">
                Configurado
              </Badge>
            ) : (
              <Badge variant="outline" className="text-xs border-yellow-400 dark:border-yellow-600 text-yellow-700 dark:text-yellow-400">
                Sin configurar
              </Badge>
            )}
            {isDirty && (
              <Badge variant="secondary" className="text-xs">
                Sin guardar
              </Badge>
            )}
          </div>
          <p className="text-xs text-muted-foreground mt-0.5">{config.description}</p>
        </div>
      </div>
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Input
            type={config.sensitive && !visible ? "password" : "text"}
            value={visible ? value : (document.activeElement?.id === config.key ? value : displayValue())}
            id={config.key}
            onFocus={() => setVisible(true)}
            onBlur={() => { if (!value || value === storedValue) setVisible(false); }}
            onChange={(e) => setValue(e.target.value)}
            placeholder={config.placeholder}
            className="pr-10 font-mono text-sm"
          />
          {config.sensitive && storedValue && (
            <button
              type="button"
              onClick={() => setVisible(!visible)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
            >
              {visible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          )}
        </div>
        <Button
          size="sm"
          onClick={handleSave}
          disabled={saving || !isDirty || !value.trim()}
          className="gap-1.5 shrink-0"
        >
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          Guardar
        </Button>
      </div>
    </div>
  );
}

export default function SecretsManagerTab() {
  const [values, setValues] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    const keys = SECRET_CONFIGS.map((s) => s.key);
    const { data } = await supabase
      .from("app_settings")
      .select("key, value")
      .in("key", keys);
    const map: Record<string, string> = {};
    (data || []).forEach((row) => { map[row.key] = row.value; });
    setValues(map);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const handleSave = async (key: string, value: string) => {
    const { error } = await supabase
      .from("app_settings")
      .upsert({ key, value, updated_at: new Date().toISOString() }, { onConflict: "key" });
    if (error) {
      toast.error("Error al guardar: " + error.message);
    } else {
      setValues((prev) => ({ ...prev, [key]: value }));
      toast.success("Clave guardada correctamente");
    }
  };

  if (loading) {
    return (
      <div className="flex h-32 items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const configured = SECRET_CONFIGS.filter((s) => values[s.key]).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="border-yellow-200 bg-yellow-50/30 dark:border-yellow-900 dark:bg-yellow-950/20">
        <CardContent className="pt-4 pb-4">
          <div className="flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-yellow-600 dark:text-yellow-400 shrink-0 mt-0.5" />
            <div className="text-sm">
              <p className="font-medium text-yellow-800 dark:text-yellow-300">Zona de seguridad</p>
              <p className="text-yellow-700 dark:text-yellow-400 mt-0.5">
                Estas claves se almacenan en la base de datos <strong>cifrada y con acceso exclusivo para administradores</strong>.
                Los valores son leídos por las funciones del backend. Cambiar una clave aquí la actualiza de inmediato en todo el sistema.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex items-center justify-between">
        <div className="text-sm text-muted-foreground">
          <span className="font-medium text-foreground">{configured}</span> de {SECRET_CONFIGS.length} claves configuradas
        </div>
        <Button variant="ghost" size="sm" onClick={load} className="gap-1.5">
          <RefreshCw className="h-4 w-4" />
          Recargar
        </Button>
      </div>

      {GROUPS.map((group) => {
        const groupSecrets = SECRET_CONFIGS.filter((s) => s.group === group);
        const groupConfigured = groupSecrets.filter((s) => values[s.key]).length;
        return (
          <Card key={group}>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center justify-between text-base">
                <span className="flex items-center gap-2">
                  {groupIcon(group)}
                  {group}
                </span>
                <span className="text-xs font-normal text-muted-foreground">
                  {groupConfigured}/{groupSecrets.length}
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {groupSecrets.map((config) => (
                <SecretRow
                  key={config.key}
                  config={config}
                  storedValue={values[config.key] || ""}
                  onSave={handleSave}
                />
              ))}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
