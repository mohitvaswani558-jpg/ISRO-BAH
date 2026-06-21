// GeoSentinel AI — deterministic mock environmental intelligence dataset for India.
// All values are generated from a stable hash of the state name so the platform
// behaves like a live system without external API keys.

export type RiskLevel = "low" | "moderate" | "high" | "severe";

export interface StateEnv {
  name: string;
  code: string;
  temp: number; // °C
  feelsLike: number;
  humidity: number; // %
  aqi: number;
  pm25: number;
  pm10: number;
  rainfall: number; // mm (24h)
  wind: number; // km/h
  pressure: number; // hPa
  visibility: number; // km
  condition: string;
  heatRisk: number; // 0-100
  floodRisk: number; // 0-100
  aqiRisk: number; // 0-100
  overallRisk: number; // 0-100
  trend: number[]; // 7-day temp
  aqiTrend: number[]; // 24h
  rainfallTrend: number[]; // 7-day mm
  humidityTrend: number[]; // 24h
  last7: number[]; // 7-day max temp history
  last30: number[]; // 30-day aqi history
}

export interface CityLive {
  name: string;
  state: string;
  temp: number;
  condition: string;
  aqi: number;
  wind: number;
  updated: number;
}

export interface AlertItem {
  id: string;
  region: string;
  state: string;
  type: "Heatwave" | "Flood" | "Air Quality" | "Cyclone" | "Drought";
  severity: RiskLevel;
  risk: number;
  message: string;
  issued: string;
  action: string;
}

// stable hash -> 0..1
function hash(str: string, salt = 0): number {
  let h = 2166136261 ^ salt;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return ((h >>> 0) % 100000) / 100000;
}

const CONDITIONS = ["Clear", "Partly Cloudy", "Hazy", "Humid", "Cloudy", "Light Rain", "Dust", "Thunderstorm"];

function lerp(a: number, b: number, t: number) { return a + (b - a) * t; }

function buildTrend(base: number, vol: number, n: number, salt: number, name: string): number[] {
  const out: number[] = [];
  for (let i = 0; i < n; i++) {
    const t = hash(name, salt + i) - 0.5;
    out.push(Math.round((base + t * vol) * 10) / 10);
  }
  return out;
}

function riskLabel(v: number): RiskLevel {
  if (v >= 75) return "severe";
  if (v >= 55) return "high";
  if (v >= 35) return "moderate";
  return "low";
}

const STATE_SEEDS: Record<string, { temp: number; aqi: number; rain: number; hum: number }> = {
  // baseline climate hints by region for realism
  "Delhi": { temp: 38, aqi: 168, rain: 4, hum: 38 },
  "Rajasthan": { temp: 41, aqi: 92, rain: 2, hum: 22 },
  "Uttar Pradesh": { temp: 37, aqi: 145, rain: 6, hum: 50 },
  "Tamil Nadu": { temp: 34, aqi: 88, rain: 14, hum: 72 },
  "Kerala": { temp: 31, aqi: 60, rain: 26, hum: 84 },
  "Assam": { temp: 30, aqi: 78, rain: 42, hum: 88 },
  "West Bengal": { temp: 33, aqi: 120, rain: 18, hum: 76 },
  "Maharashtra": { temp: 33, aqi: 110, rain: 10, hum: 64 },
  "Karnataka": { temp: 32, aqi: 84, rain: 9, hum: 60 },
  "Gujarat": { temp: 39, aqi: 98, rain: 3, hum: 48 },
  "Punjab": { temp: 37, aqi: 132, rain: 3, hum: 40 },
  "Haryana": { temp: 38, aqi: 138, rain: 3, hum: 38 },
  "Bihar": { temp: 35, aqi: 150, rain: 8, hum: 70 },
  "Odisha": { temp: 34, aqi: 104, rain: 12, hum: 74 },
  "Madhya Pradesh": { temp: 36, aqi: 112, rain: 6, hum: 52 },
  "Jharkhand": { temp: 35, aqi: 130, rain: 7, hum: 58 },
  "Chhattisgarh": { temp: 35, aqi: 108, rain: 7, hum: 56 },
  "Andhra Pradesh": { temp: 34, aqi: 90, rain: 8, hum: 66 },
  "Telangana": { temp: 37, aqi: 96, rain: 5, hum: 54 },
  "Jammu and Kashmir": { temp: 22, aqi: 70, rain: 6, hum: 60 },
  "Himachal Pradesh": { temp: 24, aqi: 64, rain: 8, hum: 62 },
  "Uttarakhand": { temp: 26, aqi: 80, rain: 7, hum: 60 },
  "Ladakh": { temp: 18, aqi: 40, rain: 2, hum: 30 },
  "Sikkim": { temp: 20, aqi: 50, rain: 14, hum: 78 },
  "Arunachal Pradesh": { temp: 24, aqi: 52, rain: 22, hum: 82 },
  "Nagaland": { temp: 26, aqi: 58, rain: 16, hum: 80 },
  "Manipur": { temp: 28, aqi: 62, rain: 18, hum: 80 },
  "Mizoram": { temp: 28, aqi: 56, rain: 16, hum: 78 },
  "Tripura": { temp: 30, aqi: 70, rain: 22, hum: 84 },
  "Meghalaya": { temp: 26, aqi: 54, rain: 38, hum: 90 },
  "Goa": { temp: 31, aqi: 58, rain: 12, hum: 76 },
  "Chandigarh": { temp: 36, aqi: 128, rain: 3, hum: 42 },
  "Puducherry": { temp: 33, aqi: 70, rain: 14, hum: 74 },
  "Andaman and Nicobar Islands": { temp: 30, aqi: 48, rain: 30, hum: 84 },
  "Lakshadweep": { temp: 30, aqi: 46, rain: 28, hum: 82 },
  "Dadra and Nagar Haveli and Daman and Diu": { temp: 34, aqi: 78, rain: 6, hum: 64 },
};

