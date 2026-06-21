// GeoSentinel AI — real environmental hotspot locations across India.
// Coordinates are real lat/lng of known heatwave, flood, pollution & crop regions.

export type HotspotType = "heat" | "flood" | "aqi" | "crop";

export interface Hotspot {
  name: string;
  state: string;
  lat: number;
  lng: number;
  severity: number; // 0-100
  intensity: string; // short label
  detail: string;
  radius: number; // meters for circle zone
}

export const HOTSPOT_META: Record<HotspotType, { label: string; color: string; icon: string; glow: string }> = {
  heat: { label: "Heat Hotspot", color: "#ef4444", icon: "🔥", glow: "rgba(239,68,68,0.6)" },
  flood: { label: "Flood Risk", color: "#0284c7", icon: "🌊", glow: "rgba(2,132,199,0.6)" },
  aqi: { label: "AQI Pollution", color: "#c084fc", icon: "💨", glow: "rgba(192,132,252,0.6)" },
  crop: { label: "Crop Stress", color: "#f59e0b", icon: "🌾", glow: "rgba(245,158,11,0.6)" },
};

// Real heatwave hotspots — cities that record extreme temperatures
export const HEAT_HOTSPOTS: Hotspot[] = [
  { name: "Phalodi", state: "Rajasthan", lat: 27.13, lng: 72.37, severity: 96, intensity: "51°C record", detail: "India's highest ever recorded temperature (51°C, 2016). Extreme heat-island zone.", radius: 45000 },
  { name: "Jaisalmer", state: "Rajasthan", lat: 26.91, lng: 70.92, severity: 91, intensity: "48°C+", detail: "Thar Desert thermal extreme — sustained 45°C+ for 40+ days each summer.", radius: 60000 },
  { name: "Delhi NCR", state: "Delhi", lat: 28.61, lng: 77.21, severity: 88, intensity: "47°C LST", detail: "Urban heat-island amplification; surface temps hit 47°C+ across concrete sprawl.", radius: 55000 },
  { name: "Gwalior", state: "Madhya Pradesh", lat: 26.22, lng: 78.18, severity: 82, intensity: "46°C", detail: "Central India heat dome — frequent severe heatwave warnings May–June.", radius: 40000 },
  { name: "Nagpur", state: "Maharashtra", lat: 21.15, lng: 79.09, severity: 80, intensity: "46°C", detail: "Vidarbha heat corridor — chronic farmer heat-stress fatalities.", radius: 42000 },
  { name: "Banda", state: "Uttar Pradesh", lat: 25.48, lng: 80.33, severity: 78, intensity: "45°C", detail: "Bundelkhand dry-belt heatwave epicentre.", radius: 35000 },
  { name: "Titlagarh", state: "Odisha", lat: 20.30, lng: 83.15, severity: 76, intensity: "45°C", detail: "Odisha's hottest town — repeated heatwave casualty zone.", radius: 30000 },
  { name: "Kota", state: "Rajasthan", lat: 25.21, lng: 75.86, severity: 84, intensity: "47°C", detail: "Hadoti plateau heat-trap; LST anomalies detected via satellite.", radius: 38000 },
  { name: "Rentachintala", state: "Andhra Pradesh", lat: 16.39, lng: 79.65, severity: 74, intensity: "44°C", detail: "South India's persistent heat pocket in Palnadu district.", radius: 28000 },
  { name: "Akola", state: "Maharashtra", lat: 20.70, lng: 77.00, severity: 72, intensity: "44°C", detail: "Amravati division heat belt — agrarian heat-stress zone.", radius: 30000 },
];

