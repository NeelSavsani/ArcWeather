import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/ui-glass";
import {
  LocationSearch, FavoriteButton, HeroCurrent, CurrentMetrics,
  HourlyStrip, DailyList, WeatherError, WeatherLoading, useCurrentWeather,
} from "@/components/weather-parts";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "ArcWeather — Real-time weather dashboard" },
      { name: "description", content: "Real-time conditions, hourly and 7-day forecasts, and premium weather insights." },
    ],
  }),
  component: HomePage,
});

function HomePage() {
  const q = useCurrentWeather();
  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Live weather"
        title="Your sky, in glass."
        description="Precision forecasts, air quality, and beautiful visual insights — updated in real time."
        right={<FavoriteButton />}
      />

      <LocationSearch />

      {q.isLoading && <WeatherLoading />}
      {q.isError && <WeatherError error={q.error} refetch={q.refetch} />}

      {q.data && (
        <>
          <HeroCurrent data={q.data} />
          <CurrentMetrics data={q.data} />
          <div className="grid gap-6 lg:grid-cols-3">
            <div className="lg:col-span-2"><HourlyStrip data={q.data} /></div>
            <div className="lg:col-span-1"><DailyList data={q.data} /></div>
          </div>
        </>
      )}
    </div>
  );
}
