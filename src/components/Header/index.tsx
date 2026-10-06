import { useEffect, useRef, useState } from "react";
import { Pencil, LogOut, Menu } from "lucide-react";

import "./header.style.css";
import type { Usuario } from "../../types/usuario/usuario";
import { ROLE_LABELS } from "../../types/usuario/role";
import { EditUsuarioModal } from "../EditUsuarioModal";
import type { EditUsuarioFormData } from "../EditUsuarioModal/editUsuarioFields";
import { atualizarUsuarioLogado } from "../../services/usuarioService";

interface HeaderProps {
  usuarioLogado: Usuario;
  onLogout: () => void;
  onUpdateUsuarioLogado: (data: Usuario) => void;
  /** Abre o menu lateral em telas pequenas. */
  onOpenMenu?: () => void;
  isMenuExpanded?: boolean;
}

export function Header({
  usuarioLogado,
  onLogout,
  onUpdateUsuarioLogado,
  onOpenMenu,
  isMenuExpanded = false,
}: HeaderProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [submitError, setSubmitError] = useState("");

  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: PointerEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    }

    // pointerdown cobre mouse e toque.
    document.addEventListener("pointerdown", handleClickOutside);

    return () => {
      document.removeEventListener("pointerdown", handleClickOutside);
    };
  }, []);

  async function handleSalvarEdicao(data: EditUsuarioFormData) {
    try {
      // Limpa erro anterior antes de uma nova tentativa
      setSubmitError("");

      // Senha não leva trim: espaços fazem parte dela. Em branco = manter a atual.
      const novaSenha = data.novaSenha?.trim() ? data.novaSenha : undefined;
      const trocaSenha = novaSenha !== undefined;
      const trocaUsername = data.username !== usuarioLogado.username;

      // Trocar senha ou username exige confirmar a senha atual (o backend também valida).
      if ((trocaSenha || trocaUsername) && !data.senhaAtual) {
        setSubmitError(
          "Informe a senha atual para alterar a senha ou o username.",
        );
        return;
      }

      const usuarioAtualizado = await atualizarUsuarioLogado({
        nome: data.nome,
        documento: data.documento,
        telefone: data.telefone,
        username: data.username,
        password: novaSenha,
        senhaAtual: trocaSenha || trocaUsername ? data.senhaAtual : undefined,
      });

      if (trocaSenha) {
        // Trocar a senha revoga todos os tokens do usuário: é preciso entrar de novo.
        onLogout();
        return;
      }

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
      <button
        type="button"
        className="menu-toggle"
        onClick={onOpenMenu}
        aria-label="Abrir menu"
        aria-controls="sidebar"
        aria-expanded={isMenuExpanded}
      >
        <Menu size={22} />
      </button>

      <div className="header-greeting">
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
            aria-haspopup="menu"
            aria-expanded={isMenuOpen}
            onClick={() => setIsMenuOpen((prev) => !prev)}
          >
            <div className="avatar">
              {usuarioLogado.nome[0] ?? "Nome não encontrado"}
            </div>

            <div className="user-info-text">
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
