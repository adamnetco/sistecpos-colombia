import { useState, useEffect, useCallback, createContext, useContext, ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { User, Session } from "@supabase/supabase-js";

type AppRole = "admin" | "customer" | "reseller";

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  roles: AppRole[];
  isAdmin: boolean;
  isReseller: boolean;
  isCustomer: boolean;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
  loading: true,
  roles: [],
  isAdmin: false,
  isReseller: false,
  isCustomer: false,
  signOut: async () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [roles, setRoles] = useState<AppRole[]>([]);

  const fetchRoles = useCallback(async (userId: string) => {
    const { data } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", userId);
    setRoles((data || []).map((r) => r.role as AppRole));
  }, []);

  useEffect(() => {
    let mounted = true;
    let initialDone = false;

    // Get initial session first
    supabase.auth.getSession().then(({ data: { session: s } }) => {
      if (!mounted) return;
      initialDone = true;
      setSession(s);
      setUser(s?.user ?? null);
      setLoading(false);
      if (s?.user) fetchRoles(s.user.id);
    });

    // Listen for subsequent changes (sign-in, sign-out, token refresh)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, s) => {
        if (!mounted || !initialDone) return; // skip during initial load
        setSession(s);
        setUser(s?.user ?? null);
        if (s?.user) {
          fetchRoles(s.user.id);
        } else {
          setRoles([]);
        }
      }
    );

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [fetchRoles]);

  const signOut = useCallback(async () => {
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
    setRoles([]);
  }, []);

  const isAdmin = roles.includes("admin");
  const isReseller = roles.includes("reseller");
  const isCustomer = roles.includes("customer");

  return (
    <AuthContext.Provider value={{ user, session, loading, roles, isAdmin, isReseller, isCustomer, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
