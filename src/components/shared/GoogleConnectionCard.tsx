import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Chrome, CheckCircle2, RefreshCw, Unlink, Calendar, Contact2 } from "lucide-react";

interface GoogleTokenStatus {
  connected: boolean;
  google_email: string | null;
  scopes: string[];
  expires_at: string | null;
}

export default function GoogleConnectionCard() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [status, setStatus] = useState<GoogleTokenStatus>({
    connected: false,
    google_email: null,
    scopes: [],
    expires_at: null,
  });
  const [loading, setLoading] = useState(true);
  const [connecting, setConnecting] = useState(false);
  const [syncing, setSyncing] = useState(false);

  useEffect(() => {
    if (!user) return;
    checkConnection();
  }, [user]);

  const checkConnection = async () => {
    setLoading(true);
    try {
      const { data } = await supabase
        .from("google_user_tokens")
        .select("google_email, scopes, token_expires_at")
        .eq("user_id", user!.id)
        .maybeSingle();

      if (data) {
        setStatus({
          connected: true,
          google_email: data.google_email,
          scopes: data.scopes || [],
          expires_at: data.token_expires_at,
        });
      } else {
        setStatus({ connected: false, google_email: null, scopes: [], expires_at: null });
      }
    } catch {
      // Not connected
    }
    setLoading(false);
  };

  const handleConnect = async () => {
    setConnecting(true);
    try {
      const { data, error } = await supabase.functions.invoke("google-oauth-start", {
        body: { redirect_uri: undefined }, // Uses default callback
      });

      if (error) throw error;
      if (data?.url) {
        // Open Google consent in a popup
        const popup = window.open(data.url, "google-oauth", "width=600,height=700,scrollbars=yes");

        // Poll for popup close
        const interval = setInterval(() => {
          if (popup?.closed) {
            clearInterval(interval);
            setConnecting(false);
            // Recheck connection
            setTimeout(checkConnection, 1000);
          }
        }, 500);
      }
    } catch (err: any) {
      toast({ title: "Error al conectar Google", description: err.message, variant: "destructive" });
      setConnecting(false);
    }
  };

  const handleDisconnect = async () => {
    if (!confirm("¿Desconectar tu cuenta de Google? Se eliminarán los tokens almacenados.")) return;

    const { error } = await supabase
      .from("google_user_tokens")
      .delete()
      .eq("user_id", user!.id);

    if (!error) {
      setStatus({ connected: false, google_email: null, scopes: [], expires_at: null });
      toast({ title: "Google desconectado" });
    }
  };

  const handleSyncContacts = async () => {
    setSyncing(true);
    try {
      const { data, error } = await supabase.functions.invoke("sync-google-contacts", {
        body: { action: "sync_all" },
      });
      if (error) throw error;
      toast({ title: `${data.synced} contactos sincronizados ✅` });
    } catch (err: any) {
      toast({ title: "Error al sincronizar", description: err.message, variant: "destructive" });
    }
    setSyncing(false);
  };

  const hasCalendarScope = status.scopes.some((s) => s.includes("calendar"));
  const hasContactsScope = status.scopes.some((s) => s.includes("contacts"));

  if (loading) {
    return (
      <Card>
        <CardContent className="py-6">
          <div className="flex items-center gap-2 text-muted-foreground">
            <RefreshCw className="h-4 w-4 animate-spin" />
            Verificando conexión con Google...
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm flex items-center gap-2">
          <Chrome className="h-4 w-4" />
          Google Workspace
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {status.connected ? (
          <>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-primary" />
              <span className="text-sm font-medium">Conectado como</span>
              <Badge variant="secondary">{status.google_email}</Badge>
            </div>

            <div className="flex flex-wrap gap-2">
              {hasContactsScope && (
                <Badge variant="outline" className="gap-1">
                  <Contact2 className="h-3 w-3" /> Contactos
                </Badge>
              )}
              {hasCalendarScope && (
                <Badge variant="outline" className="gap-1">
                  <Calendar className="h-3 w-3" /> Calendario
                </Badge>
              )}
            </div>

            <div className="flex flex-wrap gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={handleSyncContacts}
                disabled={syncing || !hasContactsScope}
              >
                <RefreshCw className={`mr-1 h-3 w-3 ${syncing ? "animate-spin" : ""}`} />
                {syncing ? "Sincronizando..." : "Sincronizar Contactos"}
              </Button>
              <Button size="sm" variant="outline" onClick={handleConnect} disabled={connecting}>
                <RefreshCw className="mr-1 h-3 w-3" />
                Reconectar
              </Button>
              <Button size="sm" variant="ghost" className="text-destructive" onClick={handleDisconnect}>
                <Unlink className="mr-1 h-3 w-3" />
                Desconectar
              </Button>
            </div>
          </>
        ) : (
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">
              Conecta tu cuenta de Google para sincronizar contactos y gestionar tu calendario.
            </p>
            <Button onClick={handleConnect} disabled={connecting}>
              <Chrome className="mr-2 h-4 w-4" />
              {connecting ? "Conectando..." : "Conectar Google"}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
