import { useState } from "react";
import {
  Building2,
  Eye,
  Pencil,
  Phone,
  IdCard,
  Power,
  PowerOff,
} from "lucide-react";

import { StatCard } from "../../components/StatCard";
import { HeaderPageWithButton } from "../../components/HeaderPageWithButton";
import { SearchBar } from "../../components/SearchBar";
import { EntityTable } from "../../components/EntityTable";
import { Pagination } from "../../components/Pagination";
import type { Column, EntityAction } from "../../components/EntityTable/types";
import { EntityForm } from "../../components/EntityForm";
import { EntityViewModal } from "../../components/EntityViewModal";
import {
  buscarOficinas,
  criarOficina,
  atualizarOficina,
  ativarOficina,
  desativarOficina,
} from "../../services/oficinaService";

import { useServerSearch } from "../../hooks/useServerSearch";
import type { Oficina } from "../../types/oficina/oficina";
import { formatDocument, formatPhone } from "../../utils/formatters";

import { oficinaFields, type OficinaFormData } from "./oficinasFields";

import "./oficinas.style.css";

export function Oficinas() {
  const {
    items: oficinas,
    searchTerm,
    buscando,
    page,
    totalPages,
    totalElements,
    setPage,
    handleSearch,
    reload,
  } = useServerSearch<Oficina>(buscarOficinas);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingOficina, setEditingOficina] = useState<Oficina | null>(null);
  const [viewingOficina, setViewingOficina] = useState<Oficina | null>(null);
  const [submitError, setSubmitError] = useState("");

  function handleView(id: number) {
    const oficina = oficinas.find((o) => o.id === id);
    if (!oficina) return;
    setViewingOficina(oficina);
  }

  function handleEdit(id: number) {
    const oficina = oficinas.find((o) => o.id === id);
    if (!oficina) return;
    setEditingOficina(oficina);
    setIsModalOpen(true);
  }

  async function handleAddOficina(data: OficinaFormData) {
    try {
      setSubmitError("");
      await criarOficina({
        nome: data.nome,
        cnpj: data.cnpj,
        telefone: data.telefone,
      });

      reload();

      setIsModalOpen(false);
    } catch (err) {
      console.error("Erro ao criar oficina:", err);
      setSubmitError(
        err instanceof Error
          ? err.message
          : "Não foi possível criar a oficina.",
      );
    }
  }

  async function handleUpdateOficina(data: OficinaFormData) {
    if (!editingOficina) return;

    try {
      setSubmitError("");
      await atualizarOficina(editingOficina.id, {
        nome: data.nome,
        cnpj: data.cnpj,
        telefone: data.telefone,
      });

      reload();

      setEditingOficina(null);
      setIsModalOpen(false);
    } catch (err) {
      console.error("Erro ao atualizar oficina:", err);
      setSubmitError(
        err instanceof Error
          ? err.message
          : "Não foi possível atualizar a oficina.",
      );
    }
  }

  async function handleToggleStatus(oficina: Oficina) {
    try {
      if (oficina.ativo) {
        await desativarOficina(oficina.id);
      } else {
        await ativarOficina(oficina.id);
      }

      reload();
    } catch (err) {
      console.error(
        `Erro ao ${oficina.ativo ? "desativar" : "ativar"} oficina:`,
        err,
      );
    }
  }

  const columns: Column<Oficina>[] = [
    {
      key: "nome",
      header: "Nome",
      width: "24%",
      render: (o) => <strong className="oficina-name">{o.nome}</strong>,
    },
    {
      key: "cnpj",
      header: "CNPJ",
      width: "18%",
      render: (o) => formatDocument(o.cnpj).display,
    },
    {
      key: "telefone",
      header: "Telefone",
      width: "18%",
      render: (o) => formatPhone(o.telefone),
    },
    {
      key: "ativo",
      header: "Status",
      width: "14%",
      render: (o) => (
        <span
          className={`status-badge ${
            o.ativo ? "status-active" : "status-inactive"
          }`}
        >
          {o.ativo ? "Ativa" : "Desativada"}
        </span>
      ),
    },
  ];

  const actions: EntityAction<Oficina>[] = [
    {
      label: "Visualizar oficina",
      icon: Eye,
      variant: "view",
      onClick: (o) => handleView(o.id),
    },
    {
      label: "Editar oficina",
      icon: Pencil,
      variant: "edit",
      onClick: (o) => handleEdit(o.id),
    },
    {
      label: "Desativar oficina",
      icon: PowerOff,
      variant: "delete",
      onClick: (o) => handleToggleStatus(o),
      hidden: (o) => !o.ativo,
    },
    {
      label: "Ativar oficina",
      icon: Power,
      variant: "edit",
      onClick: (o) => handleToggleStatus(o),
      hidden: (o) => o.ativo,
    },
  ];

  return (
    <div className="page">
      <HeaderPageWithButton
        title="Oficinas"
        subtitle="Gerencie as oficinas do sistema"
        onButtonClick={() => {
          setEditingOficina(null);
          setIsModalOpen(true);
        }}
        buttonText="Nova Oficina"
      />

      <StatCard
        title="Oficinas Cadastradas"
        value={totalElements.toString()}
        description={buscando ? "Encontradas na busca" : "Total de oficinas"}
        icon={Building2}
      />

      <SearchBar
        placeholder="Pesquisar por nome ou CNPJ"
        searchTerm={searchTerm}
        setSearchTerm={handleSearch}
      />

      <EntityTable
        data={oficinas}
        columns={columns}
        actions={actions}
        getRowKey={(o) => o.id}
        emptyMessage={
          buscando
            ? "Nenhuma oficina encontrada para a busca"
            : "Nenhuma oficina cadastrada"
        }
      />

      <Pagination
        page={page}
        totalPages={totalPages}
        totalElements={totalElements}
        onPageChange={setPage}
      />

      {isModalOpen && (
        <EntityForm<OficinaFormData>
          title={editingOficina ? "Editar Oficina" : "Cadastro de Oficina"}
          fields={oficinaFields}
          submitError={submitError}
          initialValues={
            editingOficina
              ? {
                  nome: editingOficina.nome,
                  cnpj: editingOficina.cnpj,
                  telefone: editingOficina.telefone ?? undefined,
                }
              : undefined
          }
          onSubmit={editingOficina ? handleUpdateOficina : handleAddOficina}
          onClose={() => {
            setEditingOficina(null);
            setIsModalOpen(false);
          }}
        />
      )}

      {viewingOficina && (
        <EntityViewModal
          title={viewingOficina.nome}
          subtitle={formatDocument(viewingOficina.cnpj).display}
          onClose={() => setViewingOficina(null)}
          fields={[
            {
              icon: IdCard,
              label: "CNPJ",
              value: formatDocument(viewingOficina.cnpj).display,
            },
            {
              icon: Phone,
              label: "Telefone",
              value: formatPhone(viewingOficina.telefone),
            },
          ]}
        />
      )}
    </div>
  );
}
