import { Layout } from "@/components/layout/Layout";
import { DynamicMeta } from "@/components/seo/DynamicMeta";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { Target, Eye, Heart, Users, Award, Clock, MapPin, Phone } from "lucide-react";
import eduardoTobacia from "@/assets/eduardo-tobacia.png";

const valores = [
  {
    icon: Heart,
    title: "Compromiso Local",
    description: "Estamos donde nos necesitas. Somos parte de tu comunidad en Santander."
  },
  {
    icon: Users,
    title: "Servicio Personalizado",
    description: "Cada negocio es único. Adaptamos nuestras soluciones a tus necesidades específicas."
  },
  {
    icon: Award,
    title: "Calidad Garantizada",
    description: "Software robusto respaldado por soporte técnico experto y presencial."
  },
  {
    icon: Clock,
    title: "Respuesta Inmediata",
    description: "Cuando nos necesitas, estamos ahí. Soporte el mismo día en tu negocio."
  }
];

const timeline = [
  {
    year: "Inicio",
    title: "Nacimiento de una Visión",
    description: "Eduardo Tobacia identifica la necesidad de soluciones POS con soporte local en Santander."
  },
  {
    year: "Crecimiento",
    title: "Expansión en el Área Metropolitana",
    description: "SistecPOS se consolida en Bucaramanga, Floridablanca, Girón y Piedecuesta."
  },
  {
    year: "Hoy",
    title: "Líder en Soporte Presencial",
    description: "Cientos de negocios confían en nuestro servicio de instalación y soporte local."
  }
];

export default function NosotrosPage() {
  return (
    <Layout>
      <DynamicMeta
        title="Sobre Nosotros | SistecPOS - Software POS en Santander"
        description="Conoce a SistecPOS: empresa de software POS con soporte presencial en Bucaramanga y el Área Metropolitana. Compromiso local, calidad garantizada."
        canonical="https://sistecpos.lovable.app/nosotros"
      />
      {/* Hero Section */}
      <section className="relative py-20 md:py-28 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-secondary/50 to-background" />
        <div className="container relative px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-3xl mx-auto text-center"
          >
            <span className="inline-block px-4 py-1.5 mb-6 text-sm font-medium rounded-full bg-primary/10 text-primary">
              Nuestra Historia
            </span>
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              Tecnología con{" "}
              <span className="gradient-text">Rostro Humano</span>
            </h1>
            <p className="text-lg text-muted-foreground">
              Somos más que un proveedor de software. Somos tu vecino, tu aliado tecnológico, 
              el experto que va a tu negocio cuando lo necesitas.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Founder Section */}
      <section className="py-16 md:py-24">
        <div className="container px-4">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="relative"
            >
              <div className="relative max-w-md mx-auto">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-accent/20 rounded-2xl transform rotate-3" />
                <img
                  src={eduardoTobacia}
                  alt="Eduardo Tobacia - Fundador de SistecPOS"
                  className="relative rounded-2xl shadow-card w-full"
                />
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Eduardo Tobacia
              </h2>
              <p className="text-lg text-primary font-medium mb-4">
                Fundador & Implementador Experto
              </p>
              <div className="space-y-4 text-muted-foreground">
                <p>
                  Con años de experiencia en el sector tecnológico, Eduardo fundó SistecPOS 
                  con una misión clara: ofrecer a los comerciantes de Santander una alternativa 
                  real a los grandes proveedores nacionales que solo ofrecen soporte remoto.
                </p>
                <p>
                  "Entendí que los negocios locales necesitaban algo más que un software. 
                  Necesitaban a alguien que fuera a su local, entendiera su operación y 
                  los acompañara en el proceso de digitalización."
                </p>
                <p>
                  Hoy, Eduardo lidera personalmente cada implementación, asegurando que 
                  cada cliente reciba la atención personalizada que merece.
                </p>
              </div>
              <div className="flex flex-wrap gap-4 mt-6">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <MapPin className="h-4 w-4 text-primary" />
                  <span>Área Metropolitana de Bucaramanga</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Phone className="h-4 w-4 text-primary" />
                  <span>+57 317 626 8307</span>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="py-16 md:py-24 bg-muted/30">
        <div className="container px-4">
          <div className="grid md:grid-cols-2 gap-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="bg-card rounded-2xl p-8 shadow-card"
            >
              <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-primary/10 mb-6">
                <Target className="h-7 w-7 text-primary" />
              </div>
              <h3 className="text-2xl font-bold mb-4">Nuestra Misión</h3>
              <p className="text-muted-foreground">
                Democratizar el acceso a tecnología POS de calidad para los comerciantes de Santander, 
                ofreciendo no solo software, sino un servicio integral que incluye instalación presencial, 
                capacitación práctica y soporte cercano.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="bg-card rounded-2xl p-8 shadow-card"
            >
              <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-accent/10 mb-6">
                <Eye className="h-7 w-7 text-accent" />
              </div>
              <h3 className="text-2xl font-bold mb-4">Nuestra Visión</h3>
              <p className="text-muted-foreground">
                Ser el referente en soluciones POS con servicio presencial en Colombia, 
                expandiendo nuestro modelo de atención personalizada a más ciudades, 
                sin perder nunca la cercanía que nos caracteriza.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Timeline */}
      <section className="py-16 md:py-24">
        <div className="container px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Nuestra Trayectoria
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Un camino construido con dedicación y compromiso hacia nuestros clientes.
            </p>
          </motion.div>

          <div className="max-w-3xl mx-auto">
            {timeline.map((item, index) => (
              <motion.div
                key={item.year}
                initial={{ opacity: 0, x: index % 2 === 0 ? -20 : 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="relative pl-8 pb-8 border-l-2 border-primary/20 last:pb-0"
              >
                <div className="absolute left-0 top-0 w-4 h-4 -translate-x-[9px] rounded-full bg-primary" />
                <span className="inline-block px-3 py-1 text-sm font-medium rounded-full bg-primary/10 text-primary mb-2">
                  {item.year}
                </span>
                <h3 className="text-xl font-bold mb-2">{item.title}</h3>
                <p className="text-muted-foreground">{item.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-16 md:py-24 bg-muted/30">
        <div className="container px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Nuestros Valores
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Los principios que guían cada interacción con nuestros clientes.
            </p>
          </motion.div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {valores.map((valor, index) => (
              <motion.div
                key={valor.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="bg-card rounded-2xl p-6 shadow-card text-center"
              >
                <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-primary/10 mx-auto mb-4">
                  <valor.icon className="h-7 w-7 text-primary" />
                </div>
                <h3 className="text-lg font-bold mb-2">{valor.title}</h3>
                <p className="text-sm text-muted-foreground">{valor.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 md:py-24">
        <div className="container px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="max-w-3xl mx-auto text-center"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              ¿Listo para conocernos?
            </h2>
            <p className="text-lg text-muted-foreground mb-8">
              Agenda una visita y descubre cómo podemos ayudar a tu negocio.
            </p>
            <Button 
              asChild 
              size="lg" 
              className="bg-whatsapp hover:bg-whatsapp/90 text-whatsapp-foreground"
            >
              <a
                href="https://wa.me/573176268307?text=Hola,%20quiero%20conocer%20más%20sobre%20SistecPOS"
                target="_blank"
                rel="noopener noreferrer"
              >
                Hablar con Eduardo
              </a>
            </Button>
          </motion.div>
        </div>
      </section>
    </Layout>
  );
}
