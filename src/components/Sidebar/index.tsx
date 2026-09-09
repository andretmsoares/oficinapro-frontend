import {
  LayoutDashboard,
  Users,
  Car,
  ClipboardList,
  Wrench,
  Package,
  CreditCard,
  LogOut,
} from "lucide-react";
import { NavLink } from "react-router-dom";

import "./sidebar.style.css";

interface SidebarProps {
  onLogout?: () => void;
}

export function Sidebar({ onLogout }: SidebarProps) {
  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <img className="sidebar-logo-img" src="/logo.png" alt="Oficina Pro" />
      </div>

      <nav className="sidebar-nav">
        <NavLink to="/dashboard" className="nav-item">
          <LayoutDashboard size={18} />
          <span>Dashboard</span>
        </NavLink>

        <NavLink to="/clientes" className="nav-item">
          <Users size={18} />
          <span>Clientes</span>
        </NavLink>

        <NavLink to="/veiculos" className="nav-item">
          <Car size={18} />
          <span>Veículos</span>
        </NavLink>

        <NavLink to="/ordens-servico" className="nav-item">
          <ClipboardList size={18} />
          <span>Ordens de Serviço</span>
        </NavLink>

        <NavLink to="/mecanicos" className="nav-item">
          <Wrench size={18} />
          <span>Mecânicos</span>
        </NavLink>

        <NavLink to="/pecas" className="nav-item">
          <Package size={18} />
          <span>Peças</span>
        </NavLink>

        <NavLink to="/pagamentos" className="nav-item">
          <CreditCard size={18} />
          <span>Pagamentos</span>
        </NavLink>
      </nav>

      <div className="sidebar-bottom">
        <button onClick={onLogout} className="nav-item nav-button">
          <LogOut size={18} />
          <span>Sair</span>
        </button>
      </div>
    </aside>
  );
}
