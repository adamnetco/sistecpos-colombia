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

// City coordinates mapped from real lat/lon using:
// x = (lon + 80) * 25,  y = (13 - lat) * 26
const cities: CityPoint[] = [
  // Santander (Presencial)
  { slug: "bucaramanga", name: "Bucaramanga", x: 172, y: 153, isPresencial: true, region: "Santander" },
  { slug: "floridablanca", name: "Floridablanca", x: 173, y: 155, isPresencial: true, region: "Santander" },
  { slug: "giron", name: "Girón", x: 171, y: 154, isPresencial: true, region: "Santander" },
  { slug: "piedecuesta", name: "Piedecuesta", x: 174, y: 156, isPresencial: true, region: "Santander" },
  // Principales
  { slug: "bogota", name: "Bogotá", x: 148, y: 216, isPresencial: false, region: "Cundinamarca" },
  { slug: "medellin", name: "Medellín", x: 110, y: 176, isPresencial: false, region: "Antioquia" },
  { slug: "cali", name: "Cali", x: 88, y: 248, isPresencial: false, region: "Valle del Cauca" },
  { slug: "barranquilla", name: "Barranquilla", x: 130, y: 53, isPresencial: false, region: "Atlántico" },
  { slug: "cartagena", name: "Cartagena", x: 113, y: 68, isPresencial: false, region: "Bolívar" },
  { slug: "cucuta", name: "Cúcuta", x: 188, y: 133, isPresencial: false, region: "N. Santander" },
  { slug: "pereira", name: "Pereira", x: 108, y: 213, isPresencial: false, region: "Risaralda" },
  // Secundarias
  { slug: "soacha", name: "Soacha", x: 145, y: 219, isPresencial: false, region: "Cundinamarca" },
  { slug: "ibague", name: "Ibagué", x: 120, y: 223, isPresencial: false, region: "Tolima" },
  { slug: "manizales", name: "Manizales", x: 113, y: 206, isPresencial: false, region: "Caldas" },
  { slug: "neiva", name: "Neiva", x: 118, y: 262, isPresencial: false, region: "Huila" },
  { slug: "villavicencio", name: "Villavicencio", x: 160, y: 230, isPresencial: false, region: "Meta" },
  { slug: "pasto", name: "Pasto", x: 68, y: 307, isPresencial: false, region: "Nariño" },
  { slug: "monteria", name: "Montería", x: 103, y: 111, isPresencial: false, region: "Córdoba" },
  { slug: "valledupar", name: "Valledupar", x: 169, y: 66, isPresencial: false, region: "Cesar" },
  { slug: "santa-marta", name: "Santa Marta", x: 145, y: 46, isPresencial: false, region: "Magdalena" },
  { slug: "armenia", name: "Armenia", x: 108, y: 220, isPresencial: false, region: "Quindío" },
  { slug: "soledad", name: "Soledad", x: 131, y: 54, isPresencial: false, region: "Atlántico" },
  { slug: "palmira", name: "Palmira", x: 93, y: 246, isPresencial: false, region: "Valle del Cauca" },
  { slug: "envigado", name: "Envigado", x: 110, y: 178, isPresencial: false, region: "Antioquia" },
  { slug: "itagui", name: "Itagüí", x: 110, y: 178, isPresencial: false, region: "Antioquia" },
  { slug: "tunja", name: "Tunja", x: 165, y: 194, isPresencial: false, region: "Boyacá" },
  { slug: "popayan", name: "Popayán", x: 85, y: 275, isPresencial: false, region: "Cauca" },
];

const majorCitySlugs = [
  "bogota", "medellin", "cali", "barranquilla", "bucaramanga",
  "cartagena", "cucuta", "pereira", "santa-marta", "valledupar",
  "monteria", "pasto", "neiva", "villavicencio", "manizales", "tunja", "popayan"
];

// Realistic Colombia outline traced from geographic coordinates
const colombiaOutline = `
  M58,128
  L62,118 L68,115 L72,120 L76,125
  L80,118 L84,108
  L90,98 L96,88 L102,80
  L108,70 L115,62 L122,56
  L130,52 L138,48 L145,44
  L155,40 L165,38 L177,38
  L185,34 L195,28 L208,20 L218,15 L225,14
  L232,16 L230,25 L225,35 L218,45
  L208,55 L200,62 L195,68
  L190,78 L186,88 L184,98
  L184,108 L186,118
  L190,128 L195,135
  L200,142 L210,148 L222,155
  L234,162 L244,172 L252,184
  L258,200 L262,218 L264,238
  L264,258 L262,278 L260,298
  L255,318 L250,335 L245,348
  L235,355 L220,358 L205,355
  L185,350 L165,342
  L145,335 L128,328 L112,322
  L98,316 L85,310
  L72,305 L62,298
  L56,285 L48,270
  L42,255 L38,240 L36,225
  L35,210 L36,195
  L40,180 L46,165
  L50,150 L55,138
  Z
`;

// Eastern plains/Amazon extension (shown as lighter)
const easternExtension = `
  M252,184
  L265,178 L278,175 L288,178
  L295,185 L298,198 L298,215
  L296,235 L292,258 L288,278
  L282,300 L278,318 L272,335
  L265,348 L255,355 L245,348
`;

