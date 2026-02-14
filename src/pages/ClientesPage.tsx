import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Layout } from "@/components/layout/Layout";
import { ClientPOSLogin } from "@/components/clientes/ClientPOSLogin";
import { ClientPortal } from "@/components/clientes/ClientPortal";
import { SEO } from "@/components/seo/SEO";

export default function ClientesPage() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <Layout>
        <div className="flex min-h-[60vh] items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <SEO
        title="Acceso Clientes | SistecPOS"
        description="Ingresa a tu sistema POS SistecPOS. Accede a soporte, descargas y entrenamientos."
      />
      {user ? <ClientPortal /> : <ClientPOSLogin />}
    </Layout>
  );
}
