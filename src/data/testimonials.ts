// Testimonios contextualizados por tipo de negocio
// Estos testimonios son representativos del tipo de feedback que reciben negocios similares

export interface Testimonial {
  name: string;
  business: string;
  location: string;
  quote: string;
  rating: number;
}

// Testimonios genéricos que aplican a cualquier tipo de negocio
const genericTestimonials: Testimonial[] = [
  {
    name: "María Rodríguez",
    business: "Comerciante local",
    location: "Bucaramanga, Santander",
    quote: "La instalación presencial fue lo que me convenció. Vinieron, configuraron todo y me capacitaron el mismo día.",
    rating: 5,
  },
  {
    name: "Pedro Gómez",
    business: "Emprendedor",
    location: "Floridablanca, Santander",
    quote: "Funciona incluso cuando se va el internet. Eso para mí es fundamental.",
    rating: 5,
  },
  {
    name: "Ana Torres",
    business: "Propietaria",
    location: "Girón, Santander",
    quote: "El soporte es excelente. Cuando tengo dudas, me responden el mismo día.",
    rating: 5,
  },
];

// Testimonios específicos por tipo de negocio
const businessTestimonials: Record<string, Testimonial[]> = {
  restaurantes: [
    {
      name: "Carlos Mendoza",
      business: "Restaurante El Sabor Santandereano",
      location: "Bucaramanga, Santander",
      quote: "Las comandas llegan directo a la cocina. Ya no hay errores en los pedidos y mis meseros atienden más rápido.",
      rating: 5,
    },
    {
      name: "Laura Pineda",
      business: "Café y Bistró La Esquina",
      location: "Floridablanca, Santander",
      quote: "El control de mesas nos ayudó a optimizar la rotación. Ahora atendemos un 30% más de clientes en hora pico.",
      rating: 5,
    },
    {
      name: "Roberto Vargas",
      business: "Parrilla Don Roberto",
      location: "Piedecuesta, Santander",
      quote: "Dividir cuentas ya no es un dolor de cabeza. Los clientes pagan separado y todo cuadra perfecto.",
      rating: 4,
    },
  ],
  "mini-market": [
    {
      name: "Sandra López",
      business: "Mini Market La Vecina",
      location: "Bucaramanga, Santander",
      quote: "Con el lector de códigos cobro en segundos. Las filas ya no se acumulan como antes.",
      rating: 5,
    },
    {
      name: "José Martínez",
      business: "Autoservicio Express",
      location: "Girón, Santander",
      quote: "Las alertas de stock bajo me salvaron. Ya no me quedo sin los productos más vendidos.",
      rating: 5,
    },
    {
      name: "Carmen Ruiz",
      business: "Tienda Doña Carmen",
      location: "Floridablanca, Santander",
      quote: "Ahora sé exactamente cuánto gano cada día. Los reportes son muy claros.",
      rating: 4,
    },
  ],
  ferreterias: [
    {
      name: "Miguel Hernández",
      business: "Ferretería El Constructor",
      location: "Bucaramanga, Santander",
      quote: "Tengo más de 8,000 productos y los encuentro al instante. La importación desde Excel fue una maravilla.",
      rating: 5,
    },
    {
      name: "Fernando Castro",
      business: "Depósito de Materiales Castro",
      location: "Piedecuesta, Santander",
      quote: "Las listas de precios por cliente nos permiten dar precios especiales a constructores frecuentes.",
      rating: 5,
    },
    {
      name: "Andrés Mejía",
      business: "Ferretería y Eléctricos Mejía",
      location: "Floridablanca, Santander",
      quote: "El inventario se actualiza automáticamente. Ya no pierdo ventas por no saber qué tengo.",
      rating: 4,
    },
  ],
  "moda-calzado": [
    {
      name: "Patricia Gómez",
      business: "Boutique Patricia",
      location: "Bucaramanga, Santander",
      quote: "El control de tallas y colores es perfecto. Sé exactamente qué tengo en cada variante.",
      rating: 5,
    },
    {
      name: "Valentina Rojas",
      business: "Calzado Valentina",
      location: "Floridablanca, Santander",
      quote: "Los apartados de mercancía me ayudan a asegurar ventas. Los clientes apartan y vuelven a pagar.",
      rating: 5,
    },
    {
      name: "Diana Ortiz",
      business: "Tienda de Moda Diana",
      location: "Girón, Santander",
      quote: "Organizar por temporadas me ayuda a saber qué promocionar en cada época del año.",
      rating: 4,
    },
  ],
  "salon-belleza": [
    {
      name: "Mónica Restrepo",
      business: "Salón Mónica Stylist",
      location: "Bucaramanga, Santander",
      quote: "La agenda de citas redujo las cancelaciones. Ahora mis clientas reciben recordatorios automáticos.",
      rating: 5,
    },
    {
      name: "Jessica Parra",
      business: "Spa & Beauty Center",
      location: "Floridablanca, Santander",
      quote: "Las comisiones de mis estilistas se calculan solas. Ya no hay discusiones a fin de mes.",
      rating: 5,
    },
    {
      name: "Claudia Sánchez",
      business: "Peluquería Claudia",
      location: "Piedecuesta, Santander",
      quote: "Vendo productos y servicios en el mismo sistema. Todo queda registrado perfectamente.",
      rating: 4,
    },
  ],
  tecnologia: [
    {
      name: "David Torres",
      business: "TecnoStore Bucaramanga",
      location: "Bucaramanga, Santander",
      quote: "El control de seriales e IMEI me permite rastrear cada equipo. Las garantías están organizadas.",
      rating: 5,
    },
    {
      name: "Ricardo Peña",
      business: "Celulares y Accesorios Peña",
      location: "Floridablanca, Santander",
      quote: "El módulo de servicio técnico es excelente. Mis clientes saben siempre el estado de su reparación.",
      rating: 5,
    },
    {
      name: "Alejandro Cruz",
      business: "Compucentro Cruz",
      location: "Girón, Santander",
      quote: "Manejo ventas y reparaciones en un solo sistema. Todo integrado.",
      rating: 4,
    },
  ],
  droguerias: [
    {
      name: "Farmacia Dra. Gómez",
      business: "Droguería Salud Total",
      location: "Bucaramanga, Santander",
      quote: "El control de vencimientos nos salvó de pérdidas. Ahora rotamos bien los medicamentos.",
      rating: 5,
    },
    {
      name: "Luis Ángel Rojas",
      business: "Droguería San Ángel",
      location: "Floridablanca, Santander",
      quote: "Los lotes quedan registrados para trazabilidad. Cumplimos con todos los requisitos.",
      rating: 5,
    },
    {
      name: "Martha Osorio",
      business: "Farmacia Familiar",
      location: "Piedecuesta, Santander",
      quote: "La facturación electrónica es muy fácil de usar. Ya no tengo que preocuparme por la DIAN.",
      rating: 4,
    },
  ],
  veterinarias: [
    {
      name: "Dra. Carolina Vega",
      business: "Clínica Veterinaria Patitas",
      location: "Bucaramanga, Santander",
      quote: "Las fichas de cada mascota están completas. Consulto el historial en segundos.",
      rating: 5,
    },
    {
      name: "Dr. Hernando Mejía",
      business: "Veterinaria El Amigo Fiel",
      location: "Floridablanca, Santander",
      quote: "Los recordatorios de vacunas fidelizan a mis clientes. Vuelven cuando les toca.",
      rating: 5,
    },
    {
      name: "Dra. Lucía Ramírez",
      business: "Pet Shop y Veterinaria Lucía",
      location: "Girón, Santander",
      quote: "Vendo productos y consultas en el mismo sistema. Todo facturado correctamente.",
      rating: 4,
    },
  ],
  consultorios: [
    {
      name: "Dr. Andrés Moreno",
      business: "Consultorio Odontológico Moreno",
      location: "Bucaramanga, Santander",
      quote: "La agenda de citas me organiza el día. Los pacientes reciben recordatorios y no faltan.",
      rating: 5,
    },
    {
      name: "Dra. Natalia Rueda",
      business: "Centro Médico Integral",
      location: "Floridablanca, Santander",
      quote: "El historial de cada paciente está a un clic. Consulto visitas anteriores fácilmente.",
      rating: 5,
    },
    {
      name: "Dr. Felipe Acosta",
      business: "Consultorio Dr. Acosta",
      location: "Piedecuesta, Santander",
      quote: "Facturo servicios y procedimientos sin complicaciones. Todo queda registrado.",
      rating: 4,
    },
  ],
  panaderias: [
    {
      name: "Panadería El Trigo Dorado",
      business: "Panadería y Pastelería",
      location: "Bucaramanga, Santander",
      quote: "Planifico la producción diaria y sé exactamente qué hornear. Ya no hay desperdicio.",
      rating: 5,
    },
    {
      name: "Don Gustavo Molina",
      business: "Pastelería Don Gustavo",
      location: "Floridablanca, Santander",
      quote: "Los pedidos de tortas especiales quedan organizados. Nunca olvido una entrega.",
      rating: 5,
    },
    {
      name: "Sra. Elena Díaz",
      business: "Pan y Café Elena",
      location: "Girón, Santander",
      quote: "Ahora sé el costo real de cada producto. Las recetas con costos me abrieron los ojos.",
      rating: 4,
    },
  ],
  cafeterias: [
    {
      name: "Café Aromas",
      business: "Cafetería Aromas del Valle",
      location: "Bucaramanga, Santander",
      quote: "Los modificadores de tamaño y sin azúcar funcionan perfecto. Los pedidos salen correctos.",
      rating: 5,
    },
    {
      name: "Juan Pablo Sierra",
      business: "Coffee & Co",
      location: "Floridablanca, Santander",
      quote: "La fila de pedidos nos organiza en hora pico. Sabemos qué preparar primero.",
      rating: 5,
    },
    {
      name: "Catalina Vargas",
      business: "Juguería Natural",
      location: "Piedecuesta, Santander",
      quote: "Los combos aumentaron nuestro ticket promedio. Los clientes llevan más.",
      rating: 4,
    },
  ],
  gastrobar: [
    {
      name: "Gastrobar 503",
      business: "503 Food & Drinks",
      location: "Bucaramanga, Santander",
      quote: "Las comandas van separadas a bar y cocina. Todo sale coordinado y a tiempo.",
      rating: 5,
    },
    {
      name: "Martín Escobar",
      business: "Coctelería Martín",
      location: "Floridablanca, Santander",
      quote: "El happy hour se activa solo. Los precios cambian automáticamente.",
      rating: 5,
    },
    {
      name: "Andrea Pinto",
      business: "Wine & Tapas",
      location: "Cabecera, Bucaramanga",
      quote: "El control de licores me ayuda a saber cuánto se consume de cada botella.",
      rating: 4,
    },
  ],
  "casas-cambio": [
    {
      name: "Casa de Cambio El Dólar",
      business: "Cambios y Giros El Dólar",
      location: "Bucaramanga, Santander",
      quote: "Manejo dólares, pesos y bolívares sin problemas. Las tasas se actualizan fácil.",
      rating: 5,
    },
    {
      name: "Jhon Ferney Rueda",
      business: "Giros y Cambios Rueda",
      location: "Floridablanca, Santander",
      quote: "Los reportes para la UIAF salen directos del sistema. Cumplimos sin estrés.",
      rating: 5,
    },
    {
      name: "María José Quintero",
      business: "Divisas MJQ",
      location: "Girón, Santander",
      quote: "El arqueo de caja por moneda me da tranquilidad. Todo cuadra al centavo.",
      rating: 4,
    },
  ],
  opticas: [
    {
      name: "Óptica Visión Clara",
      business: "Óptica y Optometría",
      location: "Bucaramanga, Santander",
      quote: "Las fórmulas de cada cliente quedan guardadas. Cuando vuelven, ya sé su historial.",
      rating: 5,
    },
    {
      name: "Dr. Óptico Ramírez",
      business: "Centro Óptico Ramírez",
      location: "Floridablanca, Santander",
      quote: "Los pedidos al laboratorio salen organizados. Hago seguimiento de cada lente.",
      rating: 5,
    },
    {
      name: "Óptica Moderna",
      business: "Óptica y Moda Visual",
      location: "Piedecuesta, Santander",
      quote: "El inventario de monturas está perfecto. Sé qué marcas y modelos tengo.",
      rating: 4,
    },
  ],
  "lavaderos-autos": [
    {
      name: "Lavadero Car Wash Pro",
      business: "Car Wash Profesional",
      location: "Bucaramanga, Santander",
      quote: "Los turnos se organizan solos. Cada vehículo tiene su orden y tiempo estimado.",
      rating: 5,
    },
    {
      name: "Mauricio Rincón",
      business: "Lavadero Express Rincón",
      location: "Floridablanca, Santander",
      quote: "Las comisiones de mis empleados se calculan automáticas. Ya no hay errores.",
      rating: 5,
    },
    {
      name: "Auto Spa Deluxe",
      business: "Auto Spa & Detailing",
      location: "Girón, Santander",
      quote: "Los clientes VIP acumulan puntos. Vuelven más seguido por los beneficios.",
      rating: 4,
    },
  ],
};

// Función para obtener testimonios por tipo de negocio
export function getTestimonialsByBusiness(slug: string): Testimonial[] {
  const specific = businessTestimonials[slug];
  if (specific && specific.length > 0) {
    return specific;
  }
  // Si no hay testimonios específicos, usar genéricos
  return genericTestimonials;
}
