import { createFileRoute } from "@tanstack/react-router";
import { motion, AnimatePresence } from "framer-motion";
import { useServerFn } from "@tanstack/react-start";
import { useQueries } from "@tanstack/react-query";
import { Trash2, Eye, Star } from "lucide-react";
import { PageHeader, EmptyState } from "@/components/ui-glass";
import { useFavorites, useLocation, usePrefs } from "@/lib/store";
import { getWeather } from "@/lib/weather.functions";

export const Route = createFileRoute("/favorites")({
  head: () => ({
    meta: [
      { title: "Favorites — ArcWeather" },
      { name: "description", content: "Your saved cities at a glance." },
    ],
  }),
  component: FavoritesPage,
});

function FavoritesPage() {
  const fav = useFavorites();
  const [, setLoc] = useLocation();
  const [prefs] = usePrefs();
  const fn = useServerFn(getWeather);

  const results = useQueries({
    queries: fav.list.map((f) => ({
      queryKey: ["weather", f.lat, f.lon, prefs.units],
      queryFn: () => fn({ data: { lat: f.lat, lon: f.lon, units: prefs.units } }),
      staleTime: 5 * 60 * 1000,
    })),
  });

  return (
    <div className="space-y-8">
      <PageHeader eyebrow="Favorites" title="Your saved cities"
        description="Quick access to the places you care about." />

      {fav.list.length === 0 ? (
        <EmptyState
          icon={<Star className="h-7 w-7" />}
          title="No favorites yet"
          description="Save a city from the home page to see it here."
        />
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <AnimatePresence>
            {fav.list.map((f, i) => {
              const w = results[i]?.data;
              return (
                <motion.div key={`${f.lat}-${f.lon}`} layout
                  initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ delay: i * 0.04 }}
                  className="glass group relative p-5 transition hover:-translate-y-1"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="truncate text-lg font-semibold">{f.name}</p>
                      <p className="text-xs text-white/50">{f.country}</p>
                    </div>
                    {w && (
                      <img src={`https://openweathermap.org/img/wn/${w.current.icon}@2x.png`} alt="" className="-mt-2 h-12 w-12" />
                    )}
                  </div>
                  <div className="mt-3 flex items-end justify-between">
                    <div>
                      {w ? (
                        <p className="text-4xl font-extrabold">
                          {Math.round(w.current.temp)}<span className="text-lg font-semibold">°{prefs.units === "metric" ? "C" : "F"}</span>
                        </p>
                      ) : (
                        <div className="skeleton h-10 w-24" />
                      )}
                      <p className="mt-1 text-xs capitalize text-white/60">{w?.current.description || "Loading…"}</p>
                    </div>
                  </div>
                  <div className="mt-4 flex gap-2">
                    <button
                      onClick={() => setLoc(f)}
                      className="glass-strong flex flex-1 items-center justify-center gap-1.5 rounded-full py-2 text-xs font-medium transition hover:scale-[1.02]"
                    >
                      <Eye className="h-3.5 w-3.5" /> View
                    </button>
                    <button
                      onClick={() => fav.remove(f.lat, f.lon)}
                      className="glass grid h-9 w-9 place-items-center rounded-full text-danger transition hover:scale-105"
                      aria-label={`Remove ${f.name}`}
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
