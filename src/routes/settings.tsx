import { createFileRoute } from "@tanstack/react-router";
import { PageHeader, GlassCard } from "@/components/ui-glass";
import { usePrefs } from "@/lib/store";
import type { Prefs } from "@/lib/store";
import type { ReactNode } from "react";

export const Route = createFileRoute("/settings")({
  head: () => ({
    meta: [
      { title: "Settings — ArcWeather" },
      { name: "description", content: "Customize units, appearance and behavior." },
    ],
  }),
  component: SettingsPage,
});

function SettingsPage() {
  const [prefs, setPrefs] = usePrefs();
  const set = <K extends keyof Prefs>(k: K, v: Prefs[K]) => setPrefs((p) => ({ ...p, [k]: v }));

  return (
    <div className="space-y-8">
      <PageHeader eyebrow="Settings" title="Preferences"
        description="Personalize ArcWeather to match how you read the weather." />

      <div className="grid gap-6 lg:grid-cols-2">
        <GlassCard>
          <SectionTitle>Units</SectionTitle>
          <Row label="Temperature">
            <Segmented value={prefs.units} onChange={(v) => set("units", v)}
              options={[{ v: "metric", l: "°C" }, { v: "imperial", l: "°F" }]} />
          </Row>
          <Row label="Wind speed">
            <Segmented value={prefs.windUnit} onChange={(v) => set("windUnit", v)}
              options={[{ v: "auto", l: "Auto" }, { v: "kmh", l: "km/h" }, { v: "mph", l: "mph" }, { v: "ms", l: "m/s" }]} />
          </Row>
          <Row label="Pressure">
            <Segmented value={prefs.pressureUnit} onChange={(v) => set("pressureUnit", v)}
              options={[{ v: "hPa", l: "hPa" }, { v: "inHg", l: "inHg" }]} />
          </Row>
          <Row label="Time format">
            <Segmented value={prefs.time} onChange={(v) => set("time", v)}
              options={[{ v: "24h", l: "24h" }, { v: "12h", l: "12h" }]} />
          </Row>
        </GlassCard>

        <GlassCard delay={0.05}>
          <SectionTitle>Appearance</SectionTitle>
          <Row label="Theme">
            <Segmented value={prefs.theme} onChange={(v) => set("theme", v)}
              options={[{ v: "dark", l: "Dark" }, { v: "light", l: "Light" }, { v: "auto", l: "Auto" }]} />
          </Row>
          <Row label="Language">
            <Select value={prefs.language} onChange={(v) => set("language", v)}
              options={[{ v: "en", l: "English" }, { v: "es", l: "Español" }, { v: "fr", l: "Français" }, { v: "de", l: "Deutsch" }, { v: "ja", l: "日本語" }]} />
          </Row>
        </GlassCard>

        <GlassCard delay={0.1}>
          <SectionTitle>Behavior</SectionTitle>
          <Row label="Auto-detect location">
            <Toggle checked={prefs.autoDetect} onChange={(v) => set("autoDetect", v)} />
          </Row>
          <Row label="Enable notifications">
            <Toggle checked={prefs.notifications} onChange={(v) => set("notifications", v)} />
          </Row>
          <Row label="Refresh interval">
            <Select value={String(prefs.refreshMin)} onChange={(v) => set("refreshMin", Number(v))}
              options={[{ v: "5", l: "5 min" }, { v: "15", l: "15 min" }, { v: "30", l: "30 min" }, { v: "60", l: "1 hour" }]} />
          </Row>
        </GlassCard>

        <GlassCard delay={0.15}>
          <SectionTitle>Data</SectionTitle>
          <p className="text-sm text-white/60">
            Preferences and saved cities are stored locally on this device.
            No account is needed.
          </p>
          <button
            onClick={() => { if (confirm("Reset all preferences?")) localStorage.clear(); location.reload(); }}
            className="glass-strong mt-4 rounded-full px-4 py-2 text-sm font-medium transition hover:scale-105"
          >
            Reset everything
          </button>
        </GlassCard>
      </div>
    </div>
  );
}

function SectionTitle({ children }: { children: ReactNode }) {
  return <h2 className="mb-4 text-xs font-bold tracking-[0.2em] text-primary uppercase">{children}</h2>;
}

function Row({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-4 border-t border-white/8 py-3 first:border-none first:pt-0">
      <span className="text-sm font-medium text-white/85">{label}</span>
      <div>{children}</div>
    </div>
  );
}

function Segmented<T extends string>({ value, onChange, options }: {
  value: T; onChange: (v: T) => void; options: { v: T; l: string }[];
}) {
  return (
    <div className="glass flex overflow-hidden rounded-full p-1 text-xs font-semibold">
      {options.map((o) => (
        <button key={o.v} onClick={() => onChange(o.v)}
          className={`rounded-full px-3 py-1.5 transition ${value === o.v ? "bg-white text-slate-900" : "text-white/70 hover:text-white"}`}>
          {o.l}
        </button>
      ))}
    </div>
  );
}

function Select({ value, onChange, options }: {
  value: string; onChange: (v: string) => void; options: { v: string; l: string }[];
}) {
  return (
    <select
      value={value} onChange={(e) => onChange(e.target.value)}
      className="glass rounded-full bg-transparent px-3 py-1.5 text-xs font-semibold outline-none"
    >
      {options.map((o) => (
        <option key={o.v} value={o.v} className="bg-slate-900">{o.l}</option>
      ))}
    </select>
  );
}

function Toggle({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      role="switch" aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={`relative h-6 w-11 rounded-full transition ${checked ? "bg-primary" : "bg-white/15"}`}
    >
      <span
        className="absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white shadow-md transition-transform"
        style={{ transform: checked ? "translateX(20px)" : "translateX(0)" }}
      />
    </button>
  );
}
