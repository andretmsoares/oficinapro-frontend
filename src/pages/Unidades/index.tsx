import { useState } from "react";
import {
  Building2,
  Eye,
  Pencil,
  Trash2,
  Phone,
  MapPin,
  Hash,
} from "lucide-react";

import { StatCard } from "../../components/StatCard";
import { HeaderPageWithButton } from "../../components/HeaderPageWithButton";
import { SearchBar } from "../../components/SearchBar";
import { EntityTable } from "../../components/EntityTable";
import type { Column, EntityAction } from "../../components/EntityTable/types";
import { EntityForm } from "../../components/EntityForm";
import { ConfirmDeleteEntity } from "../../components/ConfirmDeleteEntity";
import { EntityViewModal } from "../../components/EntityViewModal";

import type { Unidade } from "../../types/unidade/unidade";
import { formatPhone } from "../../services/formatters";

import { unidadeFields, type UnidadeFormData } from "./unidadeFields";
import { MOCK_UNIDADES } from "../../mocks/unidade";

import "./unidades.style.css";

interface UnidadesProps {
  oficinaId: number;
}

export function Unidades({ oficinaId }: UnidadesProps) {
  const [unidades, setUnidades] = useState<Unidade[]>(
    MOCK_UNIDADES.filter((unidade) => unidade.oficinaId === oficinaId),
  );

  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUnidade, setEditingUnidade] = useState<Unidade | null>(null);
  const [viewingUnidade, setViewingUnidade] = useState<Unidade | null>(null);
  const [deletingUnidade, setDeletingUnidade] = useState<Unidade | null>(null);

  function handleView(id: number) {
    const unidade = unidades.find((u) => u.id === id);
    if (!unidade) return;
    setViewingUnidade(unidade);
  }

  function handleEdit(id: number) {
    const unidade = unidades.find((u) => u.id === id);
    if (!unidade) return;
    setEditingUnidade(unidade);
    setIsModalOpen(true);
  }

  function handleDelete(id: number) {
    const unidade = unidades.find((u) => u.id === id);
    if (!unidade) return;
    setDeletingUnidade(unidade);
  }

  function handleConfirmDelete() {
    if (!deletingUnidade) return;
    // TODO: substituir por chamada real ao backend (DELETE /unidades/{id}).
    // Tratar erro de FK (unidade referenciada por outros dados) conforme
    // o padrão de tratamento de erros do projeto quando a API existir.
    setUnidades((prev) => prev.filter((u) => u.id !== deletingUnidade.id));
    setDeletingUnidade(null);
  }

  function handleAddUnidade(data: UnidadeFormData) {
    const novoId =
      unidades.length > 0 ? Math.max(...unidades.map((u) => u.id)) + 1 : 1;
    // TODO: substituir por chamada real ao backend (POST /unidades).
    // A oficina é resolvida pelo backend via contexto de autenticação —
    // aqui só usamos oficinaId da prop porque ainda é mock local.
    // TODO: tratar erro de "Endereço já cadastrado" (unique constraint)
    // retornado pelo backend, conforme padrão de erros do projeto.
    setUnidades((prev) => [...prev, { id: novoId, ...data, oficinaId }]);
    setIsModalOpen(false);
  }

  function handleUpdateUnidade(data: UnidadeFormData) {
    if (!editingUnidade) return;
    // TODO: substituir por chamada real ao backend (PUT /unidades/{id}).
    setUnidades((prev) =>
      prev.map((unidade) =>
        unidade.id === editingUnidade.id ? { ...unidade, ...data } : unidade,
      ),
    );
    setEditingUnidade(null);
    setIsModalOpen(false);
  }

  const columns: Column<Unidade>[] = [
    {
      key: "codigo",
      header: "Código",
      width: "12%",
      render: (unidade) => `#${unidade.id.toString().padStart(4, "0")}`,
    },
    {
      key: "nome",
      header: "Nome",
      width: "25%",
      render: (unidade) => (
        <strong className="unit-name">{unidade.nome}</strong>
      ),
    },
    {
      key: "endereco",
      header: "Endereço",
      width: "27%",
      render: (unidade) => unidade.endereco,
    },
    {
      key: "telefone",
      header: "Telefone",
      width: "18%",
      render: (unidade) => (
        <div className="contact-info">
          <span>
            <Phone size={14} /> {formatPhone(unidade.telefone)}
          </span>
        </div>
      ),
    },
  ];

  const actions: EntityAction<Unidade>[] = [
    {
      label: "Visualizar unidade",
      icon: Eye,
      variant: "view",
      onClick: (u) => handleView(u.id),
    },
    {
      label: "Editar unidade",
      icon: Pencil,
      variant: "edit",
      onClick: (u) => handleEdit(u.id),
    },
    {
      label: "Excluir unidade",
      icon: Trash2,
      variant: "delete",
      onClick: (u) => handleDelete(u.id),
    },
  ];

  return (
    <div className="page">
      <HeaderPageWithButton
        title="Unidades"
        subtitle="Gerencie as unidades da sua oficina"
        onButtonClick={() => {
          setEditingUnidade(null);
          setIsModalOpen(true);
        }}
        buttonText="Nova Unidade"
      />

      <StatCard
        title="Unidades Cadastradas"
        value={unidades.length.toString()}
        description="Total na oficina"
        icon={Building2}
      />

      <SearchBar
        placeholder="Pesquisar unidades (nome, endereço ou telefone)"
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
      />

      <EntityTable
        data={unidades}
        columns={columns}
        actions={actions}
        getRowKey={(u) => u.id}
        searchTerm={searchTerm}
        searchFields={["nome", "endereco", "telefone"]}
        emptyMessage="Nenhuma unidade cadastrada"
      />

      {isModalOpen && (
        <EntityForm<UnidadeFormData>
          title={editingUnidade ? "Editar Unidade" : "Cadastro de Unidade"}
          fields={unidadeFields}
          initialValues={
            editingUnidade
              ? {
                  nome: editingUnidade.nome,
                  endereco: editingUnidade.endereco,
                  telefone: editingUnidade.telefone,
                }
              : undefined
          }
          onSubmit={editingUnidade ? handleUpdateUnidade : handleAddUnidade}
          onClose={() => {
            setEditingUnidade(null);
            setIsModalOpen(false);
          }}
        />
      )}

      {viewingUnidade && (
        <EntityViewModal
          title={viewingUnidade.nome}
          subtitle={`#${viewingUnidade.id.toString().padStart(4, "0")}`}
          onClose={() => setViewingUnidade(null)}
          fields={[
            {
              icon: Hash,
              label: "Código",
              value: `#${viewingUnidade.id.toString().padStart(4, "0")}`,
            },
            { icon: MapPin, label: "Endereço", value: viewingUnidade.endereco },
            {
              icon: Phone,
              label: "Telefone",
              value: formatPhone(viewingUnidade.telefone),
            },
          ]}
        />
      )}

      {deletingUnidade && (
        <ConfirmDeleteEntity
          text="Unidade"
          entity="a unidade"
          entityName={deletingUnidade.nome}
          onConfirm={handleConfirmDelete}
          onCancel={() => setDeletingUnidade(null)}
        />
      )}
    </div>
  );
}
