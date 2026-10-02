import { useEffect, useState, type ReactNode } from "react";

import { Header } from "../Header";
import { Sidebar } from "../Sidebar";

import "./mainLayout.style.css";
import type { Usuario } from "../../types/usuario/usuario";

interface MainLayoutProps {
  children: ReactNode;
  usuarioLogado: Usuario;
  onLogout: () => void;
  onUpdateUsuarioLogado: (data: Usuario) => void;
}

export function MainLayout({
  children,
  usuarioLogado,
  onLogout,
  onUpdateUsuarioLogado,
}: MainLayoutProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    if (!isMenuOpen) return;

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setIsMenuOpen(false);
    }

    document.addEventListener("keydown", handleKeyDown);

    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isMenuOpen]);

  return (
    <div className="app-layout">
      <Sidebar
        usuarioLogado={usuarioLogado}
        onLogout={onLogout}
        isOpen={isMenuOpen}
        onNavigate={() => setIsMenuOpen(false)}
      />

      {isMenuOpen && (
        <div
          className="sidebar-backdrop"
          onClick={() => setIsMenuOpen(false)}
          aria-hidden="true"
        />
      )}

      <div className="main-content">
        <Header
          usuarioLogado={usuarioLogado}
          onLogout={onLogout}
          onUpdateUsuarioLogado={onUpdateUsuarioLogado}
          onOpenMenu={() => setIsMenuOpen(true)}
          isMenuExpanded={isMenuOpen}
        />

        <main className="page-content">{children}</main>
      </div>
    </div>
  );
}
