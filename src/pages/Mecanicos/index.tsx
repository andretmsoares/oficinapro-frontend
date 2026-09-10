import { useState } from "react";
import { EntityTable } from "../../components/EntityTable";
import { HeaderPageWithButton } from "../../components/HeaderPageWithButton";
import { SearchBar } from "../../components/SearchBar";
import { StatCard } from "../../components/StatCard";
import { MOCK_MECANICOS } from "../../mocks/mecanico";
import "./mecanicos.style.css";
import type { Mecanico } from "../../types/mecanico/mecanico";
import { mecanicoFields, type MecanicoFormData } from "./mecanicosFields";
import type { Column, EntityAction } from "../../components/EntityTable/types";
import {
  formatCurrencyDisplay,
  formatDocument,
  formatPhone,
} from "../../services/formatters";
import { Pencil, Phone, Trash2, Wrench } from "lucide-react";
import { EntityForm } from "../../components/EntityForm";
import { ConfirmDeleteEntity } from "../../components/ConfirmDeleteEntity";

export function Mecanicos() {
  const [mecanicos, setMecanicos] = useState<Mecanico[]>(MOCK_MECANICOS);
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMecanico, setEditingMecanico] = useState<Mecanico | null>(null);
  const [deletingMecanico, setDeletingMecanico] = useState<Mecanico | null>(
    null,
  );

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

  function handleAddMecanico(data: MecanicoFormData) {
    setMecanicos((prev) => [
      ...prev,
      { id: prev.length + 1, oficinaId: 1, ...data },
    ]);
    setIsModalOpen(false);
  }

  function handleUpdateClient(data: MecanicoFormData) {
    if (!editingMecanico) return;

    setMecanicos((prev) =>
      prev.map((mecanico) =>
        mecanico.id === editingMecanico.id
          ? {
              ...mecanico,
              ...data,
            }
          : mecanico,
      ),
    );

    setEditingMecanico(null);
    setIsModalOpen(false);
  }

  function handleConfirmDelete() {
    if (!deletingMecanico) return;

    setMecanicos((prev) =>
      prev.filter((mecanico) => mecanico.id !== deletingMecanico.id),
    );

    setDeletingMecanico(null);
  }

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
      />

      {isModalOpen && (
        <EntityForm<MecanicoFormData>
          title={editingMecanico ? "Editar Mecânico" : "Cadastro de Mecânico"}
          fields={mecanicoFields}
          initialValues={
            editingMecanico
              ? {
                  nome: editingMecanico.nome,
                  documento: editingMecanico.documento,
                  telefone: editingMecanico.telefone,
                  salario: editingMecanico.salario,
                  obs: editingMecanico.obs,
                }
              : undefined
          }
          onSubmit={editingMecanico ? handleUpdateClient : handleAddMecanico}
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
