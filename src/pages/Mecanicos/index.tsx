import { useState, useEffect } from "react";
import { EntityTable } from "../../components/EntityTable";
import { HeaderPageWithButton } from "../../components/HeaderPageWithButton";
import { SearchBar } from "../../components/SearchBar";
import { StatCard } from "../../components/StatCard";
import {
  atualizarMecanico,
  criarMecanico,
  deletarMecanico,
  listarMecanicos,
} from "../../services/mecanico/mecanicoService";
import "./mecanicos.style.css";
import type { Mecanico } from "../../types/mecanico/mecanico";
import { mecanicoFields, type MecanicoFormData } from "./mecanicosFields";
import type { Column, EntityAction } from "../../components/EntityTable/types";
import {
  formatCurrencyDisplay,
  formatDocument,
  formatPhone,
} from "../../utils/formatters";
import { Pencil, Phone, Trash2, Wrench } from "lucide-react";
import { EntityForm } from "../../components/EntityForm";
import { ConfirmDeleteEntity } from "../../components/ConfirmDeleteEntity";

export function Mecanicos() {
  const [mecanicos, setMecanicos] = useState<Mecanico[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMecanico, setEditingMecanico] = useState<Mecanico | null>(null);
  const [deletingMecanico, setDeletingMecanico] = useState<Mecanico | null>(
    null,
  );
  const [submitError, setSubmitError] = useState("");

  function handleEdit(id: number) {
    const mecanico = mecanicos.find((c) => c.id === id);

    if (!mecanico) return;

    setEditingMecanico(mecanico);
    setIsModalOpen(true);
  }

  function handleDelete(id: number) {
    const mecanico = mecanicos.find((c) => c.id === id);

    if (!mecanico) return;

    setDeletingMecanico(mecanico);
  }

  async function handleAddMecanico(data: MecanicoFormData) {
    try {
      setSubmitError("");
      const mecanico = await criarMecanico({
        ...data,
      });

      setMecanicos((prev) => [...prev, mecanico]);
      setIsModalOpen(false);
    } catch (error) {
      console.error("Erro ao criar mecânico:", error);
      setSubmitError(
        error instanceof Error
          ? error.message
          : "Não foi possível criar o mecânico.",
      );
    }
  }

  async function handleUpdateMecanico(data: MecanicoFormData) {
    if (!editingMecanico) return;

    try {
      setSubmitError("");
      const mecanicoAtualizado = await atualizarMecanico(editingMecanico.id, {
        ...data,
      });

      setMecanicos((prev) =>
        prev.map((mecanico) =>
          mecanico.id === mecanicoAtualizado.id ? mecanicoAtualizado : mecanico,
        ),
      );

      setEditingMecanico(null);
      setIsModalOpen(false);
    } catch (error) {
      console.error("Erro ao atualizar mecânico:", error);
      setSubmitError(
        error instanceof Error
          ? error.message
          : "Não foi possível atualizar o mecânico.",
      );
    }
  }

  async function handleConfirmDelete() {
    if (!deletingMecanico) return;

    try {
      setSubmitError("");
      await deletarMecanico(deletingMecanico.id);

      setMecanicos((prev) =>
        prev.filter((mecanico) => mecanico.id !== deletingMecanico.id),
      );

      setDeletingMecanico(null);
    } catch (error) {
      console.error("Erro ao excluir mecânico:", error);
      setSubmitError(
        error instanceof Error
          ? error.message
          : "Não foi possível deletar o mecânico.",
      );
    }
  }

  useEffect(() => {
    async function carregarMecanicos() {
      try {
        const response = await listarMecanicos();

        setMecanicos(response.content);
      } catch (error) {
        console.error("Erro ao carregar mecânicos:", error);
      } finally {
        setLoading(false);
      }
    }

    carregarMecanicos();
  }, []);

  const columns: Column<Mecanico>[] = [
    {
      key: "codigo",
      header: "Código",
      width: "12%",
      render: (c) => `#${c.id.toString().padStart(4, "0")}`,
    },
    {
      key: "nome",
      header: "Nome",
      width: "28%",
      render: (c) => <strong>{c.nome}</strong>,
    },
    {
      key: "documento",
      header: "CPF",
      width: "18%",
      format: (value) => (value ? formatDocument(String(value)).display : ""),
    },
    {
      key: "telefone",
      header: "Telefone",
      width: "16%",
      render: (c) => (
        <div className="contact-info">
          <span>
            <Phone size={14} />
            {formatPhone(c.telefone)}
          </span>
        </div>
      ),
    },
    {
      key: "salario",
      header: "Salário",
      width: "12%",
      render: (c) => (
        <div className="contact-info">
          <span>{formatCurrencyDisplay(c.salario)}</span>
        </div>
      ),
    },
  ];

  const actions: EntityAction<Mecanico>[] = [
    {
      label: "Editar mecanico",
      icon: Pencil,
      variant: "edit",
      onClick: (c) => handleEdit(c.id),
    },
    {
      label: "Excluir mecanico",
      icon: Trash2,
      variant: "delete",
      onClick: (c) => handleDelete(c.id),
    },
  ];
  return (
    <div className="page">
      <HeaderPageWithButton
        title="Mecânicos"
        subtitle="Gerencie seus mecânicos cadastrados"
        onButtonClick={() => {
          setEditingMecanico(null);
          setIsModalOpen(true);
        }}
        buttonText="Novo Mecânico"
      />

      <StatCard
        title="Mecânicos Cadastrados"
        value={mecanicos.length.toString()}
        description="Total na base de dados"
        icon={Wrench}
      />

      <SearchBar
        placeholder="Pesquisar Mecânicos (nome, CPF ou telefone)"
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
      />

      <EntityTable
        data={mecanicos}
        columns={columns}
        actions={actions}
        getRowKey={(c) => c.id}
        searchTerm={searchTerm}
        searchFields={["nome", "documento", "telefone"]}
        emptyMessage="Nenhum mecanico cadastrado"
        loading={loading}
      />

      {isModalOpen && (
        <EntityForm<MecanicoFormData>
          title={editingMecanico ? "Editar Mecânico" : "Cadastro de Mecânico"}
          fields={mecanicoFields}
          submitError={submitError}
          initialValues={
            editingMecanico
              ? {
                  nome: editingMecanico.nome,
                  documento: editingMecanico.documento ?? undefined,
                  telefone: editingMecanico.telefone ?? undefined,
                  salario: editingMecanico.salario ?? undefined,
                  obs: editingMecanico.obs ?? undefined,
                }
              : undefined
          }
          onSubmit={editingMecanico ? handleUpdateMecanico : handleAddMecanico}
          onClose={() => {
            setEditingMecanico(null);
            setIsModalOpen(false);
          }}
        />
      )}

      {deletingMecanico && (
        <ConfirmDeleteEntity
          text="Mecânico"
          entity="o mecânico"
          entityName={deletingMecanico.nome}
          onConfirm={handleConfirmDelete}
          onCancel={() => setDeletingMecanico(null)}
        />
      )}
    </div>
  );
}
