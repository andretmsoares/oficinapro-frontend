import { useState } from "react";
import { Users } from "lucide-react";
import { StatCard } from "../../components/StatCard";
import { HeaderPageWithButton } from "../../components/HeaderPageWithButton";
import { SearchBar } from "../../components/SearchBar";
import { TableCardClient } from "../../components/TableCardClient";
import { type Cliente } from "../../components/TableCardClient/TBodyTableClient/ClientTableRow";
import "./clientes.style.css";
import { ClientForm } from "../../components/ClientForm";

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

  function handleOpenCreateModal() {
    setIsModalOpen(true);
  }

  function handleViewOrders(clienteId: number) {
    console.log("Visualizar Ordens de Serviço do cliente:", clienteId);
  }

  function handleEdit(id: number) {
    console.log("Editar cliente:", id);
  }

  function handleDelete(id: number) {
    if (confirm("Tem certeza que deseja remover este cliente?")) {
      setClientes((prev) => prev.filter((c) => c.id !== id));
    }
  }

  function handleCloseModal() {
    setIsModalOpen(false);
  }
  return (
    <div className="clientes-page">
      <HeaderPageWithButton
        title="Clientes"
        subtitle="Gerencie seus clientes cadastrados"
        onButtonClick={handleOpenCreateModal}
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

      <TableCardClient
        clientes={clientes}
        searchTerm={searchTerm}
        onViewOrders={handleViewOrders}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />

      {isModalOpen && (
        <ClientForm onClose={handleCloseModal} />
      )}
    </div>
  );
}
