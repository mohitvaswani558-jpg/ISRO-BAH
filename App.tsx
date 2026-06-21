import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import { Layout } from "./components/Layout";
import { Login } from "./pages/Login";
import { Dashboard } from "./pages/Dashboard";
import { HeatIntelligence } from "./pages/HeatIntelligence";
import { FloodIntelligence } from "./pages/FloodIntelligence";
import { AQIMonitoring } from "./pages/AQIMonitoring";
import { AICopilot } from "./pages/AICopilot";
import { PredictionAnalytics } from "./pages/PredictionAnalytics";
import { HistoricalComparison } from "./pages/HistoricalComparison";
import { EmergencyAlert } from "./pages/EmergencyAlert";
import { UploadPredict } from "./pages/UploadPredict";
import { GovernmentDashboard } from "./pages/GovernmentDashboard";
import { Settings } from "./pages/Settings";
import { AdminPanel } from "./pages/AdminPanel";
import { NAV, canAccess } from "./lib/nav";
import type { Role } from "./contexts/AuthContext";
import type { JSX } from "react";

function Guard({ children, roles }: { children: JSX.Element; roles: Role[] }) {
  const { user, loading } = useAuth();
  const loc = useLocation();
  if (loading) return <div className="grid place-items-center min-h-screen text-electric font-mono text-sm">Initializing secure session…</div>;
  if (!user) return <Navigate to="/login" state={{ from: loc }} replace />;
  if (!roles.includes(user.role)) return <Navigate to="/" replace />;
  return children;
}

function AppRoutes() {
  const roleMap: Record<string, Role[]> = Object.fromEntries(NAV.map((n) => [n.path, n.roles]));
  const wrap = (path: string, el: JSX.Element) => (
    <Guard roles={roleMap[path] ?? ["Public User"]}>{el}</Guard>
  );
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route element={<Layout />}>
        <Route index element={wrap("/", <Dashboard />)} />
        <Route path="/heat" element={wrap("/heat", <HeatIntelligence />)} />
        <Route path="/flood" element={wrap("/flood", <FloodIntelligence />)} />
        <Route path="/aqi" element={wrap("/aqi", <AQIMonitoring />)} />
        <Route path="/copilot" element={wrap("/copilot", <AICopilot />)} />
        <Route path="/prediction" element={wrap("/prediction", <PredictionAnalytics />)} />
        <Route path="/historical" element={wrap("/historical", <HistoricalComparison />)} />
        <Route path="/emergency" element={wrap("/emergency", <EmergencyAlert />)} />
        <Route path="/upload" element={wrap("/upload", <UploadPredict />)} />
        <Route path="/government" element={wrap("/government", <GovernmentDashboard />)} />
        <Route path="/settings" element={wrap("/settings", <Settings />)} />
        <Route path="/admin" element={wrap("/admin", <AdminPanel />)} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </AuthProvider>
  );
}
