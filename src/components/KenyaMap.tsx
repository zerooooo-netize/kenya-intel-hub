import { useEffect, useState } from "react";
import { ComposableMap, Geographies, Geography, Marker } from "react-simple-maps";
import { kenyaHotspots } from "@/data/mockData";

// Real Kenya GeoJSON (simplified Natural Earth admin-0). Loaded once.
const GEO_URL = "https://raw.githubusercontent.com/mikelmaron/kenya-election-data/master/data/counties.geojson";

const KenyaMap = () => {
  const [hovered, setHovered] = useState<string | null>(null);
  const [geoData, setGeoData] = useState<any>(null);

  useEffect(() => {
    fetch(GEO_URL)
      .then((r) => r.json())
      .then(setGeoData)
      .catch(() => setGeoData(null));
  }, []);

  return (
    <div className="absolute inset-0">
      <ComposableMap
        projection="geoMercator"
        projectionConfig={{ scale: 2400, center: [37.9062, 0.0236] }}
        width={600}
        height={400}
        style={{ width: "100%", height: "100%" }}
      >
        <defs>
          <radialGradient id="hotspot-grad">
            <stop offset="0%" stopColor="hsl(265 95% 75%)" stopOpacity="0.9" />
            <stop offset="100%" stopColor="hsl(265 95% 66%)" stopOpacity="0" />
          </radialGradient>
        </defs>

        {geoData && (
          <Geographies geography={geoData}>
            {({ geographies }) =>
              geographies.map((geo: any) => (
                <Geography
                  key={geo.rsmKey}
                  geography={geo}
                  style={{
                    default: {
                      fill: "hsl(250 30% 12%)",
                      stroke: "hsl(265 80% 55% / 0.4)",
                      strokeWidth: 0.5,
                      outline: "none",
                    },
                    hover: {
                      fill: "hsl(265 70% 22%)",
                      stroke: "hsl(265 95% 70%)",
                      strokeWidth: 0.8,
                      outline: "none",
                    },
                    pressed: { fill: "hsl(265 70% 25%)", outline: "none" },
                  }}
                />
              ))
            }
          </Geographies>
        )}

        {/* Connection arcs from Nairobi to others */}
        {kenyaHotspots.slice(1).map((h) => {
          const [x1, y1] = kenyaHotspots[0].coords;
          const [x2, y2] = h.coords;
          return (
            <line
              key={`line-${h.name}`}
              x1={projectX(x1)}
              y1={projectY(y1)}
              x2={projectX(x2)}
              y2={projectY(y2)}
              stroke="hsl(265 95% 66%)"
              strokeWidth={0.4}
              strokeOpacity={0.25}
              strokeDasharray="2 3"
            />
          );
        })}

        {/* Hotspot markers */}
        {kenyaHotspots.map((h) => {
          const r = 3 + (h.intensity / 100) * 6;
          return (
            <Marker
              key={h.name}
              coordinates={h.coords}
              onMouseEnter={() => setHovered(h.name)}
              onMouseLeave={() => setHovered(null)}
            >
              <circle r={r * 2} fill="url(#hotspot-grad)" opacity={0.6}>
                <animate attributeName="r" values={`${r * 1.5};${r * 3};${r * 1.5}`} dur="3s" repeatCount="indefinite" />
                <animate attributeName="opacity" values="0.6;0.1;0.6" dur="3s" repeatCount="indefinite" />
              </circle>
              <circle
                r={r}
                fill={h.intensity > 70 ? "hsl(265 95% 70%)" : "hsl(205 100% 65%)"}
                stroke="white"
                strokeWidth={0.5}
                style={{ cursor: "pointer" }}
              />
              {(hovered === h.name || h.intensity > 70) && (
                <text
                  textAnchor="middle"
                  y={-r - 4}
                  style={{
                    fontSize: 8,
                    fill: "hsl(230 30% 96%)",
                    fontWeight: 600,
                    paintOrder: "stroke",
                    stroke: "hsl(240 25% 4%)",
                    strokeWidth: 2,
                  }}
                >
                  {h.name}
                </text>
              )}
            </Marker>
          );
        })}
      </ComposableMap>

      {/* Tooltip */}
      {hovered && (
        <div className="absolute top-3 right-3 glass-strong rounded-lg px-3 py-2 text-xs pointer-events-none animate-fade-in">
          <div className="font-semibold">{hovered} County</div>
          <div className="text-muted-foreground">
            {kenyaHotspots.find((h) => h.name === hovered)?.mentions} mentions
          </div>
        </div>
      )}
    </div>
  );
};

// Rough projection helper to draw lines (approximation matching the map)
function projectX(lng: number) {
  return ((lng - 33.5) / (42 - 33.5)) * 600;
}
function projectY(lat: number) {
  return ((5.5 - lat) / (5.5 - -5)) * 400;
}

export default KenyaMap;
