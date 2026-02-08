import { useNavigate } from "react-router-dom";
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

// Coordinates recalculated for viewBox "0 0 320 400"
// x = (lon + 80) * 28,  y = (14 - lat) * 28
const cities: CityPoint[] = [
  // Santander (Presencial)
  { slug: "bucaramanga", name: "Bucaramanga", x: 186, y: 170, isPresencial: true, region: "Santander" },
  { slug: "floridablanca", name: "Floridablanca", x: 187, y: 172, isPresencial: true, region: "Santander" },
  { slug: "giron", name: "Girón", x: 185, y: 171, isPresencial: true, region: "Santander" },
  { slug: "piedecuesta", name: "Piedecuesta", x: 188, y: 173, isPresencial: true, region: "Santander" },
  // Principales
  { slug: "bogota", name: "Bogotá", x: 158, y: 241, isPresencial: false, region: "Cundinamarca" },
  { slug: "medellin", name: "Medellín", x: 120, y: 195, isPresencial: false, region: "Antioquia" },
  { slug: "cali", name: "Cali", x: 96, y: 274, isPresencial: false, region: "Valle del Cauca" },
  { slug: "barranquilla", name: "Barranquilla", x: 140, y: 67, isPresencial: false, region: "Atlántico" },
  { slug: "cartagena", name: "Cartagena", x: 122, y: 82, isPresencial: false, region: "Bolívar" },
  { slug: "cucuta", name: "Cúcuta", x: 200, y: 148, isPresencial: false, region: "N. Santander" },
  { slug: "pereira", name: "Pereira", x: 118, y: 237, isPresencial: false, region: "Risaralda" },
  // Secundarias
  { slug: "soacha", name: "Soacha", x: 155, y: 244, isPresencial: false, region: "Cundinamarca" },
  { slug: "ibague", name: "Ibagué", x: 130, y: 248, isPresencial: false, region: "Tolima" },
  { slug: "manizales", name: "Manizales", x: 123, y: 230, isPresencial: false, region: "Caldas" },
  { slug: "neiva", name: "Neiva", x: 128, y: 288, isPresencial: false, region: "Huila" },
  { slug: "villavicencio", name: "Villavicencio", x: 172, y: 255, isPresencial: false, region: "Meta" },
  { slug: "pasto", name: "Pasto", x: 76, y: 335, isPresencial: false, region: "Nariño" },
  { slug: "monteria", name: "Montería", x: 112, y: 125, isPresencial: false, region: "Córdoba" },
  { slug: "valledupar", name: "Valledupar", x: 180, y: 80, isPresencial: false, region: "Cesar" },
  { slug: "santa-marta", name: "Santa Marta", x: 155, y: 57, isPresencial: false, region: "Magdalena" },
  { slug: "armenia", name: "Armenia", x: 118, y: 245, isPresencial: false, region: "Quindío" },
  { slug: "soledad", name: "Soledad", x: 141, y: 68, isPresencial: false, region: "Atlántico" },
  { slug: "palmira", name: "Palmira", x: 101, y: 272, isPresencial: false, region: "Valle del Cauca" },
  { slug: "envigado", name: "Envigado", x: 120, y: 197, isPresencial: false, region: "Antioquia" },
  { slug: "itagui", name: "Itagüí", x: 120, y: 197, isPresencial: false, region: "Antioquia" },
  { slug: "tunja", name: "Tunja", x: 176, y: 216, isPresencial: false, region: "Boyacá" },
  { slug: "popayan", name: "Popayán", x: 93, y: 302, isPresencial: false, region: "Cauca" },
];

const majorCitySlugs = [
  "bogota", "medellin", "cali", "barranquilla", "bucaramanga",
  "cartagena", "cucuta", "pereira", "santa-marta", "valledupar",
  "monteria", "pasto", "neiva", "villavicencio", "manizales", "tunja", "popayan"
];

