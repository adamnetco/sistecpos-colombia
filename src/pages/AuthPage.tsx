import { useState, useEffect } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { useToast } from "@/hooks/use-toast";
import { Mail, Lock, Chrome, ArrowLeft, ShieldCheck, Eye, EyeOff, Home, LayoutDashboard, Handshake, User as UserIcon, CheckCircle2, UserPlus } from "lucide-react";
import { SEO } from "@/components/seo/SEO";
import { motion, AnimatePresence } from "framer-motion";
import type { User, Session } from "@supabase/supabase-js";

type AuthView = "login" | "signup" | "forgot" | "reset" | "otp" | "role_picker" | "signup_success";

export default function AuthPage() {
  const [view, setView] = useState<AuthView>("login");
  const [email, setEmail] = useState("");
  const [fullName, setFullName] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [otpCode, setOtpCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [pendingEmail, setPendingEmail] = useState("");
  const [pending2FA, setPending2FA] = useState(false);
  const [availableRoles, setAvailableRoles] = useState<string[]>([]);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [signupEmail, setSignupEmail] = useState(""); // stored after successful signup
  const navigate = useNavigate();
  const { toast } = useToast();
  const [searchParams] = useSearchParams();
  const registroRole = searchParams.get("registro"); // cliente | socio | admin

  // Track if user arrived from OAuth callback to skip cleanup
  const [isOAuthReturn, setIsOAuthReturn] = useState(false);

  // Auto-switch to signup view if ?registro= param is present
  useEffect(() => {
    if (registroRole && view === "login") {
      setView("signup");
    }
  }, [registroRole]);

  // Clean up stale session on /auth load (prevents access blocking)
  useEffect(() => {
    const type = searchParams.get("type");
    if (type === "recovery") {
      setView("reset");
      return;
    }

    // Detect OAuth return — Lovable Cloud redirects back after /~oauth processing
    const referrer = document.referrer;
    const isFromOAuth = referrer.includes("/~oauth") || 
      sessionStorage.getItem("oauth_in_progress") === "true";
    
    if (isFromOAuth) {
      setIsOAuthReturn(true);
      sessionStorage.removeItem("oauth_in_progress");
      return; // Do NOT clean up — session is fresh from OAuth
    }

    // If no recovery/OAuth flow, clear any stuck session so login is always fresh
    const cleanup = async () => {
      const { data: { session: existingSession } } = await supabase.auth.getSession();
      if (existingSession && !searchParams.get("type")) {
        const hash = window.location.hash;
        if (!hash.includes("access_token") && !hash.includes("refresh_token")) {
          await supabase.auth.signOut();
        }
      }
    };
    cleanup();
  }, [searchParams]);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        if (event === "PASSWORD_RECOVERY") {
          setView("reset");
        }
        // Mark OAuth returns so cleanup doesn't kill the session
        if (event === "SIGNED_IN" && session) {
          setIsOAuthReturn(true);
        }
      }
    );

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const { isAdmin } = useAuth();

  useEffect(() => {
    if (user && !pending2FA && view !== "reset" && view !== "otp" && view !== "role_picker") {
      const checkRedirect = async () => {
        const userEmail = user.email?.toLowerCase();

        // Use SECURITY DEFINER function to auto-link reseller (bypasses RLS)
        if (userEmail) {
          const { data: linkResult } = await supabase.rpc("link_reseller_on_login", {
            _user_id: user.id,
            _user_email: userEmail,
          });

          const result = linkResult as unknown as { linked: boolean; reseller_id?: string } | null;
          if (result?.linked) {
            // Still check all roles — user might have more
          }
        }

        // Fetch all roles
        const { data: userRoles } = await supabase
          .from("user_roles")
          .select("role")
          .eq("user_id", user.id);

        const roles = (userRoles || []).map((r) => r.role);

        // If user has multiple roles, show picker
        if (roles.length > 1) {
          setAvailableRoles(roles);
          setView("role_picker");
          return;
        }

        // Single role — redirect directly
        if (roles.includes("admin")) {
          navigate("/admin");
        } else if (roles.includes("reseller")) {
          navigate("/socio");
        } else if (roles.includes("customer")) {
          navigate("/clientes");
        } else {
          navigate("/");
        }
      };
      checkRedirect();
    }
  }, [user, view, pending2FA, navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast({ title: "Completa todos los campos", variant: "destructive" });
      return;
    }

    setLoading(true);
    setPending2FA(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        setPending2FA(false);
        if (error.message.includes("Invalid login")) {
          toast({ title: "Credenciales incorrectas", description: "Verifica tu email y contraseña", variant: "destructive" });
        } else if (error.message.includes("Email not confirmed")) {
          toast({ title: "Email no verificado", description: "Revisa tu correo para confirmar tu cuenta", variant: "destructive" });
        } else {
          toast({ title: "Error al iniciar sesión", description: error.message, variant: "destructive" });
        }
        return;
      }

      setPendingEmail(email);
      setView("otp");
      await send2FACode(email);
      await supabase.auth.signOut();
    } finally {
      setLoading(false);
    }
  };

  const send2FACode = async (targetEmail: string) => {
    try {
      const { data, error } = await supabase.functions.invoke("send-otp", {
        body: { email: targetEmail, type: "2fa" },
      });
      if (error) throw error;
      toast({ title: "Código enviado", description: "Revisa tu correo electrónico" });
    } catch (err) {
      console.error("OTP send error:", err);
      toast({ title: "Error al enviar código", variant: "destructive" });
    }
  };

  const handleVerifyOTP = async () => {
    if (otpCode.length !== 6) {
      toast({ title: "Ingresa el código de 6 dígitos", variant: "destructive" });
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("send-otp", {
        body: { email: pendingEmail, type: "verify", code: otpCode },
      });

      if (error || !data?.valid) {
        toast({ title: "Código inválido o expirado", description: "Intenta de nuevo", variant: "destructive" });
        return;
      }

      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: pendingEmail,
        password,
      });

      if (signInError) {
        toast({ title: "Error al iniciar sesión", description: signInError.message, variant: "destructive" });
        return;
      }

      setPending2FA(false);
      setView("login"); // Reset view so redirect useEffect can trigger
      toast({ title: "Verificación exitosa ✅" });
    } finally {
      setLoading(false);
    }
  };

  const getPasswordStrength = (pw: string): { label: string; color: string; percent: number } => {
    if (!pw) return { label: "", color: "", percent: 0 };
    let score = 0;
    if (pw.length >= 6) score++;
    if (pw.length >= 10) score++;
    if (/[A-Z]/.test(pw)) score++;
    if (/[0-9]/.test(pw)) score++;
    if (/[^A-Za-z0-9]/.test(pw)) score++;
    if (score <= 1) return { label: "Débil", color: "bg-destructive", percent: 20 };
    if (score <= 2) return { label: "Regular", color: "bg-orange-500", percent: 40 };
    if (score <= 3) return { label: "Buena", color: "bg-yellow-500", percent: 60 };
    if (score <= 4) return { label: "Fuerte", color: "bg-emerald-500", percent: 80 };
    return { label: "Muy fuerte", color: "bg-emerald-600", percent: 100 };
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password || !fullName.trim()) {
      toast({ title: "Completa todos los campos", variant: "destructive" });
      return;
    }
    if (password.length < 6) {
      toast({ title: "La contraseña debe tener al menos 6 caracteres", variant: "destructive" });
      return;
    }
    if (password !== confirmPassword) {
      toast({ title: "Las contraseñas no coinciden", variant: "destructive" });
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth`,
          data: { full_name: fullName.trim() },
        },
      });
      if (error) {
        if (error.message.includes("already registered")) {
          toast({ title: "Este email ya está registrado", description: "Intenta iniciar sesión", variant: "destructive" });
        } else {
          toast({ title: "Error al registrarse", description: error.message, variant: "destructive" });
        }
        return;
      }

      // Send WhatsApp admin notification (fire-and-forget)
      const rolLabel = registroRole === "cliente" ? "Cliente"
        : registroRole === "socio" ? "Socio distribuidor"
        : registroRole === "admin" ? "Administrador"
        : "Público (sin rol)";

      supabase.functions.invoke("send-whatsapp", {
        body: {
          event_type: "new_user_signup",
          variables: {
            full_name: fullName.trim(),
            email,
            requested_role: rolLabel,
            date: new Date().toLocaleString("es-CO", { timeZone: "America/Bogota" }),
          },
        },
      }).catch(() => {}); // silent

      // Store email for success view, then clear form
      setSignupEmail(email);
      setEmail("");
      setPassword("");
      setConfirmPassword("");
      setFullName("");
      setShowPassword(false);
      setShowConfirmPassword(false);
      setView("signup_success");
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      toast({ title: "Ingresa tu email", variant: "destructive" });
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth?type=recovery`,
      });
      if (error) {
        toast({ title: "Error", description: error.message, variant: "destructive" });
      } else {
        toast({ title: "Correo enviado 📧", description: "Revisa tu bandeja de entrada para restablecer tu contraseña." });
        setView("login");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password || password.length < 6) {
      toast({ title: "La contraseña debe tener al menos 6 caracteres", variant: "destructive" });
      return;
    }
    if (password !== confirmPassword) {
      toast({ title: "Las contraseñas no coinciden", variant: "destructive" });
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({ password });
      if (error) {
        toast({ title: "Error al actualizar contraseña", description: error.message, variant: "destructive" });
      } else {
        toast({ title: "Contraseña actualizada ✅", description: "Ya puedes iniciar sesión con tu nueva contraseña." });
        await supabase.auth.signOut();
        setView("login");
        setPassword("");
        setConfirmPassword("");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    try {
      // Flag so cleanup doesn't kill the OAuth session on return
      sessionStorage.setItem("oauth_in_progress", "true");
      const { error } = await lovable.auth.signInWithOAuth("google", {
        redirect_uri: `${window.location.origin}/auth`,
      });
      if (error) {
        sessionStorage.removeItem("oauth_in_progress");
        toast({ title: "Error con Google", description: error.message, variant: "destructive" });
      }
    } finally {
      setLoading(false);
    }
  };

  const renderPasswordInput = (
    id: string,
    value: string,
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void,
    placeholder: string,
    show: boolean,
    onToggle: () => void,
  ) => (
    <div className="relative">
      <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
      <Input
        id={id}
        type={show ? "text" : "password"}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        className="pl-10 pr-10"
        minLength={6}
        required
      />
      <button
        type="button"
        onClick={onToggle}
        className="absolute right-3 top-3 text-muted-foreground hover:text-foreground transition-colors"
        tabIndex={-1}
        aria-label={show ? "Ocultar contraseña" : "Mostrar contraseña"}
      >
        {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
      </button>
    </div>
  );

  const renderBackToHome = () => (
    <div className="text-center pt-2">
      <Link
        to="/"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary transition-colors"
      >
        <Home className="h-3.5 w-3.5" />
        Volver al inicio
      </Link>
    </div>
  );

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-secondary via-background to-secondary/50 px-4 py-8">
      <SEO title="Iniciar Sesión | SistecPOS" description="Accede al panel de gestión de SistecPOS" noindex />

      {/* Decorative blurred circles */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -top-32 -left-32 h-96 w-96 rounded-full bg-primary/5 blur-3xl" />
        <div className="absolute -bottom-32 -right-32 h-96 w-96 rounded-full bg-accent/5 blur-3xl" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="w-full max-w-md relative z-10"
      >
        <Card className="shadow-xl border-border/50 backdrop-blur-sm">
          <CardHeader className="text-center pb-2">
            <Link to="/" className="inline-block mx-auto mb-4 hover:opacity-80 transition-opacity">
              <img
                src="/lovable-uploads/43a24c53-78c0-4ca3-b642-99a376d90a0f.png"
                alt="SistecPOS"
                className="h-10"
              />
            </Link>

            <motion.div
              key={view}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25 }}
            >
              {view === "login" && (
                <>
                  <CardTitle className="text-2xl font-display">Bienvenido de nuevo</CardTitle>
                  <CardDescription>Accede al panel de gestión</CardDescription>
                </>
              )}
              {view === "signup" && (
                <>
                  <CardTitle className="text-2xl font-display">Crear Cuenta</CardTitle>
                  <CardDescription>
                    {registroRole === "cliente"
                      ? "Regístrate para acceder al portal de clientes"
                      : registroRole === "socio"
                      ? "Regístrate para aplicar como socio distribuidor"
                      : registroRole === "admin"
                      ? "Regístrate para solicitar acceso administrativo"
                      : "Regístrate para comenzar"}
                  </CardDescription>
                </>
              )}
              {view === "forgot" && (
                <>
                  <CardTitle className="text-2xl font-display">Restablecer Contraseña</CardTitle>
                  <CardDescription>Te enviaremos un enlace para restablecer tu contraseña</CardDescription>
                </>
              )}
              {view === "reset" && (
                <>
                  <CardTitle className="text-2xl font-display">Nueva Contraseña</CardTitle>
                  <CardDescription>Ingresa tu nueva contraseña</CardDescription>
                </>
              )}
              {view === "otp" && (
                <>
                  <CardTitle className="text-2xl font-display">Verificación de Seguridad</CardTitle>
                  <CardDescription>
                    Ingresa el código de 6 dígitos enviado a <strong>{pendingEmail}</strong>
                  </CardDescription>
                </>
              )}
              {view === "role_picker" && (
                <>
                  <CardTitle className="text-2xl font-display">¿A dónde deseas ir?</CardTitle>
                  <CardDescription>Tienes acceso a múltiples paneles</CardDescription>
                </>
              )}
              {view === "signup_success" && (
                <>
                  <CardTitle className="text-2xl font-display">¡Registro Exitoso! 🎉</CardTitle>
                  <CardDescription>Solo falta un paso para activar tu cuenta</CardDescription>
                </>
              )}
            </motion.div>
          </CardHeader>

          <CardContent className="space-y-4 pt-2">
            {/* Role picker view */}
            {view === "role_picker" && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="space-y-4"
              >
                <p className="text-center text-sm text-muted-foreground">
                  Bienvenido, <strong>{user?.email}</strong>
                </p>
                <div className="space-y-2">
                  {availableRoles.includes("admin") && (
                    <Button
                      variant="outline"
                      className="w-full h-14 justify-start gap-3 text-left"
                      onClick={() => navigate("/admin")}
                    >
                      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10">
                        <LayoutDashboard className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <div className="font-medium">Panel Admin</div>
                        <div className="text-xs text-muted-foreground">Gestión completa del sistema</div>
                      </div>
                    </Button>
                  )}
                  {availableRoles.includes("reseller") && (
                    <Button
                      variant="outline"
                      className="w-full h-14 justify-start gap-3 text-left"
                      onClick={() => navigate("/socio")}
                    >
                      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10">
                        <Handshake className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <div className="font-medium">Portal Socios</div>
                        <div className="text-xs text-muted-foreground">Licencias, comisiones y soporte</div>
                      </div>
                    </Button>
                  )}
                  {availableRoles.includes("customer") && (
                    <Button
                      variant="outline"
                      className="w-full h-14 justify-start gap-3 text-left"
                      onClick={() => navigate("/clientes")}
                    >
                      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10">
                        <UserIcon className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <div className="font-medium">Portal Clientes</div>
                        <div className="text-xs text-muted-foreground">Acceso POS, tickets y descargas</div>
                      </div>
                    </Button>
                  )}
                </div>
                {renderBackToHome()}
              </motion.div>
            )}

            {/* OTP verification view */}
            {view === "otp" && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="space-y-6"
              >
                <div className="flex justify-center">
                  <div className="rounded-full bg-primary/10 p-4">
                    <ShieldCheck className="h-12 w-12 text-primary" />
                  </div>
                </div>
                <div className="flex justify-center">
                  <InputOTP maxLength={6} value={otpCode} onChange={setOtpCode}>
                    <InputOTPGroup>
                      <InputOTPSlot index={0} />
                      <InputOTPSlot index={1} />
                      <InputOTPSlot index={2} />
                      <InputOTPSlot index={3} />
                      <InputOTPSlot index={4} />
                      <InputOTPSlot index={5} />
                    </InputOTPGroup>
                  </InputOTP>
                </div>
                <Button
                  onClick={handleVerifyOTP}
                  disabled={loading || otpCode.length !== 6}
                  className="w-full h-12 text-base gradient-bg text-primary-foreground"
                >
                  {loading ? "Verificando..." : "Verificar Código"}
                </Button>
                <div className="text-center space-y-2">
                  <button
                    type="button"
                    className="text-sm text-primary hover:underline"
                    onClick={() => send2FACode(pendingEmail)}
                  >
                    Reenviar código
                  </button>
                  <br />
                  <button
                    type="button"
                    className="text-sm text-muted-foreground hover:underline flex items-center gap-1 mx-auto"
                    onClick={() => { setView("login"); setOtpCode(""); setPending2FA(false); }}
                  >
                    <ArrowLeft className="h-3 w-3" /> Volver al inicio de sesión
                  </button>
                </div>
                {renderBackToHome()}
              </motion.div>
            )}

            {/* Login view */}
            {view === "login" && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
                <Button
                  variant="outline"
                  className="w-full h-12 text-base font-medium border-border/80 hover:bg-secondary/60"
                  onClick={handleGoogleLogin}
                  disabled={loading}
                >
                  <Chrome className="mr-2 h-5 w-5" />
                  Continuar con Google
                </Button>

                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-card px-2 text-muted-foreground">o con email</span>
                  </div>
                </div>

                <form onSubmit={handleLogin} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="email"
                        type="email"
                        placeholder="tu@email.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="pl-10"
                        required
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="password">Contraseña</Label>
                      <button
                        type="button"
                        className="text-xs text-primary hover:underline"
                        onClick={() => setView("forgot")}
                      >
                        ¿Olvidaste tu contraseña?
                      </button>
                    </div>
                    {renderPasswordInput("password", password, (e) => setPassword(e.target.value), "Mínimo 6 caracteres", showPassword, () => setShowPassword(!showPassword))}
                  </div>
                  <Button type="submit" className="w-full h-12 text-base gradient-bg text-primary-foreground" disabled={loading}>
                    {loading ? "Cargando..." : "Iniciar Sesión"}
                  </Button>
                </form>

                <div className="text-center text-sm">
                  <button type="button" className="text-primary hover:underline" onClick={() => setView("signup")}>
                    ¿No tienes cuenta? Regístrate
                  </button>
                </div>

                {renderBackToHome()}
              </motion.div>
            )}

            {/* Signup success view */}
            {view === "signup_success" && (
              <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="space-y-6">
                <div className="flex justify-center">
                  <div className="rounded-full bg-emerald-100 dark:bg-emerald-900/30 p-5">
                    <CheckCircle2 className="h-14 w-14 text-emerald-600 dark:text-emerald-400" />
                  </div>
                </div>
                <div className="text-center space-y-2">
                  <p className="text-sm text-foreground font-medium">
                    Hemos enviado un correo de verificación a:
                  </p>
                  <p className="text-primary font-semibold text-lg break-all">{signupEmail}</p>
                  <div className="bg-muted/50 rounded-lg p-4 mt-4 text-left space-y-2">
                    <p className="text-sm text-muted-foreground font-medium">📋 Pasos siguientes:</p>
                    <ol className="text-sm text-muted-foreground list-decimal list-inside space-y-1">
                      <li>Revisa tu bandeja de entrada (y spam)</li>
                      <li>Haz clic en el enlace de verificación</li>
                      <li>Inicia sesión con tus credenciales</li>
                    </ol>
                  </div>
                  {registroRole && (
                    <p className="text-xs text-primary/80 mt-2">
                      {registroRole === "cliente"
                        ? "Un administrador te asignará acceso de cliente tras la verificación."
                        : registroRole === "socio"
                        ? "Un administrador revisará tu perfil de socio."
                        : registroRole === "admin"
                        ? "Un administrador te asignará permisos administrativos."
                        : ""}
                    </p>
                  )}
                </div>
                <Button
                  className="w-full h-12 text-base gradient-bg text-primary-foreground"
                  onClick={() => { setView("login"); }}
                >
                  Ir a Iniciar Sesión
                </Button>
                {renderBackToHome()}
              </motion.div>
            )}

            {/* Signup view */}
            {view === "signup" && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
                <Button
                  variant="outline"
                  className="w-full h-12 text-base font-medium border-border/80 hover:bg-secondary/60"
                  onClick={handleGoogleLogin}
                  disabled={loading}
                >
                  <Chrome className="mr-2 h-5 w-5" />
                  Continuar con Google
                </Button>

                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-card px-2 text-muted-foreground">o con email</span>
                  </div>
                </div>

                <form onSubmit={handleSignUp} className="space-y-3">
                  <div className="space-y-2">
                    <Label htmlFor="signup-name">Nombre completo</Label>
                    <div className="relative">
                      <UserPlus className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="signup-name"
                        type="text"
                        placeholder="Tu nombre"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        className="pl-10"
                        required
                        maxLength={100}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-email">Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="signup-email"
                        type="email"
                        placeholder="tu@email.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="pl-10"
                        required
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-password">Contraseña</Label>
                    {renderPasswordInput("signup-password", password, (e) => setPassword(e.target.value), "Mínimo 6 caracteres", showPassword, () => setShowPassword(!showPassword))}
                    {password && (
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full transition-all duration-300 ${getPasswordStrength(password).color}`}
                              style={{ width: `${getPasswordStrength(password).percent}%` }}
                            />
                          </div>
                          <span className="text-xs text-muted-foreground whitespace-nowrap">
                            {getPasswordStrength(password).label}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-confirm-password">Confirmar contraseña</Label>
                    {renderPasswordInput("signup-confirm-password", confirmPassword, (e) => setConfirmPassword(e.target.value), "Repite la contraseña", showConfirmPassword, () => setShowConfirmPassword(!showConfirmPassword))}
                    {confirmPassword && confirmPassword !== password && (
                      <p className="text-xs text-destructive">Las contraseñas no coinciden</p>
                    )}
                  </div>
                  <Button
                    type="submit"
                    className="w-full h-12 text-base gradient-bg text-primary-foreground"
                    disabled={loading || !fullName.trim() || !email || !password || password !== confirmPassword}
                  >
                    {loading ? "Registrando..." : "Crear mi cuenta"}
                  </Button>
                </form>

                <p className="text-xs text-center text-muted-foreground">
                  Al registrarte, recibirás un correo de verificación para activar tu cuenta.
                </p>

                <div className="text-center text-sm">
                  <button type="button" className="text-primary hover:underline" onClick={() => setView("login")}>
                    ¿Ya tienes cuenta? Inicia sesión
                  </button>
                </div>

                {renderBackToHome()}
              </motion.div>
            )}

            {/* Forgot password view */}
            {view === "forgot" && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <form onSubmit={handleForgotPassword} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="forgot-email">Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="forgot-email"
                        type="email"
                        placeholder="tu@email.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="pl-10"
                        required
                      />
                    </div>
                  </div>
                  <Button type="submit" className="w-full h-12 text-base gradient-bg text-primary-foreground" disabled={loading}>
                    {loading ? "Enviando..." : "Enviar Enlace de Recuperación"}
                  </Button>
                  <div className="text-center">
                    <button
                      type="button"
                      className="text-sm text-muted-foreground hover:underline flex items-center gap-1 mx-auto"
                      onClick={() => setView("login")}
                    >
                      <ArrowLeft className="h-3 w-3" /> Volver al inicio de sesión
                    </button>
                  </div>
                  {renderBackToHome()}
                </form>
              </motion.div>
            )}

            {/* Reset password view */}
            {view === "reset" && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <form onSubmit={handleResetPassword} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="new-password">Nueva Contraseña</Label>
                    {renderPasswordInput("new-password", password, (e) => setPassword(e.target.value), "Mínimo 6 caracteres", showPassword, () => setShowPassword(!showPassword))}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="confirm-password">Confirmar Contraseña</Label>
                    {renderPasswordInput("confirm-password", confirmPassword, (e) => setConfirmPassword(e.target.value), "Repite la contraseña", showConfirmPassword, () => setShowConfirmPassword(!showConfirmPassword))}
                  </div>
                  <Button type="submit" className="w-full h-12 text-base gradient-bg text-primary-foreground" disabled={loading}>
                    {loading ? "Actualizando..." : "Guardar Nueva Contraseña"}
                  </Button>
                  {renderBackToHome()}
                </form>
              </motion.div>
            )}
          </CardContent>
        </Card>

        <p className="text-center text-xs text-muted-foreground mt-4">
          © {new Date().getFullYear()} SistecPOS · Todos los derechos reservados
        </p>
      </motion.div>
    </div>
  );
}
