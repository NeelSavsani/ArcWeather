import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/ui-glass";
import { HourlyStrip, DailyList, WeatherError, WeatherLoading, useCurrentWeather } from "@/components/weather-parts";

export const Route = createFileRoute("/forecast")({
  head: () => ({
    meta: [
      { title: "Forecast — ArcWeather" },
      { name: "description", content: "Detailed hourly and 7-day forecast for your selected city." },
    ],
  }),
  component: ForecastPage,
});

function ForecastPage() {
  const q = useCurrentWeather();
  return (
    <div className="space-y-8">
      <PageHeader eyebrow="Forecast" title="Hourly & weekly outlook"
        description="Every three hours for the next day, plus a seven-day extended forecast." />
      {q.isLoading && <WeatherLoading />}
      {q.isError && <WeatherError error={q.error} refetch={q.refetch} />}
      {q.data && (
        <>
          <HourlyStrip data={q.data} />
          <DailyList data={q.data} />
        </>
      )}
    </div>
  );
}
