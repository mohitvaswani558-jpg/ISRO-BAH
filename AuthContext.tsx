import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

export type Role = "Scientist" | "Government Officer" | "Analyst" | "Public User" | "Admin";

export interface User {
  uid: string;
  name: string;
  email: string;
  role: Role;
  avatar: string;
  agency: string;
  clearance: "Public" | "Restricted" | "Confidential" | "Top Secret";
  verified: boolean;
  loginMethod: "email" | "google" | "otp";
  joined: string;
}

interface AuthCtx {
  user: User | null;
  loading: boolean;
  loginEmail: (email: string, password: string, role: Role) => Promise<User>;
  loginGoogle: () => Promise<User>;
  requestOtp: (email: string) => { otp: string };
  verifyOtp: (email: string, otp: string, role: Role) => Promise<User>;
  register: (name: string, email: string, password: string, role: Role) => Promise<User>;
  logout: () => void;
  updateProfile: (patch: Partial<User>) => void;
  setRole: (role: Role) => void;
}

const Ctx = createContext<AuthCtx | null>(null);
export const useAuth = () => {
  const c = useContext(Ctx);
  if (!c) throw new Error("useAuth must be used within AuthProvider");
  return c;
};

const STORAGE_KEY = "geosentinel.session.v1";

const ROLE_CLEARANCE: Record<Role, User["clearance"]> = {
  "Public User": "Public",
  Analyst: "Restricted",
  Scientist: "Confidential",
  "Government Officer": "Confidential",
  Admin: "Top Secret",
};

const ROLE_AGENCY: Record<Role, string> = {
  "Public User": "Public Access",
  Analyst: "NESAC / Earth Observation",
  Scientist: "ISRO — Space Applications Centre",
  "Government Officer": "MoEFCC / NDMA",
  Admin: "GeoSentinel Command Authority",
};

function deriveName(email: string): string {
  const base = email.split("@")[0].replace(/[._-]+/g, " ");
  return base.replace(/\b\w/g, (c) => c.toUpperCase());
}

function avatar(seed: string): string {
  const colors = ["#22d3ee", "#0ea5e9", "#38bdf8", "#a5f3fc", "#0369a1"];
  const i = Math.abs(seed.split("").reduce((a, c) => a + c.charCodeAt(0), 0)) % colors.length;
  const bg = colors[i];
  const initial = deriveName(seed).charAt(0).toUpperCase();
  const svg = `<svg xmlns='http://www.w3.org/2000/svg' width='96' height='96'><rect width='96' height='96' rx='48' fill='${bg}'/><text x='50%' y='54%' font-family='Orbitron,sans-serif' font-size='40' fill='#04263a' text-anchor='middle' dominant-baseline='middle'>${initial}</text></svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

function buildUser(email: string, role: Role, method: User["loginMethod"], name?: string): User {
  const nm = name?.trim() || deriveName(email);
  return {
    uid: "U-" + Math.abs(email.split("").reduce((a, c) => a + c.charCodeAt(0), 0)).toString(36).toUpperCase(),
    name: nm,
    email,
    role,
    avatar: avatar(email + role),
    agency: ROLE_AGENCY[role],
    clearance: ROLE_CLEARANCE[role],
    verified: method === "google" ? true : true,
    loginMethod: method,
    joined: new Date().toISOString(),
  };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setUser(JSON.parse(raw));
    } catch { /* ignore */ }
    setLoading(false);
  }, []);

  useEffect(() => {
    if (user) localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
    else localStorage.removeItem(STORAGE_KEY);
  }, [user]);

  const loginEmail: AuthCtx["loginEmail"] = async (email, _password, role) => {
    await new Promise((r) => setTimeout(r, 650));
    const u = buildUser(email, role, "email");
    setUser(u);
    return u;
  };

  const loginGoogle: AuthCtx["loginGoogle"] = async () => {
    await new Promise((r) => setTimeout(r, 900));
    const u = buildUser("officer.isro@gov.in", "Government Officer", "google", "R. Vikram");
    setUser(u);
    return u;
  };

  const requestOtp: AuthCtx["requestOtp"] = (email) => {
    const otp = String(Math.floor(100000 + Math.random() * 900000));
    // store transient OTP
    sessionStorage.setItem("geosentinel.otp." + email, otp);
    return { otp };
  };

  const verifyOtp: AuthCtx["verifyOtp"] = async (email, otp, role) => {
    await new Promise((r) => setTimeout(r, 700));
    const saved = sessionStorage.getItem("geosentinel.otp." + email);
    if (saved !== otp.trim()) throw new Error("Invalid OTP. Please verify the 6-digit code.");
    sessionStorage.removeItem("geosentinel.otp." + email);
    const u = buildUser(email, role, "otp");
    setUser(u);
    return u;
  };

  const register: AuthCtx["register"] = async (name, email, _password, role) => {
    await new Promise((r) => setTimeout(r, 800));
    const u = buildUser(email, role, "email", name);
    setUser(u);
    return u;
  };

  const logout = () => setUser(null);
  const updateProfile = (patch: Partial<User>) => setUser((u) => (u ? { ...u, ...patch } : u));
  const setRole = (role: Role) => setUser((u) => (u ? { ...u, role, clearance: ROLE_CLEARANCE[role], agency: ROLE_AGENCY[role] } : u));

  return (
    <Ctx.Provider value={{ user, loading, loginEmail, loginGoogle, requestOtp, verifyOtp, register, logout, updateProfile, setRole }}>
      {children}
    </Ctx.Provider>
  );
}
