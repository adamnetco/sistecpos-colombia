import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Monitor, LogIn } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export function ClientPOSAccess() {
  const { toast } = useToast();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [store, setStore] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !password || !store) {
      toast({ title: "Completa todos los campos", variant: "destructive" });
      return;
    }

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
            <Label htmlFor="pos-user">Usuario</Label>
            <Input id="pos-user" value={username} onChange={(e) => setUsername(e.target.value)} required />
          </div>
          <div>
            <Label htmlFor="pos-store">Empresa</Label>
            <Input id="pos-store" value={store} onChange={(e) => setStore(e.target.value)} required />
          </div>
          <div>
            <Label htmlFor="pos-pass">Contraseña</Label>
            <Input id="pos-pass" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
          </div>
          <Button type="submit" className="w-full">
            <LogIn className="mr-2 h-4 w-4" />
            Ingresar al POS
          </Button>
          <p className="text-xs text-muted-foreground text-center">
            Se abrirá una nueva pestaña e ingresarás directamente a tu panel POS.
          </p>
        </form>
      </CardContent>
    </Card>
  );
}
