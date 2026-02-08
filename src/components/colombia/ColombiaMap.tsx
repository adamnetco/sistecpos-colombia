import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useState } from "react";
import colombiaSvgUrl from "@/assets/colombia-map.svg";

interface CityPoint {
  slug: string;
  name: string;
  // Percentage positions on the SVG (0-100)
  px: number;
  py: number;
  isPresencial: boolean;
  region: string;
}

// Positions as percentages of the 1000x1000 SVG viewBox
const cities: CityPoint[] = [
  // Santander (Presencial)
  { slug: "bucaramanga", name: "Bucaramanga", px: 52.5, py: 33.5, isPresencial: true, region: "Santander" },
  { slug: "floridablanca", name: "Floridablanca", px: 52.8, py: 34.2, isPresencial: true, region: "Santander" },
  { slug: "giron", name: "Girón", px: 52.0, py: 33.8, isPresencial: true, region: "Santander" },
  { slug: "piedecuesta", name: "Piedecuesta", px: 53.2, py: 34.8, isPresencial: true, region: "Santander" },
  // Principales
  { slug: "bogota", name: "Bogotá", px: 48.5, py: 46.0, isPresencial: false, region: "Cundinamarca" },
  { slug: "medellin", name: "Medellín", px: 42.0, py: 38.0, isPresencial: false, region: "Antioquia" },
  { slug: "cali", name: "Cali", px: 36.5, py: 55.5, isPresencial: false, region: "Valle del Cauca" },
  { slug: "barranquilla", name: "Barranquilla", px: 43.5, py: 15.5, isPresencial: false, region: "Atlántico" },
  { slug: "cartagena", name: "Cartagena", px: 39.5, py: 18.0, isPresencial: false, region: "Bolívar" },
  { slug: "cucuta", name: "Cúcuta", px: 58.0, py: 28.5, isPresencial: false, region: "N. Santander" },
  { slug: "pereira", name: "Pereira", px: 39.5, py: 47.5, isPresencial: false, region: "Risaralda" },
  // Secundarias
  { slug: "soacha", name: "Soacha", px: 47.8, py: 46.8, isPresencial: false, region: "Cundinamarca" },
  { slug: "ibague", name: "Ibagué", px: 42.5, py: 49.0, isPresencial: false, region: "Tolima" },
  { slug: "manizales", name: "Manizales", px: 40.5, py: 45.5, isPresencial: false, region: "Caldas" },
  { slug: "neiva", name: "Neiva", px: 42.0, py: 56.0, isPresencial: false, region: "Huila" },
  { slug: "villavicencio", name: "Villavicencio", px: 53.0, py: 49.0, isPresencial: false, region: "Meta" },
  { slug: "pasto", name: "Pasto", px: 33.0, py: 65.0, isPresencial: false, region: "Nariño" },
  { slug: "monteria", name: "Montería", px: 37.5, py: 24.0, isPresencial: false, region: "Córdoba" },
  { slug: "valledupar", name: "Valledupar", px: 53.0, py: 17.0, isPresencial: false, region: "Cesar" },
  { slug: "santa-marta", name: "Santa Marta", px: 47.5, py: 13.0, isPresencial: false, region: "Magdalena" },
  { slug: "armenia", name: "Armenia", px: 39.0, py: 48.5, isPresencial: false, region: "Quindío" },
  { slug: "soledad", name: "Soledad", px: 44.0, py: 15.8, isPresencial: false, region: "Atlántico" },
  { slug: "palmira", name: "Palmira", px: 37.5, py: 55.0, isPresencial: false, region: "Valle del Cauca" },
  { slug: "envigado", name: "Envigado", px: 42.0, py: 38.8, isPresencial: false, region: "Antioquia" },
  { slug: "itagui", name: "Itagüí", px: 42.0, py: 38.8, isPresencial: false, region: "Antioquia" },
  { slug: "tunja", name: "Tunja", px: 53.5, py: 41.0, isPresencial: false, region: "Boyacá" },
  { slug: "popayan", name: "Popayán", px: 35.0, py: 60.0, isPresencial: false, region: "Cauca" },
];

const majorCitySlugs = [
  "bogota", "medellin", "cali", "barranquilla", "bucaramanga",
  "cartagena", "cucuta", "pereira", "santa-marta", "valledupar",
  "monteria", "pasto", "neiva", "villavicencio", "manizales", "tunja", "popayan"
];

