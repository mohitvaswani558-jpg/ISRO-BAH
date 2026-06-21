import {
  LayoutDashboard, Flame, Droplets, Wind, Bot, TrendingUp, History,
  Siren, UploadCloud, Landmark, Settings, ShieldCheck,
} from "lucide-react";
import type { Role } from "../contexts/AuthContext";
import type { ReactNode } from "react";

export interface NavItem {
  id: string;
  label: string;
  path: string;
  icon: ReactNode;
  group: "Command" | "Intelligence" | "AI" | "Operations" | "Administration";
  roles: Role[];
  badge?: string;
}

const ALL: Role[] = ["Scientist", "Government Officer", "Analyst", "Public User", "Admin"];
const STAFF: Role[] = ["Scientist", "Analyst", "Government Officer", "Admin"];
const GOV: Role[] = ["Government Officer", "Admin"];
const ADMIN: Role[] = ["Admin"];

export const NAV: NavItem[] = [
  { id: "dashboard", label: "Dashboard Home", path: "/", icon: <LayoutDashboard size={18} />, group: "Command", roles: ALL },
  { id: "heat", label: "Heat Intelligence", path: "/heat", icon: <Flame size={18} />, group: "Intelligence", roles: ALL, badge: "LIVE" },
  { id: "flood", label: "Flood Intelligence", path: "/flood", icon: <Droplets size={18} />, group: "Intelligence", roles: ALL, badge: "LIVE" },
  { id: "aqi", label: "AQI Monitoring", path: "/aqi", icon: <Wind size={18} />, group: "Intelligence", roles: ALL, badge: "LIVE" },
  { id: "copilot", label: "AI Copilot", path: "/copilot", icon: <Bot size={18} />, group: "AI", roles: ALL },
  { id: "prediction", label: "Prediction Analytics", path: "/prediction", icon: <TrendingUp size={18} />, group: "AI", roles: STAFF },
  { id: "historical", label: "Historical Comparison", path: "/historical", icon: <History size={18} />, group: "AI", roles: STAFF },
  { id: "emergency", label: "Emergency Alert Center", path: "/emergency", icon: <Siren size={18} />, group: "Operations", roles: ALL, badge: "ALERT" },
  { id: "upload", label: "Upload & Predict", path: "/upload", icon: <UploadCloud size={18} />, group: "Operations", roles: STAFF },
  { id: "gov", label: "Government Dashboard", path: "/government", icon: <Landmark size={18} />, group: "Administration", roles: GOV },
  { id: "settings", label: "Settings / Profile", path: "/settings", icon: <Settings size={18} />, group: "Administration", roles: ALL },
  { id: "admin", label: "Admin Panel", path: "/admin", icon: <ShieldCheck size={18} />, group: "Administration", roles: ADMIN },
];

export const GROUPS: NavItem["group"][] = ["Command", "Intelligence", "AI", "Operations", "Administration"];

export function canAccess(item: NavItem, role: Role): boolean {
  return item.roles.includes(role);
}
