import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { useState } from "react";
import Layout from "./components/Layout";
import Dashboard from "./pages/Dashboard";
import Usuarios from "./pages/Usuarios";
import Reportes from "./pages/Reportes";
import RegPedidos from "./pages/RegPedidos";
import Entregas from "./pages/Entregas";
import Login from "./pages/Login"; // Asegúrate de importar Login
import "./styles.css";

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(() => {
    return !!localStorage.getItem("token"); // true si hay token
  });

  const handleLogout = () => {
    localStorage.removeItem("token");
    setIsLoggedIn(false);
  };

  return (
    <Router>
      {!isLoggedIn ? (
        <Login onLogin={() => setIsLoggedIn(true)} />
      ) : (
        <Layout onLogout={handleLogout}>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/usuarios" element={<Usuarios />} />
            <Route path="/reportes" element={<Reportes />} />
            <Route path="/regpedidos" element={<RegPedidos />} />
            <Route path="/entregas" element={<Entregas />} />
          </Routes>
        </Layout>
      )}
    </Router>
  );
}
