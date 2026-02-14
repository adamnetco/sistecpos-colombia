import { useState } from "react";
import { lovable } from "@/integrations/lovable/index";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Monitor, LogIn, Download, HeadphonesIcon } from "lucide-react";
import { Link } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

export function ClientPOSLogin() {
  const { toast } = useToast();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [store, setStore] = useState("");
  const [loading, setLoading] = useState(false);

  const handlePOSLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !password || !store) {
      toast({ title: "Completa todos los campos", variant: "destructive" });
      return;
    }

    // Create a hidden form that POSTs directly to the POS login endpoint
    // This way the browser handles cookies natively (no cross-origin issues)
    const form = document.createElement("form");
    form.method = "POST";
    form.action = "https://softwarepos.online/index.php/login/index/1";
    form.target = "_blank";

    const fields = { username, password, store, remember_user: "1" };
    for (const [key, value] of Object.entries(fields)) {
      const input = document.createElement("input");
      input.type = "hidden";
      input.name = key;
      input.value = value;
      form.appendChild(input);
    }

    document.body.appendChild(form);
    form.submit();
    document.body.removeChild(form);

    toast({ title: "Abriendo tu sistema POS..." });
  };

  const handleGoogleLogin = async () => {
    const { error } = await lovable.auth.signInWithOAuth("google", {
      redirect_uri: `${window.location.origin}/clientes`,
    });
    if (error) {
      toast({ title: "Error al iniciar sesión con Google", variant: "destructive" });
    }
  };

  return (
    <section className="py-16 md:py-24">
      <div className="container px-4">
        <div className="mx-auto max-w-5xl">
          <div className="mb-10 text-center">
            <h1 className="text-3xl font-bold md:text-4xl">Acceso Clientes</h1>
            <p className="mt-2 text-muted-foreground">Ingresa a tu sistema POS o accede al portal de soporte</p>
          </div>

          <div className="grid gap-8 md:grid-cols-2">
            {/* POS Login */}
            <Card className="border-2">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                    <Monitor className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <CardTitle>Ingresar al POS</CardTitle>
                    <CardDescription>Accede a tu sistema de facturación</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <form onSubmit={handlePOSLogin} className="space-y-4">
                  <div>
                    <Label htmlFor="username">Usuario</Label>
                    <Input
                      id="username"
                      placeholder="Tu usuario"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="store">Empresa</Label>
                    <Input
                      id="store"
                      placeholder="Nombre de tu empresa"
                      value={store}
                      onChange={(e) => setStore(e.target.value)}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="password">Contraseña</Label>
                    <Input
                      id="password"
                      type="password"
                      placeholder="Tu contraseña"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                  </div>
                  <Button type="submit" className="w-full">
                    <LogIn className="mr-2 h-4 w-4" />
                    Ingresar al Sistema
                  </Button>
                  <p className="text-xs text-muted-foreground text-center">
                    Se abrirá una nueva pestaña e ingresarás directamente a tu panel POS.
                  </p>
                </form>
              </CardContent>
            </Card>

            {/* Support Portal Login */}
            <Card className="border-2 border-dashed">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-accent/50">
                    <HeadphonesIcon className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <CardTitle>Portal de Soporte</CardTitle>
                    <CardDescription>Tickets, entrenamientos y descargas</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <p className="text-sm text-muted-foreground">
                  Inicia sesión con Google para acceder a soporte técnico,
                  material de capacitación y herramientas de descarga.
                </p>
                <Button
                  onClick={handleGoogleLogin}
                  variant="outline"
                  className="w-full gap-2"
                  size="lg"
                >
                  <svg className="h-5 w-5" viewBox="0 0 24 24">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                  </svg>
                  Continuar con Google
                </Button>

                <Separator />

                <div className="space-y-3">
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Acceso rápido</p>
                  <Button variant="ghost" className="w-full justify-start gap-2" asChild>
                    <Link to="/ayuda">
                      <Download className="h-4 w-4" />
                      Ayuda y Descargas
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </section>
  );
}
