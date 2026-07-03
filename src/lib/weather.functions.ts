import { createServerFn } from "@tanstack/react-start";

const BASE = "https://api.openweathermap.org";

async function ow(path: string, params: Record<string, string | number>) {
  // const key = process.env.OPENWEATHER_API_KEY;
  const key = "1c85fff7f3cf2b753ecb47f2a1d7636c";
  if (!key) throw new Error("OPENWEATHER_API_KEY is not configured");
  const qs = new URLSearchParams({ ...Object.fromEntries(Object.entries(params).map(([k, v]) => [k, String(v)])), appid: key });
  const res = await fetch(`${BASE}${path}?${qs.toString()}`);
  if (!res.ok) throw new Error(`OpenWeather ${path} failed: ${res.status}`);
  return res.json();
}

export interface WeatherPayload {
  location: { name: string; country: string; lat: number; lon: number; localTime: string };
  current: {
    temp: number;
    feels_like: number;
    humidity: number;
    pressure: number;
    wind_speed: number;
    wind_deg: number;
    visibility: number;
    clouds: number;
    condition: string;
    description: string;
    icon: string;
    sunrise: number;
    sunset: number;
    dt: number;
    timezone: number;
  };
  hourly: Array<{ dt: number; temp: number; icon: string; condition: string; pop: number }>;
  daily: Array<{ dt: number; min: number; max: number; icon: string; condition: string; pop: number }>;
  aqi: { aqi: number; components: Record<string, number> } | null;
}

export const getWeather = createServerFn({ method: "GET" })
  .inputValidator((data: { query?: string; lat?: number; lon?: number; units?: "metric" | "imperial" }) => ({
    query: data.query?.trim() || undefined,
    lat: typeof data.lat === "number" ? data.lat : undefined,
    lon: typeof data.lon === "number" ? data.lon : undefined,
    units: data.units === "imperial" ? "imperial" : "metric",
  }))
  .handler(async ({ data }): Promise<WeatherPayload> => {
    let lat = data.lat;
    let lon = data.lon;
    let name = "";
    let country = "";

    if (lat === undefined || lon === undefined) {
      const q = data.query || "London";
      const geo = (await ow("/geo/1.0/direct", { q, limit: 1 })) as Array<{ name: string; country: string; lat: number; lon: number; state?: string }>;
      if (!geo.length) throw new Error("Location not found");
      lat = geo[0].lat;
      lon = geo[0].lon;
      name = geo[0].name;
      country = geo[0].country;
    } else {
      const rev = (await ow("/geo/1.0/reverse", { lat, lon, limit: 1 })) as Array<{ name: string; country: string }>;
      name = rev[0]?.name || "Current location";
      country = rev[0]?.country || "";
    }

    const results = await Promise.all([
      ow("/data/2.5/weather", { lat, lon, units: data.units }),
      ow("/data/2.5/forecast", { lat, lon, units: data.units }),
      ow("/data/2.5/air_pollution", { lat, lon }).catch(() => null),
    ]);
    const current = results[0] as any;
    const forecast = results[1] as any;
    const air = results[2] as any;

    const tz = current.timezone as number;
    const localTime = new Date((current.dt + tz) * 1000).toISOString();

    const hourly = (forecast.list as any[]).slice(0, 8).map((h) => ({
      dt: h.dt,
      temp: h.main.temp,
      icon: h.weather[0].icon,
      condition: h.weather[0].main,
      pop: h.pop ?? 0,
    }));

    // Group forecast into daily min/max
    const byDay = new Map<string, { min: number; max: number; icons: string[]; conds: string[]; pop: number; dt: number }>();
    for (const item of forecast.list as any[]) {
      const day = new Date((item.dt + tz) * 1000).toISOString().slice(0, 10);
      const entry = byDay.get(day) || { min: Infinity, max: -Infinity, icons: [] as string[], conds: [] as string[], pop: 0, dt: item.dt };
      entry.min = Math.min(entry.min, item.main.temp_min);
      entry.max = Math.max(entry.max, item.main.temp_max);
      entry.icons.push(item.weather[0].icon);
      entry.conds.push(item.weather[0].main);
      entry.pop = Math.max(entry.pop, item.pop ?? 0);
      byDay.set(day, entry);
    }
    const daily = Array.from(byDay.values()).slice(0, 7).map((d) => ({
      dt: d.dt,
      min: d.min,
      max: d.max,
      icon: d.icons[Math.floor(d.icons.length / 2)],
      condition: d.conds[Math.floor(d.conds.length / 2)],
      pop: d.pop,
    }));

    return {
      location: { name, country, lat, lon, localTime },
      current: {
        temp: current.main.temp,
        feels_like: current.main.feels_like,
        humidity: current.main.humidity,
        pressure: current.main.pressure,
        wind_speed: current.wind.speed,
        wind_deg: current.wind.deg,
        visibility: current.visibility ?? 0,
        clouds: current.clouds?.all ?? 0,
        condition: current.weather[0].main,
        description: current.weather[0].description,
        icon: current.weather[0].icon,
        sunrise: current.sys.sunrise,
        sunset: current.sys.sunset,
        dt: current.dt,
        timezone: tz,
      },
      hourly,
      daily,
      aqi: air ? { aqi: air.list[0].main.aqi, components: air.list[0].components } : null,
    };
  });

export const searchCities = createServerFn({ method: "GET" })
  .inputValidator((data: { q: string }) => ({ q: data.q.trim().slice(0, 60) }))
  .handler(async ({ data }) => {
    if (!data.q) return [];
    const results = (await ow("/geo/1.0/direct", { q: data.q, limit: 5 })) as Array<{
      name: string; country: string; state?: string; lat: number; lon: number;
    }>;
    return results.map((r) => ({
      name: r.name,
      country: r.country,
      state: r.state,
      lat: r.lat,
      lon: r.lon,
      label: [r.name, r.state, r.country].filter(Boolean).join(", "),
    }));
  });