// Real flood-prone hotspots — river basins & coastal regions with history of inundation
export const FLOOD_HOTSPOTS: Hotspot[] = [
  { name: "Brahmaputra Valley", state: "Assam", lat: 26.14, lng: 91.74, severity: 92, intensity: "Annual severe", detail: "Brahmaputra breaches banks every monsoon; Kaziranga–Majuli inundation zone.", radius: 90000 },
  { name: "Kosi Basin", state: "Bihar", lat: 25.99, lng: 86.94, severity: 88, intensity: "High recurrence", detail: "'Sorrow of Bihar' — frequent avulsion & embankment breaches displacing millions.", radius: 75000 },
  { name: "Sundarbans Delta", state: "West Bengal", lat: 22.17, lng: 88.91, severity: 84, intensity: "Tidal + surge", detail: "Low-lying Ganges delta; cyclone surge + riverine flooding compound risk.", radius: 70000 },
  { name: "Ghaghara Plains", state: "Uttar Pradesh", lat: 26.80, lng: 82.20, severity: 78, intensity: "Monsoon", detail: "Ghaghara–Rapti confluence floodplain; recurring embankment overtopping.", radius: 55000 },
  { name: "Mahanadi Delta", state: "Odisha", lat: 20.46, lng: 85.88, severity: 80, intensity: "Cyclone-prone", detail: "Cuttack–Puri delta; cyclone-driven flooding + Hirakud dam releases.", radius: 60000 },
  { name: "Periyar Basin", state: "Kerala", lat: 10.10, lng: 76.36, severity: 76, intensity: "2018-type event", detail: "Idukki–Ernakulam; 2018 floods benchmark — extreme rainfall + dam release.", radius: 45000 },
  { name: "Godavari Delta", state: "Andhra Pradesh", lat: 17.00, lng: 81.78, severity: 72, intensity: "Monsoon surge", detail: "Rajahmundry delta; Godavari spillover inundates East & West Godavari.", radius: 55000 },
  { name: "Tapi Floodplain", state: "Gujarat", lat: 21.17, lng: 72.83, severity: 70, intensity: "Surat-type", detail: "Surat Tapi-bank zone; Ukai dam emergency releases cause urban flooding.", radius: 40000 },
  { name: "Alaknanda Valley", state: "Uttarakhand", lat: 30.73, lng: 79.07, severity: 82, intensity: "Flash flood", detail: "Kedarnath 2013 cloud-burst zone; Himalayan flash-flood & GLOF risk.", radius: 35000 },
  { name: "Damodar Basin", state: "West Bengal", lat: 23.52, lng: 87.31, severity: 68, intensity: "Dam release", detail: "'Sorrow of Bengal'; DVC dam releases flood Bardhaman–Howrah.", radius: 45000 },
];

// Real AQI pollution hotspots — most polluted cities/industrial belts
export const AQI_HOTSPOTS: Hotspot[] = [
  { name: "Delhi NCR", state: "Delhi", lat: 28.61, lng: 77.21, severity: 95, intensity: "AQI 380+", detail: "World's most polluted capital; winter PM2.5 exceeds 300 µg/m³ regularly.", radius: 60000 },
  { name: "Ghaziabad–Noida", state: "Uttar Pradesh", lat: 28.66, lng: 77.44, severity: 93, intensity: "AQI 360+", detail: "NCR industrial belt; stubble-burning + vehicular + dust convergence.", radius: 45000 },
  { name: "Kanpur", state: "Uttar Pradesh", lat: 26.45, lng: 80.33, severity: 88, intensity: "AQI 320", detail: "Leather-tannery cluster; chronic PM2.5 & hexavalent chromium emissions.", radius: 35000 },
  { name: "Muzaffarnagar", state: "Uttar Pradesh", lat: 29.47, lng: 77.70, severity: 85, intensity: "AQI 300", detail: "Sugar-mill & paper-pulp belt; severe winter inversion smog.", radius: 30000 },
  { name: "Faridabad", state: "Haryana", lat: 28.41, lng: 77.32, severity: 86, intensity: "AQI 310", detail: "Industrial cluster; NCR pollution dome contributor.", radius: 30000 },
  { name: "Patna", state: "Bihar", lat: 25.61, lng: 85.14, severity: 82, intensity: "AQI 280", detail: "Gangetic plain dust + biomass burning; winter AQI hazardous.", radius: 35000 },
  { name: "Kolkata", state: "West Bengal", lat: 22.57, lng: 88.36, severity: 78, intensity: "AQI 260", detail: "Vehicular + coal-cluster emissions; Howrah corridor smog.", radius: 40000 },
  { name: "Ahmedabad", state: "Gujarat", lat: 23.02, lng: 72.57, severity: 74, intensity: "AQI 240", detail: "Naroda–Vatva industrial estates; textile-chemical emissions.", radius: 35000 },
  { name: "Singrauli", state: "Madhya Pradesh", lat: 24.20, lng: 82.66, severity: 80, intensity: "AQI 270", detail: "Coal-power hub (14+ plants); fly-ash & SO₂ heavy zone.", radius: 45000 },
  { name: "Dhanbad", state: "Jharkhand", lat: 23.80, lng: 86.44, severity: 76, intensity: "AQI 250", detail: "Coal-mining belt; open-cust dust + methane fires degrade air.", radius: 35000 },
];

