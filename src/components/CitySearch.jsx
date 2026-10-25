import { useEffect, useRef, useState } from "react";
import { ArrowUpRight, LoaderCircle, MapPin, Search, X } from "lucide-react";
import { QUICK_CITIES, searchCities } from "../lib/weather";

export default function CitySearch({ city, onSelect }) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState(null);
  const [status, setStatus] = useState("idle");
  const [error, setError] = useState("");
  const [attempt, setAttempt] = useState(0);
  const [open, setOpen] = useState(false);
  const container = useRef(null);
  const input = useRef(null);

  useEffect(() => {
    const close = (event) => {
      if (!container.current?.contains(event.target)) setOpen(false);
    };
    document.addEventListener("pointerdown", close);
    return () => document.removeEventListener("pointerdown", close);
  }, []);

  useEffect(() => {
    if (query.trim().length < 2) {
      setResults(null);
      setStatus("idle");
      return;
    }
    const controller = new AbortController();
    setStatus("loading");
    const timer = setTimeout(async () => {
      try {
        const cities = await searchCities(query, controller.signal);
        if (!controller.signal.aborted) {
          setResults(cities);
          setStatus("success");
        }
      } catch (err) {
        if (!controller.signal.aborted) {
          setError(err.message);
          setStatus("error");
        }
      }
    }, 350);
    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [query, attempt]);

  function select(nextCity) {
    onSelect(nextCity);
    setQuery("");
    setOpen(false);
    input.current?.focus();
  }

  return (
    <section className="search-section" aria-label="Find a city">
      <div
        className="search-wrapper"
        ref={container}
        onKeyDown={(event) => {
          if (event.key === "Escape") setOpen(false);
        }}
      >
        <form
          className={`search-box ${open ? "is-open" : ""}`}
          role="search"
          onSubmit={(event) => {
            event.preventDefault();
            setOpen(true);
          }}
        >
          <Search size={21} aria-hidden="true" />
          <input
            ref={input}
            aria-label="Search for a Sri Lankan city"
            placeholder="Search a city in Sri Lanka..."
            value={query}
            onChange={(event) => {
              setQuery(event.target.value);
              setOpen(true);
            }}
            onFocus={() => setOpen(true)}
            autoComplete="off"
          />
          {query ? (
            <button
              type="button"
              className="icon-button"
              aria-label="Clear search"
              onClick={() => {
                setQuery("");
                setOpen(false);
              }}
            >
              <X size={18} />
            </button>
          ) : (
            <span className="search-country">LK</span>
          )}
          <button className="search-submit" type="submit">
            Explore <ArrowUpRight size={17} />
          </button>
        </form>
        {open && query.trim().length >= 2 && (
          <div id="city-results" className="search-results">
            <div role="status" aria-live="polite">
              {status === "loading" && (
                <p className="search-message">
                  <LoaderCircle className="spin" size={17} /> Finding places on
                  the island...
                </p>
              )}
              {status === "success" && results?.length === 0 && (
                <p className="search-message">
                  No Sri Lankan cities found for "{query.trim()}". Try another
                  city name.
                </p>
              )}
              {status === "error" && (
                <div className="search-message">
                  {error}
                  <button
                    type="button"
                    className="text-button"
                    onClick={() => setAttempt((value) => value + 1)}
                  >
                    Retry search
                  </button>
                </div>
              )}
            </div>
            {status === "success" &&
              results?.map((result) => (
                <button
                  className="search-result"
                  key={result.id}
                  onClick={() => select(result)}
                >
                  <MapPin size={18} />
                  <span>
                    <strong>{result.name}</strong>
                    <small>{result.admin1 || "Sri Lanka"}, Sri Lanka</small>
                  </span>
                  <ArrowUpRight size={17} />
                </button>
              ))}
          </div>
        )}
      </div>
      <div className="quick-cities">
        <span>Or explore</span>
        {QUICK_CITIES.map((item) => (
          <button
            key={item.name}
            className={
              city.name === item.name ? "city-chip active" : "city-chip"
            }
            onClick={() => select(item)}
            aria-pressed={city.name === item.name}
          >
            {item.name}
          </button>
        ))}
      </div>
    </section>
  );
}
