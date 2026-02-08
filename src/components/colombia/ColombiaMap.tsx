import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useState } from "react";

interface CityPoint {
  slug: string;
  name: string;
  x: number;
  y: number;
  isPresencial: boolean;
  region: string;
}

const cities: CityPoint[] = [
  // Santander (Presencial)
  { slug: "bucaramanga", name: "Bucaramanga", x: 200, y: 195, isPresencial: true, region: "Santander" },
  { slug: "floridablanca", name: "Floridablanca", x: 206, y: 200, isPresencial: true, region: "Santander" },
  { slug: "giron", name: "Girón", x: 194, y: 200, isPresencial: true, region: "Santander" },
  { slug: "piedecuesta", name: "Piedecuesta", x: 203, y: 206, isPresencial: true, region: "Santander" },
  // Principales
  { slug: "bogota", name: "Bogotá", x: 188, y: 260, isPresencial: false, region: "Cundinamarca" },
  { slug: "medellin", name: "Medellín", x: 155, y: 225, isPresencial: false, region: "Antioquia" },
  { slug: "cali", name: "Cali", x: 140, y: 295, isPresencial: false, region: "Valle del Cauca" },
  { slug: "barranquilla", name: "Barranquilla", x: 170, y: 115, isPresencial: false, region: "Atlántico" },
  { slug: "cartagena", name: "Cartagena", x: 148, y: 125, isPresencial: false, region: "Bolívar" },
  { slug: "cucuta", name: "Cúcuta", x: 218, y: 180, isPresencial: false, region: "N. Santander" },
  { slug: "pereira", name: "Pereira", x: 155, y: 260, isPresencial: false, region: "Risaralda" },
  // Secundarias
  { slug: "soacha", name: "Soacha", x: 185, y: 265, isPresencial: false, region: "Cundinamarca" },
  { slug: "ibague", name: "Ibagué", x: 165, y: 268, isPresencial: false, region: "Tolima" },
  { slug: "manizales", name: "Manizales", x: 155, y: 250, isPresencial: false, region: "Caldas" },
  { slug: "neiva", name: "Neiva", x: 170, y: 295, isPresencial: false, region: "Huila" },
  { slug: "villavicencio", name: "Villavicencio", x: 210, y: 268, isPresencial: false, region: "Meta" },
  { slug: "pasto", name: "Pasto", x: 148, y: 340, isPresencial: false, region: "Nariño" },
  { slug: "monteria", name: "Montería", x: 138, y: 165, isPresencial: false, region: "Córdoba" },
  { slug: "valledupar", name: "Valledupar", x: 205, y: 130, isPresencial: false, region: "Cesar" },
  { slug: "santa-marta", name: "Santa Marta", x: 188, y: 115, isPresencial: false, region: "Magdalena" },
  { slug: "armenia", name: "Armenia", x: 152, y: 268, isPresencial: false, region: "Quindío" },
  { slug: "soledad", name: "Soledad", x: 173, y: 118, isPresencial: false, region: "Atlántico" },
  { slug: "palmira", name: "Palmira", x: 143, y: 290, isPresencial: false, region: "Valle del Cauca" },
  { slug: "envigado", name: "Envigado", x: 158, y: 228, isPresencial: false, region: "Antioquia" },
  { slug: "itagui", name: "Itagüí", x: 152, y: 228, isPresencial: false, region: "Antioquia" },
  { slug: "tunja", name: "Tunja", x: 198, y: 240, isPresencial: false, region: "Boyacá" },
  { slug: "popayan", name: "Popayán", x: 140, y: 315, isPresencial: false, region: "Cauca" },
];

// Only show labels for major cities to avoid clutter
const majorCitySlugs = [
  "bogota", "medellin", "cali", "barranquilla", "bucaramanga",
  "cartagena", "cucuta", "pereira", "santa-marta", "valledupar",
  "monteria", "pasto", "neiva", "ibague", "villavicencio", "manizales", "tunja", "popayan"
];

