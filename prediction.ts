// GeoSentinel AI — deterministic "AI" future-prediction engine.
// Performs trend analysis, anomaly detection, and time-series style forecasting
// over the mock historical data to produce explainable risk predictions.

import { STATE_ENV_MAP, type StateEnv, type RiskLevel } from "./mockData";

export interface Prediction {
  state: string;
  metric: "Heat" | "Flood" | "AQI";
  horizonLabel: string; // "Tomorrow"
  riskPercent: number;
  confidence: number;
  level: RiskLevel;
  forecastSeries: number[]; // next 7 days
  baselineSeries: number[]; // past 7 days
  reasoning: string[];
  recommendation: string;
  anomalies: string[];
}

function slope(series: number[]): number {
  const n = series.length;
  const xs = series.map((_, i) => i);
  const xm = xs.reduce((a, b) => a + b, 0) / n;
  const ym = series.reduce((a, b) => a + b, 0) / n;
  let num = 0, den = 0;
  for (let i = 0; i < n; i++) { num += (xs[i] - xm) * (series[i] - ym); den += (xs[i] - xm) ** 2; }
  return den === 0 ? 0 : num / den;
}

function stdev(series: number[]): number {
  const m = series.reduce((a, b) => a + b, 0) / series.length;
  return Math.sqrt(series.reduce((a, b) => a + (b - m) ** 2, 0) / series.length);
}

function levelOf(v: number): RiskLevel {
  if (v >= 75) return "severe";
  if (v >= 55) return "high";
  if (v >= 35) return "moderate";
  return "low";
}

function forecastNext(series: number[], steps: number): number[] {
  const m = slope(series);
  const b = series[series.length - 1];
  const sd = stdev(series);
  const out: number[] = [];
  for (let i = 1; i <= steps; i++) {
    // weighted linear drift + small oscillation + seasonal pull toward mean
    const seasonal = Math.sin((i / steps) * Math.PI) * sd * 0.4;
    out.push(Math.round((b + m * i * 1.15 + seasonal) * 10) / 10);
  }
  return out;
}

export function predict(state: string, metric: Prediction["metric"]): Prediction {
  const e: StateEnv = STATE_ENV_MAP[state] ?? STATE_ENV_MAP["Delhi"];
  let baseline: number[];
  let currentRisk: number;
  let unit = "";
  let recommendation = "";
  let metricLabel = "";

  if (metric === "Heat") {
    baseline = e.last7;
    currentRisk = e.heatRisk;
    unit = "°C";
    metricLabel = "max temperature";
    recommendation =
      currentRisk >= 65
        ? "Activate ISRO heatwave protocol: urban cooling shelters, public SMS advisory, suspend outdoor labour 11:00–16:00."
        : "Maintain hydration advisories and monitor satellite LST anomalies daily.";
  } else if (metric === "Flood") {
    baseline = e.rainfallTrend;
    currentRisk = e.floodRisk;
    unit = "mm";
    metricLabel = "rainfall";
    recommendation =
      currentRisk >= 60
        ? "Pre-position NDRF teams, issue dam-release advisories, evacuate low-lying riverbanks."
        : "Continue rainfall radar monitoring; no evacuation required.";
  } else {
    baseline = e.last30.slice(-7);
    currentRisk = e.aqiRisk;
    unit = "AQI";
    metricLabel = "air quality index";
    recommendation =
      currentRisk >= 60
        ? "Issue health advisory, restrict open burning, deploy smog-tower/misting, advise N95 outdoors."
        : "Maintain routine air monitoring; no intervention required.";
  }

  const m = slope(baseline);
  const sd = stdev(baseline);
  const last = baseline[baseline.length - 1];
  const mean = baseline.reduce((a, b) => a + b, 0) / baseline.length;

  // anomaly: last value beyond 1.5 SD of mean
  const anomaly = Math.abs(last - mean) > sd * 1.5;

  // risk projection: blend current risk with trend momentum
  const momentum = m > 0 ? Math.min(20, m * 6) : Math.max(-18, m * 5);
  const humidityFactor = metric === "Heat" ? (e.humidity > 70 ? 8 : 0) : 0;
  const rainFactor = metric === "Flood" ? (e.rainfall > 20 ? 12 : 0) : 0;
  const aqiFactor = metric === "AQI" ? (e.aqi > 200 ? 10 : 0) : 0;
  const riskPercent = Math.min(98, Math.max(4, Math.round(
    currentRisk * 0.7 + momentum + humidityFactor + rainFactor + aqiFactor + (anomaly ? 6 : 0)
  )));

  const forecastSeries = forecastNext(baseline, 7);

  // confidence: higher when trend is stable (low stdev relative to mean)
  const cv = mean === 0 ? 1 : sd / Math.abs(mean);
  const confidence = Math.round(Math.min(96, Math.max(58, 92 - cv * 60 + (anomaly ? -8 : 4))));

  const reasoning: string[] = [
    `Last 7-day ${metricLabel} averaged ${Math.round(mean * 10) / 10}${unit} with a ${m > 0 ? "rising" : m < 0 ? "falling" : "flat"} trend (slope ${m.toFixed(2)}${unit}/day).`,
    `Latest reading ${last}${unit} is ${anomaly ? "anomalous — exceeding 1.5σ from the 7-day mean, indicating a destabilising thermal/pollution event." : "within normal variance of the 7-day baseline."}`,
    `Humidity ${e.humidity}%, wind ${e.wind} km/h, pressure ${e.pressure} hPa ${metric === "Heat" ? "compound the heat-stress index" : metric === "Flood" ? "influence convective rainfall potential" : "affect pollutant dispersion capacity"}.`,
    `Forecast model projects ${forecastSeries[0]}${unit} → ${forecastSeries[6]}${unit} over the next 7 days using linear drift + seasonal oscillation.`,
    `Composite risk score ${riskPercent}% (${levelOf(riskPercent).toUpperCase()}) with ${confidence}% model confidence.`,
  ];

  const anomalies: string[] = [];
  if (anomaly) anomalies.push(`${last}${unit} exceeds 7-day mean by ${(Math.abs(last - mean)).toFixed(1)}${unit} (>1.5σ).`);
  baseline.forEach((v, i) => { if (Math.abs(v - mean) > sd * 2) anomalies.push(`Day ${i + 1}: ${v}${unit} — 2σ outlier detected.`); });
  if (m > 0 && metric === "Heat") anomalies.push(`Sustained positive temperature drift (+${m.toFixed(2)}°C/day) detected.`);
  if (anomalies.length === 0) anomalies.push("No statistical anomalies in the analysed window.");

  return {
    state, metric, horizonLabel: "Tomorrow",
    riskPercent, confidence, level: levelOf(riskPercent),
    forecastSeries, baselineSeries: baseline,
    reasoning, recommendation, anomalies,
  };
}