// Real crop-stress hotspots — agricultural regions facing drought/yield risk
export const CROP_HOTSPOTS: Hotspot[] = [
  { name: "Ludhiana Belt", state: "Punjab", lat: 30.90, lng: 75.86, severity: 78, intensity: "Wheat stress", detail: "Intensive wheat-rice zone; groundwater depletion + heat-stress yield loss.", radius: 50000 },
  { name: "Karnal", state: "Haryana", lat: 29.69, lng: 76.99, severity: 74, intensity: "Wheat", detail: "NH-44 agri-corridor; rising March temps cut grain-fill window.", radius: 40000 },
  { name: "Bundelkhand", state: "Uttar Pradesh", lat: 25.48, lng: 80.33, severity: 82, intensity: "Drought", detail: "Chronic drought zone; repeated crop-failure & farmer distress.", radius: 60000 },
  { name: "Vidarbha", state: "Maharashtra", lat: 20.93, lng: 78.40, severity: 85, intensity: "Cotton distress", detail: "Rain-fed cotton belt; monsoon failure + heat → suicides hotspot.", radius: 70000 },
  { name: "Marathwada", state: "Maharashtra", lat: 18.71, lng: 76.37, severity: 80, intensity: "Soybean/pulse", detail: "Aurangabad–Latur; 2015-type drought, dam-canal deficit.", radius: 55000 },
  { name: "Rayalaseema", state: "Andhra Pradesh", lat: 14.47, lng: 78.82, severity: 76, intensity: "Groundnut", detail: "Anantapur dry-tract; erratic monsoon hits groundnut yield.", radius: 50000 },
  { name: "Telangana Dry Belt", state: "Telangana", lat: 17.97, lng: 79.59, severity: 72, intensity: "Cotton", detail: "Warangal–Nalgonda; rain-fed cotton under heat & water stress.", radius: 45000 },
  { name: "North Karnataka", state: "Karnataka", lat: 15.85, lng: 75.30, severity: 70, intensity: "Jowar/pulse", detail: "Dharwad–Belagavi semi-arid; recurring kharif shortfall.", radius: 45000 },
  { name: "Saurashtra", state: "Gujarat", lat: 22.30, lng: 70.79, severity: 68, intensity: "Groundnut", detail: "Rajkot–Junagadh; monsoon-delay hits groundnut & cotton sowing.", radius: 40000 },
  { name: "Jaisalmer Dry Tract", state: "Rajasthan", lat: 26.91, lng: 70.92, severity: 66, intensity: "Bajra", detail: "Extreme arid zone; marginal bajra cultivation under heat stress.", radius: 55000 },
];

export const HOTSPOTS: Record<HotspotType, Hotspot[]> = {
  heat: HEAT_HOTSPOTS,
  flood: FLOOD_HOTSPOTS,
  aqi: AQI_HOTSPOTS,
  crop: CROP_HOTSPOTS,
};
