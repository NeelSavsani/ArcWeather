import { useEffect, useState, useSyncExternalStore } from "react";

type Listener = () => void;

function createStore<T>(key: string, initial: T) {
  const listeners = new Set<Listener>();
  let cache: T | undefined;

  function read(): T {
    if (cache !== undefined) return cache;
    if (typeof window === "undefined") return initial;
    try {
      const raw = window.localStorage.getItem(key);
      cache = raw ? (JSON.parse(raw) as T) : initial;
    } catch { cache = initial; }
    return cache as T;
  }

  function write(next: T) {
    cache = next;
    if (typeof window !== "undefined") {
      window.localStorage.setItem(key, JSON.stringify(next));
    }
    listeners.forEach((l) => l());
  }

  function subscribe(l: Listener) {
    listeners.add(l);
    return () => { listeners.delete(l); };
  }

  return { read, write, subscribe };
}

export function useStore<T>(store: ReturnType<typeof createStore<T>>, initial: T): [T, (v: T | ((p: T) => T)) => void] {
  const value = useSyncExternalStore(store.subscribe, store.read, () => initial);
  const set = (v: T | ((p: T) => T)) => {
    const next = typeof v === "function" ? (v as (p: T) => T)(store.read()) : v;
    store.write(next);
  };
  return [value, set];
}

// ============ Selected location ============
export interface LocationRef {
  lat: number;
  lon: number;
  name: string;
  country?: string;
  query?: string;
}
const DEFAULT_LOCATION: LocationRef = { lat: 37.7749, lon: -122.4194, name: "San Francisco", country: "US" };
const locationStore = createStore<LocationRef>("arc:location", DEFAULT_LOCATION);
export const useLocation = () => useStore(locationStore, DEFAULT_LOCATION);

// ============ Preferences ============
export interface Prefs {
  units: "metric" | "imperial";
  time: "24h" | "12h";
  theme: "dark" | "light" | "auto";
  autoDetect: boolean;
  notifications: boolean;
  refreshMin: number;
  language: string;
  pressureUnit: "hPa" | "inHg";
  windUnit: "auto" | "kmh" | "mph" | "ms";
}
const DEFAULT_PREFS: Prefs = {
  units: "metric", time: "24h", theme: "dark", autoDetect: false,
  notifications: false, refreshMin: 15, language: "en", pressureUnit: "hPa", windUnit: "auto",
};
const prefsStore = createStore<Prefs>("arc:prefs", DEFAULT_PREFS);
export const usePrefs = () => useStore(prefsStore, DEFAULT_PREFS);

// ============ Favorites ============
export type Favorite = LocationRef;
const favStore = createStore<Favorite[]>("arc:favorites", []);
export function useFavorites() {
  const [list, setList] = useStore(favStore, []);
  return {
    list,
    add: (f: Favorite) => setList((p) => (p.some((x) => x.lat === f.lat && x.lon === f.lon) ? p : [...p, f])),
    remove: (lat: number, lon: number) => setList((p) => p.filter((x) => !(x.lat === lat && x.lon === lon))),
    has: (lat: number, lon: number) => list.some((x) => x.lat === lat && x.lon === lon),
  };
}

// ============ Search history ============
export interface HistoryEntry extends LocationRef { at: number }
const historyStore = createStore<HistoryEntry[]>("arc:history", []);
export function useHistory() {
  const [list, setList] = useStore(historyStore, []);
  return {
    list,
    push: (loc: LocationRef) => setList((p) => {
      const filtered = p.filter((x) => !(x.lat === loc.lat && x.lon === loc.lon));
      return [{ ...loc, at: Date.now() }, ...filtered].slice(0, 20);
    }),
    remove: (at: number) => setList((p) => p.filter((x) => x.at !== at)),
    clear: () => setList([]),
  };
}

// ============ Debounce ============
export function useDebounced<T>(value: T, ms = 250) {
  const [v, setV] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setV(value), ms);
    return () => clearTimeout(t);
  }, [value, ms]);
  return v;
}
