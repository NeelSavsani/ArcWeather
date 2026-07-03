import { createFileRoute } from "@tanstack/react-router";
import { motion, AnimatePresence } from "framer-motion";
import { Clock, Trash2, RotateCw, History } from "lucide-react";
import { PageHeader, EmptyState } from "@/components/ui-glass";
import { useHistory, useLocation } from "@/lib/store";

export const Route = createFileRoute("/history")({
  head: () => ({
    meta: [
      { title: "Search History — ArcWeather" },
      { name: "description", content: "Recently searched cities." },
    ],
  }),
  component: HistoryPage,
});

function HistoryPage() {
  const h = useHistory();
  const [, setLoc] = useLocation();

  function timeAgo(ts: number) {
    const s = Math.floor((Date.now() - ts) / 1000);
    if (s < 60) return `${s}s ago`;
    if (s < 3600) return `${Math.floor(s / 60)}m ago`;
    if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
    return `${Math.floor(s / 86400)}d ago`;
  }

  return (
    <div className="space-y-8">
      <PageHeader eyebrow="History" title="Recent searches"
        description="Everything you've looked up recently."
        right={
          h.list.length > 0 ? (
            <button onClick={h.clear} className="glass flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium text-danger transition hover:scale-105">
              <Trash2 className="h-4 w-4" /> Clear all
            </button>
          ) : undefined
        }
      />

      {h.list.length === 0 ? (
        <EmptyState
          icon={<History className="h-7 w-7" />}
          title="No search history"
          description="Search for a city on the home page and it'll appear here."
        />
      ) : (
        <div className="glass overflow-hidden">
          <ul className="divide-y divide-white/10">
            <AnimatePresence initial={false}>
              {h.list.map((entry) => (
                <motion.li key={entry.at}
                  layout
                  initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}
                  className="flex items-center gap-4 p-4"
                >
                  <div className="grid h-10 w-10 place-items-center rounded-2xl bg-white/8 text-primary">
                    <Clock className="h-4 w-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium">{entry.name}{entry.country && `, ${entry.country}`}</p>
                    <p className="text-xs text-white/50">{timeAgo(entry.at)}</p>
                  </div>
                  <button
                    onClick={() => setLoc({ lat: entry.lat, lon: entry.lon, name: entry.name, country: entry.country })}
                    className="glass-strong flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition hover:scale-105"
                  >
                    <RotateCw className="h-3.5 w-3.5" /> Search again
                  </button>
                  <button
                    onClick={() => h.remove(entry.at)}
                    className="glass grid h-9 w-9 place-items-center rounded-full text-danger transition hover:scale-105"
                    aria-label="Remove"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </motion.li>
              ))}
            </AnimatePresence>
          </ul>
        </div>
      )}
    </div>
  );
}
