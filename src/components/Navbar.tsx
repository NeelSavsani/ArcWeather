import { Link, useLocation as useRouterLocation } from "@tanstack/react-router";
import { motion, AnimatePresence } from "framer-motion";
import { Cloud, Menu, X, MapPin, Bell, User } from "lucide-react";
import { useState } from "react";
import { useLocation as useAppLocation } from "@/lib/store";

const NAV = [
  { to: "/", label: "Home" },
  { to: "/forecast", label: "Forecast" },
  { to: "/air-quality", label: "Air Quality" },
  { to: "/maps", label: "Maps" },
  { to: "/favorites", label: "Favorites" },
  { to: "/history", label: "History" },
  { to: "/settings", label: "Settings" },
  { to: "/about", label: "About" },
] as const;

function initialColor(seed: string) {
  const hues = [220, 260, 190, 320, 40, 150];
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h + seed.charCodeAt(i)) % 360;
  return `hsl(${hues[h % hues.length]} 70% 75%)`;
}

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const pathname = useRouterLocation({ select: (s) => s.pathname });
  const [loc] = useAppLocation();
  const initial = (loc.name?.[0] || "A").toUpperCase();

  return (
    <>
      <motion.header
        initial={{ y: -24, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="sticky top-3 z-40 mx-auto mt-3 w-[min(1400px,calc(100%-1rem))] px-2 sm:top-4 sm:mt-4 sm:px-0"
      >
        <div className="glass-strong flex items-center gap-3 rounded-full px-3 py-2 sm:px-5 sm:py-3">
          {/* Logo */}
          <Link to="/" className="group flex min-w-0 items-center gap-2.5" aria-label="ArcWeather home">
            <div className="grid h-9 w-9 shrink-0 place-items-center rounded-2xl shadow-lg transition group-hover:scale-105"
                 style={{ background: "linear-gradient(135deg, #4DA8FF, #8B5CF6)" }}>
              <Cloud className="h-5 w-5" />
            </div>
            <span className="hidden text-base font-bold tracking-tight sm:block">ArcWeather</span>
          </Link>

          {/* Desktop nav */}
          <nav className="mx-auto hidden items-center gap-1 lg:flex">
            {NAV.map((n) => {
              const active = pathname === n.to;
              return (
                <Link
                  key={n.to} to={n.to}
                  className={`relative rounded-full px-3.5 py-1.5 text-sm font-medium transition ${
                    active ? "text-white" : "text-white/60 hover:text-white"
                  }`}
                >
                  {n.label}
                  {active && (
                    <motion.span layoutId="nav-active"
                      className="absolute inset-0 -z-10 rounded-full bg-white/15"
                      transition={{ type: "spring", stiffness: 350, damping: 30 }} />
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Right */}
          <div className="ml-auto flex shrink-0 items-center gap-1.5">
            <button className="glass hidden h-9 w-9 items-center justify-center rounded-full transition hover:scale-105 sm:flex"
                    title="My location" aria-label="My location">
              <MapPin className="h-4 w-4" />
            </button>
            <button className="glass hidden h-9 w-9 items-center justify-center rounded-full transition hover:scale-105 sm:flex"
                    title="Notifications" aria-label="Notifications">
              <Bell className="h-4 w-4" />
            </button>
            <button
              className="grid h-9 w-9 shrink-0 place-items-center rounded-full text-sm font-bold text-slate-900 transition hover:scale-105"
              style={{ background: initialColor(loc.name || "A") }}
              aria-label="Profile"
            >
              {initial || <User className="h-4 w-4" />}
            </button>
            <button
              className="glass ml-1 flex h-9 w-9 items-center justify-center rounded-full lg:hidden"
              onClick={() => setOpen(true)} aria-label="Open menu"
            >
              <Menu className="h-4 w-4" />
            </button>
          </div>
        </div>
      </motion.header>

      {/* Mobile drawer */}
      <AnimatePresence>
        {open && (
          <>
            <motion.div
              className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setOpen(false)}
            />
            <motion.aside
              className="glass-strong fixed top-3 right-3 bottom-3 z-50 flex w-[min(320px,85vw)] flex-col gap-1 overflow-y-auto p-4"
              initial={{ x: 400 }} animate={{ x: 0 }} exit={{ x: 400 }}
              transition={{ type: "spring", damping: 30, stiffness: 260 }}
            >
              <div className="mb-3 flex items-center justify-between">
                <span className="text-lg font-bold">Menu</span>
                <button className="glass grid h-9 w-9 place-items-center rounded-full" onClick={() => setOpen(false)} aria-label="Close menu">
                  <X className="h-4 w-4" />
                </button>
              </div>
              {NAV.map((n) => {
                const active = pathname === n.to;
                return (
                  <Link
                    key={n.to} to={n.to} onClick={() => setOpen(false)}
                    className={`rounded-2xl px-4 py-3 text-base font-medium transition ${
                      active ? "bg-white/15 text-white" : "text-white/70 hover:bg-white/10 hover:text-white"
                    }`}
                  >
                    {n.label}
                  </Link>
                );
              })}
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