// Realistic Colombia outline — recognizable silhouette with Guajira, Pacific coast, and Amazon
// Based on simplified real geographic coordinates
const colombiaPath = `
M 155,56 L 150,52 L 143,48 L 138,46 L 132,44 
L 126,46 L 120,50 L 114,56 L 108,62 
L 102,70 L 96,78 L 90,86 L 86,92 
L 82,100 L 78,108 L 74,116 
L 70,126 L 66,136 L 64,144 
L 62,152 L 60,162 L 56,172 
L 52,180 L 48,188 L 44,196 
L 40,206 L 38,216 L 38,226 
L 40,236 L 42,246 
L 46,256 L 50,264 L 54,272 
L 58,280 L 62,288 
L 66,296 L 70,304 L 74,312 
L 78,320 L 82,326 L 86,332 
L 92,338 L 98,342 L 106,346 
L 114,348 L 122,350 L 130,352 
L 140,352 L 148,350 L 156,348 
L 164,344 L 172,340 L 180,336 
L 186,330 L 192,322 L 198,312 
L 204,302 L 208,292 L 212,282 
L 216,270 L 218,258 L 220,246 
L 222,234 L 222,222 L 220,210 
L 218,198 L 216,186 
L 212,174 L 208,164 L 204,156 
L 200,148 L 196,140 L 192,132 
L 190,124 L 190,116 L 192,108 
L 194,100 L 196,92 L 198,84 
L 200,76 L 202,68 
L 206,60 L 210,52 L 214,44 
L 218,36 L 220,28 L 220,22 
L 216,18 L 210,16 L 204,14 
L 198,12 L 192,10 L 186,10 
L 180,12 L 174,16 L 168,22 
L 164,30 L 162,38 L 160,46 
L 155,56 Z
`;

// Guajira peninsula — the distinctive horn shape
const guajiraPath = `
M 186,10 L 192,8 L 200,6 L 210,4 
L 220,4 L 230,6 L 238,10 L 244,16 
L 248,24 L 250,32 L 248,38 
L 244,44 L 238,48 L 230,50 
L 222,48 L 216,44 L 212,38 
L 210,32 L 210,26 
L 212,22 L 216,18 L 220,22 
L 220,28 L 218,36 L 214,44 
L 210,52 L 206,60 L 202,68 
L 200,76 L 198,84
`;

// Eastern llanos/Amazon — dashed, lighter
const easternPath = `
M 222,222 L 228,218 L 236,216 L 244,218 
L 250,224 L 254,234 L 256,246 
L 256,260 L 254,276 L 250,292 
L 246,308 L 240,320 L 234,330 
L 226,338 L 218,342 L 210,344 
L 204,342 L 198,338 
L 198,312 L 204,302 
L 208,292 L 212,282 L 216,270 
L 218,258 L 220,246 L 222,234 L 222,222
`;

