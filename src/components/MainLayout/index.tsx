import type { ReactNode } from "react";

import { Header } from "../Header";
import { Sidebar } from "../Sidebar";

import "./mainLayout.style.css";
import type { Usuario } from "../../types/usuario/usuario";
import type { EditUsuarioFormData } from "../EditUsuarioModal/editUsuarioFields";

interface MainLayoutProps {
  children: ReactNode;
  usuarioLogado: Usuario;
  onLogout: () => void;
  onUpdateUsuarioLogado: (data: EditUsuarioFormData) => void;
}

export function MainLayout({
  children,
  usuarioLogado,
  onLogout,
  onUpdateUsuarioLogado,
}: MainLayoutProps) {
  return (
    <div className="app-layout">
      <Sidebar usuarioLogado={usuarioLogado} onLogout={onLogout} />

      <div className="main-content">
        <Header
          usuarioLogado={usuarioLogado}
          onLogout={onLogout}
          onUpdateUsuarioLogado={onUpdateUsuarioLogado}
        />

        <main className="page-content">{children}</main>
      </div>
    </div>
  );
}
