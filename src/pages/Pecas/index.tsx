import { useState } from "react";
import { ConfirmDeleteEntity } from "../../components/ConfirmDeleteEntity";
import { EntityForm } from "../../components/EntityForm";
import { EntityTable } from "../../components/EntityTable";
import { HeaderPageWithButton } from "../../components/HeaderPageWithButton";
import { SearchBar } from "../../components/SearchBar";
import { StatCard } from "../../components/StatCard";
import { MOCK_PECAS } from "../../mocks/pecas";
import type { PecaOrdemServico } from "../../types/pecas/pecas";
import { pecasFields, type PecaFormData } from "./pecasFields";
import type { Column, EntityAction } from "../../components/EntityTable/types";
import { formatCurrencyDisplay } from "../../services/formatters";
import { NotepadText, Package, Pencil, Trash2 } from "lucide-react";

export function Pecas() {
  const [pecas, setPecas] = useState<PecaOrdemServico[]>(MOCK_PECAS);
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPeca, setEditingPeca] = useState<PecaOrdemServico | null>(null);
  const [deletingPeca, setDeletingPeca] = useState<PecaOrdemServico | null>(
    null,
  );
  //const [isModalUpOs, setIsModalUpOs] = useState(false);

  function handleUpOs(id: number) {
    console.log({ id });
  }

  function handleEdit(id: number) {
    const peca = pecas.find((c) => c.id === id);

    if (!peca) return;

    setEditingPeca(peca);
    setIsModalOpen(true);
  }

  function handleDelete(id: number) {
    const peca = pecas.find((c) => c.id === id);

    if (!peca) return;

    setDeletingPeca(peca);
  }

  function handleAddMecanico(data: PecaFormData) {
    const valorTotal = data.quantidade * data.valorUnitario;
    setPecas((prev) => [
      ...prev,
      { id: prev.length + 1, oficinaId: 1, ...data, valorTotal },
    ]);
    setIsModalOpen(false);
  }

  function handleUpdateClient(data: PecaFormData) {
    if (!editingPeca) return;

    setPecas((prev) =>
      prev.map((peca) =>
        peca.id === editingPeca.id
          ? {
              ...peca,
              ...data,
            }
          : peca,
      ),
    );

    setEditingPeca(null);
    setIsModalOpen(false);
  }

  function handleConfirmDelete() {
    if (!deletingPeca) return;

    setPecas((prev) => prev.filter((peca) => peca.id !== deletingPeca.id));

    setDeletingPeca(null);
  }

  const columns: Column<PecaOrdemServico>[] = [
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
      key: "quantidade",
      header: "Quantidade",
      width: "18%",
    },
    {
      key: "valorUnitario",
      header: "Valor Unitário",
      width: "12%",
      render: (c) => (
        <div className="contact-info">
          <span>{formatCurrencyDisplay(c.valorUnitario)}</span>
        </div>
      ),
    },
    {
      key: "valorTotal",
      header: "Valor Total",
      width: "12%",
      render: (c) => (
        <div className="contact-info">
          <span>{formatCurrencyDisplay(c.quantidade * c.valorUnitario)}</span>
        </div>
      ),
    },
  ];

  const actions: EntityAction<PecaOrdemServico>[] = [
    {
      label: "Relacionar a Ordem de Serviço",
      icon: NotepadText,
      variant: "upOs",
      onClick: (c) => handleUpOs(c.id),
    },
    {
      label: "Editar peça",
      icon: Pencil,
      variant: "edit",
      onClick: (c) => handleEdit(c.id),
    },
    {
      label: "Excluir peça",
      icon: Trash2,
      variant: "delete",
      onClick: (c) => handleDelete(c.id),
    },
  ];
  return (
    <div className="page">
      <HeaderPageWithButton
        title="Peças"
        subtitle="Gerencie suas Peças cadastrados"
        onButtonClick={() => {
          setEditingPeca(null);
          setIsModalOpen(true);
        }}
        buttonText="Nova Peça"
      />

      <StatCard
        title="Peças Cadastrados"
        value={pecas.length.toString()}
        description="Total na base de dados"
        icon={Package}
      />

      <SearchBar
        placeholder="Pesquisar Peças"
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
      />

      <EntityTable
        data={pecas}
        columns={columns}
        actions={actions}
        getRowKey={(c) => c.id}
        searchTerm={searchTerm}
        searchFields={["nome"]}
        emptyMessage="Nenhuma peça cadastrado"
      />

      {isModalOpen && (
        <EntityForm<PecaFormData>
          title={editingPeca ? "Editar Peças" : "Cadastro de Peça"}
          fields={pecasFields}
          initialValues={
            editingPeca
              ? {
                  nome: editingPeca.nome,
                  quantidade: editingPeca.quantidade,
                  valorUnitario: editingPeca.valorUnitario,
                }
              : undefined
          }
          onSubmit={editingPeca ? handleUpdateClient : handleAddMecanico}
          onClose={() => {
            setEditingPeca(null);
            setIsModalOpen(false);
          }}
        />
      )}

      {deletingPeca && (
        <ConfirmDeleteEntity
          text="Peça"
          entity="a peça"
          entityName={deletingPeca.nome}
          onConfirm={handleConfirmDelete}
          onCancel={() => setDeletingPeca(null)}
        />
      )}
    </div>
  );
}
