import React, { useState } from "react";
import { BrowserRouter, Routes, Route, Navigate, Link, useLocation, useNavigate } from "react-router-dom";
import { api } from "./lib/api";
import { getCurrentRole } from "./lib/auth";
import EquipementsPage from "./pages/EquipementsPage";
import PdrPage from "./pages/PdrPage";
import FournisseursPage from "./pages/FournisseursPage";
import DemandesAchatPage from "./pages/DemandesAchatPage";
import CommandesPage from "./pages/CommandesPage";
import EntreesPage from "./pages/EntreesPage";
import SortiesPage from "./pages/SortiesPage";
import DepensesPage from "./pages/DepensesPage";
import NotificationsPage from "./pages/NotificationsPage";
import HistoriquePage from "./pages/HistoriquePage";
import ParametresPage from "./pages/ParametresPage";
import InterventionsPage from "./pages/InterventionsPage";
import RecherchePage from "./pages/RecherchePage";
import RapportsPage from "./pages/RapportsPage";
import DocumentsPage from "./pages/DocumentsPage";
import UsersPage from "./pages/UsersPage";

const ORANGE = "#F5821F";
const DARK = "#22262B";

function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    try {
      const { data } = await api.post("/auth/login", { email, password });
      localStorage.setItem("accessToken", data.accessToken);
      navigate("/");
    } catch (err) {
      setError("Identifiants invalides.");
    }
  };

  return (
    <div style={{ height: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#F3F4F6", fontFamily: "Arial" }}>
      <form onSubmit={handleSubmit} style={{ background: "#fff", padding: 32, borderRadius: 8, width: 320 }}>
        <div style={{ fontWeight: 800, fontSize: 18, marginBottom: 4 }}>SONASID <span style={{ color: ORANGE }}>ELJ</span></div>
        <div style={{ fontSize: 12, color: "#6B7280", marginBottom: 20 }}>Portail Suivis — Service Électrique</div>
        <input placeholder="Email professionnel" value={email} onChange={(e) => setEmail(e.target.value)} style={inputStyle} />
        <input placeholder="Mot de passe" type="password" value={password} onChange={(e) => setPassword(e.target.value)} style={inputStyle} />
        {error && <div style={{ color: "#DC2626", fontSize: 12, marginBottom: 10 }}>{error}</div>}
        <button type="submit" style={{ width: "100%", background: ORANGE, color: "#fff", border: "none", borderRadius: 4, padding: 10, fontWeight: 700 }}>
          Se connecter
        </button>
      </form>
    </div>
  );
}

// Un seul point pour ajouter un module au menu : le reste (route, garde
// d'authentification, mise en page) suit automatiquement.
const modules = [
  { path: "/equipements", label: "Base Équipements Critiques", element: <EquipementsPage /> },
  { path: "/interventions", label: "Interventions", element: <InterventionsPage /> },
  { path: "/pdr", label: "Suivi PDR Magasin ELJ", element: <PdrPage /> },
  { path: "/entrees", label: "Entrées", element: <EntreesPage /> },
  { path: "/sorties", label: "Sorties", element: <SortiesPage /> },
  { path: "/depenses", label: "Dépenses Arrêt Électrique", element: <DepensesPage /> },
  { path: "/demandes-achat", label: "Demandes d'Achat (DA)", element: <DemandesAchatPage /> },
  { path: "/commandes", label: "Commandes (BC)", element: <CommandesPage /> },
  { path: "/fournisseurs", label: "Fournisseurs", element: <FournisseursPage /> },
  { path: "/rapports", label: "Rapports", element: <RapportsPage /> },
  { path: "/documents", label: "Documents (GED)", element: <DocumentsPage /> },
  { path: "/recherche", label: "Recherche globale", element: <RecherchePage /> },
  { path: "/notifications", label: "Notifications", element: <NotificationsPage /> },
  { path: "/historique", label: "Historique / Audit", element: <HistoriquePage /> },
  { path: "/parametres", label: "Paramètres", element: <ParametresPage /> },
  { path: "/utilisateurs", label: "Utilisateurs", element: <UsersPage />, roles: ["ADMINISTRATEUR"] },
];

function Layout({ children }) {
  const location = useLocation();
  const role = getCurrentRole();
  const visibleModules = modules.filter((m) => !m.roles || m.roles.includes(role));
  return (
    <div style={{ display: "flex", height: "100vh", fontFamily: "Arial" }}>
      <div style={{ width: 240, background: DARK, color: "#fff", display: "flex", flexDirection: "column" }}>
        <div style={{ padding: 18, fontWeight: 800 }}>SONASID <span style={{ color: ORANGE }}>ELJ</span></div>
        <div style={{ flex: 1, overflowY: "auto" }}>
          {visibleModules.map((m) => {
            const active = location.pathname === m.path;
            return (
              <Link
                key={m.path}
                to={m.path}
                style={{
                  display: "block", padding: "10px 18px", textDecoration: "none", fontSize: 13,
                  color: active ? "#fff" : "#B4BAC2", background: active ? ORANGE : "transparent",
                  borderLeft: active ? "3px solid #fff" : "3px solid transparent", fontWeight: active ? 700 : 500,
                }}
              >
                {m.label}
              </Link>
            );
          })}
        </div>
        <button
          onClick={() => { localStorage.removeItem("accessToken"); window.location.href = "/login"; }}
          style={{ margin: 18, background: "transparent", border: "1px solid #4b515a", color: "#B4BAC2", borderRadius: 4, padding: "6px 10px", fontSize: 12, cursor: "pointer" }}
        >
          Déconnexion
        </button>
      </div>
      <div style={{ flex: 1, overflowY: "auto", padding: 24, background: "#F3F4F6" }}>{children}</div>
    </div>
  );
}

function RequireAuth({ children, roles }) {
  const token = localStorage.getItem("accessToken");
  if (!token) return <Navigate to="/login" replace />;
  if (roles && !roles.includes(getCurrentRole())) return <Navigate to="/equipements" replace />;
  return children;
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        {modules.map((m) => (
          <Route key={m.path} path={m.path} element={<RequireAuth roles={m.roles}><Layout>{m.element}</Layout></RequireAuth>} />
        ))}
        <Route path="/" element={<Navigate to="/equipements" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

const inputStyle = {
  display: "block", width: "100%", marginBottom: 12, padding: "9px 10px",
  border: "1px solid #E4E7EB", borderRadius: 4, fontSize: 13, boxSizing: "border-box",
};
