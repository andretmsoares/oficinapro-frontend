import { useState } from "react";
import { Users, NotepadText, Pencil, Phone, Trash2 } from "lucide-react";
import { StatCard } from "../../components/StatCard";
import { HeaderPageWithButton } from "../../components/HeaderPageWithButton";
import { SearchBar } from "../../components/SearchBar";
import { EntityTable } from "../../components/EntityTable";
import { Pagination } from "../../components/Pagination";
import type { Column, EntityAction } from "../../components/EntityTable/types";
import { type Cliente } from "../../types/cliente/cliente";
import { EntityForm } from "../../components/EntityForm";
import { clientFields, type ClienteFormData } from "./clientFields";
import { ConfirmDeleteEntity } from "../../components/ConfirmDeleteEntity";
import { formatPhone, formatDocument } from "../../utils/formatters";

import "./clientes.style.css";
import { type Usuario } from "../../types/usuario/usuario";
import { HeaderPage } from "../../components/HeaderPage";
import {
  atualizarCliente,
  buscarClientesPaginado,
  criarCliente,
  deletarCliente,
} from "../../services/clienteService";
import { useServerSearch } from "../../hooks/useServerSearch";
import { useNavigate } from "react-router-dom";

interface ClientesProps {
  usuarioLogado: Usuario;
}

export function Clientes({ usuarioLogado }: ClientesProps) {
  const isGerente = usuarioLogado.role === "GERENTE";
  const {
    items: clientes,
    loading,
    searchTerm,
    buscando,
    page,
    totalPages,
    totalElements,
    setPage,
    handleSearch,
    reload: recarregar,
  } = useServerSearch<Cliente>(buscarClientesPaginado);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCliente, setEditingCliente] = useState<Cliente | null>(null);
  const [deletingCliente, setDeletingCliente] = useState<Cliente | null>(null);
  const [submitError, setSubmitError] = useState("");
  const navigate = useNavigate();

  function handleViewOrders(clienteId: number) {
    const cliente = clientes.find((c) => c.id === clienteId);

    if (!cliente) {
      return;
    }

    const busca = cliente.nome.trim();

    navigate(`/ordens-servico?cliente=${encodeURIComponent(busca)}`);
  }

  function handleEdit(id: number) {
    const cliente = clientes.find((c) => c.id === id);

    if (!cliente) return;

    setEditingCliente(cliente);
    setIsModalOpen(true);
  }

  function handleDelete(id: number) {
    const cliente = clientes.find((c) => c.id === id);

    if (!cliente) return;

    setDeletingCliente(cliente);
  }

  async function handleAddClient(data: ClienteFormData) {
    try {
      setSubmitError("");
      await criarCliente({
        ...data,
      });
      recarregar();
      setIsModalOpen(false);
    } catch (err) {
      console.error("Erro ao criar cliente:", err);
      setSubmitError(
        err instanceof Error
          ? err.message
          : "Não foi possível criar o cliente.",
      );
    }
  }

  async function handleUpdateClient(data: ClienteFormData) {
    if (!editingCliente) return;

    try {
      setSubmitError("");
      await atualizarCliente(editingCliente.id, {
        ...data,
      });

      recarregar();
      setEditingCliente(null);
      setIsModalOpen(false);
    } catch (err) {
      console.error("Erro ao atualizar cliente:", err);
      setSubmitError(
        err instanceof Error
          ? err.message
          : "Não foi possível atualizar o cliente.",
      );
    }
  }

  async function handleConfirmDelete() {
    if (!deletingCliente) return;

    try {
      setSubmitError("");
      await deletarCliente(deletingCliente.id);
      recarregar();
      setDeletingCliente(null);
    } catch (err) {
      console.error("Erro ao deletar cliente:", err);
      setSubmitError(
        err instanceof Error
          ? err.message
          : "Não foi possível deletar o cliente.",
      );
    }
  }

  const columns: Column<Cliente>[] = [
    {
      key: "codigo",
      header: "Código",
      width: "12%",
      render: (c) => `#${c.id.toString().padStart(4, "0")}`,
    },
    {
      key: "nome",
      header: "Nome",
      width: "40%",
      render: (c) => <strong className="client-name">{c.nome}</strong>,
    },
    {
      key: "documento",
      header: "CPF/CNPJ",
      width: "18%",
      format: (value) => (value ? formatDocument(String(value)).display : ""),
    },
    {
      key: "telefone",
      header: "Telefone",
      width: "18%",
      render: (c) => (
        <div className="contact-info">
          <span>
            <Phone size={14} />
            {formatPhone(c.telefone)}
          </span>
        </div>
      ),
    },
  ];

  const actions: EntityAction<Cliente>[] = [
    {
      label: "Visualizar Ordens de Serviço",
      icon: NotepadText,
      variant: "view",
      onClick: (c) => handleViewOrders(c.id),
    },
    ...(isGerente
      ? [
          {
            label: "Editar cliente",
            icon: Pencil,
            variant: "edit" as const,
            onClick: (c: Cliente) => handleEdit(c.id),
          },
          {
            label: "Excluir cliente",
            icon: Trash2,
            variant: "delete" as const,
            onClick: (c: Cliente) => handleDelete(c.id),
          },
        ]
      : []),
  ];

  return (
    <div className="page">
      {isGerente ? (
        <HeaderPageWithButton
          title="Clientes"
          subtitle="Gerencie seus clientes cadastrados"
          onButtonClick={() => {
            setEditingCliente(null);
            setIsModalOpen(true);
          }}
          buttonText="Novo Cliente"
        />
      ) : (
        <HeaderPage
          title="Clientes"
          subtitle="Consulte os clientes cadastrados"
        />
      )}

      <StatCard
        title="Clientes Cadastrados"
        value={totalElements.toString()}
        description={
          buscando ? "Encontrados na busca" : "Total na base de dados"
        }
        icon={Users}
      />

      <SearchBar
        placeholder="Pesquisar clientes (nome, CPF ou telefone)"
        searchTerm={searchTerm}
        setSearchTerm={handleSearch}
      />

      <EntityTable
        data={clientes}
        columns={columns}
        actions={actions}
        loading={loading}
        getRowKey={(c) => c.id}
        emptyMessage={
          buscando
            ? "Nenhum cliente encontrado para a busca"
            : "Nenhum cliente cadastrado"
        }
      />

      <Pagination
        page={page}
        totalPages={totalPages}
        totalElements={totalElements}
        onPageChange={setPage}
      />

      {isModalOpen && (
        <EntityForm<ClienteFormData>
          title={editingCliente ? "Editar Cliente" : "Cadastro de Cliente"}
          fields={clientFields}
          submitError={submitError}
          initialValues={
            editingCliente
              ? {
                  nome: editingCliente.nome,
                  documento: editingCliente.documento,
                  telefone: editingCliente.telefone,
                }
              : undefined
          }
          onSubmit={editingCliente ? handleUpdateClient : handleAddClient}
          onClose={() => {
            setEditingCliente(null);
            setIsModalOpen(false);
          }}
        />
      )}

      {deletingCliente && (
        <ConfirmDeleteEntity
          text="Cliente"
          entity="o cliente"
          entityName={deletingCliente.nome}
          onConfirm={handleConfirmDelete}
          onCancel={() => setDeletingCliente(null)}
        />
      )}
    </div>
  );
}
