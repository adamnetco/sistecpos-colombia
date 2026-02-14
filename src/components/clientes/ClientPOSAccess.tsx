import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Monitor, LogIn, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export function ClientPOSAccess() {
  const { toast } = useToast();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [store, setStore] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !password || !store) {
      toast({ title: "Completa todos los campos", variant: "destructive" });
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("connect-pos", {
        body: { username, password, store },
      });

      if (error) throw error;

      if (data?.redirect_url) {
        window.open(data.redirect_url, "_blank");
        toast({ title: "Redirigiendo al sistema POS..." });
      }
    } catch {
      toast({ title: "Error al conectar", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="max-w-lg">
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
            <Monitor className="h-5 w-5 text-primary" />
          </div>
          <div>
            <CardTitle className="text-lg">Acceder al Sistema POS</CardTitle>
            <CardDescription>Ingresa tus credenciales para abrir tu panel</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <Label htmlFor="pos-store">Empresa</Label>
            <Input id="pos-store" value={store} onChange={(e) => setStore(e.target.value)} required />
          </div>
          <div>
            <Label htmlFor="pos-user">Usuario</Label>
            <Input id="pos-user" value={username} onChange={(e) => setUsername(e.target.value)} required />
          </div>
          <div>
            <Label htmlFor="pos-pass">Contraseña</Label>
            <Input id="pos-pass" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
          </div>
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <LogIn className="mr-2 h-4 w-4" />}
            Ingresar al POS
          </Button>
          <p className="text-xs text-muted-foreground text-center">
            Se abrirá en una nueva pestaña. Haz clic en "Iniciar Sesión" en la página siguiente.
          </p>
        </form>
      </CardContent>
    </Card>
  );
}
