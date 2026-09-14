import { useState } from "react";
import {
  Eye,
  Trash2,
  Users,
  UserCircle,
  IdCard,
  Phone,
  ShieldCheck,
} from "lucide-react";

import { StatCard } from "../../components/StatCard";
import { HeaderPage } from "../../components/HeaderPage";
import { SearchBar } from "../../components/SearchBar";
import { EntityTable } from "../../components/EntityTable";
import type { Column, EntityAction } from "../../components/EntityTable/types";
import { ConfirmDeleteEntity } from "../../components/ConfirmDeleteEntity";
import { EntityViewModal } from "../../components/EntityViewModal";

import type { Usuario } from "../../types/usuario/usuario";
import { ROLE_LABELS } from "../../types/usuario/role";
import { formatDocument, formatPhone } from "../../services/formatters";

import { MOCK_USUARIOS } from "../../mocks/usuario";

import "./usuarios.style.css";

interface UsuariosProps {
  oficinaId: number;
}

export function Usuarios({ oficinaId }: UsuariosProps) {
  const [usuarios, setUsuarios] = useState<Usuario[]>(
    MOCK_USUARIOS.filter((usuario) => usuario.oficinaId === oficinaId),
  );

  const [searchTerm, setSearchTerm] = useState("");
  const [viewingUsuario, setViewingUsuario] = useState<Usuario | null>(null);
  const [deletingUsuario, setDeletingUsuario] = useState<Usuario | null>(null);

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

  function handleConfirmDelete() {
    if (!deletingUsuario) return;
    // TODO: substituir por chamada real ao backend (DELETE /usuarios/{id})
    setUsuarios((prev) => prev.filter((u) => u.id !== deletingUsuario.id));
    setDeletingUsuario(null);
  }

  const columns: Column<Usuario>[] = [
    {
      key: "nome",
      header: "Nome",
      width: "28%",
      render: (u) => <strong className="user-name">{u.nome}</strong>,
    },
    {
      key: "documento",
      header: "Documento",
      width: "20%",
      render: (u) => formatDocument(u.documento).display,
    },
    {
      key: "telefone",
      header: "Telefone",
      width: "20%",
      render: (u) => formatPhone(u.telefone),
    },
    {
      key: "role",
      header: "Role",
      width: "18%",
      render: (u) => (
        <span className={`role-badge role-${u.role.toLowerCase()}`}>
          {ROLE_LABELS[u.role]}
        </span>
      ),
    },
  ];

  const actions: EntityAction<Usuario>[] = [
    {
      label: "Visualizar usuário",
      icon: Eye,
      variant: "view",
      onClick: (u) => handleView(u.id),
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
      <HeaderPage
        title="Usuários"
        subtitle="Gerencie os usuários desta oficina"
      />

      <StatCard
        title="Usuários Cadastrados"
        value={usuarios.length.toString()}
        description="Total na oficina"
        icon={Users}
      />

      <SearchBar
        placeholder="Pesquisar por nome, documento ou telefone"
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
      />

      <EntityTable
        data={usuarios}
        columns={columns}
        actions={actions}
        getRowKey={(u) => u.id}
        searchTerm={searchTerm}
        searchFields={["nome", "documento", "telefone"]}
        emptyMessage="Nenhum usuário cadastrado"
      />

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
