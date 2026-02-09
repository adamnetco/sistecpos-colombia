import { Layout } from "@/components/layout/Layout";
import { SEO } from "@/components/seo/SEO";
import { Breadcrumbs } from "@/components/seo/Breadcrumbs";

export default function PoliticaPrivacidadPage() {
  return (
    <Layout>
      <SEO
        title="Política de Privacidad y Habeas Data | SistecPOS"
        description="Conoce nuestra política de tratamiento de datos personales conforme a la Ley 1581 de 2012 de Colombia."
        canonical="https://sistecpos.com/politica-privacidad"
      />
      <Breadcrumbs items={[{ label: "Política de Privacidad" }]} />

      <article className="py-12 md:py-20">
        <div className="container px-4 max-w-3xl mx-auto prose prose-slate">
          <h1 id="titulo" className="text-3xl font-bold md:text-4xl mb-8">
            Política de Privacidad y Tratamiento de Datos Personales
          </h1>

          <p className="text-muted-foreground">
            Última actualización: Febrero 2026
          </p>

          <h2 className="text-xl font-semibold mt-8 mb-4">
            1. Responsable del Tratamiento
          </h2>
          <p>
            <strong>SistecPOS</strong> – Sistema y Soluciones Tecnológicas POS
            <br />
            Dirección: Área Metropolitana de Bucaramanga, Santander, Colombia
            <br />
            Correo: info@sistecpos.com
            <br />
            WhatsApp: +57 317 626 8307
          </p>

          <h2 className="text-xl font-semibold mt-8 mb-4">
            2. Marco Legal
          </h2>
          <p>
            Esta política se rige por la <strong>Ley 1581 de 2012</strong>{" "}
            (Habeas Data), el <strong>Decreto 1377 de 2013</strong> y demás
            normas concordantes de la República de Colombia que regulan el
            tratamiento de datos personales.
          </p>

          <h2 className="text-xl font-semibold mt-8 mb-4">
            3. Datos que Recopilamos
          </h2>
          <ul className="list-disc pl-6 space-y-2">
            <li>
              <strong>Datos de identificación:</strong> nombre completo, nombre
              del negocio.
            </li>
            <li>
              <strong>Datos de contacto:</strong> número de WhatsApp, correo
              electrónico.
            </li>
            <li>
              <strong>Datos de navegación:</strong> dirección IP, tipo de
              navegador, páginas visitadas (mediante cookies).
            </li>
          </ul>

          <h2 className="text-xl font-semibold mt-8 mb-4">
            4. Finalidades del Tratamiento
          </h2>
          <ul className="list-disc pl-6 space-y-2">
            <li>
              Responder solicitudes de demostración y cotización del software
              POS.
            </li>
            <li>
              Enviar información comercial sobre productos, servicios y
              promociones vía WhatsApp o correo electrónico.
            </li>
            <li>Brindar soporte técnico y servicio al cliente.</li>
            <li>
              Mejorar la experiencia de navegación y los servicios ofrecidos.
            </li>
          </ul>

          <h2 className="text-xl font-semibold mt-8 mb-4">
            5. Derechos del Titular (ARCO)
          </h2>
          <p>
            Como titular de los datos, usted tiene derecho a:
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li>
              <strong>Acceder</strong> a sus datos personales.
            </li>
            <li>
              <strong>Rectificar</strong> datos inexactos o incompletos.
            </li>
            <li>
              <strong>Cancelar</strong> (suprimir) sus datos cuando lo considere
              pertinente.
            </li>
            <li>
              <strong>Oponerse</strong> al tratamiento de sus datos para fines
              específicos.
            </li>
            <li>
              <strong>Revocar</strong> la autorización otorgada.
            </li>
          </ul>
          <p>
            Para ejercer estos derechos, envíe su solicitud a{" "}
            <a
              href="mailto:info@sistecpos.com"
              className="text-primary hover:underline"
            >
              info@sistecpos.com
            </a>
            .
          </p>

          <h2 className="text-xl font-semibold mt-8 mb-4">
            6. Seguridad de los Datos
          </h2>
          <p>
            Implementamos medidas técnicas y organizativas para proteger sus
            datos contra acceso no autorizado, pérdida o alteración. Los datos
            recopilados a través de formularios son transmitidos de forma segura
            y no se almacenan en servidores propios.
          </p>

          <h2 className="text-xl font-semibold mt-8 mb-4">
            7. Transferencia de Datos
          </h2>
          <p>
            No vendemos, alquilamos ni compartimos sus datos personales con
            terceros, salvo cuando sea estrictamente necesario para la
            prestación del servicio o por requerimiento legal.
          </p>

          <h2 className="text-xl font-semibold mt-8 mb-4">
            8. Vigencia
          </h2>
          <p>
            Esta política entra en vigencia a partir de su publicación y los
            datos serán tratados mientras subsista la finalidad para la cual
            fueron recopilados o hasta que el titular solicite su eliminación.
          </p>

          <h2 className="text-xl font-semibold mt-8 mb-4">
            9. Contacto
          </h2>
          <p>
            Para consultas o reclamos relacionados con el tratamiento de datos
            personales, puede contactarnos en:
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
                href="https://wa.me/573176268307"
                className="text-primary hover:underline"
              >
                +57 317 626 8307
              </a>
            </li>
          </ul>
        </div>
      </article>
    </Layout>
  );
}
