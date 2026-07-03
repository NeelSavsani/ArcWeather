import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search, MapPin, Wind, Droplets, Eye, Gauge, Sunrise, Sunset,
  Thermometer, CloudRain, Compass, Loader2, X, Star, StarOff, Clock,
} from "lucide-react";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { getWeather, searchCities, type WeatherPayload } from "@/lib/weather.functions";
import { useLocation, useFavorites, useHistory, usePrefs, useDebounced } from "@/lib/store";
import { ErrorState } from "@/components/ui-glass";

function iconUrl(icon: string) { return `https://openweathermap.org/img/wn/${icon}@4x.png`; }

function useWeather() {
  const [loc] = useLocation();
  const [prefs] = usePrefs();
  const fn = useServerFn(getWeather);
  return useQuery({
    queryKey: ["weather", loc.lat, loc.lon, prefs.units],
    queryFn: () => fn({ data: { lat: loc.lat, lon: loc.lon, units: prefs.units } }),
    staleTime: 5 * 60 * 1000,
  });
}

export function useCurrentWeather() { return useWeather(); }

export function LocationSearch() {
  const [q, setQ] = useState("");
  const dq = useDebounced(q, 250);
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const [, setLoc] = useLocation();
  const history = useHistory();
  const search = useServerFn(searchCities);

  const suggest = useQuery({
    queryKey: ["cities", dq],
    queryFn: () => search({ data: { q: dq } }),
    enabled: dq.trim().length >= 2,
    staleTime: 60_000,
  });

  useEffect(() => {
    function h(e: MouseEvent) { if (!ref.current?.contains(e.target as Node)) setOpen(false); }
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  function pick(c: { name: string; country: string; lat: number; lon: number }) {
    const loc = { lat: c.lat, lon: c.lon, name: c.name, country: c.country };
    setLoc(loc);
    history.push(loc);
    setQ(""); setOpen(false);
  }

  function useMyLoc() {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      (p) => setLoc({ lat: p.coords.latitude, lon: p.coords.longitude, name: "Current location" }),
      () => {}, { timeout: 6000 },
    );
  }

  return (
    <div ref={ref} className="relative">
      <div className="glass-strong flex items-center gap-3 rounded-full px-5 py-3.5">
        <Search className="h-5 w-5 shrink-0 text-white/60" />
        <input
          value={q}
          onChange={(e) => { setQ(e.target.value); setOpen(true); }}
          onFocus={() => setOpen(true)}
          placeholder="Search any city…"
          aria-label="Search city"
          className="min-w-0 flex-1 bg-transparent text-base outline-none placeholder:text-white/40"
        />
        {q && (
          <button onClick={() => setQ("")} className="text-white/40 hover:text-white" aria-label="Clear">
            <X className="h-4 w-4" />
          </button>
        )}
        {suggest.isFetching && <Loader2 className="h-4 w-4 shrink-0 animate-spin text-white/60" />}
        <button onClick={useMyLoc}
          className="glass flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition hover:scale-105"
          aria-label="Use my location">
          <MapPin className="h-3.5 w-3.5" /> <span className="hidden sm:inline">My location</span>
        </button>
      </div>

      <AnimatePresence>
        {open && ((suggest.data && suggest.data.length > 0) || history.list.length > 0) && (
          <motion.div
            initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
            className="glass-strong absolute z-30 mt-2 w-full overflow-hidden rounded-3xl p-2"
          >
            {suggest.data && suggest.data.length > 0 ? (
              <ul>
                {suggest.data.map((c) => (
                  <li key={`${c.lat}-${c.lon}`}>
                    <button
                      onClick={() => pick({ name: c.name, country: c.country, lat: c.lat, lon: c.lon })}
                      className="flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-left text-sm transition hover:bg-white/10"
                    >
                      <MapPin className="h-4 w-4 text-primary" /> <span>{c.label}</span>
                    </button>
                  </li>
                ))}
              </ul>
            ) : (
              <>
                <p className="px-3 py-2 text-[11px] font-semibold tracking-widest text-white/50 uppercase">Recent</p>
                <ul>
                  {history.list.slice(0, 6).map((h) => (
                    <li key={h.at}>
                      <button
                        onClick={() => pick({ name: h.name, country: h.country || "", lat: h.lat, lon: h.lon })}
                        className="flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-left text-sm transition hover:bg-white/10"
                      >
                        <Clock className="h-4 w-4 text-white/50" />
                        <span>{h.name}{h.country && `, ${h.country}`}</span>
                      </button>
                    </li>
                  ))}
                </ul>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export function FavoriteButton() {
  const [loc] = useLocation();
  const fav = useFavorites();
  const active = fav.has(loc.lat, loc.lon);
  return (
    <button
      onClick={() => (active ? fav.remove(loc.lat, loc.lon) : fav.add(loc))}
      className="glass flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition hover:scale-105"
      aria-pressed={active}
    >
      {active ? <Star className="h-4 w-4 fill-warning text-warning" /> : <StarOff className="h-4 w-4" />}
      {active ? "Saved" : "Save"}
    </button>
  );
}

export function HeroCurrent({ data }: { data: WeatherPayload }) {
  const [prefs] = usePrefs();
  const unitSym = prefs.units === "metric" ? "°C" : "°F";
  const { current, location } = data;
  const tz = current.timezone;

  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}
      className="glass-strong relative overflow-hidden p-6 sm:p-8"
      style={{ boxShadow: "var(--shadow-glass), var(--shadow-glow)" }}
    >
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0">
          <div className="flex items-center gap-2 text-white/70">
            <MapPin className="h-4 w-4" />
            <span className="truncate text-sm font-medium">
              {location.name}{location.country && `, ${location.country}`}
            </span>
          </div>
          <p className="mt-1 text-xs text-white/50">
            {new Intl.DateTimeFormat("en-US", {
              weekday: "long", month: "long", day: "numeric",
              hour: prefs.time === "12h" ? "numeric" : "2-digit",
              minute: "2-digit", hour12: prefs.time === "12h", timeZone: "UTC",
            }).format(new Date((current.dt + tz) * 1000))}
          </p>
        </div>
        <span className="glass rounded-full px-3 py-1 text-xs font-medium capitalize text-white/80">
          {current.description}
        </span>
      </div>

      <div className="mt-6 flex flex-wrap items-center gap-6">
        <motion.img
          src={iconUrl(current.icon)} alt={current.condition}
          className="animate-float h-40 w-40 drop-shadow-2xl"
          initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 120 }}
        />
        <div className="min-w-0">
          <div className="text-gradient text-7xl font-extrabold leading-none tracking-tight sm:text-8xl">
            {Math.round(current.temp)}<span className="text-4xl font-semibold">{unitSym}</span>
          </div>
          <p className="mt-2 text-sm text-white/70">
            Feels like <span className="font-semibold text-white">{Math.round(current.feels_like)}{unitSym}</span>
          </p>
        </div>
      </div>
    </motion.section>
  );
}

export function WeatherError({ error, refetch }: { error: unknown; refetch: () => void }) {
  return <ErrorState title="Couldn't load weather" message={(error as Error)?.message || "Please try again."} onRetry={refetch} />;
}

export function WeatherLoading() {
  return (
    <div className="glass flex items-center justify-center gap-3 p-10 text-white/70">
      <Loader2 className="h-5 w-5 animate-spin" /> Loading forecast…
    </div>
  );
}

// Grid of metric tiles
export function CurrentMetrics({ data }: { data: WeatherPayload }) {
  const [prefs] = usePrefs();
  const unitSym = prefs.units === "metric" ? "°C" : "°F";
  const speedSym = prefs.units === "metric" ? "m/s" : "mph";
  const c = data.current;
  const tiles = [
    { icon: <Thermometer />, label: "Temperature", value: `${Math.round(c.temp)}${unitSym}`, desc: `Feels ${Math.round(c.feels_like)}${unitSym}` },
    { icon: <Droplets />, label: "Humidity", value: `${c.humidity}%`, desc: c.humidity > 60 ? "Humid" : "Comfortable" },
    { icon: <Wind />, label: "Wind", value: `${c.wind_speed.toFixed(1)} ${speedSym}`, desc: `${c.wind_deg}°` },
    { icon: <Gauge />, label: "Pressure", value: `${c.pressure} hPa`, desc: c.pressure > 1015 ? "High" : "Low" },
    { icon: <Eye />, label: "Visibility", value: `${(c.visibility / 1000).toFixed(1)} km`, desc: c.visibility > 8000 ? "Clear" : "Reduced" },
    { icon: <CloudRain />, label: "Clouds", value: `${c.clouds}%`, desc: c.clouds > 50 ? "Cloudy" : "Clear-ish" },
    { icon: <Sunrise />, label: "Sunrise", value: fmt(c.sunrise, c.timezone, prefs.time), desc: "" },
    { icon: <Sunset />, label: "Sunset", value: fmt(c.sunset, c.timezone, prefs.time), desc: "" },
    { icon: <Compass />, label: "Wind dir", value: `${c.wind_deg}°`, desc: dirLabel(c.wind_deg) },
  ];
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
      {tiles.map((t, i) => (
        <motion.div key={t.label}
          initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}
          className="glass group cursor-default rounded-3xl p-4 transition hover:-translate-y-0.5"
          style={{ transition: "transform .3s, box-shadow .3s" }}
        >
          <div className="flex items-center gap-2 text-xs text-white/60">
            <span className="text-primary [&>svg]:h-4 [&>svg]:w-4">{t.icon}</span>
            {t.label}
          </div>
          <p className="mt-2 truncate text-2xl font-bold">{t.value}</p>
          {t.desc && <p className="mt-0.5 text-xs text-white/50">{t.desc}</p>}
        </motion.div>
      ))}
    </div>
  );
}

function dirLabel(deg: number) {
  const d = ["N", "NE", "E", "SE", "S", "SW", "W", "NW"];
  return d[Math.round(deg / 45) % 8];
}
function fmt(unix: number, tz: number, format: "12h" | "24h") {
  return new Intl.DateTimeFormat("en-US", {
    hour: format === "12h" ? "numeric" : "2-digit",
    minute: "2-digit", hour12: format === "12h", timeZone: "UTC",
  }).format(new Date((unix + tz) * 1000));
}

export function HourlyStrip({ data }: { data: WeatherPayload }) {
  const [prefs] = usePrefs();
  return (
    <div className="glass p-6">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-semibold">Next 24 hours</h2>
        <span className="text-xs text-white/50">3-hour steps</span>
      </div>
      <div className="-mx-2 flex snap-x snap-mandatory gap-3 overflow-x-auto px-2 pb-2">
        {data.hourly.map((h, i) => (
          <motion.div key={h.dt}
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}
            className={`flex min-w-[100px] snap-start flex-col items-center gap-1 rounded-2xl px-3 py-4 ${
              i === 0 ? "glass-strong ring-1 ring-primary/40" : "glass"
            }`}
          >
            <span className="text-xs text-white/60">{i === 0 ? "Now" : fmt(h.dt, data.current.timezone, prefs.time)}</span>
            <img src={iconUrl(h.icon)} alt={h.condition} className="h-12 w-12" />
            <span className="text-base font-semibold">{Math.round(h.temp)}°</span>
            <span className="flex items-center gap-1 text-[10px] text-primary">
              <CloudRain className="h-3 w-3" />{Math.round(h.pop * 100)}%
            </span>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

export function DailyList({ data }: { data: WeatherPayload }) {
  const [expanded, setExpanded] = useState<number | null>(null);
  const tz = data.current.timezone;
  return (
    <div className="glass p-6">
      <h2 className="mb-4 text-lg font-semibold">7-day forecast</h2>
      <ul className="divide-y divide-white/10">
        {data.daily.map((d, i) => {
          const isOpen = expanded === i;
          return (
            <li key={d.dt}>
              <button
                onClick={() => setExpanded(isOpen ? null : i)}
                className="grid w-full grid-cols-[80px_44px_1fr_auto] items-center gap-4 py-3 text-left transition hover:bg-white/5"
              >
                <span className="text-sm font-medium">
                  {i === 0 ? "Today" : new Intl.DateTimeFormat("en-US", { weekday: "short", timeZone: "UTC" }).format(new Date((d.dt + tz) * 1000))}
                </span>
                <img src={iconUrl(d.icon)} alt={d.condition} className="h-10 w-10" />
                <div className="flex items-center gap-3">
                  <span className="text-xs text-white/60">{Math.round(d.min)}°</span>
                  <div className="relative h-1.5 flex-1 overflow-hidden rounded-full bg-white/10">
                    <div className="absolute inset-y-0 rounded-full"
                         style={{ left: "10%", right: "10%", background: "linear-gradient(90deg, #4FD1C5, #4DA8FF, #F59E0B)" }} />
                  </div>
                  <span className="text-sm font-semibold">{Math.round(d.max)}°</span>
                </div>
                <span className="flex items-center gap-1 text-xs text-primary">
                  <CloudRain className="h-3.5 w-3.5" />{Math.round(d.pop * 100)}%
                </span>
              </button>
              <AnimatePresence>
                {isOpen && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="grid grid-cols-2 gap-3 py-3 pl-[124px] text-xs sm:grid-cols-4">
                      <MiniStat label="Condition" value={d.condition} />
                      <MiniStat label="Rain chance" value={`${Math.round(d.pop * 100)}%`} />
                      <MiniStat label="High" value={`${Math.round(d.max)}°`} />
                      <MiniStat label="Low" value={`${Math.round(d.min)}°`} />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

function MiniStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="glass rounded-2xl px-3 py-2">
      <p className="text-white/50">{label}</p>
      <p className="mt-0.5 font-semibold text-white">{value}</p>
    </div>
  );
}
