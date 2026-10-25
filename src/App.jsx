import { useEffect, useRef, useState } from "react";
import {
  ArrowUpRight,
  CloudSun,
  Globe2,
  MapPin,
  RefreshCw,
  TriangleAlert,
} from "lucide-react";
import CitySearch from "./components/CitySearch";
import WeatherDashboard from "./components/WeatherDashboard";
import { fetchWeather, QUICK_CITIES } from "./lib/weather";

export default function App() {
  const [city, setCity] = useState(QUICK_CITIES[0]);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [attempt, setAttempt] = useState(0);
  const loadedCity = useRef(null);

  useEffect(() => {
    const refresh = () => {
      if (!document.hidden) setAttempt((value) => value + 1);
    };
    const timer = setInterval(refresh, 10 * 60 * 1000);
    document.addEventListener("visibilitychange", refresh);
    return () => {
      clearInterval(timer);
      document.removeEventListener("visibilitychange", refresh);
    };
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    setError("");
    if (loadedCity.current !== city) setData(null);
    fetchWeather(city, controller.signal)
      .then((result) => {
        if (!controller.signal.aborted) {
          setData(result);
          loadedCity.current = city;
        }
      })
      .catch((err) => {
        if (!controller.signal.aborted)
          setError(
            err instanceof TypeError
              ? "We could not connect to the weather service. Check your connection and try again."
              : err.message,
          );
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });
    return () => controller.abort();
  }, [city, attempt]);

  return (
    <>
      <header className="site-header">
        <div className="header-inner">
          <a className="brand" href="./" aria-label="SWYNEX Weather home">
            <span className="brand-symbol">
              <CloudSun size={25} strokeWidth={1.6} />
            </span>
            <span>
              SWYNEX<span className="brand-weather">WEATHER EXPLORER</span>
            </span>
          </a>
          <div className="header-right">
            <span className="country-badge">
              <span className="flag-mark" aria-hidden="true" />
              <span>Sri Lanka</span>
              <span className="country-dot" />
            </span>
            <span className="header-divider" />
            <span className="header-tagline">
              An island. A world of weather.
            </span>
          </div>
        </div>
      </header>
      <main className="page-shell">
        <section className="intro">
          <div className="intro-kicker">
            <span />
            YOUR DAILY DOSE OF ISLAND WEATHER
          </div>
          <h1>
            A little closer to
            <br className="mobile-break" /> <span>the island.</span>
          </h1>
          <p>Wherever the day takes you, know the weather ahead.</p>
          <div className="intro-coordinate" aria-hidden="true">
            <Globe2 size={36} strokeWidth={1} />
            <span>
              SRI LANKA
              <br />
              6.9271° N · 79.8612° E
            </span>
          </div>
        </section>
        <CitySearch city={city} onSelect={setCity} />
        <p className="sr-only" role="status">
          {loading
            ? `Loading weather for ${city.name}.`
            : error
              ? `Weather update failed for ${city.name}.`
              : `Weather loaded for ${city.name}.`}
        </p>
        <div className="weather-region" aria-busy={loading}>
          {error && (
            <section className="error-panel" role="alert">
              <TriangleAlert size={25} />
              <div>
                <h2>
                  {data
                    ? "Could not refresh the forecast"
                    : "A little turbulence in the forecast"}
                </h2>
                <p>{error}</p>
                {data && (
                  <small>The last loaded forecast is shown below.</small>
                )}
              </div>
              <button
                className="retry-button"
                onClick={() => setAttempt((value) => value + 1)}
                disabled={loading}
              >
                <RefreshCw size={16} />
                Try again
              </button>
            </section>
          )}
          {loading && !data && (
            <section className="loading-panel" role="status">
              <div className="loading-heading">
                <MapPin size={19} />
                <span>Checking the skies over {city.name}...</span>
              </div>
              <div className="skeleton-overview">
                <div className="skeleton tall" />
                <div className="skeleton tall" />
              </div>
              <div className="skeleton-metrics">
                {[0, 1, 2, 3].map((item) => (
                  <div className="skeleton short" key={item} />
                ))}
              </div>
            </section>
          )}
          {data && (
            <WeatherDashboard
              city={city}
              data={data}
              refreshing={loading}
              onRefresh={() => setAttempt((value) => value + 1)}
            />
          )}
        </div>
        <div className="bottom-caption">
          <MapPin size={14} />
          <span>One island. Endless places to explore.</span>
          <span className="caption-line" />
        </div>
      </main>
      <footer className="site-footer">
        <div className="footer-inner">
          <p>
            <strong>SWYNEX</strong>
            <span>Made for the island, inspired by the skies.</span>
          </p>
          <a href="https://open-meteo.com/" target="_blank" rel="noreferrer">
            Weather & geocoding by Open-Meteo <ArrowUpRight size={14} />
          </a>
          <span className="footer-task">TASK 04 / WEATHER EXPLORER</span>
        </div>
      </footer>
    </>
  );
}
