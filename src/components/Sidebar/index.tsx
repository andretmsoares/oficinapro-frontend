import {
  LayoutDashboard,
  Users,
  Car,
  ClipboardList,
  Wrench,
  Package,
  CreditCard,
  LogOut,
  Building2,
  UserCog,
} from "lucide-react";
import { NavLink } from "react-router-dom";

import type { Usuario } from "../../types/usuario/usuario";
import "./sidebar.style.css";

interface SidebarProps {
  usuarioLogado: Usuario;
  onLogout?: () => void;
}

export function Sidebar({ usuarioLogado, onLogout }: SidebarProps) {
  const isAdminSaas = usuarioLogado.role === "ADMIN";
  const isGerenteOficina = usuarioLogado.role === "GERENTE";

  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <img className="sidebar-logo-img" src="/logo.png" alt="Oficina Pro" />
      </div>

      <nav className="sidebar-nav">
        {isAdminSaas ? (
          <>
            <NavLink to="/admin/oficinas" className="nav-item">
              <Building2 size={18} />
              <span>Oficinas</span>
            </NavLink>

            <NavLink to="/admin/usuarios" className="nav-item">
              <UserCog size={18} />
              <span>Usuários</span>
            </NavLink>
          </>
        ) : (
          <>
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

            {isGerenteOficina && (
              <>
                <NavLink to="/usuarios" className="nav-item">
                  <UserCog size={18} />
                  <span>Usuários</span>
                </NavLink>
                <NavLink to="/unidades" className="nav-item">
                  <Building2 size={18} />
                  <span>Unidades</span>
                </NavLink>
              </>
            )}
          </>
        )}
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
