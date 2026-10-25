# SWYNEX Task 04 - Sri Lanka Weather Explorer

A responsive, live-weather dashboard for Sri Lanka built with React and Vite. Explore the island's weather, from sunlit shores to misty hills.

## Run Locally

Use **Node.js 20.19+ or 22.12+** and npm. From this project directory:

```sh
npm install
npm run dev
```

Open the local URL printed by Vite (usually `http://localhost:5173`). No API key, environment variables, or backend is required. An internet connection is required for live weather and geocoding.

## Commands

```sh
npm run dev       # Start the development server
npm test          # Run API and formatting unit tests
npm run test:e2e  # Run Chromium browser checks (requires live API access)
npm run build    # Create the production bundle in dist/
npm run preview  # Preview that bundle locally
```

`npm run preview` is for local verification, not a production server. Nothing is deployed automatically.

Before running browser tests for the first time, run `npx playwright install chromium`. Browser checks cover live Colombo data, real city search, quick choices, mobile overflow, no-results feedback, API failure/retry, and preservation of a forecast after a failed refresh.

## Features

- Colombo on first load, with quick choices for Kandy, Galle, Jaffna, and Nuwara Eliya.
- Debounced Sri Lankan city search, province-labelled results, and an explicit no-results message.
- Real current temperature, feels-like temperature, WMO weather conditions, humidity, precipitation, and wind speed/direction.
- Five-day forecast including today, with daily highs/lows and peak rain probability.
- Sunrise, sunset, maximum UV index, and contextual sun-protection guidance.
- All dates and times stay in `Asia/Colombo` (SLST), regardless of the viewer's timezone.
- Loading skeletons, request cancellation, a 15-second request timeout, network/service errors, and retry controls.
- Manual refresh via the update-time button, refresh every ten minutes while visible, and refresh when returning to the tab.
- Previously loaded weather stays visible if a same-city refresh fails, with an explicit warning. Changing cities clears old results so they cannot appear under the wrong city.
- Responsive desktop/mobile layout, keyboard-accessible controls, screen-reader status announcements, visible focus states, and reduced-motion support.

## APIs and Data

### Open-Meteo Geocoding

`https://geocoding-api.open-meteo.com/v1/search`

Search sends `name`, `count=10`, `language=en`, `format=json`, and `countryCode=LK`. Returned results are also filtered by `country_code === "LK"`. Search starts after two characters and waits 350 ms after typing. Quick choices use fixed geographic coordinates only, never fixed weather results.

### Open-Meteo Forecast

`https://api.open-meteo.com/v1/forecast`

Requests use the selected coordinates, `timezone=Asia/Colombo`, `forecast_days=5`, Celsius, km/h, and mm.

| Group   | Requested fields                                                                                                                                    |
| ------- | --------------------------------------------------------------------------------------------------------------------------------------------------- |
| Current | `temperature_2m`, `relative_humidity_2m`, `apparent_temperature`, `is_day`, `precipitation`, `weather_code`, `wind_speed_10m`, `wind_direction_10m` |
| Daily   | `weather_code`, `temperature_2m_max`, `temperature_2m_min`, `sunrise`, `sunset`, `uv_index_max`, `precipitation_probability_max`                    |

Conditions and icons map Open-Meteo's WMO weather codes. "Updated" displays the API's current-data timestamp, not a fabricated observation time. Rain probability is the daily maximum, not a guarantee of rain. Current weather is model-based and is not a direct weather-station observation. No sample-weather fallback is included in the application.

Data attribution: [Open-Meteo](https://open-meteo.com/) and [GeoNames](https://www.geonames.org/) through Open-Meteo geocoding. See [API documentation](https://open-meteo.com/en/docs), [geocoding documentation](https://open-meteo.com/en/docs/geocoding-api), and [terms](https://open-meteo.com/en/terms) for attribution, usage limits, and commercial licensing. The public free endpoint is intended for non-commercial use; evaluate licensing before a commercial release.

## Project Structure

```text
src/
  App.jsx                         App state, loading/error handling, refresh
  main.jsx                        React entry point
  styles.css                      Responsive visual system
  components/
    CitySearch.jsx                Search and quick-city controls
    WeatherDashboard.jsx          Current weather, metrics, forecast
    WeatherIcon.jsx               Shared weather-code icon rendering
  lib/
    weather.js                    API clients, city coordinates, formatters
    weather.test.js               Node test-runner unit tests
public/
  favicon.svg                     Local app icon
```

React 19, Vite 6, and Lucide React provide the UI tooling. Google Fonts supplies DM Sans and Manrope, with local sans-serif fallbacks if unavailable. The island illustration is an original inline SVG; no remote imagery is needed. Tests use mocked API responses only for isolated verification; the running app always requests live data.
