import type { ReactNode } from "react";

import { Header } from "../Header";
import { Sidebar } from "../Sidebar";

import "./mainLayout.style.css";
import type { UsuarioLogado } from "../../types/usuario/usuario";

interface MainLayoutProps {
  children: ReactNode;
  usuarioLogado: UsuarioLogado;
  onLogout?: () => void;
}

export function MainLayout({
  children,
  usuarioLogado,
  onLogout,
}: MainLayoutProps) {
  return (
    <div className="app-layout">
      <Sidebar usuarioLogado={usuarioLogado} onLogout={onLogout} />

      <div className="main-content">
        <Header />

        <main className="page-content">{children}</main>
      </div>
    </div>
  );
}
