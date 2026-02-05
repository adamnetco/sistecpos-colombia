import { Layout } from "@/components/layout/Layout";
import { motion } from "framer-motion";
import {
  MapPin,
  Phone,
  Mail,
  Clock,
  MessageCircle,
  Calendar,
  ExternalLink,
  Instagram,
  Facebook,
  Youtube,
  Linkedin,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

// X (Twitter) icon
const XIcon = () => (
  <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
);

// TikTok icon
const TikTokIcon = () => (
  <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor">
    <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-5.2 1.74 2.89 2.89 0 012.31-4.64 2.93 2.93 0 01.88.13V9.4a6.84 6.84 0 00-1-.05A6.33 6.33 0 005 20.1a6.34 6.34 0 0010.86-4.43v-7a8.16 8.16 0 004.77 1.52v-3.4a4.85 4.85 0 01-1-.1z" />
  </svg>
);

const socialLinks = [
  {
    name: "WhatsApp",
    icon: MessageCircle,
    href: "https://wa.me/573176268307",
    color: "bg-[#25D366] hover:bg-[#128C7E]",
  },
  {
    name: "Instagram",
    icon: Instagram,
    href: "https://www.instagram.com/sistecpos",
    color: "bg-gradient-to-r from-[#833AB4] via-[#FD1D1D] to-[#F77737] hover:opacity-90",
  },
  {
    name: "Facebook",
    icon: Facebook,
    href: "https://www.facebook.com/sistecpos",
    color: "bg-[#1877F2] hover:bg-[#0C63D4]",
  },
  {
    name: "YouTube",
    icon: Youtube,
    href: "https://www.youtube.com/user/sistecpos",
    color: "bg-[#FF0000] hover:bg-[#CC0000]",
  },
  {
    name: "LinkedIn",
    icon: Linkedin,
    href: "https://www.linkedin.com/company/sistecpos",
    color: "bg-[#0A66C2] hover:bg-[#004182]",
  },
  { name: "TikTok", icon: TikTokIcon, href: "https://tiktok.com/@sistecpos", color: "bg-black hover:bg-gray-800" },
  { name: "X", icon: XIcon, href: "https://twitter.com/sistecpos", color: "bg-black hover:bg-gray-800" },
];

const contactInfo = [
  {
    icon: Phone,
    title: "Teléfono / WhatsApp",
    details: ["+57 317 626 8307", "+57 310 769 0204"],
    href: "https://wa.me/573176268307",
  },
  {
    icon: Mail,
    title: "Correo Electrónico",
    details: ["info@sistecpos.com"],
    href: "mailto:info@sistecpos.com",
  },
  {
    icon: MapPin,
    title: "Ubicación",
    details: ["Área Metropolitana de Bucaramanga", "Santander, Colombia"],
    href: "https://maps.app.goo.gl/wzjEFtpam6Tkt2Av7",
  },
  {
    icon: Clock,
    title: "Horario de Atención",
    details: ["Lunes a Viernes: 8:00 AM - 6:00 PM", "Sábados: 9:00 AM - 1:00 PM"],
    href: null,
  },
];

export default function ContactoPage() {
  return (
    <Layout>
      {/* Hero Section */}
      <section className="relative py-20 md:py-28 bg-gradient-to-br from-primary/5 via-background to-secondary/5">
        <div className="container px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center max-w-3xl mx-auto"
          >
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-6">Contáctanos</h1>
            <p className="text-xl text-muted-foreground">
              Estamos listos para ayudarte a transformar tu negocio con la mejor solución POS en Santander
            </p>
          </motion.div>
        </div>
      </section>

      {/* Contact Info Cards */}
      <section className="py-16">
        <div className="container px-4">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {contactInfo.map((item, index) => (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <Card className="h-full hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                        <item.icon className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-semibold mb-2">{item.title}</h3>
                        {item.details.map((detail, i) =>
                          item.href ? (
                            <a
                              key={i}
                              href={item.href}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="block text-sm text-muted-foreground hover:text-primary transition-colors"
                            >
                              {detail}
                            </a>
                          ) : (
                            <p key={i} className="text-sm text-muted-foreground">
                              {detail}
                            </p>
                          ),
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Agendar Cita Section */}
      <section className="py-16 bg-muted/30">
        <div className="container px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-2 text-sm font-medium text-primary mb-4">
              <Calendar className="h-4 w-4" />
              Agenda tu Cita
            </div>
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">Programa una Demostración Gratuita</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Reserva 30 minutos con nuestro equipo para conocer cómo SistecPOS puede transformar tu negocio
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="max-w-4xl mx-auto"
          >
            <Card className="overflow-hidden shadow-xl">
              <CardContent className="p-0">
                <iframe
                  src="https://calendly.com/sistecpos/30min"
                  width="100%"
                  height="700"
                  frameBorder="0"
                  title="Agendar cita con SistecPOS"
                  className="w-full"
                />
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </section>

      {/* Map Section */}
      <section className="py-16">
        <div className="container px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-2 text-sm font-medium text-primary mb-4">
              <MapPin className="h-4 w-4" />
              Ubicación
            </div>
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">Visítanos en Bucaramanga</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Instalación presencial y soporte técnico en toda el Área Metropolitana de Bucaramanga
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="rounded-xl overflow-hidden shadow-xl"
          >
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3959.389904880747!2d-73.12101142500204!3d7.080715392922182!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x8e683f02ef225bf7%3A0x2ecbfbc5d58b0169!2sSistecPOS%20Sistema%20y%20Soluciones%20Tecnologicas%20POS!5e0!3m2!1ses!2sco!4v1769907191888!5m2!1ses!2sco"
              width="100%"
              height="450"
              style={{ border: 0 }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title="Ubicación de SistecPOS"
              className="w-full"
            />
          </motion.div>

          <div className="text-center mt-6">
            <Button asChild variant="outline" size="lg">
              <a
                href="https://maps.app.goo.gl/e5iaeQeAw4oNbWVn6"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2"
              >
                <ExternalLink className="h-4 w-4" />
                Abrir en Google Maps
              </a>
            </Button>
          </div>
        </div>
      </section>

      {/* Social Media Section */}
      <section className="py-16 bg-muted/30">
        <div className="container px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">Síguenos en Redes Sociales</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Mantente al día con las últimas novedades, tips y promociones
            </p>
          </motion.div>

          <div className="flex flex-wrap justify-center gap-4 max-w-3xl mx-auto">
            {socialLinks.map((social, index) => (
              <motion.a
                key={social.name}
                href={social.href}
                target="_blank"
                rel="noopener noreferrer"
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: index * 0.05 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className={`flex items-center gap-2 px-6 py-3 rounded-full text-white font-medium transition-all ${social.color}`}
              >
                <social.icon />
                {social.name}
              </motion.a>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16">
        <div className="container px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center bg-primary rounded-2xl p-8 md:p-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-primary-foreground mb-4">¿Listo para empezar?</h2>
            <p className="text-lg text-primary-foreground/80 mb-8 max-w-2xl mx-auto">
              Contáctanos ahora y recibe asesoría personalizada para tu negocio
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild size="lg" className="bg-whatsapp hover:bg-whatsapp/90 text-whatsapp-foreground">
                <a
                  href="https://wa.me/573176268307?text=Hola,%20quiero%20información%20sobre%20SistecPOS"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <MessageCircle className="mr-2 h-5 w-5" />
                  WhatsApp Directo
                </a>
              </Button>
              <Button asChild size="lg" variant="secondary">
                <a href="tel:+573176268307">
                  <Phone className="mr-2 h-5 w-5" />
                  Llamar Ahora
                </a>
              </Button>
            </div>
          </motion.div>
        </div>
      </section>
    </Layout>
  );
}
