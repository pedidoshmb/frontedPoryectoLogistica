import { Link } from "react-router-dom";

export default function Sidebar() {
  return (
    <div className="bg-dark border-right" id="sidebar-wrapper">
      <div className="sidebar-heading text-white">Logistica</div>
      <div className="list-group list-group-flush">
        <Link
          to="/"
          className="list-group-item list-group-item-action bg-dark text-white"
        >
          <i className="fas fa-tachometer-alt me-2"></i> Dashboard
        </Link>
        <Link
          to="/usuarios"
          className="list-group-item list-group-item-action bg-dark text-white"
        >
          <i className="fas fa-users me-2"></i> Usuarios
        </Link>
        <Link
          to="/regpedidos"
          className="list-group-item list-group-item-action bg-dark text-white"
        >
          <i className="fas fa-shopping-cart me-2"></i> Reg-Pedidos
        </Link>
        <Link
          to="/entregas"
          className="list-group-item list-group-item-action bg-dark text-white"
        >
          <i className="fas fa-shopping-cart me-2"></i> Entregas Pedidos
        </Link>
        <Link
          to="/listado-entregas"
          className="list-group-item list-group-item-action bg-dark text-white"
        >
          <i className="fas fa-shopping-cart me-2"></i> Listado Entregas
        </Link>
        <Link
          to="/reportes"
          className="list-group-item list-group-item-action bg-dark text-white"
        >
          <i className="fas fa-chart-line me-2"></i> Reportes
        </Link>
      </div>
    </div>
  );
}
