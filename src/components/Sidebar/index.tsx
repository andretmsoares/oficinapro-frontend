import {
  LayoutDashboard,
  Users,
  Car,
  ClipboardList,
  Wrench,
  Package,
  Truck,
  CreditCard,
  BarChart3,
  Settings,
  LogOut,
} from "lucide-react";

import "./sidebar.style.css";

export function Sidebar() {
  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <h1>OficinaPro</h1>
      </div>

      <nav className="sidebar-nav">
        <a className="nav-item active" href="#">
          <LayoutDashboard size={18} />
          <span>Dashboard</span>
        </a>

        <a className="nav-item" href="#">
          <Users size={18} />
          <span>Clientes</span>
        </a>

        <a className="nav-item" href="#">
          <Car size={18} />
          <span>Veículos</span>
        </a>

        <a className="nav-item" href="#">
          <ClipboardList size={18} />
          <span>Ordens de Serviço</span>
        </a>

        <a className="nav-item" href="#">
          <Wrench size={18} />
          <span>Mecânicos</span>
        </a>

        <a className="nav-item" href="#">
          <Package size={18} />
          <span>Peças</span>
        </a>

        <a className="nav-item" href="#">
          <Truck size={18} />
          <span>Distribuidoras</span>
        </a>

        <a className="nav-item" href="#">
          <CreditCard size={18} />
          <span>Pagamentos</span>
        </a>

        <a className="nav-item" href="#">
          <BarChart3 size={18} />
          <span>Relatórios</span>
        </a>

        <a className="nav-item" href="#">
          <Settings size={18} />
          <span>Configurações</span>
        </a>
      </nav>

      <div className="sidebar-bottom">
        <a className="nav-item" href="#">
          <LogOut size={18} />
          <span>Sair</span>
        </a>
      </div>
    </aside>
  );
}