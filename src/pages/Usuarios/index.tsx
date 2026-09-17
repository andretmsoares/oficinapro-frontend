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
} from "lucide-react";

import { StatCard } from "../../components/StatCard";
import { HeaderPageWithButton } from "../../components/HeaderPageWithButton";
import { SearchBar } from "../../components/SearchBar";
import { EntityTable } from "../../components/EntityTable";
import type { Column, EntityAction } from "../../components/EntityTable/types";
import { EntityForm } from "../../components/EntityForm";
import { ConfirmDeleteEntity } from "../../components/ConfirmDeleteEntity";
import { EntityViewModal } from "../../components/EntityViewModal";

import type { Usuario } from "../../types/usuario/usuario";
import { ROLE_LABELS } from "../../types/usuario/role";
import { formatDocument, formatPhone } from "../../utils/formatters";

import { createUsuarioFields, type UsuarioFormData } from "./usuarioFields";

import {
  listarUsuarios,
  criarUsuario,
  deletarUsuario,
} from "../../services/usuario/usuarioService";
import { MOCK_OFICINAS } from "../../mocks/oficina";

interface UsuariosProps {
  usuarioLogado: Usuario;
}

export function Usuarios({ usuarioLogado }: UsuariosProps) {
  const isAdmin = usuarioLogado.role === "ADMIN";
  const oficinaId = usuarioLogado.oficinaId;
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [viewingUsuario, setViewingUsuario] = useState<Usuario | null>(null);
  const [deletingUsuario, setDeletingUsuario] = useState<Usuario | null>(null);
  console.log("USUÁRIOS:", usuarios);

  const oficinaOptions = isAdmin
    ? MOCK_OFICINAS.map((oficina) => ({
        label: oficina.nome,
        value: String(oficina.id),
      }))
    : [];

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
    return (
      MOCK_OFICINAS.find((o) => o.id === oficinaId)?.nome ??
      "Oficina não encontrada"
    );
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

      setUsuarios((prev) => prev.filter((u) => u.id !== deletingUsuario.id));

      setDeletingUsuario(null);
    } catch (err) {
      console.error("Erro ao excluir usuário:", err);
    }
  }

  useEffect(() => {
    async function carregarUsuarios() {
      try {
        const response = await listarUsuarios(0, 100);

        setUsuarios(response.content);
      } catch (err) {
        console.error("Erro ao carregar usuários:", err);
      }
    }

    carregarUsuarios();
  }, []);

  async function handleAddUsuario(data: UsuarioFormData) {
    try {
      const oficinaId =
        usuarioLogado.role === "ADMIN"
          ? data.role === "ADMIN"
            ? null
            : (data.oficinaId ?? null)
          : usuarioLogado.oficinaId;

      const novoUsuario = await criarUsuario({
        nome: data.nome,
        documento: data.documento,
        telefone: data.telefone,
        username: data.username,
        password: data.password,
        role: data.role,
        oficinaId,
      });

      setUsuarios((prev) => [...prev, novoUsuario]);
      setIsModalOpen(false);
    } catch (err) {
      console.error("Erro ao criar usuário:", err);
    }
  }

  const columns: Column<Usuario>[] = [
    {
      key: "nome",
      header: "Nome",
      width: "22%",
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
      key: "oficinaNome",
      header: "Oficina",
      width: "20%",
      render: (u) => getOficinaNome(u.oficinaId),
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
        value={usuarios.length.toString()}
        description="Total de usuários"
        icon={Users}
      />

      <SearchBar
        placeholder="Pesquisar por nome, documento, telefone ou oficina"
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
      />

      <EntityTable
        data={usuarios}
        columns={columns}
        actions={actions}
        getRowKey={(u) => u.id}
        searchTerm={searchTerm}
        searchFn={(usuario, term) =>
          usuario.nome.toLowerCase().includes(term) ||
          usuario.documento.includes(term) ||
          usuario.telefone.includes(term) ||
          getOficinaNome(usuario.oficinaId).toLowerCase().includes(term)
        }
        emptyMessage="Nenhum usuário cadastrado"
      />

      {isModalOpen && (
        <EntityForm<UsuarioFormData>
          title="Cadastro de Usuário"
          fields={createUsuarioFields(oficinaOptions, roleOptions)}
          onSubmit={handleAddUsuario}
          onClose={() => setIsModalOpen(false)}
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