export function ColombiaMap() {
  const [hoveredCity, setHoveredCity] = useState<string | null>(null);
  const navigate = useNavigate();

  return (
    <div className="relative w-full max-w-lg mx-auto">
      {/* Real Colombia SVG as background with primary color */}
      <div className="relative w-full" style={{ paddingBottom: "100%" }}>
        <img
          src={colombiaSvgUrl}
          alt="Silueta del mapa de Colombia"
          className="absolute inset-0 w-full h-full object-contain opacity-20"
          style={{
            filter: "sepia(1) saturate(5) hue-rotate(190deg) brightness(0.7)",
          }}
          draggable={false}
        />

        {/* City markers overlay */}
        <svg
          viewBox="0 0 100 100"
          className="absolute inset-0 w-full h-full"
          preserveAspectRatio="xMidYMid meet"
        >
          <defs>
            <filter id="glow">
              <feGaussianBlur stdDeviation="0.3" result="coloredBlur" />
              <feMerge>
                <feMergeNode in="coloredBlur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* Bucaramanga presencial area */}
          <circle
            cx="52.5"
            cy="34"
            r="3"
            fill="hsl(var(--primary) / 0.1)"
            stroke="hsl(var(--primary) / 0.2)"
            strokeWidth="0.15"
            strokeDasharray="0.5,0.5"
          />

          {cities.map((city) => {
            const isMajor = majorCitySlugs.includes(city.slug);
            const isHovered = hoveredCity === city.slug;
            const isBucaramangaArea = city.isPresencial;

            if (city.slug === "itagui" || city.slug === "soledad") return null;

            return (
              <g
                key={city.slug}
                onClick={() => navigate(`/software-pos/${city.slug}`)}
                onMouseEnter={() => setHoveredCity(city.slug)}
                onMouseLeave={() => setHoveredCity(null)}
                className="cursor-pointer"
              >
                {/* Pulse for Bucaramanga */}
                {isBucaramangaArea && city.slug === "bucaramanga" && (
                  <motion.circle
                    cx={city.px}
                    cy={city.py}
                    r="1"
                    fill="none"
                    stroke="hsl(var(--primary))"
                    strokeWidth="0.15"
                    initial={{ r: 0.8, opacity: 0.6 }}
                    animate={{ r: 2.5, opacity: 0 }}
                    transition={{ duration: 2, repeat: Infinity, ease: "easeOut" }}
                  />
                )}

                {/* Hover zoom ring */}
                {isHovered && (
                  <motion.circle
                    cx={city.px}
                    cy={city.py}
                    r="0.5"
                    fill="hsl(var(--primary) / 0.12)"
                    stroke="hsl(var(--primary) / 0.3)"
                    strokeWidth="0.1"
                    initial={{ r: 0.5, opacity: 0 }}
                    animate={{ r: 2, opacity: 1 }}
                    transition={{ duration: 0.25, ease: "easeOut" }}
                  />
                )}

                {/* City dot */}
                <motion.circle
                  cx={city.px}
                  cy={city.py}
                  r={isBucaramangaArea ? 0.7 : isMajor ? 0.55 : 0.4}
                  fill={isBucaramangaArea ? "hsl(var(--primary))" : isHovered ? "hsl(var(--primary))" : "hsl(var(--primary) / 0.7)"}
                  stroke="hsl(var(--background))"
                  strokeWidth={isMajor ? 0.2 : 0.1}
                  filter={isHovered ? "url(#glow)" : undefined}
                  animate={{
                    r: isHovered ? 1 : isBucaramangaArea ? 0.7 : isMajor ? 0.55 : 0.4,
                  }}
                  transition={{ duration: 0.2, ease: "easeOut" }}
                  className="cursor-pointer"
                />

                {/* City label */}
                {(isMajor || isHovered) && (
                  <motion.text
                    x={city.px + (city.px > 55 ? -0.8 : 1.2)}
                    y={city.py - 1}
                    textAnchor={city.px > 55 ? "end" : "start"}
                    fontSize={isHovered ? "1.4" : "1"}
                    fontWeight={isHovered || isBucaramangaArea ? "bold" : "500"}
                    fill={isBucaramangaArea ? "hsl(var(--primary))" : "hsl(var(--foreground) / 0.7)"}
                    className="pointer-events-none select-none"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.2 }}
                  >
                    {city.name}
                  </motion.text>
                )}
              </g>
            );
          })}

          {/* Legend */}
          <g>
            <circle cx="6" cy="96" r="0.6" fill="hsl(var(--primary))" />
            <text x="7.5" y="96.4" fontSize="1.1" fill="hsl(var(--foreground) / 0.5)" fontWeight="500">Presencial</text>
            <circle cx="18" cy="96" r="0.5" fill="hsl(var(--primary) / 0.7)" />
            <text x="19.3" y="96.4" fontSize="1.1" fill="hsl(var(--foreground) / 0.5)" fontWeight="500">Remoto</text>
          </g>
        </svg>
      </div>

      {/* Hover tooltip */}
      {hoveredCity && (() => {
        const city = cities.find(c => c.slug === hoveredCity);
        if (!city) return null;
        return (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.15 }}
            className="absolute top-2 right-2 bg-background/95 backdrop-blur-sm border rounded-lg p-2.5 shadow-lg text-xs z-10"
          >
            <p className="font-semibold text-foreground">{city.name}</p>
            <p className="text-muted-foreground">{city.region}</p>
            <p className="text-primary text-[10px] mt-1">
              {city.isPresencial ? "📍 Instalación presencial" : "💻 Instalación remota"}
            </p>
          </motion.div>
        );
      })()}
    </div>
  );
}
