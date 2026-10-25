export const QUICK_CITIES = [
  {
    name: "Colombo",
    latitude: 6.9319,
    longitude: 79.8478,
    admin1: "Western Province",
  },
  {
    name: "Kandy",
    latitude: 7.2906,
    longitude: 80.6337,
    admin1: "Central Province",
  },
  {
    name: "Galle",
    latitude: 6.0367,
    longitude: 80.217,
    admin1: "Southern Province",
  },
  {
    name: "Jaffna",
    latitude: 9.6685,
    longitude: 80.0074,
    admin1: "Northern Province",
  },
  {
    name: "Nuwara Eliya",
    latitude: 6.9708,
    longitude: 80.7829,
    admin1: "Central Province",
  },
];

export function weatherInfo(code, isDay = true) {
  if (code === 0)
    return {
      label: isDay ? "Clear skies" : "Clear night",
      icon: isDay ? "sun" : "moon",
    };
  if ([1, 2].includes(code))
    return { label: "Partly cloudy", icon: isDay ? "cloud-sun" : "cloud-moon" };
  if (code === 3) return { label: "Overcast", icon: "cloud" };
  if ([45, 48].includes(code)) return { label: "Foggy", icon: "fog" };
  if ([51, 53, 55, 56, 57].includes(code))
    return { label: "Drizzle", icon: "drizzle" };
  if ([61, 63, 65, 66, 67, 80, 81, 82].includes(code))
    return { label: "Rain showers", icon: "rain" };
  if ([71, 73, 75, 77, 85, 86].includes(code))
    return { label: "Snow", icon: "snow" };
  if ([95, 96, 99].includes(code))
    return { label: "Thunderstorms", icon: "storm" };
  return { label: "Conditions unavailable", icon: "cloud" };
}

async function fetchJson(url, signal) {
  const timeout = AbortSignal.timeout(15000);
  let response;
  try {
    response = await fetch(url, {
      signal: signal ? AbortSignal.any([signal, timeout]) : timeout,
    });
  } catch (error) {
    if (timeout.aborted)
      throw new Error(
        "The weather service took too long to respond. Please try again.",
      );
    throw error;
  }
  if (!response.ok)
    throw new Error(
      "The weather service is unavailable right now. Please try again.",
    );
  return response.json();
}

export async function searchCities(query, signal) {
  const params = new URLSearchParams({
    name: query.trim(),
    count: "10",
    language: "en",
    format: "json",
    countryCode: "LK",
  });
  const data = await fetchJson(
    `https://geocoding-api.open-meteo.com/v1/search?${params}`,
    signal,
  );
  return (data.results ?? []).filter((city) => city.country_code === "LK");
}

export async function fetchWeather(city, signal) {
  const params = new URLSearchParams({
    latitude: city.latitude,
    longitude: city.longitude,
    current:
      "temperature_2m,relative_humidity_2m,apparent_temperature,is_day,precipitation,weather_code,wind_speed_10m,wind_direction_10m",
    daily:
      "weather_code,temperature_2m_max,temperature_2m_min,sunrise,sunset,uv_index_max,precipitation_probability_max",
    timezone: "Asia/Colombo",
    forecast_days: "5",
    temperature_unit: "celsius",
    wind_speed_unit: "kmh",
    precipitation_unit: "mm",
  });
  const data = await fetchJson(
    `https://api.open-meteo.com/v1/forecast?${params}`,
    signal,
  );
  const dailyFields = [
    "time",
    "weather_code",
    "temperature_2m_max",
    "temperature_2m_min",
    "sunrise",
    "sunset",
    "uv_index_max",
    "precipitation_probability_max",
  ];
  if (
    !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}/.test(data.current?.time ?? "") ||
    !dailyFields.every(
      (field) =>
        Array.isArray(data.daily?.[field]) && data.daily[field].length === 5,
    ) ||
    !["time", "sunrise", "sunset"].every((field) =>
      data.daily[field].every(
        (value) =>
          typeof value === "string" && !Number.isNaN(Date.parse(value)),
      ),
    )
  ) {
    throw new Error(
      "The weather service returned incomplete data. Please try again.",
    );
  }
  return data;
}

// Open-Meteo returns local wall-clock times without an offset. Keep those times local.
export function localTime(value) {
  if (!value) return "--";
  const [hour, minute] = value.split("T")[1].split(":").map(Number);
  return `${hour % 12 || 12}:${String(minute).padStart(2, "0")} ${hour >= 12 ? "PM" : "AM"}`;
}

export function dayLabel(date, options = { weekday: "short" }) {
  return new Intl.DateTimeFormat("en-GB", {
    ...options,
    timeZone: "Asia/Colombo",
  }).format(new Date(`${date}T12:00:00+05:30`));
}

export function windDirection(degrees) {
  return ["N", "NE", "E", "SE", "S", "SW", "W", "NW"][
    Math.round(degrees / 45) % 8
  ];
}

export function rounded(value) {
  return Number.isFinite(value) ? Math.round(value) : "--";
}
