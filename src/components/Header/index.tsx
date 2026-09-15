import { useEffect, useRef, useState } from "react";
import { Pencil, LogOut } from "lucide-react";

import "./header.style.css";
import type { Usuario } from "../../types/usuario/usuario";
import { ROLE_LABELS } from "../../types/usuario/role";
import { EditUsuarioModal } from "../EditUsuarioModal";
import type { EditUsuarioFormData } from "../EditUsuarioModal/editUsuarioFields";

interface HeaderProps {
  usuarioLogado: Usuario;
  onLogout: () => void;
  onUpdateUsuarioLogado: (data: EditUsuarioFormData) => void;
}

export function Header({
  usuarioLogado,
  onLogout,
  onUpdateUsuarioLogado,
}: HeaderProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  function handleSalvarEdicao(data: EditUsuarioFormData) {
    // TODO: substituir por chamada real ao backend (PUT /usuarios/me).
    // Se novaSenha vier vazia, o backend deve manter a senha atual.
    onUpdateUsuarioLogado(data);
    setIsEditModalOpen(false);
  }

  return (
    <header className="header">
      <div>
        <h2>Olá, {usuarioLogado.nome} 👋</h2>
        <p>
          {usuarioLogado.role === "ADMIN"
            ? "Acompanhe e gerencie todas as oficinas do sistema."
            : "Confira o resumo da sua oficina hoje."}
        </p>
      </div>

      <div className="header-actions">
        <div className="user-info" ref={menuRef}>
          <button
            type="button"
            className="avatar-button"
            onClick={() => setIsMenuOpen((prev) => !prev)}
          >
            <div className="avatar">
              {usuarioLogado.nome[0] ?? "Nome não encontrado"}
            </div>

            <div>
              <strong>{usuarioLogado.nome}</strong>
              <span>{ROLE_LABELS[usuarioLogado.role]}</span>
            </div>
          </button>

          {isMenuOpen && (
            <div className="user-menu">
              <button
                type="button"
                className="user-menu-item"
                onClick={() => {
                  setIsMenuOpen(false);
                  setIsEditModalOpen(true);
                }}
              >
                <Pencil size={15} />
                Editar dados
              </button>

              <button
                type="button"
                className="user-menu-item user-menu-item-danger"
                onClick={() => {
                  setIsMenuOpen(false);
                  onLogout();
                }}
              >
                <LogOut size={15} />
                Sair
              </button>
            </div>
          )}
        </div>
      </div>

      {isEditModalOpen && (
        <EditUsuarioModal
          usuarioLogado={usuarioLogado}
          onClose={() => setIsEditModalOpen(false)}
          onSave={handleSalvarEdicao}
        />
      )}
    </header>
  );
}