export function ColombiaMap() {
  const [hoveredCity, setHoveredCity] = useState<string | null>(null);
  const navigate = useNavigate();

  return (
    <div className="relative w-full max-w-lg mx-auto">
      <svg
        viewBox="20 -5 260 375"
        className="w-full h-auto"
        role="img"
        aria-label="Mapa de Colombia con ciudades donde SistecPOS tiene cobertura"
      >
        <defs>
          <radialGradient id="mapGradient" cx="50%" cy="40%" r="60%">
            <stop offset="0%" stopColor="hsl(var(--primary) / 0.15)" />
            <stop offset="100%" stopColor="hsl(var(--primary) / 0.04)" />
          </radialGradient>
          <filter id="glow">
            <feGaussianBlur stdDeviation="2" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <filter id="shadow">
            <feDropShadow dx="0" dy="1" stdDeviation="2" floodOpacity="0.15" />
          </filter>
        </defs>

        {/* Eastern llanos/Amazon — lighter, dashed */}
        <path
          d={easternPath}
          fill="hsl(var(--primary) / 0.03)"
          stroke="hsl(var(--primary) / 0.12)"
          strokeWidth="0.8"
          strokeDasharray="4,3"
        />

        {/* Main Colombia silhouette */}
        <path
          d={colombiaPath}
          fill="url(#mapGradient)"
          stroke="hsl(var(--primary) / 0.4)"
          strokeWidth="1.5"
          strokeLinejoin="round"
          filter="url(#shadow)"
        />

        {/* Guajira peninsula */}
        <path
          d={guajiraPath}
          fill="url(#mapGradient)"
          stroke="hsl(var(--primary) / 0.4)"
          strokeWidth="1.5"
          strokeLinejoin="round"
        />

        {/* Caribbean Sea label */}
        <text x="180" y="0" textAnchor="middle" fontSize="5" fill="hsl(var(--primary) / 0.2)" fontStyle="italic">
          Mar Caribe
        </text>

        {/* Pacific label */}
        <text x="32" y="240" textAnchor="middle" fontSize="5" fill="hsl(var(--primary) / 0.2)" fontStyle="italic" transform="rotate(-90, 32, 240)">
          Océano Pacífico
        </text>

        {/* Andean cordillera suggestions */}
        <path
          d="M 105,330 Q 110,300 108,270 Q 106,250 108,230 Q 112,210 115,195 Q 118,175 120,155 Q 122,135 125,118"
          fill="none"
          stroke="hsl(var(--primary) / 0.06)"
          strokeWidth="8"
          strokeLinecap="round"
        />
        <path
          d="M 135,340 Q 140,310 145,280 Q 150,260 155,240 Q 160,220 165,200 Q 170,180 175,165"
          fill="none"
          stroke="hsl(var(--primary) / 0.05)"
          strokeWidth="6"
          strokeLinecap="round"
        />

        {/* Bucaramanga presencial area glow */}
        <circle
          cx="186"
          cy="171"
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

          if (city.slug === "itagui" || city.slug === "soledad") return null;

          return (
            <g
              key={city.slug}
              onClick={() => navigate(`/software-pos/${city.slug}`)}
              onMouseEnter={() => setHoveredCity(city.slug)}
              onMouseLeave={() => setHoveredCity(null)}
              className="cursor-pointer"
              style={{ transition: "transform 0.25s ease" }}
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

              {/* Hover zoom ring */}
              {isHovered && (
                <motion.circle
                  cx={city.x}
                  cy={city.y}
                  r="3"
                  fill="hsl(var(--primary) / 0.1)"
                  stroke="hsl(var(--primary) / 0.3)"
                  strokeWidth="0.5"
                  initial={{ r: 3, opacity: 0 }}
                  animate={{ r: 10, opacity: 1 }}
                  transition={{ duration: 0.25, ease: "easeOut" }}
                />
              )}

              {/* City dot with zoom on hover */}
              <motion.circle
                cx={city.x}
                cy={city.y}
                r={isBucaramangaArea ? 3.5 : isMajor ? 2.8 : 2}
                fill={isBucaramangaArea ? "hsl(var(--primary))" : isHovered ? "hsl(var(--primary))" : "hsl(var(--primary) / 0.65)"}
                stroke="hsl(var(--background))"
                strokeWidth={isMajor ? 1 : 0.5}
                filter={isHovered ? "url(#glow)" : undefined}
                animate={{
                  r: isHovered ? 5 : isBucaramangaArea ? 3.5 : isMajor ? 2.8 : 2,
                }}
                transition={{ duration: 0.2, ease: "easeOut" }}
                className="cursor-pointer"
              />

              {/* City label */}
              {(isMajor || isHovered) && (
                <motion.text
                  x={city.x + (city.x > 180 ? -4 : 6)}
                  y={city.y - 6}
                  textAnchor={city.x > 180 ? "end" : "start"}
                  fontSize={isHovered ? "7" : "5"}
                  fontWeight={isHovered || isBucaramangaArea ? "bold" : "500"}
                  fill={isBucaramangaArea ? "hsl(var(--primary))" : "hsl(var(--foreground) / 0.65)"}
                  className="pointer-events-none select-none"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1, fontSize: isHovered ? "7px" : "5px" }}
                  transition={{ duration: 0.2 }}
                >
                  {city.name}
                </motion.text>
              )}
            </g>
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
