import { createFileRoute } from "@tanstack/react-router";
import { Cloud, Mail, ExternalLink, Code2 } from "lucide-react";
import { PageHeader, GlassCard } from "@/components/ui-glass";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About — ArcWeather" },
      { name: "description", content: "About ArcWeather — a premium glassmorphic weather platform." },
    ],
  }),
  component: AboutPage,
});

const STACK = [
  "React 19", "TanStack Start", "TanStack Query", "TypeScript",
  "Tailwind CSS v4", "Framer Motion", "Lucide Icons", "OpenWeatherMap API",
];

function AboutPage() {
  return (
    <div className="space-y-8">
      <PageHeader eyebrow="About" title="Meet ArcWeather"
        description="A premium weather platform built for people who love good design as much as good forecasts." />

      <div className="grid gap-6 lg:grid-cols-3">
        <GlassCard className="text-center lg:col-span-1">
          <div className="mx-auto grid h-20 w-20 place-items-center rounded-3xl shadow-xl"
               style={{ background: "linear-gradient(135deg, #4DA8FF, #8B5CF6)" }}>
            <Cloud className="h-10 w-10" />
          </div>
          <h2 className="mt-4 text-2xl font-extrabold">ArcWeather</h2>
          <p className="mt-1 text-sm text-white/60">v1.0.0 · Glass edition</p>
        </GlassCard>

        <GlassCard delay={0.05} className="lg:col-span-2">
          <h2 className="text-lg font-semibold">What is ArcWeather?</h2>
          <p className="mt-3 text-sm leading-relaxed text-white/75">
            ArcWeather is a modern, production-ready weather forecasting platform designed with a
            futuristic glassmorphism interface. It delivers real-time conditions, hourly and
            weekly forecasts, air quality insights, and beautiful visual data — all wrapped in
            an experience inspired by Apple Weather, visionOS, and Linear.
          </p>
          <p className="mt-3 text-sm leading-relaxed text-white/75">
            Every API request is proxied through a secure server layer, so your data stays fast
            and your keys stay private.
          </p>
        </GlassCard>

        <GlassCard delay={0.1} className="lg:col-span-2">
          <h2 className="text-lg font-semibold">Technology stack</h2>
          <div className="mt-4 flex flex-wrap gap-2">
            {STACK.map((s) => (
              <span key={s} className="glass rounded-full px-3 py-1.5 text-xs font-medium">{s}</span>
            ))}
          </div>
        </GlassCard>

        <GlassCard delay={0.15}>
          <h2 className="text-lg font-semibold">Credits</h2>
          <p className="mt-2 text-sm text-white/70">
            Weather data by <a href="https://openweathermap.org" target="_blank" rel="noreferrer"
              className="text-primary underline-offset-4 hover:underline">OpenWeatherMap</a>.
            Icons by Lucide.
          </p>
        </GlassCard>

        <GlassCard delay={0.2} className="lg:col-span-3">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-semibold">Get in touch</h2>
              <p className="mt-1 text-sm text-white/60">Feedback, ideas, or bugs — we'd love to hear.</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <a href="#" className="glass-strong flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition hover:scale-105">
                <Code2 className="h-4 w-4" /> GitHub <ExternalLink className="h-3 w-3 opacity-60" />
              </a>
              <a href="#" className="glass flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition hover:scale-105">
                <Mail className="h-4 w-4" /> Contact
              </a>
            </div>
          </div>
        </GlassCard>
      </div>
    </div>
  );
}
