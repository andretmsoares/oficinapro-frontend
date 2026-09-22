import { useState, useEffect } from "react";
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
import { formatPhone } from "../../utils/formatters";

import { unidadeFields, type UnidadeFormData } from "./unidadeFields";

import "./unidades.style.css";
import {
  atualizarUnidade,
  criarUnidade,
  deletarUnidade,
  listarUnidades,
} from "../../services/unidade/unidadeService";

interface UnidadesProps {
  oficinaId: number;
}

export function Unidades({ oficinaId }: UnidadesProps) {
  const [unidades, setUnidades] = useState<Unidade[]>([]);
  const [loading, setLoading] = useState(true);

  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUnidade, setEditingUnidade] = useState<Unidade | null>(null);
  const [viewingUnidade, setViewingUnidade] = useState<Unidade | null>(null);
  const [deletingUnidade, setDeletingUnidade] = useState<Unidade | null>(null);
  const [submitError, setSubmitError] = useState("");

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

  async function handleConfirmDelete() {
    if (!deletingUnidade) return;

    try {
      setSubmitError("");
      await deletarUnidade(deletingUnidade.id);

      setUnidades((prev) => prev.filter((u) => u.id !== deletingUnidade.id));

      setDeletingUnidade(null);
    } catch (error) {
      console.error("Erro ao excluir unidade:", error);
      setSubmitError(
        error instanceof Error
          ? error.message
          : "Não foi possível deletar a unidade.",
      );
    }
  }

  async function handleAddUnidade(data: UnidadeFormData) {
    try {
      setSubmitError("");
      const unidade = await criarUnidade(oficinaId, data);

      setUnidades((prev) => [...prev, unidade]);
      setIsModalOpen(false);
    } catch (error) {
      console.error("Erro ao cadastrar unidade:", error);
      setSubmitError(
        error instanceof Error
          ? error.message
          : "Não foi possível criar a Unidade.",
      );
    }
  }

  async function handleUpdateUnidade(data: UnidadeFormData) {
    if (!editingUnidade) return;

    try {
      setSubmitError("");
      const unidadeAtualizada = await atualizarUnidade(editingUnidade.id, data);

      setUnidades((prev) =>
        prev.map((unidade) =>
          unidade.id === unidadeAtualizada.id ? unidadeAtualizada : unidade,
        ),
      );

      setEditingUnidade(null);
      setIsModalOpen(false);
    } catch (error) {
      console.error("Erro ao atualizar unidade:", error);
      setSubmitError(
        error instanceof Error
          ? error.message
          : "Não foi possível atualizar a unidade.",
      );
    }
  }

  useEffect(() => {
    async function carregar() {
      try {
        setLoading(true);

        const data = await listarUnidades();

        setUnidades(data);
      } catch (error) {
        console.error("Erro ao carregar unidades:", error);
      } finally {
        setLoading(false);
      }
    }

    carregar();
  }, []);

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
        loading={loading}
        getRowKey={(u) => u.id}
        searchTerm={searchTerm}
        searchFields={["nome", "endereco", "telefone"]}
        emptyMessage="Nenhuma unidade cadastrada"
      />

      {isModalOpen && (
        <EntityForm<UnidadeFormData>
          title={editingUnidade ? "Editar Unidade" : "Cadastro de Unidade"}
          fields={unidadeFields}
          submitError={submitError}
          initialValues={
            editingUnidade
              ? {
                  nome: editingUnidade.nome,
                  endereco: editingUnidade.endereco,
                  telefone: editingUnidade.telefone ?? undefined,
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