export function ColombiaMap() {
  const [hoveredCity, setHoveredCity] = useState<string | null>(null);

  return (
    <div className="relative w-full max-w-lg mx-auto">
      <svg
        viewBox="80 60 200 330"
        className="w-full h-auto"
        role="img"
        aria-label="Mapa de Colombia con ciudades donde SistecPOS tiene cobertura"
      >
        {/* Colombia outline - simplified */}
        <path
          d="M148,80 L160,75 L175,78 L185,85 L195,82 L208,90 L218,95 L225,105 L230,120 L235,135 L240,155 L238,170 L235,180 L230,190 L225,200 L228,215 L225,230 L220,245 L215,255 L210,265 L205,275 L200,285 L198,300 L195,315 L190,330 L185,340 L178,350 L170,355 L162,358 L155,360 L148,355 L140,345 L135,335 L130,320 L128,305 L125,290 L122,275 L120,260 L118,245 L115,230 L112,215 L115,200 L118,185 L120,170 L122,155 L118,140 L115,128 L118,115 L125,105 L132,95 L140,88 Z"
          fill="hsl(var(--primary) / 0.08)"
          stroke="hsl(var(--primary) / 0.3)"
          strokeWidth="1.5"
          className="transition-all duration-300"
        />

        {/* Decorative region boundaries */}
        <path
          d="M120,170 Q165,165 230,175"
          fill="none"
          stroke="hsl(var(--primary) / 0.1)"
          strokeWidth="0.5"
          strokeDasharray="3,3"
        />
        <path
          d="M118,240 Q170,235 220,245"
          fill="none"
          stroke="hsl(var(--primary) / 0.1)"
          strokeWidth="0.5"
          strokeDasharray="3,3"
        />

        {/* Bucaramanga presencial area glow */}
        <circle
          cx="200"
          cy="200"
          r="18"
          fill="hsl(var(--primary) / 0.08)"
          stroke="hsl(var(--primary) / 0.15)"
          strokeWidth="0.5"
          strokeDasharray="2,2"
        />

        {/* City markers */}
        {cities.map((city) => {
          const isMajor = majorCitySlugs.includes(city.slug);
          const isHovered = hoveredCity === city.slug;
          const isBucaramangaArea = city.isPresencial;

          // Skip rendering labels for minor cities (still render dot)
          return (
            <Link
              key={city.slug}
              to={`/software-pos/${city.slug}`}
              onMouseEnter={() => setHoveredCity(city.slug)}
              onMouseLeave={() => setHoveredCity(null)}
            >
              {/* Pulse ring for presencial cities */}
              {isBucaramangaArea && city.slug === "bucaramanga" && (
                <motion.circle
                  cx={city.x}
                  cy={city.y}
                  r="6"
                  fill="none"
                  stroke="hsl(var(--primary))"
                  strokeWidth="0.5"
                  initial={{ r: 4, opacity: 0.6 }}
                  animate={{ r: 10, opacity: 0 }}
                  transition={{ duration: 2, repeat: Infinity, ease: "easeOut" }}
                />
              )}

              {/* City dot */}
              <circle
                cx={city.x}
                cy={city.y}
                r={isHovered ? 4.5 : isBucaramangaArea ? 3.5 : isMajor ? 3 : 2}
                fill={isBucaramangaArea ? "hsl(var(--primary))" : "hsl(var(--primary) / 0.7)"}
                stroke="hsl(var(--background))"
                strokeWidth={isMajor ? 1 : 0.5}
                className="transition-all duration-200 cursor-pointer"
              />

              {/* City label */}
              {(isMajor || isHovered) && (
                <text
                  x={city.x + (city.x > 200 ? -3 : 5)}
                  y={city.y - 5}
                  textAnchor={city.x > 200 ? "end" : "start"}
                  fontSize={isHovered ? "7" : "5.5"}
                  fontWeight={isHovered || isBucaramangaArea ? "bold" : "normal"}
                  fill={isBucaramangaArea ? "hsl(var(--primary))" : "hsl(var(--foreground) / 0.7)"}
                  className="transition-all duration-200 pointer-events-none select-none"
                >
                  {city.name}
                </text>
              )}
            </Link>
          );
        })}

        {/* Legend */}
        <g transform="translate(90, 365)">
          <circle cx="0" cy="0" r="3" fill="hsl(var(--primary))" />
          <text x="6" y="2" fontSize="5" fill="hsl(var(--foreground) / 0.6)">Presencial</text>
          <circle cx="50" cy="0" r="2.5" fill="hsl(var(--primary) / 0.7)" />
          <text x="55" y="2" fontSize="5" fill="hsl(var(--foreground) / 0.6)">Remoto</text>
        </g>
      </svg>

      {/* Hover tooltip */}
      {hoveredCity && (
        <div className="absolute top-2 right-2 bg-background/95 backdrop-blur-sm border rounded-lg p-2 shadow-md text-xs">
          <p className="font-semibold text-foreground">
            {cities.find(c => c.slug === hoveredCity)?.name}
          </p>
          <p className="text-muted-foreground">
            {cities.find(c => c.slug === hoveredCity)?.region}
          </p>
          <p className="text-primary text-[10px] mt-0.5">
            {cities.find(c => c.slug === hoveredCity)?.isPresencial ? "📍 Instalación presencial" : "💻 Instalación remota"}
          </p>
        </div>
      )}
    </div>
  );
}
