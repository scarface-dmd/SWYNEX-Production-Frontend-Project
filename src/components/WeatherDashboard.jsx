import {
  ArrowUpRight,
  Compass,
  Droplets,
  MapPin,
  Sunrise,
  Sunset,
  Umbrella,
  Wind,
} from "lucide-react";
import {
  dayLabel,
  localTime,
  rounded,
  weatherInfo,
  windDirection,
} from "../lib/weather";
import WeatherIcon from "./WeatherIcon";

function MetricCard({ icon: Icon, label, value, unit, description, children }) {
  return (
    <article className="metric-card">
      <div className="metric-heading">
        <Icon size={19} />
        <h3>{label}</h3>
      </div>
      <p className="metric-value">
        {value}
        <span>{unit}</span>
      </p>
      <p className="metric-description">{description}</p>
      {children}
    </article>
  );
}

function Forecast({ daily }) {
  return (
    <section className="forecast-section" aria-labelledby="forecast-heading">
      <div className="section-heading">
        <div>
          <span className="eyebrow">A LITTLE LOOK AHEAD</span>
          <h2 id="forecast-heading">Your next five days</h2>
        </div>
        <span className="forecast-note">Highs & lows in °C</span>
      </div>
      <div className="forecast-grid">
        {daily.time.map((date, index) => {
          const info = weatherInfo(daily.weather_code[index]);
          return (
            <article
              className={`forecast-card ${index === 0 ? "today" : ""}`}
              key={date}
            >
              <div className="forecast-day">
                <h3>{index === 0 ? "Today" : dayLabel(date)}</h3>
                <span>
                  {dayLabel(date, { day: "numeric", month: "short" })}
                </span>
              </div>
              <WeatherIcon type={info.icon} size={45} />
              <p className="forecast-condition">{info.label}</p>
              <div className="forecast-temperatures">
                <strong>{rounded(daily.temperature_2m_max[index])}°</strong>
                <span>{rounded(daily.temperature_2m_min[index])}°</span>
              </div>
              <div className="rain-chance">
                <Droplets size={14} />
                <span>
                  {rounded(daily.precipitation_probability_max[index])}% rain
                </span>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}

function IslandIllustration() {
  return (
    <svg
      className="island-illustration"
      viewBox="0 0 250 290"
      fill="none"
      aria-hidden="true"
    >
      <ellipse
        cx="127"
        cy="149"
        rx="98"
        ry="112"
        stroke="currentColor"
        strokeDasharray="3 7"
        opacity=".2"
      />
      <ellipse
        cx="127"
        cy="149"
        rx="75"
        ry="88"
        stroke="currentColor"
        opacity=".15"
      />
      <path
        d="M119 36c-8 9-6 25-13 35-8 13-16 24-18 38-3 16-11 27-15 42-7 21-14 42-9 62 4 23 21 41 43 44 24 4 48-7 61-26 12-18 17-39 12-60-4-20-17-38-25-54-10-18-17-35-22-54-3-11-5-21-14-27Z"
        fill="currentColor"
        fillOpacity=".1"
        stroke="currentColor"
        strokeOpacity=".5"
        strokeWidth="1.5"
      />
      <path
        d="m89 148 28-34 30 45-37 36-21-47Zm28-34 2-78m-9 159-3 62m37-98 36 12m-91-23-16 3"
        stroke="currentColor"
        strokeOpacity=".2"
        strokeDasharray="3 4"
      />
      <circle cx="77" cy="202" r="15" fill="currentColor" fillOpacity=".12" />
      <circle cx="77" cy="202" r="5" fill="#eac675" />
      <circle cx="118" cy="153" r="3" fill="currentColor" opacity=".7" />
      <circle cx="121" cy="70" r="3" fill="currentColor" opacity=".7" />
      <circle cx="113" cy="237" r="3" fill="currentColor" opacity=".7" />
      <path
        d="M185 51v16m-8-8h16M40 111v10m-5-5h10"
        stroke="currentColor"
        opacity=".5"
      />
    </svg>
  );
}

export default function WeatherDashboard({
  city,
  data,
  refreshing,
  onRefresh,
}) {
  const { current, daily } = data;
  const info = weatherInfo(current.weather_code, current.is_day === 1);
  const uv = daily.uv_index_max[0];
  const uvLabel =
    uv == null
      ? "Unavailable"
      : uv < 3
        ? "Low"
        : uv < 6
          ? "Moderate"
          : uv < 8
            ? "High"
            : uv < 11
              ? "Very high"
              : "Extreme";

  return (
    <div className="dashboard">
      <div className="location-heading">
        <div>
          <div className="location-title">
            <MapPin size={22} />
            <h2>
              {city.name}
              <span>, Sri Lanka</span>
            </h2>
          </div>
          <p>
            {city.admin1 || "Sri Lanka"}
            <span className="dot-separator">·</span>
            {dayLabel(current.time.split("T")[0], {
              weekday: "long",
              day: "numeric",
              month: "long",
              year: "numeric",
            })}
          </p>
        </div>
        <button
          className="update-button"
          onClick={onRefresh}
          disabled={refreshing}
          title="Refresh weather"
        >
          <span className={`live-dot ${refreshing ? "pulsing" : ""}`} />
          {refreshing ? "Updating..." : `Updated ${localTime(current.time)}`}
          <span className="timezone">SLST</span>
          <ArrowUpRight size={14} />
        </button>
      </div>
      <div className="overview-grid">
        <section className="current-card" aria-labelledby="current-heading">
          <div className="current-card-top">
            <span className="eyebrow" id="current-heading">
              RIGHT NOW
            </span>
            <span className="current-tag">
              {current.is_day ? "Daytime" : "Nighttime"}
            </span>
          </div>
          <div className="current-main">
            <div>
              <div className="current-temperature">
                {rounded(current.temperature_2m)}
                <span>°C</span>
              </div>
              <h3>{info.label}</h3>
              <p>
                Feels like {rounded(current.apparent_temperature)}°
                <span> · </span>H: {rounded(daily.temperature_2m_max[0])}°
                &nbsp; L: {rounded(daily.temperature_2m_min[0])}°
              </p>
            </div>
            <WeatherIcon
              type={info.icon}
              className="hero-weather-icon"
              size={116}
            />
          </div>
          <div className="current-bottom">
            <span>
              <Wind size={17} />
              {rounded(current.wind_speed_10m)} km/h{" "}
              {windDirection(current.wind_direction_10m)}
            </span>
            <span>
              <Droplets size={17} />
              {rounded(current.relative_humidity_2m)}% humidity
            </span>
          </div>
        </section>
        <aside className="island-card">
          <div className="island-copy">
            <span className="eyebrow">7° N, 81° E</span>
            <h2>
              Small island.
              <br />
              Big atmosphere.
            </h2>
            <p>
              From sunlit shores to misty hills.
              <br />
              Find your kind of weather.
            </p>
            <span className="island-caption">
              <span className="live-dot" /> THE PEARL OF THE INDIAN OCEAN
            </span>
          </div>
          <IslandIllustration />
        </aside>
      </div>
      <section
        className="highlights-section"
        aria-labelledby="highlights-heading"
      >
        <div className="section-heading compact">
          <h2 id="highlights-heading">Today's highlights</h2>
          <span className="section-subtitle">
            The details that make your day.
          </span>
        </div>
        <div className="metrics-grid">
          <MetricCard
            icon={Droplets}
            label="Humidity"
            value={rounded(current.relative_humidity_2m)}
            unit="%"
            description="Current relative humidity"
          >
            <div className="humidity-track">
              <span
                style={{ width: `${current.relative_humidity_2m ?? 0}%` }}
              />
            </div>
          </MetricCard>
          <MetricCard
            icon={Wind}
            label="Wind speed"
            value={rounded(current.wind_speed_10m)}
            unit="km/h"
            description={`Blowing from the ${windDirection(current.wind_direction_10m)}`}
          >
            <Compass className="metric-decoration" size={42} strokeWidth={1} />
          </MetricCard>
          <MetricCard
            icon={Umbrella}
            label="Chance of rain"
            value={rounded(daily.precipitation_probability_max[0])}
            unit="%"
            description="Today's peak probability"
          >
            <span className="metric-footnote">
              Precipitation now: {current.precipitation ?? "--"} mm
            </span>
          </MetricCard>
          <MetricCard
            icon={Sunrise}
            label="Sun & daylight"
            value={localTime(daily.sunrise[0]).split(" ")[0]}
            unit={localTime(daily.sunrise[0]).split(" ")[1]}
            description="Sunrise in Sri Lanka"
          >
            <span className="sunset-time">
              <Sunset size={16} />
              Sunset {localTime(daily.sunset[0])}
            </span>
          </MetricCard>
        </div>
      </section>
      <Forecast daily={daily} />
      <section className="day-note">
        <div className="note-icon">
          <WeatherIcon type="sun" size={25} />
        </div>
        <div>
          <h3>A little heads-up for your day</h3>
          <p>
            {uv == null
              ? "UV data is unavailable. Check local guidance before spending time outdoors."
              : `Today's maximum UV index is ${uv.toFixed(1)} (${uvLabel.toLowerCase()}). ${uv >= 3 ? "Keep sunscreen handy and seek shade around midday." : "Enjoy the outdoors, and stay hydrated along the way."}`}
          </p>
        </div>
        <span className="uv-badge">UV {uvLabel}</span>
      </section>
    </div>
  );
}
