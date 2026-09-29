import { useEffect, useState } from "react";
import {
  Eye,
  Trash2,
  Users,
  UserCircle,
  IdCard,
  Phone,
  ShieldCheck,
  Building2,
  LockOpen,
} from "lucide-react";
import { StatCard } from "../../components/StatCard";
import { HeaderPageWithButton } from "../../components/HeaderPageWithButton";
import { SearchBar } from "../../components/SearchBar";
import { EntityTable } from "../../components/EntityTable";
import { Pagination } from "../../components/Pagination";
import type { Column, EntityAction } from "../../components/EntityTable/types";
import { EntityForm } from "../../components/EntityForm";
import { ConfirmDeleteEntity } from "../../components/ConfirmDeleteEntity";
import { EntityViewModal } from "../../components/EntityViewModal";
import type { Usuario } from "../../types/usuario/usuario";
import { ROLE_LABELS } from "../../types/usuario/role";
import { formatDocument, formatPhone } from "../../utils/formatters";
import { createUsuarioFields, type UsuarioFormData } from "./usuarioFields";
import {
  buscarUsuariosPaginado,
  criarUsuario,
  deletarUsuario,
  desbloquearUsuario,
} from "../../services/usuarioService";
import { useServerSearch } from "../../hooks/useServerSearch";
import { buscarOficinaPorId } from "../../services/oficinaService";

interface UsuariosProps {
  usuarioLogado: Usuario;
}

