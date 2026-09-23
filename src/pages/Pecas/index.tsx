import { useEffect, useState } from "react";
import { Link, Link2Off, Package, Pencil, Trash2 } from "lucide-react";

import { ConfirmDeleteEntity } from "../../components/ConfirmDeleteEntity";
import { EntityForm } from "../../components/EntityForm";
import { EntityTable } from "../../components/EntityTable";
import { HeaderPageWithButton } from "../../components/HeaderPageWithButton";
import { SearchBar } from "../../components/SearchBar";
import { StatCard } from "../../components/StatCard";

import type { ItemOsPeca } from "../../types/itemOsPeca/itemOsPeca";
import type { Column, EntityAction } from "../../components/EntityTable/types";

import { formatCurrencyDisplay } from "../../utils/formatters";

import {
  atualizarItemOsPeca,
  criarItemOsPeca,
  deletarItemOsPeca,
  desvincularItemOsPecaOs,
  listarItemOsPecas,
  vincularItemOsPecaOs,
} from "../../services/itemOsPecaService";

import {
  pecasFields,
  type ItemOsPecaFormData,
  vincularItemOsPecaFields,
  type VincularItemOsPecaFormData,
} from "./itemOsPecasFields";

export function Pecas() {
  const [pecas, setPecas] = useState<ItemOsPeca[]>([]);
  const [searchTerm, setSearchTerm] = useState("");

  const [loading, setLoading] = useState(false);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPeca, setEditingPeca] = useState<ItemOsPeca | null>(null);

  const [deletingPeca, setDeletingPeca] = useState<ItemOsPeca | null>(null);

  const [submitError, setSubmitError] = useState("");

  const [linkingPeca, setLinkingPeca] = useState<ItemOsPeca | null>(null);
  const [unlinkingPeca, setUnlinkingPeca] = useState<ItemOsPeca | null>(null);

  function handleNovaPeca() {
    setEditingPeca(null);
    setSubmitError("");
    setIsModalOpen(true);
  }

  function handleEdit(id: number) {
    const peca = pecas.find((item) => item.id === id);

    if (!peca) return;

    setSubmitError("");
    setEditingPeca(peca);
    setIsModalOpen(true);
  }

  function handleDelete(id: number) {
    const peca = pecas.find((item) => item.id === id);

    if (!peca) return;

    setDeletingPeca(peca);
  }

  function handleVincular(peca: ItemOsPeca) {
    if (peca.osId !== null && peca.osId !== undefined) {
      window.alert("Atenção: Peça já está vinculada a uma OS");
      return;
    }

    setSubmitError("");
    setLinkingPeca(peca);
  }

  function handleDesvincular(peca: ItemOsPeca) {
    if (peca.osId == null || peca.osId == undefined) {
      window.alert("Atenção: Peça não está vinculada a alguma OS");
      return;
    }
    setUnlinkingPeca(peca);
  }

  async function handleAddPeca(data: ItemOsPecaFormData) {
    try {
      setSubmitError("");

      await criarItemOsPeca({
        nome: data.nome,
        quantidade: data.quantidade,
        valorUnitario: data.valorUnitario,
        osId: data.osId ?? null,
      });

      setIsModalOpen(false);

      await carregarItemOsPecas();
    } catch (error) {
      console.error("Erro ao criar peça:", error);

      setSubmitError(
        error instanceof Error
          ? error.message
          : "Não foi possível criar a peça.",
      );
    }
  }

  async function handleUpdatePeca(data: ItemOsPecaFormData) {
    if (!editingPeca) return;

    try {
      setSubmitError("");

      await atualizarItemOsPeca(editingPeca.id, {
        nome: data.nome,
        quantidade: data.quantidade,
        valorUnitario: data.valorUnitario,
      });

      setEditingPeca(null);
      setIsModalOpen(false);

      await carregarItemOsPecas();
    } catch (error) {
      console.error("Erro ao atualizar peça:", error);

      setSubmitError(
        error instanceof Error
          ? error.message
          : "Não foi possível atualizar a peça.",
      );
    }
  }

  async function handleConfirmDelete() {
    if (!deletingPeca) return;

    try {
      setSubmitError("");

      await deletarItemOsPeca(deletingPeca.id);

      setDeletingPeca(null);

      await carregarItemOsPecas();
    } catch (error) {
      console.error("Erro ao excluir peça:", error);

      setSubmitError(
        error instanceof Error
          ? error.message
          : "Não foi possível deletar a peça.",
      );
    }
  }

  async function handleConfirmVincular(data: VincularItemOsPecaFormData) {
    if (!linkingPeca) return;

    try {
      setSubmitError("");

      await vincularItemOsPecaOs(linkingPeca.id, data.osId);

      setLinkingPeca(null);

      await carregarItemOsPecas();
    } catch (error) {
      console.error("Erro ao vincular peça:", error);

      setSubmitError(
        error instanceof Error
          ? error.message
          : "Não foi possível vincular a peça à OS.",
      );
    }
  }

  async function handleConfirmDesvincular() {
    if (!unlinkingPeca) return;

    try {
      setSubmitError("");

      await desvincularItemOsPecaOs(unlinkingPeca.id);

      setUnlinkingPeca(null);

      await carregarItemOsPecas();
    } catch (error) {
      console.error("Erro ao desvincular peça:", error);

      setSubmitError(
        error instanceof Error
          ? error.message
          : "Não foi possível desvincular a peça da OS.",
      );
    }
  }

  async function carregarItemOsPecas() {
    try {
      setLoading(true);
      const data = await listarItemOsPecas();
      setPecas(data);
    } catch (error) {
      console.error("Erro ao carregar peças:", error);
      setPecas([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    let ativo = true;

    async function carregarInicialmente() {
      try {
        setLoading(true);

        const data = await listarItemOsPecas();

        if (ativo) {
          setPecas(data);
        }
      } catch (error) {
        console.error("Erro ao carregar peças:", error);

        if (ativo) {
          setPecas([]);
        }
      } finally {
        if (ativo) {
          setLoading(false);
        }
      }
    }

    void carregarInicialmente();

    return () => {
      ativo = false;
    };
  }, []);

  const columns: Column<ItemOsPeca>[] = [
    {
      key: "codigo",
      header: "Código",
      width: "10%",
      render: (peca) => `#${peca.id.toString().padStart(4, "0")}`,
    },
    {
      key: "nome",
      header: "Nome",
      width: "25%",
      render: (peca) => <strong>{peca.nome}</strong>,
    },
    {
      key: "quantidade",
      header: "Quantidade",
      width: "10%",
    },
    {
      key: "valorUnitario",
      header: "Valor Unitário",
      width: "15%",
      render: (peca) => (
        <div className="contact-info">
          <span>{formatCurrencyDisplay(peca.valorUnitario)}</span>
        </div>
      ),
    },
    {
      key: "valorTotal",
      header: "Valor Total",
      width: "15%",
      render: (peca) => (
        <div className="contact-info">
          <span>{formatCurrencyDisplay(peca.valorTotal)}</span>
        </div>
      ),
    },
    {
      key: "osId",
      header: "OS",
      width: "10%",
      render: (peca) => (peca.osId ? `#${peca.osId}` : "Não vinculada"),
    },
  ];

  const actions: EntityAction<ItemOsPeca>[] = [
    {
      label: "Vincular à Ordem de Serviço",
      icon: Link,
      variant: "upOs",
      onClick: handleVincular,
    },
    {
      label: "Desvincular da Ordem de Serviço",
      icon: Link2Off,
      variant: "delete",
      onClick: handleDesvincular,
    },
    {
      label: "Editar peça",
      icon: Pencil,
      variant: "edit",
      onClick: (peca) => handleEdit(peca.id),
    },
    {
      label: "Excluir peça",
      icon: Trash2,
      variant: "delete",
      onClick: (peca) => handleDelete(peca.id),
    },
  ];

  return (
    <div className="page">
      <HeaderPageWithButton
        title="Peças"
        subtitle="Gerencie as peças das ordens de serviço"
        onButtonClick={handleNovaPeca}
        buttonText="Nova Peça"
      />

      <StatCard
        title="Peças Cadastradas"
        value={pecas.length.toString()}
        description="Total de peças da oficina"
        icon={Package}
      />

      <SearchBar
        placeholder="Pesquisar por nome ou ID da OS"
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
      />

      <EntityTable
        data={pecas}
        columns={columns}
        actions={actions}
        getRowKey={(peca) => peca.id}
        searchTerm={searchTerm}
        searchFields={["nome"]}
        searchFn={(peca, term) =>
          peca.nome.toLowerCase().includes(term) ||
          String(peca.osId ?? "").includes(term)
        }
        loading={loading}
        emptyMessage="Nenhuma peça cadastrada"
      />

      {isModalOpen && (
        <EntityForm<ItemOsPecaFormData>
          title={editingPeca ? "Editar Peça" : "Cadastro de Peça"}
          fields={
            editingPeca
              ? pecasFields.filter((field) => field.name !== "osId")
              : pecasFields
          }
          submitError={submitError}
          initialValues={
            editingPeca
              ? {
                  nome: editingPeca.nome,
                  quantidade: editingPeca.quantidade,
                  valorUnitario: editingPeca.valorUnitario,
                }
              : undefined
          }
          onSubmit={editingPeca ? handleUpdatePeca : handleAddPeca}
          onClose={() => {
            setEditingPeca(null);
            setSubmitError("");
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

      {linkingPeca && (
        <EntityForm<VincularItemOsPecaFormData>
          title="Vincular Peça à Ordem de Serviço"
          fields={vincularItemOsPecaFields}
          submitError={submitError}
          onSubmit={handleConfirmVincular}
          onClose={() => {
            setLinkingPeca(null);
            setSubmitError("");
          }}
        />
      )}

      {unlinkingPeca && (
        <ConfirmDeleteEntity
          text="Desvincular peça"
          entity="a peça"
          entityName={unlinkingPeca.nome}
          title="Desvincular Peça"
          icon={Link2Off}
          message={
            <>
              Tem certeza que deseja desvincular a peça{" "}
              <strong>{unlinkingPeca.nome}</strong> da Ordem de Serviço{" "}
              <strong>#{unlinkingPeca.osId}</strong>?
            </>
          }
          confirmText="Desvincular"
          onConfirm={handleConfirmDesvincular}
          onCancel={() => setUnlinkingPeca(null)}
        />
      )}
    </div>
  );
}