export function ColombiaMap() {
  const [hoveredCity, setHoveredCity] = useState<string | null>(null);

  return (
    <div className="relative w-full max-w-lg mx-auto">
      <svg
        viewBox="20 0 300 375"
        className="w-full h-auto"
        role="img"
        aria-label="Mapa de Colombia con ciudades donde SistecPOS tiene cobertura"
      >
        <defs>
          <radialGradient id="mapGradient" cx="50%" cy="40%" r="60%">
            <stop offset="0%" stopColor="hsl(var(--primary) / 0.12)" />
            <stop offset="100%" stopColor="hsl(var(--primary) / 0.04)" />
          </radialGradient>
          <filter id="glow">
            <feGaussianBlur stdDeviation="2" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Eastern plains/Amazon - lighter */}
        <path
          d={easternExtension}
          fill="hsl(var(--primary) / 0.03)"
          stroke="hsl(var(--primary) / 0.12)"
          strokeWidth="0.8"
          strokeDasharray="4,3"
        />

        {/* Main Colombia outline */}
        <path
          d={colombiaOutline}
          fill="url(#mapGradient)"
          stroke="hsl(var(--primary) / 0.35)"
          strokeWidth="1.5"
          strokeLinejoin="round"
        />

        {/* Caribbean Sea label */}
        <text x="150" y="25" textAnchor="middle" fontSize="5" fill="hsl(var(--primary) / 0.2)" fontStyle="italic">
          Mar Caribe
        </text>

        {/* Pacific label */}
        <text x="32" y="220" textAnchor="middle" fontSize="5" fill="hsl(var(--primary) / 0.2)" fontStyle="italic" transform="rotate(-90, 32, 220)">
          Océano Pacífico
        </text>

        {/* Andean cordillera suggestion lines */}
        <path
          d="M100,300 Q105,275 100,250 Q95,230 100,210 Q105,190 108,175 Q112,160 115,140 Q118,120 120,105"
          fill="none"
          stroke="hsl(var(--primary) / 0.06)"
          strokeWidth="8"
          strokeLinecap="round"
        />
        <path
          d="M125,310 Q130,285 135,260 Q140,240 145,220 Q150,200 155,180 Q160,160 165,145"
          fill="none"
          stroke="hsl(var(--primary) / 0.05)"
          strokeWidth="6"
          strokeLinecap="round"
        />

        {/* Bucaramanga presencial area glow */}
        <circle
          cx="172"
          cy="155"
          r="14"
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

          // Skip duplicate positions (Envigado/Itagüí overlap)
          if (city.slug === "itagui" || city.slug === "soledad") return null;

          return (
            <Link
              key={city.slug}
              to={`/software-pos/${city.slug}`}
              onMouseEnter={() => setHoveredCity(city.slug)}
              onMouseLeave={() => setHoveredCity(null)}
            >
              {/* Pulse for Bucaramanga */}
              {isBucaramangaArea && city.slug === "bucaramanga" && (
                <motion.circle
                  cx={city.x}
                  cy={city.y}
                  r="5"
                  fill="none"
                  stroke="hsl(var(--primary))"
                  strokeWidth="0.5"
                  initial={{ r: 4, opacity: 0.6 }}
                  animate={{ r: 12, opacity: 0 }}
                  transition={{ duration: 2, repeat: Infinity, ease: "easeOut" }}
                />
              )}

              {/* City dot */}
              <circle
                cx={city.x}
                cy={city.y}
                r={isHovered ? 4.5 : isBucaramangaArea ? 3.5 : isMajor ? 2.8 : 2}
                fill={isBucaramangaArea ? "hsl(var(--primary))" : isHovered ? "hsl(var(--primary))" : "hsl(var(--primary) / 0.65)"}
                stroke="hsl(var(--background))"
                strokeWidth={isMajor ? 1 : 0.5}
                className="transition-all duration-200 cursor-pointer"
                filter={isHovered ? "url(#glow)" : undefined}
              />

              {/* City label */}
              {(isMajor || isHovered) && (
                <text
                  x={city.x + (city.x > 180 ? -4 : 6)}
                  y={city.y - 5}
                  textAnchor={city.x > 180 ? "end" : "start"}
                  fontSize={isHovered ? "7" : "5"}
                  fontWeight={isHovered || isBucaramangaArea ? "bold" : "500"}
                  fill={isBucaramangaArea ? "hsl(var(--primary))" : "hsl(var(--foreground) / 0.65)"}
                  className="pointer-events-none select-none"
                >
                  {city.name}
                </text>
              )}
            </Link>
          );
        })}

        {/* Legend */}
        <g transform="translate(30, 365)">
          <circle cx="0" cy="0" r="3" fill="hsl(var(--primary))" />
          <text x="6" y="2" fontSize="5.5" fill="hsl(var(--foreground) / 0.5)" fontWeight="500">Presencial</text>
          <circle cx="60" cy="0" r="2.5" fill="hsl(var(--primary) / 0.65)" />
          <text x="65" y="2" fontSize="5.5" fill="hsl(var(--foreground) / 0.5)" fontWeight="500">Remoto</text>
        </g>
      </svg>

      {/* Hover tooltip */}
      {hoveredCity && (() => {
        const city = cities.find(c => c.slug === hoveredCity);
        if (!city) return null;
        return (
          <div className="absolute top-2 right-2 bg-background/95 backdrop-blur-sm border rounded-lg p-2.5 shadow-lg text-xs z-10">
            <p className="font-semibold text-foreground">{city.name}</p>
            <p className="text-muted-foreground">{city.region}</p>
            <p className="text-primary text-[10px] mt-1">
              {city.isPresencial ? "📍 Instalación presencial" : "💻 Instalación remota"}
            </p>
          </div>
        );
      })()}
    </div>
  );
}
