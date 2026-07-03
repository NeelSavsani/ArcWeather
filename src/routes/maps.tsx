import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { motion } from "framer-motion";
import { CloudSnow, Wind, Droplets, Thermometer, MapPin, Plus, Minus, Layers } from "lucide-react";
import { PageHeader } from "@/components/ui-glass";
import { useLocation } from "@/lib/store";

const LAYERS = [
  { id: "temp", label: "Temperature", icon: <Thermometer className="h-4 w-4" /> },
  { id: "rain", label: "Rainfall", icon: <Droplets className="h-4 w-4" /> },
  { id: "wind", label: "Wind", icon: <Wind className="h-4 w-4" /> },
  { id: "clouds", label: "Clouds", icon: <CloudSnow className="h-4 w-4" /> },
] as const;

export const Route = createFileRoute("/maps")({
  head: () => ({
    meta: [
      { title: "Weather Maps — ArcWeather" },
      { name: "description", content: "Interactive weather radar with temperature, rainfall, wind, and cloud layers." },
    ],
  }),
  component: MapsPage,
});

function MapsPage() {
  const [layer, setLayer] = useState<(typeof LAYERS)[number]["id"]>("temp");
  const [zoom, setZoom] = useState(6);
  const [loc] = useLocation();

  return (
    <div className="space-y-6">
      <PageHeader eyebrow="Maps" title="Weather radar"
        description="Toggle between temperature, rainfall, wind and cloud layers. Real radar coming soon." />

      <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
        {/* Sidebar */}
        <div className="space-y-4">
          <div className="glass p-5">
            <h3 className="flex items-center gap-2 text-sm font-semibold text-white/80">
              <Layers className="h-4 w-4" /> Layers
            </h3>
            <div className="mt-3 flex flex-col gap-1.5">
              {LAYERS.map((l) => (
                <button key={l.id} onClick={() => setLayer(l.id)}
                  className={`flex items-center gap-2.5 rounded-2xl px-3 py-2.5 text-sm transition ${
                    layer === l.id ? "bg-white/15 text-white" : "text-white/60 hover:bg-white/10"
                  }`}>
                  <span className="text-primary">{l.icon}</span> {l.label}
                </button>
              ))}
            </div>
          </div>

          <div className="glass p-5 text-sm">
            <p className="flex items-center gap-2 text-white/60">
              <MapPin className="h-4 w-4 text-primary" /> Center
            </p>
            <p className="mt-1 font-semibold">{loc.name}{loc.country && `, ${loc.country}`}</p>
            <p className="mt-1 font-mono text-xs text-white/50">
              {loc.lat.toFixed(3)}°, {loc.lon.toFixed(3)}°
            </p>
          </div>
        </div>

        {/* Map placeholder */}
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.5 }}
          className="glass-strong relative aspect-[16/10] overflow-hidden lg:aspect-auto lg:min-h-[560px]"
        >
          <MapPlaceholder layer={layer} />

          {/* Overlay: zoom */}
          <div className="glass absolute top-4 right-4 flex flex-col overflow-hidden rounded-2xl">
            <button onClick={() => setZoom((z) => Math.min(12, z + 1))} className="p-2.5 transition hover:bg-white/10" aria-label="Zoom in">
              <Plus className="h-4 w-4" />
            </button>
            <div className="h-px bg-white/15" />
            <button onClick={() => setZoom((z) => Math.max(2, z - 1))} className="p-2.5 transition hover:bg-white/10" aria-label="Zoom out">
              <Minus className="h-4 w-4" />
            </button>
          </div>
          <div className="glass absolute bottom-4 left-4 rounded-full px-3 py-1.5 text-xs font-medium">
            Zoom · {zoom}
          </div>
          <div className="glass absolute bottom-4 right-4 rounded-full px-3 py-1.5 text-xs font-medium capitalize">
            {LAYERS.find((l) => l.id === layer)?.label}
          </div>

          {/* Center marker */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
            <motion.div
              animate={{ scale: [1, 1.3, 1] }} transition={{ duration: 2, repeat: Infinity }}
              className="h-12 w-12 rounded-full"
              style={{ background: "radial-gradient(circle, rgba(77,168,255,0.6), transparent 70%)" }}
            />
            <div className="absolute inset-0 grid place-items-center">
              <MapPin className="h-6 w-6 text-primary drop-shadow-lg" fill="currentColor" />
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

function MapPlaceholder({ layer }: { layer: string }) {
  const gradients: Record<string, string> = {
    temp: "radial-gradient(circle at 30% 40%, rgba(239,68,68,0.5), transparent 50%), radial-gradient(circle at 70% 60%, rgba(77,168,255,0.5), transparent 50%)",
    rain: "radial-gradient(circle at 60% 40%, rgba(77,168,255,0.5), transparent 50%), radial-gradient(circle at 30% 70%, rgba(79,209,197,0.5), transparent 50%)",
    wind: "radial-gradient(circle at 50% 50%, rgba(139,92,246,0.4), transparent 55%), radial-gradient(circle at 80% 20%, rgba(79,209,197,0.4), transparent 50%)",
    clouds: "radial-gradient(circle at 40% 40%, rgba(255,255,255,0.15), transparent 55%), radial-gradient(circle at 70% 60%, rgba(255,255,255,0.12), transparent 55%)",
  };
  return (
    <div className="absolute inset-0" style={{ background: gradients[layer] || gradients.temp }}>
      {/* Grid lines */}
      <svg className="absolute inset-0 h-full w-full opacity-20" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <pattern id="grid" width="60" height="60" patternUnits="userSpaceOnUse">
            <path d="M 60 0 L 0 0 0 60" fill="none" stroke="white" strokeWidth="0.5" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#grid)" />
      </svg>
    </div>
  );
}
