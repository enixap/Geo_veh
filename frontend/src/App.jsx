import React from "react";
import { Routes, Route, Navigate, useNavigate, Link } from "react-router-dom";
import LoginPage from "../pages/LoginPage";
import DashboardPage from "../pages/DashboardPage";
import VehiclesPage from "../pages/VehiclesPage";
import PrivateRoute from "../components/PrivateRoute";
import PositionsPage from "../pages/PositionsPage";

function AppShell({ children }) {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("jwt_token");
    navigate("/login");
  };

  const isAuthenticated = Boolean(localStorage.getItem("jwt_token"));

  return (
    <div className="app-shell">
      <header className="app-header">
        <div className="app-header-title">Geo Veh · Suivi de véhicules</div>
        <div style={{ display: "flex", gap: "0.8rem", alignItems: "center" }}>
          {isAuthenticated && (
            <>
              <Link to="/dashboard" style={{ color: "#a5b4fc", fontSize: "0.85rem", textDecoration: "none" }}>
                🗺 Dashboard
              </Link>
              <Link to="/vehicles" style={{ color: "#a5b4fc", fontSize: "0.85rem", textDecoration: "none" }}>
                 Véhicules
              </Link>
              <Link to="/positions" style={{ color: "#a5b4fc", fontSize: "0.85rem", textDecoration: "none" }}>
                 Positions
              </Link>
              <button type="button" className="btn btn-outline" onClick={handleLogout}>
                Déconnexion
              </button>
            </>
          )}
        </div>
      </header>
      <main className="app-main">{children}</main>
    </div>
  );
}

function App() {
  return (
    <AppShell>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/dashboard" element={<PrivateRoute><DashboardPage /></PrivateRoute>} />
        <Route path="/vehicles" element={<PrivateRoute><VehiclesPage /></PrivateRoute>} />
        <Route path="/positions" element={<PrivateRoute><PositionsPage /></PrivateRoute>} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </AppShell>
  );
}

export default App;