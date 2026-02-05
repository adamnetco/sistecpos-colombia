 import { Link } from "react-router-dom";
 import { Mail, Phone, MapPin } from "lucide-react";
 import logoSistecPOSWhite from "@/assets/logo-sistecpos-white.png";
 
 const footerLinks = {
   soluciones: [
     { name: "POS Restaurantes", href: "/soluciones/restaurantes" },
     { name: "POS Mini Market", href: "/soluciones/mini-market" },
     { name: "POS Moda", href: "/soluciones/moda-calzado" },
     { name: "POS Ferreterías", href: "/soluciones/ferreterias" },
     { name: "POS Droguerías", href: "/soluciones/droguerias" },
     { name: "Ver todos", href: "/#soluciones" },
   ],
   productos: [
     { name: "Impresoras Térmicas", href: "/productos" },
     { name: "Lectores de Barras", href: "/productos" },
     { name: "Cajones Monederos", href: "/productos" },
     { name: "Comparar Licencias", href: "/comparativa-licencias" },
   ],
   ciudades: [
     { name: "POS Bogotá", href: "/software-pos/bogota" },
     { name: "POS Medellín", href: "/software-pos/medellin" },
     { name: "POS Cali", href: "/software-pos/cali" },
     { name: "POS Barranquilla", href: "/software-pos/barranquilla" },
     { name: "POS Bucaramanga", href: "/software-pos/bucaramanga" },
     { name: "POS Cartagena", href: "/software-pos/cartagena" },
   ],
   empresa: [
     { name: "Nosotros", href: "/nosotros" },
     { name: "Contacto", href: "/contacto" },
   ],
 };
 
 const presencialCities = [
   { name: "Bucaramanga", href: "/software-pos/bucaramanga" },
   { name: "Floridablanca", href: "/software-pos/floridablanca" },
   { name: "Girón", href: "/software-pos/giron" },
   { name: "Piedecuesta", href: "/software-pos/piedecuesta" },
 ];

export function Footer() {
  return (
    <footer className="bg-foreground text-primary-foreground" id="contacto">
      <div className="container px-4 py-12 md:py-16">
        {/* Main Footer Content */}
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-5">
          {/* Brand Column */}
          <div className="lg:col-span-1">
            <Link to="/" className="flex items-center gap-2 mb-4">
              <img src={logoSistecPOSWhite} alt="SistecPOS" className="h-10 w-auto" />
            </Link>
            <p className="text-sm text-primary-foreground/70 mb-4">
              Software POS con instalación presencial y soporte local en Santander.
            </p>

            {/* NAP for Local SEO */}
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2 text-primary-foreground/70">
                <MapPin className="h-4 w-4 shrink-0" />
                <span>Transversal 112 # 19 - 22, Oficina 309, Viversos de Pronveza, Bucaramanga, Santander</span>
              </div>
              <a
                href="https://wa.me/573176268307"
                className="flex items-center gap-2 text-primary-foreground/70 hover:text-whatsapp transition-colors"
              >
                <Phone className="h-4 w-4 shrink-0" />
                <span>+57 317 626 8307</span>
              </a>
              <a
                href="mailto:info@sistecpos.com"
                className="flex items-center gap-2 text-primary-foreground/70 hover:text-primary transition-colors"
              >
                <Mail className="h-4 w-4 shrink-0" />
                <span>info@sistecpos.com</span>
              </a>
            </div>
          </div>

          {/* Soluciones */}
          <div>
            <h3 className="font-semibold mb-4">Soluciones</h3>
            <ul className="space-y-2">
              {footerLinks.soluciones.map((link) => (
                <li key={link.name}>
                  <Link
                    to={link.href}
                    className="text-sm text-primary-foreground/70 hover:text-primary-foreground transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Productos */}
          <div>
            <h3 className="font-semibold mb-4">Productos</h3>
            <ul className="space-y-2">
              {footerLinks.productos.map((link) => (
                <li key={link.name}>
                  <Link
                    to={link.href}
                    className="text-sm text-primary-foreground/70 hover:text-primary-foreground transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

           {/* Ciudades */}
           <div>
             <h3 className="font-semibold mb-4">Ciudades</h3>
             <ul className="space-y-2">
               {footerLinks.ciudades.map((link) => (
                 <li key={link.name}>
                   <Link
                     to={link.href}
                     className="text-sm text-primary-foreground/70 hover:text-primary-foreground transition-colors"
                   >
                     {link.name}
                   </Link>
                 </li>
               ))}
             </ul>
           </div>
 
           {/* Empresa */}
           <div>
             <h3 className="font-semibold mb-4">Empresa</h3>
            <ul className="space-y-2">
              {footerLinks.empresa.map((link) => (
                <li key={link.name}>
                  <a
                    href={link.href}
                    className="text-sm text-primary-foreground/70 hover:text-primary-foreground transition-colors"
                  >
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

         {/* Coverage Cities */}
         <div className="mt-8 pt-8 border-t border-primary-foreground/10" id="cobertura">
           <div className="flex flex-wrap items-center justify-center gap-2 text-sm">
             <span className="text-primary-foreground/50">Instalación Presencial:</span>
             {presencialCities.map((city, index) => (
               <span key={city.name} className="flex items-center gap-2">
                 <Link 
                   to={city.href}
                   className="text-primary-foreground/70 hover:text-whatsapp transition-colors"
                 >
                   {city.name}
                 </Link>
                 {index < presencialCities.length - 1 && <span className="text-primary-foreground/30">•</span>}
               </span>
             ))}
           </div>
         </div>

        {/* Copyright */}
        <div className="mt-8 pt-8 border-t border-primary-foreground/10 text-center">
          <p className="text-sm text-primary-foreground/50">
            © {new Date().getFullYear()} SistecPOS. Todos los derechos reservados.
          </p>
          <p className="text-xs text-primary-foreground/30 mt-2">Desarrollado por AdamNetCo</p>
        </div>
      </div>
    </footer>
  );
}