// Natural-language copilot response builder
export function copilotAnswer(query: string): {
  text: string;
  prediction?: Prediction;
  state?: string;
  metric?: Prediction["metric"];
  cards: { label: string; value: string }[];
} {
  const q = query.toLowerCase();
  let state = "Delhi";
  let metric: Prediction["metric"] = "Heat";

  const stateNames = Object.keys(STATE_ENV_MAP);
  for (const s of stateNames) if (q.includes(s.toLowerCase())) state = s;
  if (!stateNames.some((s) => q.includes(s.toLowerCase()))) {
    if (q.includes("assam") || q.includes("flood")) state = "Assam";
    else if (q.includes("mumbai") || q.includes("maharashtra")) state = "Maharashtra";
    else if (q.includes("delhi")) state = "Delhi";
  }
  if (q.includes("flood") || q.includes("rain")) metric = "Flood";
  else if (q.includes("aqi") || q.includes("air") || q.includes("pollution") || q.includes("pm")) metric = "AQI";
  else if (q.includes("heat") || q.includes("temperature") || q.includes("hot")) metric = "Heat";

  const p = predict(state, metric);
  const e = STATE_ENV_MAP[state];

  const text =
    `${state} ${metric === "Heat" ? "faces a " + p.level + " heat-stress outlook for tomorrow." : metric === "Flood" ? "shows a " + p.level + " flood-probability outlook." : "indicates a " + p.level + " air-quality outlook."} ` +
    `Based on the last 7 days of ${metric === "Heat" ? "temperature" : metric === "Flood" ? "rainfall" : "AQI"}, humidity, and dispersion conditions, ` +
    `${state} has a ${p.riskPercent}% probability of ${metric === "Heat" ? "severe heat stress" : metric === "Flood" ? "flood inundation" : "hazardous air quality"} tomorrow, with ${p.confidence}% confidence. ` +
    `Current readings — temp ${e.temp}°C, humidity ${e.humidity}%, ${metric === "AQI" ? `AQI ${e.aqi}` : `rainfall ${e.rainfall}mm`}. ` +
    `Recommendation: ${p.recommendation}`;

  const cards = [
    { label: "Risk", value: `${p.riskPercent}%` },
    { label: "Confidence", value: `${p.confidence}%` },
    { label: "Level", value: p.level.toUpperCase() },
    { label: metric === "Heat" ? "Tomorrow Max" : metric === "Flood" ? "Tomorrow Rain" : "Tomorrow AQI", value: `${p.forecastSeries[0]}${metric === "Heat" ? "°C" : metric === "Flood" ? "mm" : ""}` },
  ];

  return { text, prediction: p, state, metric, cards };
}

export const COPILOT_SUGGESTIONS = [
  "Will Delhi face heatwave tomorrow?",
  "Show flood probability in Assam",
  "Analyze AQI trends in Mumbai",
  "Predict heat risk in Rajasthan next week",
  "Compare flood risk between Bihar and West Bengal",
  "Is Chennai air quality safe tomorrow?",
];
