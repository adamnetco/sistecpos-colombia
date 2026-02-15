import { Layout } from "@/components/layout/Layout";
import { SEO } from "@/components/seo/SEO";
import { Breadcrumbs } from "@/components/seo/Breadcrumbs";
import { useWhatsAppConfig } from "@/hooks/useWhatsAppConfig";

export default function TerminosCondicionesPage() {
  const { buildUrl, displayPhone } = useWhatsAppConfig();
  return (
    <Layout>
      <SEO
        title="Términos y Condiciones | SistecPOS"
        description="Términos y condiciones de uso del software POS SistecPOS. Modelo de suscripción SaaS mensual y anual."
        canonical="https://sistecpos.com/terminos-condiciones"
      />
      <Breadcrumbs items={[{ label: "Términos y Condiciones" }]} />

      <article className="py-12 md:py-20">
        <div className="container px-4 max-w-3xl mx-auto prose prose-slate">
          <h1 id="titulo" className="text-3xl font-bold md:text-4xl mb-8">
            Términos y Condiciones de Uso
          </h1>

          <p className="text-muted-foreground">
            Última actualización: Febrero 2026
          </p>

          <h2 className="text-xl font-semibold mt-8 mb-4">
            1. Aceptación de los Términos
          </h2>
          <p>
            Al acceder y utilizar los servicios de <strong>SistecPOS</strong>,
            usted acepta estos términos y condiciones en su totalidad. Si no
            está de acuerdo, por favor absténgase de utilizar nuestros
            servicios.
          </p>

          <h2 className="text-xl font-semibold mt-8 mb-4">
            2. Descripción del Servicio
          </h2>
          <p>
            SistecPOS es un software de punto de venta (POS) ofrecido bajo el
            modelo de <strong>Software como Servicio (SaaS)</strong>. El acceso
            se concede mediante suscripción periódica (mensual o anual).{" "}
            <strong>
              No se venden licencias perpetuas ni de pago único.
            </strong>
          </p>

          <h2 className="text-xl font-semibold mt-8 mb-4">
            3. Modelo de Suscripción
          </h2>
          <ul className="list-disc pl-6 space-y-2">
            <li>
              <strong>Planes disponibles:</strong> Mensual, Anual Básico, Anual
              Intermedio, Anual Premium y Multi-tienda.
            </li>
            <li>
              <strong>Renovación:</strong> Las suscripciones se renuevan
              automáticamente al final de cada periodo. El usuario puede
              cancelar antes de la fecha de renovación.
            </li>
            <li>
              <strong>Periodo de prueba:</strong> Se ofrece un periodo de prueba
              gratuito de 7 días con acceso completo a todas las
              funcionalidades.
            </li>
            <li>
              <strong>Precios:</strong> Los precios pueden estar expresados en
              USD y COP. El cobro se realiza en pesos colombianos (COP) según la
              tasa de cambio vigente.
            </li>
          </ul>

          <h2 className="text-xl font-semibold mt-8 mb-4">
            4. Obligaciones del Usuario
          </h2>
          <ul className="list-disc pl-6 space-y-2">
            <li>
              Proporcionar información veraz y actualizada al momento del
              registro.
            </li>
            <li>
              No compartir las credenciales de acceso con terceros no
              autorizados.
            </li>
            <li>
              Utilizar el software de acuerdo con la legislación colombiana
              vigente.
            </li>
            <li>
              Mantener al día los pagos de la suscripción para garantizar la
              continuidad del servicio.
            </li>
          </ul>

          <h2 className="text-xl font-semibold mt-8 mb-4">
            5. Propiedad Intelectual
          </h2>
          <p>
            Todo el contenido, diseño, código fuente y funcionalidades del
            software son propiedad exclusiva de SistecPOS. La suscripción otorga
            un derecho de uso no exclusivo, no transferible y limitado al
            periodo contratado.
          </p>

          <h2 className="text-xl font-semibold mt-8 mb-4">
            6. Disponibilidad del Servicio
          </h2>
          <p>
            SistecPOS se compromete a mantener una disponibilidad del 99.5% del
            servicio en la nube. El software incluye funcionalidad offline de
            hasta 8 días con sincronización automática al restablecerse la
            conexión.
          </p>

          <h2 className="text-xl font-semibold mt-8 mb-4">
            7. Facturación Electrónica
          </h2>
          <p>
            SistecPOS incluye funcionalidad de facturación electrónica
            conforme a la normativa de la DIAN. El usuario es responsable de
            mantener actualizada su información tributaria y resolución de
            numeración.
          </p>

          <h2 className="text-xl font-semibold mt-8 mb-4">
            8. Soporte Técnico
          </h2>
          <ul className="list-disc pl-6 space-y-2">
            <li>
              <strong>Área Metropolitana de Bucaramanga:</strong> Instalación y
              soporte presencial incluido.
            </li>
            <li>
              <strong>Resto de Colombia:</strong> Instalación remota asistida y
              soporte técnico 24/7 vía WhatsApp.
            </li>
          </ul>

          <h2 className="text-xl font-semibold mt-8 mb-4">
            9. Cancelación y Reembolsos
          </h2>
          <p>
            El usuario puede cancelar su suscripción en cualquier momento. La
            cancelación será efectiva al final del periodo de facturación
            vigente. No se realizan reembolsos por periodos parciales, salvo
            durante el periodo de prueba gratuita.
          </p>

          <h2 className="text-xl font-semibold mt-8 mb-4">
            10. Limitación de Responsabilidad
          </h2>
          <p>
            SistecPOS no será responsable por pérdidas indirectas, incidentales
            o consecuentes derivadas del uso del software. La responsabilidad
            máxima se limita al valor de la suscripción pagada en los últimos 12
            meses.
          </p>

          <h2 className="text-xl font-semibold mt-8 mb-4">
            11. Legislación Aplicable
          </h2>
          <p>
            Estos términos se rigen por las leyes de la República de Colombia.
            Cualquier controversia será sometida a los tribunales competentes de
            la ciudad de Bucaramanga, Santander.
          </p>

          <h2 className="text-xl font-semibold mt-8 mb-4">
            12. Contacto
          </h2>
          <p>
            Para consultas sobre estos términos:
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li>
              Correo:{" "}
              <a
                href="mailto:info@sistecpos.com"
                className="text-primary hover:underline"
              >
                info@sistecpos.com
              </a>
            </li>
            <li>
              WhatsApp:{" "}
              <a
                href={buildUrl()}
                className="text-primary hover:underline"
              >
                {displayPhone}
              </a>
            </li>
          </ul>
        </div>
      </article>
    </Layout>
  );
}