function envFor(name: string, code: string): StateEnv {
  const seed = STATE_SEEDS[name] ?? { temp: 32, aqi: 90, rain: 8, hum: 60 };
  const t = hash(name, 1);
  const temp = Math.round((seed.temp + (t - 0.5) * 6) * 10) / 10;
  const humidity = Math.round(seed.hum + (hash(name, 2) - 0.5) * 18);
  const aqi = Math.round(seed.aqi + (hash(name, 3) - 0.5) * 60);
  const pm25 = Math.round(aqi * 0.46);
  const pm10 = Math.round(aqi * 0.74);
  const rainfall = Math.round((seed.rain + (hash(name, 4) - 0.5) * 12) * 10) / 10;
  const wind = Math.round((8 + hash(name, 5) * 22) * 10) / 10;
  const pressure = Math.round(1006 + (hash(name, 6) - 0.5) * 14);
  const visibility = Math.round((2 + hash(name, 7) * 13) * 10) / 10;
  const condition = CONDITIONS[Math.floor(hash(name, 8) * CONDITIONS.length)];

  const heatRisk = Math.min(100, Math.round(Math.max(0, (temp - 22) * 2.4) + (humidity > 70 ? 8 : 0)));
  const floodRisk = Math.min(100, Math.round(Math.max(0, (rainfall - 4) * 4.2) + (humidity > 80 ? 14 : 0)));
  const aqiRisk = Math.min(100, Math.round((aqi / 5)));
  const overallRisk = Math.round((heatRisk * 0.4 + floodRisk * 0.3 + aqiRisk * 0.3));

  return {
    name, code, temp,
    feelsLike: Math.round((temp + (humidity > 65 ? (temp * 0.12) : -(temp * 0.04))) * 10) / 10,
    humidity, aqi, pm25, pm10, rainfall, wind, pressure, visibility, condition,
    heatRisk, floodRisk, aqiRisk, overallRisk,
    trend: buildTrend(temp, 6, 7, 11, name),
    aqiTrend: buildTrend(aqi, 50, 24, 12, name),
    rainfallTrend: buildTrend(rainfall, 14, 7, 13, name),
    humidityTrend: buildTrend(humidity, 14, 24, 14, name),
    last7: buildTrend(temp + 1.5, 5, 7, 15, name),
    last30: buildTrend(aqi, 70, 30, 16, name),
  };
}

import { INDIA_STATES } from "./indiaStates";

export const STATE_ENV: StateEnv[] = INDIA_STATES.map((s) => envFor(s.name, s.code));
export const STATE_ENV_MAP: Record<string, StateEnv> = Object.fromEntries(STATE_ENV.map((e) => [e.name, e]));

export const CITIES: CityLive[] = [
  ["New Delhi", "Delhi"], ["Mumbai", "Maharashtra"], ["Chennai", "Tamil Nadu"],
  ["Kolkata", "West Bengal"], ["Bengaluru", "Karnataka"], ["Hyderabad", "Telangana"],
  ["Ahmedabad", "Gujarat"], ["Pune", "Maharashtra"], ["Jaipur", "Rajasthan"],
  ["Lucknow", "Uttar Pradesh"], ["Guwahati", "Assam"], ["Bhopal", "Madhya Pradesh"],
  ["Patna", "Bihar"], ["Surat", "Gujarat"], ["Kochi", "Kerala"], ["Chandigarh", "Chandigarh"],
].map(([name, state]) => {
  const e = STATE_ENV_MAP[state];
  return {
    name, state, temp: e.temp, condition: e.condition, aqi: e.aqi, wind: e.wind,
    updated: Date.now(),
  } as CityLive;
});

