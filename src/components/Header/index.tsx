import { useEffect, useRef, useState } from "react";
import { Pencil, LogOut } from "lucide-react";

import "./header.style.css";
import type { Usuario } from "../../types/usuario/usuario";
import { ROLE_LABELS } from "../../types/usuario/role";
import { EditUsuarioModal } from "../EditUsuarioModal";
import type { EditUsuarioFormData } from "../EditUsuarioModal/editUsuarioFields";
import { atualizarUsuarioLogado } from "../../services/usuario/usuarioService";

interface HeaderProps {
  usuarioLogado: Usuario;
  onLogout: () => void;
  onUpdateUsuarioLogado: (data: Usuario) => void;
}

export function Header({
  usuarioLogado,
  onLogout,
  onUpdateUsuarioLogado,
}: HeaderProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [submitError, setSubmitError] = useState("");

  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  async function handleSalvarEdicao(data: EditUsuarioFormData) {
    try {
      // Limpa erro anterior antes de uma nova tentativa
      setSubmitError("");

      const usuarioAtualizado = await atualizarUsuarioLogado({
        nome: data.nome,
        documento: data.documento,
        telefone: data.telefone,
        username: data.username,
        password: data.novaSenha?.trim() || undefined,
      });

      onUpdateUsuarioLogado(usuarioAtualizado);
      setIsEditModalOpen(false);
    } catch (err) {
      console.error("Erro ao atualizar usuário:", err);

      setSubmitError(
        err instanceof Error
          ? err.message
          : "Não foi possível atualizar seus dados.",
      );
    }
  }

  function handleAbrirEdicao() {
    setSubmitError("");
    setIsMenuOpen(false);
    setIsEditModalOpen(true);
  }

  function handleFecharEdicao() {
    setSubmitError("");
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
                onClick={handleAbrirEdicao}
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
          onClose={handleFecharEdicao}
          onSave={handleSalvarEdicao}
          submitError={submitError}
        />
      )}
    </header>
  );
}
