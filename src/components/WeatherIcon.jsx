import {
  Sun,
  Moon,
  CloudSun,
  CloudMoon,
  Cloud,
  CloudFog,
  CloudDrizzle,
  CloudRain,
  CloudSnow,
  CloudLightning,
} from "lucide-react";

const icons = {
  sun: Sun,
  moon: Moon,
  "cloud-sun": CloudSun,
  "cloud-moon": CloudMoon,
  cloud: Cloud,
  fog: CloudFog,
  drizzle: CloudDrizzle,
  rain: CloudRain,
  snow: CloudSnow,
  storm: CloudLightning,
};

export default function WeatherIcon({ type, className = "", size = 32 }) {
  const Icon = icons[type] || Cloud;
  return (
    <Icon
      size={size}
      strokeWidth={1.5}
      className={`weather-icon ${className}`}
      aria-hidden="true"
    />
  );
}
