import { useState } from "react";
import { Users, NotepadText, Pencil, Phone, Trash2 } from "lucide-react";
import { StatCard } from "../../components/StatCard";
import { HeaderPageWithButton } from "../../components/HeaderPageWithButton";
import { SearchBar } from "../../components/SearchBar";
import { EntityTable } from "../../components/EntityTable";
import type { Column, EntityAction } from "../../components/EntityTable/types";
import { type Cliente } from "../../types/cliente/cliente";
import { EntityForm } from "../../components/EntityForm";
import { clientFields, type ClienteFormData } from "./clientFields";
import { ConfirmDeleteEntity } from "../../components/ConfirmDeleteEntity";
import {
  formatPhone,
  formatDocument,
} from "../../components/EntityForm/formatters";

import "./clientes.style.css";
const MOCK_CLIENTES: Cliente[] = [
  {
    id: 1,
    nome: "Carlos Eduardo Silva",
    cpf: "123.456.789-00",
    telefone: "(83) 98888-1111",
    osCount: 2,
  },
  {
    id: 2,
    nome: "Mariana Souza Santos",
    cpf: "987.654.321-11",
    telefone: "(83) 99999-2222",
    osCount: 1,
  },
  {
    id: 3,
    nome: "Roberto Alves Costa",
    cpf: "456.789.123-22",
    telefone: "(83) 97777-3333",
    osCount: 3,
  },
  {
    id: 4,
    nome: "Fernanda Lima Oliveira",
    cpf: "321.654.987-33",
    telefone: "(83) 96666-4444",
    osCount: 1,
  },
];

export function Clientes() {
  const [clientes, setClientes] = useState<Cliente[]>(MOCK_CLIENTES);
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCliente, setEditingCliente] = useState<Cliente | null>(null);
  const [deletingCliente, setDeletingCliente] = useState<Cliente | null>(null);

  function handleViewOrders(clienteId: number) {
    console.log("Visualizar Ordens de Serviço do cliente:", clienteId);
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

  function handleAddClient(data: ClienteFormData) {
    setClientes((prev) => [
      ...prev,
      { id: prev.length + 1, ...data, osCount: 0 },
    ]);
    setIsModalOpen(false);
  }

  function handleUpdateClient(data: ClienteFormData) {
    if (!editingCliente) return;

    setClientes((prev) =>
      prev.map((cliente) =>
        cliente.id === editingCliente.id
          ? {
              ...cliente,
              ...data,
            }
          : cliente,
      ),
    );

    setEditingCliente(null);
    setIsModalOpen(false);
  }

  function handleConfirmDelete() {
    if (!deletingCliente) return;

    setClientes((prev) =>
      prev.filter((cliente) => cliente.id !== deletingCliente.id),
    );

    setDeletingCliente(null);
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
      width: "28%",
      render: (c) => <strong className="client-name">{c.nome}</strong>,
    },
    {
      key: "cpf",
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
    {
      key: "osCount",
      header: "Ordens de Serviço",
      width: "14%",
      render: (c) => (
        <span className="badge-os">
          {c.osCount}{" "}
          {c.osCount === 1 ? "Ordem de Serviço" : "Ordens de Serviço"}
        </span>
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
    {
      label: "Editar cliente",
      icon: Pencil,
      variant: "edit",
      onClick: (c) => handleEdit(c.id),
    },
    {
      label: "Excluir cliente",
      icon: Trash2,
      variant: "delete",
      onClick: (c) => handleDelete(c.id),
    },
  ];

  return (
    <div className="clientes-page">
      <HeaderPageWithButton
        title="Clientes"
        subtitle="Gerencie seus clientes cadastrados"
        onButtonClick={() => {
          setEditingCliente(null);
          setIsModalOpen(true);
        }}
        buttonText="Novo Cliente"
      />

      <StatCard
        title="Clientes Cadastrados"
        value={clientes.length.toString()}
        description="Total na base de dados"
        icon={Users}
      />

      <SearchBar
        placeholder="Pesquisar clientes (nome, CPF ou telefone)"
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
      />

      <EntityTable
        data={clientes}
        columns={columns}
        actions={actions}
        getRowKey={(c) => c.id}
        searchTerm={searchTerm}
        searchFields={["nome", "cpf", "telefone"]}
        emptyMessage="Nenhum cliente cadastrado"
      />

      {isModalOpen && (
        <EntityForm<ClienteFormData>
          title={editingCliente ? "Editar Cliente" : "Cadastro de Cliente"}
          fields={clientFields}
          initialValues={
            editingCliente
              ? {
                  nome: editingCliente.nome,
                  cpf: editingCliente.cpf,
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
          entityName={deletingCliente.nome}
          onConfirm={handleConfirmDelete}
          onCancel={() => setDeletingCliente(null)}
        />
      )}
    </div>
  );
}
