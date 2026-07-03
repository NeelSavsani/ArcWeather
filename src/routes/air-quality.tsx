import { createFileRoute } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { PageHeader, GlassCard } from "@/components/ui-glass";
import { WeatherError, WeatherLoading, useCurrentWeather } from "@/components/weather-parts";

const AQI_LABELS = ["", "Good", "Fair", "Moderate", "Poor", "Very Poor"];
const AQI_COLORS = ["", "#22C55E", "#84cc16", "#F59E0B", "#EF4444", "#8B5CF6"];
const HEALTH: Record<number, string> = {
  1: "Air quality is satisfactory. Perfect for outdoor activities.",
  2: "Acceptable air quality. Unusually sensitive people should limit prolonged exertion.",
  3: "Sensitive groups may experience health effects; general public unlikely affected.",
  4: "Everyone may begin to experience effects. Sensitive groups should reduce outdoor activity.",
  5: "Health warnings of emergency conditions. Entire population more likely to be affected.",
};

const POLLUTANTS: { key: string; name: string; unit: string; max: number }[] = [
  { key: "pm2_5", name: "PM2.5", unit: "µg/m³", max: 75 },
  { key: "pm10", name: "PM10", unit: "µg/m³", max: 150 },
  { key: "co", name: "CO", unit: "µg/m³", max: 15400 },
  { key: "no2", name: "NO₂", unit: "µg/m³", max: 200 },
  { key: "o3", name: "O₃", unit: "µg/m³", max: 180 },
  { key: "so2", name: "SO₂", unit: "µg/m³", max: 350 },
];

export const Route = createFileRoute("/air-quality")({
  head: () => ({
    meta: [
      { title: "Air Quality — ArcWeather" },
      { name: "description", content: "Live air quality index and pollutant breakdown for your location." },
    ],
  }),
  component: AirQualityPage,
});

function AirQualityPage() {
  const q = useCurrentWeather();
  const aqi = q.data?.aqi;

  return (
    <div className="space-y-8">
      <PageHeader eyebrow="Air quality" title="What you're breathing"
        description="Live AQI, pollutant concentrations, and health guidance." />

      {q.isLoading && <WeatherLoading />}
      {q.isError && <WeatherError error={q.error} refetch={q.refetch} />}

      {q.data && !aqi && (
        <div className="glass p-8 text-center text-white/70">Air quality data unavailable for this location.</div>
      )}

      {aqi && (
        <div className="grid gap-6 lg:grid-cols-3">
          <GlassCard className="lg:col-span-1 flex flex-col items-center justify-center gap-4 text-center">
            <CircularAqi value={aqi.aqi} />
            <div>
              <p className="text-3xl font-extrabold">{AQI_LABELS[aqi.aqi]}</p>
              <p className="mt-1 text-sm text-white/60">Overall Air Quality Index</p>
            </div>
          </GlassCard>

          <GlassCard delay={0.05} className="lg:col-span-2">
            <h2 className="text-lg font-semibold">Health guidance</h2>
            <p className="mt-3 text-sm leading-relaxed text-white/75">{HEALTH[aqi.aqi]}</p>
            <div className="mt-6 grid grid-cols-5 gap-2">
              {[1, 2, 3, 4, 5].map((n) => (
                <div key={n} className="text-center">
                  <div className="h-2 rounded-full transition"
                       style={{ background: n <= aqi.aqi ? AQI_COLORS[n] : "rgba(255,255,255,0.1)" }} />
                  <p className="mt-1 text-[10px] text-white/50">{AQI_LABELS[n]}</p>
                </div>
              ))}
            </div>
          </GlassCard>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:col-span-3 lg:grid-cols-3">
            {POLLUTANTS.map((p, i) => {
              const val = aqi.components[p.key] ?? 0;
              const pct = Math.min(100, (val / p.max) * 100);
              return (
                <motion.div key={p.key}
                  initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                  className="glass p-5"
                >
                  <div className="flex items-baseline justify-between">
                    <span className="text-sm text-white/70">{p.name}</span>
                    <span className="text-xs text-white/40">{p.unit}</span>
                  </div>
                  <p className="mt-1 text-3xl font-bold">{val.toFixed(1)}</p>
                  <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-white/10">
                    <motion.div initial={{ width: 0 }} animate={{ width: `${pct}%` }} transition={{ duration: 0.8, delay: 0.1 + i * 0.05 }}
                      className="h-full rounded-full" style={{ background: AQI_COLORS[aqi.aqi] }} />
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

function CircularAqi({ value }: { value: number }) {
  const pct = (value / 5) * 100;
  const size = 200, stroke = 14, r = (size - stroke) / 2, c = 2 * Math.PI * r;
  const color = AQI_COLORS[value];
  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} strokeWidth={stroke} stroke="rgba(255,255,255,0.08)" fill="none" />
        <motion.circle
          cx={size / 2} cy={size / 2} r={r} strokeWidth={stroke} stroke={color} fill="none" strokeLinecap="round"
          strokeDasharray={c}
          initial={{ strokeDashoffset: c }}
          animate={{ strokeDashoffset: c - (c * pct) / 100 }}
          transition={{ duration: 1, ease: "easeOut" }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-5xl font-extrabold" style={{ color }}>{value}</span>
        <span className="text-xs tracking-widest text-white/50 uppercase">AQI</span>
      </div>
    </div>
  );
}