export const ALERTS: AlertItem[] = STATE_ENV
  .filter((e) => e.overallRisk >= 58)
  .sort((a, b) => b.overallRisk - a.overallRisk)
  .slice(0, 9)
  .map((e, i) => {
    const primary = e.heatRisk >= e.floodRisk && e.heatRisk >= e.aqiRisk
      ? "Heatwave" : e.floodRisk >= e.aqiRisk ? "Flood" : "Air Quality";
    return {
      id: "ALR-" + (1000 + i),
      region: e.name + " Region",
      state: e.name,
      type: primary as AlertItem["type"],
      severity: riskLabel(e.overallRisk),
      risk: e.overallRisk,
      message:
        primary === "Heatwave"
          ? `${e.name} under severe heat stress — surface temp ${e.temp}°C, feels ${e.feelsLike}°C.`
          : primary === "Flood"
          ? `${e.name} flood risk elevated — ${e.rainfall}mm rainfall, soil saturation high.`
          : `${e.name} air quality degraded — AQI ${e.aqi}, PM2.5 ${e.pm25} µg/m³.`,
      issued: new Date(Date.now() - i * 36e5).toISOString(),
      action:
        primary === "Heatwave"
          ? "Activate urban cooling shelters, issue public advisory, suspend outdoor work 11–16h."
          : primary === "Flood"
          ? "Pre-position rescue teams, monitor dam release, evacuate low-lying banks."
          : "Issue health advisory, restrict open burning, deploy misting towers.",
    };
  });

export const NATIONAL_STATS = {
  statesMonitored: STATE_ENV.length,
  avgTemp: Math.round(STATE_ENV.reduce((a, e) => a + e.temp, 0) / STATE_ENV.length * 10) / 10,
  avgAqi: Math.round(STATE_ENV.reduce((a, e) => a + e.aqi, 0) / STATE_ENV.length),
  avgRain: Math.round(STATE_ENV.reduce((a, e) => a + e.rainfall, 0) / STATE_ENV.length * 10) / 10,
  severeAlerts: ALERTS.filter((a) => a.severity === "severe").length,
  highAlerts: ALERTS.filter((a) => a.severity === "high").length,
  avgHeatRisk: Math.round(STATE_ENV.reduce((a, e) => a + e.heatRisk, 0) / STATE_ENV.length),
  avgFloodRisk: Math.round(STATE_ENV.reduce((a, e) => a + e.floodRisk, 0) / STATE_ENV.length),
  avgAqiRisk: Math.round(STATE_ENV.reduce((a, e) => a + e.aqiRisk, 0) / STATE_ENV.length),
  satellites: 7,
  sensors: 1840,
  uptime: 99.98,
};

export const RISK_COLOR: Record<RiskLevel, string> = {
  low: "#34d399",
  moderate: "#facc15",
  high: "#fb923c",
  severe: "#ef4444",
};

export const HEAT_COLOR = (v: number) => (v >= 75 ? "#ef4444" : v >= 55 ? "#fb923c" : v >= 35 ? "#facc15" : "#a3e635");
export const FLOOD_COLOR = (v: number) => (v >= 75 ? "#0284c7" : v >= 55 ? "#38bdf8" : v >= 35 ? "#7dd3fc" : "#bae6fd");
export const AQI_COLOR = (v: number) => (v >= 301 ? "#7c3aed" : v >= 201 ? "#c084fc" : v >= 151 ? "#f87171" : v >= 101 ? "#fbbf24" : v >= 51 ? "#facc15" : "#34d399");

export function aqiCategory(v: number): { label: string; color: string; advice: string } {
  if (v <= 50) return { label: "Good", color: "#34d399", advice: "Air quality is satisfactory; minimal hazard." };
  if (v <= 100) return { label: "Satisfactory", color: "#facc15", advice: "Acceptable for most; sensitive groups watch." };
  if (v <= 200) return { label: "Moderate", color: "#fbbf24", advice: "May cause breathing discomfort to sensitive people." };
  if (v <= 300) return { label: "Poor", color: "#f87171", advice: "Breathing discomfort to most on prolonged exposure." };
  if (v <= 400) return { label: "Very Poor", color: "#c084fc", advice: "Respiratory illness likely; avoid outdoor exertion." };
  return { label: "Severe", color: "#7c3aed", advice: "Serious health impact; stay indoors." };
}
