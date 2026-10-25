import test from "node:test";
import assert from "node:assert/strict";
import {
  dayLabel,
  fetchWeather,
  localTime,
  QUICK_CITIES,
  rounded,
  searchCities,
  weatherInfo,
  windDirection,
} from "./weather.js";

test("weather codes include day, night, rain, storms and unknown conditions", () => {
  assert.equal(weatherInfo(0).icon, "sun");
  assert.equal(weatherInfo(0, false).icon, "moon");
  assert.equal(weatherInfo(2, false).icon, "cloud-moon");
  assert.equal(weatherInfo(45).icon, "fog");
  assert.equal(weatherInfo(53).icon, "drizzle");
  assert.equal(weatherInfo(80).icon, "rain");
  assert.equal(weatherInfo(95).icon, "storm");
  assert.equal(weatherInfo(null).label, "Conditions unavailable");
});

test("Sri Lankan API wall-clock times are not converted to the viewer timezone", () => {
  assert.equal(localTime("2026-10-25T06:03"), "6:03 AM");
  assert.equal(localTime("2026-10-25T18:05"), "6:05 PM");
  assert.equal(localTime("2026-10-25T00:00"), "12:00 AM");
  assert.equal(localTime("2026-10-25T12:00"), "12:00 PM");
  assert.equal(dayLabel("2026-10-25"), "Sun");
});

test("wind bearings wrap north correctly and missing values are not fake zeroes", () => {
  assert.equal(windDirection(360), "N");
  assert.equal(windDirection(234), "SW");
  assert.equal(rounded(null), "--");
  assert.equal(rounded(26.6), 27);
});

test("city search uses country filter and rejects any non-Sri Lankan results", async (t) => {
  t.mock.method(globalThis, "fetch", async (url) => {
    const params = new URL(url).searchParams;
    assert.equal(params.get("countryCode"), "LK");
    assert.equal(params.get("name"), "Kandy");
    return {
      ok: true,
      json: async () => ({
        results: [
          { name: "Kandy", country_code: "LK" },
          { name: "Other", country_code: "US" },
        ],
      }),
    };
  });
  assert.deepEqual(await searchCities(" Kandy "), [
    { name: "Kandy", country_code: "LK" },
  ]);
});

test("a city that cannot be found returns an empty list", async (t) => {
  t.mock.method(globalThis, "fetch", async () => ({
    ok: true,
    json: async () => ({}),
  }));
  assert.deepEqual(await searchCities("not-a-city"), []);
});

test("non-200 API responses produce a recoverable error", async (t) => {
  t.mock.method(globalThis, "fetch", async () => ({ ok: false }));
  await assert.rejects(fetchWeather(QUICK_CITIES[0]), /unavailable/);
});

test("malformed or incomplete weather data produces an error instead of a render crash", async (t) => {
  t.mock.method(globalThis, "fetch", async () => ({
    ok: true,
    json: async () => ({
      current: {},
      daily: { time: Array(5).fill("2026-10-25") },
    }),
  }));
  await assert.rejects(fetchWeather(QUICK_CITIES[0]), /incomplete data/);
});

test("weather requests use Colombo timezone, Celsius, and five real forecast days", async (t) => {
  const data = {
    current: { time: "2026-10-25T12:00", temperature_2m: 28 },
    daily: Object.fromEntries(
      [
        "time",
        "weather_code",
        "temperature_2m_max",
        "temperature_2m_min",
        "sunrise",
        "sunset",
        "uv_index_max",
        "precipitation_probability_max",
      ].map((field) => [
        field,
        Array(5).fill(
          ["time", "sunrise", "sunset"].includes(field)
            ? "2026-10-25T06:00"
            : 1,
        ),
      ]),
    ),
  };
  t.mock.method(globalThis, "fetch", async (url) => {
    const params = new URL(url).searchParams;
    assert.equal(params.get("forecast_days"), "5");
    assert.equal(params.get("timezone"), "Asia/Colombo");
    assert.equal(params.get("temperature_unit"), "celsius");
    assert.equal(params.get("latitude"), String(QUICK_CITIES[0].latitude));
    return { ok: true, json: async () => data };
  });
  assert.deepEqual(await fetchWeather(QUICK_CITIES[0]), data);
});