export function Usuarios({ usuarioLogado }: UsuariosProps) {
  const isAdmin = usuarioLogado.role === "ADMIN";
  const oficinaId = usuarioLogado.oficinaId;

  const {
    items: usuarios,
    loading,
    searchTerm,
    buscando,
    page,
    totalPages,
    totalElements,
    setPage,
    handleSearch,
    reload,
  } = useServerSearch<Usuario>(buscarUsuariosPaginado);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [viewingUsuario, setViewingUsuario] = useState<Usuario | null>(null);
  const [deletingUsuario, setDeletingUsuario] = useState<Usuario | null>(null);

  // Cache local de nomes de oficina, resolvidos sob demanda (nunca a lista
  // completa) só para os IDs que aparecem nos usuários já carregados.
  const [oficinaNomes, setOficinaNomes] = useState<Record<number, string>>({});
  const [submitError, setSubmitError] = useState("");
  const [actionError, setActionError] = useState("");

  const roleOptions = isAdmin
    ? [
        { label: "Administrador", value: "ADMIN" },
        { label: "Gerente", value: "GERENTE" },
        { label: "Mecânico", value: "MECANICO" },
      ]
    : [
        { label: "Gerente", value: "GERENTE" },
        { label: "Mecânico", value: "MECANICO" },
      ];

  function getOficinaNome(oficinaId: number | null): string {
    if (oficinaId === null) return "Global";
    return oficinaNomes[oficinaId] ?? "Carregando...";
  }

  function handleView(id: number) {
    const usuario = usuarios.find((u) => u.id === id);
    if (!usuario) return;
    setViewingUsuario(usuario);
  }

  function handleDelete(id: number) {
    const usuario = usuarios.find((u) => u.id === id);
    if (!usuario) return;
    setDeletingUsuario(usuario);
  }

  async function handleConfirmDelete() {
    if (!deletingUsuario) return;
    try {
      await deletarUsuario(deletingUsuario.id);
      reload();
      setDeletingUsuario(null);
    } catch (err) {
      console.error("Erro ao excluir usuário:", err);
    }
  }

  async function handleDesbloquear(usuario: Usuario) {
    try {
      setActionError("");
      await desbloquearUsuario(usuario.id);
      reload();
    } catch (err) {
      console.error("Erro ao desbloquear usuário:", err);
      setActionError(
        err instanceof Error
          ? err.message
          : "Não foi possível desbloquear o usuário.",
      );
    }
  }

  useEffect(() => {
    const idsFaltantes = Array.from(
      new Set(
        usuarios
          .map((u) => u.oficinaId)
          .filter(
            (id): id is number => id !== null && oficinaNomes[id] === undefined,
          ),
      ),
    );

    if (idsFaltantes.length === 0) return;

    idsFaltantes.forEach(async (id) => {
      try {
        const oficina = await buscarOficinaPorId(id);
        setOficinaNomes((prev) => ({ ...prev, [id]: oficina.nome }));
      } catch (err) {
        console.error(`Erro ao buscar oficina ${id}:`, err);
        setOficinaNomes((prev) => ({
          ...prev,
          [id]: "Oficina não encontrada",
        }));
      }
    });
  }, [usuarios, oficinaNomes]);

  async function handleAddUsuario(data: UsuarioFormData) {
    try {
      setSubmitError("");
      const oficinaId =
        usuarioLogado.role === "ADMIN"
          ? data.role === "ADMIN"
            ? null
            : (data.oficinaId ?? null)
          : usuarioLogado.oficinaId;

      await criarUsuario({
        nome: data.nome,
        documento: data.documento,
        telefone: data.telefone,
        username: data.username,
        password: data.password,
        role: data.role,
        oficinaId,
      });

      reload();
      setIsModalOpen(false);
    } catch (err) {
      console.error("Erro ao criar usuário:", err);

      setSubmitError(
        err instanceof Error
          ? err.message
          : "Não foi possível criar o usuário.",
      );
    }
  }

  const columns: Column<Usuario>[] = [
    {
      key: "nome",
      header: "Nome",
      width: "20%",
      render: (u) => <strong className="user-name">{u.nome}</strong>,
    },
    {
      key: "documento",
      header: "Documento",
      width: "16%",
      render: (u) => formatDocument(u.documento).display,
    },
    {
      key: "telefone",
      header: "Telefone",
      width: "16%",
      render: (u) => formatPhone(u.telefone),
    },
    {
      key: "role",
      header: "Role",
      width: "14%",
      render: (u) => (
        <span className={`role-badge role-${u.role.toLowerCase()}`}>
          {ROLE_LABELS[u.role]}
        </span>
      ),
    },
    {
      key: "bloqueado",
      header: "Acesso",
      width: "12%",
      render: (u) =>
        u.bloqueado ? (
          <span style={{ color: "#b91c1c", fontWeight: 600 }}>Bloqueado</span>
        ) : (
          "Liberado"
        ),
    },
    ...(isAdmin
      ? [
          {
            key: "oficinaNome",
            header: "Oficina",
            width: "20%",
            render: (u: Usuario) => getOficinaNome(u.oficinaId),
          },
        ]
      : []),
  ];

  const actions: EntityAction<Usuario>[] = [
    {
      label: "Visualizar usuário",
      icon: Eye,
      variant: "view",
      onClick: (u) => handleView(u.id),
    },
    {
      label: "Desbloquear login",
      icon: LockOpen,
      variant: "edit",
      onClick: (u) => handleDesbloquear(u),
      hidden: (u) => !u.bloqueado,
    },
    {
      label: "Remover usuário",
      icon: Trash2,
      variant: "delete",
      onClick: (u) => handleDelete(u.id),
    },
  ];

  return (
    <div className="page">
      <HeaderPageWithButton
        title="Usuários"
        subtitle={
          oficinaId !== undefined
            ? "Gerencie os usuários desta oficina"
            : "Gerencie os usuários de todas as oficinas"
        }
        onButtonClick={() => setIsModalOpen(true)}
        buttonText="Novo Usuário"
      />

      <StatCard
        title="Usuários Cadastrados"
        value={totalElements.toString()}
        description={buscando ? "Encontrados na busca" : "Total de usuários"}
        icon={Users}
      />

      <SearchBar
        placeholder="Pesquisar por nome, username, documento ou telefone"
        searchTerm={searchTerm}
        setSearchTerm={handleSearch}
      />

      {actionError && (
        <p role="alert" style={{ color: "#b91c1c" }}>
          {actionError}
        </p>
      )}

      <EntityTable
        data={usuarios}
        columns={columns}
        actions={actions}
        getRowKey={(u) => u.id}
        loading={loading}
        emptyMessage={
          buscando
            ? "Nenhum usuário encontrado para a busca"
            : "Nenhum usuário cadastrado"
        }
      />

      <Pagination
        page={page}
        totalPages={totalPages}
        totalElements={totalElements}
        onPageChange={setPage}
      />

      {isModalOpen && (
        <EntityForm<UsuarioFormData>
          title="Cadastro de Usuário"
          fields={createUsuarioFields(isAdmin, roleOptions)}
          onSubmit={handleAddUsuario}
          onClose={() => setIsModalOpen(false)}
          submitError={submitError}
        />
      )}

      {viewingUsuario && (
        <EntityViewModal
          title={viewingUsuario.nome}
          subtitle={`@${viewingUsuario.username}`}
          onClose={() => setViewingUsuario(null)}
          fields={[
            { icon: UserCircle, label: "Nome", value: viewingUsuario.nome },
            {
              icon: IdCard,
              label: "Documento",
              value: formatDocument(viewingUsuario.documento).display,
            },
            {
              icon: Phone,
              label: "Telefone",
              value: formatPhone(viewingUsuario.telefone),
            },
            {
              icon: ShieldCheck,
              label: "Role",
              value: ROLE_LABELS[viewingUsuario.role],
            },
            {
              icon: Building2,
              label: "Oficina",
              value: getOficinaNome(viewingUsuario.oficinaId),
            },
          ]}
        />
      )}

      {deletingUsuario && (
        <ConfirmDeleteEntity
          text="Usuário"
          entity="o usuário"
          entityName={deletingUsuario.nome}
          onConfirm={handleConfirmDelete}
          onCancel={() => setDeletingUsuario(null)}
        />
      )}
    </div>
  );
}
