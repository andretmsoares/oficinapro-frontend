import { useState } from "react";
import {
  Users,
  Search,
  Plus,
  Pencil,
  Trash2,
  Phone,
  Mail,
  NotepadText,
} from "lucide-react";
import { StatCard } from "../../components/StatCard"; // Reaproveitando seu card de estatística
import "./clientes.style.css";
import { HeaderPage } from "../../components/HeaderPage";
import { HeaderPageWithButton } from "../../components/HeaderPageWithButton/indes";

interface Cliente {
  id: number;
  nome: string;
  cpf: string;
  telefone: string;
  osCount: number;
}

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

  const clientesFiltrados = clientes.filter((cliente) => {
    const termo = searchTerm.toLowerCase();
    return (
      cliente.nome.toLowerCase().includes(termo) ||
      cliente.cpf.includes(termo) ||
      cliente.telefone.includes(termo)
    );
  });

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

  function handleOpenCreateModal() {
    console.log("Abrir modal de novo cliente");
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

      {/* Barra de Busca */}
      <section className="search-bar-container">
        <div className="search-input-wrapper">
          <Search size={18} className="search-icon" />
          <input
            type="text"
            placeholder="Buscar cliente por nome, CPF ou telefone..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </section>

      <section className="table-card">
        <div className="table-wrapper">
          <table className="clientes-table">
            <thead>
              <tr>
                <th>Código</th>
                <th>Nome</th>
                <th>CPF</th>
                <th>Contato</th>
                <th>Veículos</th>
                <th className="actions-header">Ações</th>
              </tr>
            </thead>
            <tbody>
              {clientesFiltrados.map((cliente) => (
                <tr key={cliente.id}>
                  <td>#{cliente.id.toString().padStart(4, "0")}</td>
                  <td>
                    <strong className="client-name">{cliente.nome}</strong>
                  </td>
                  <td>{cliente.cpf}</td>
                  <td>
                    <div className="contact-info">
                      <span>
                        <Phone size={14} /> {cliente.telefone}
                      </span>
                      <small>
                        <Mail size={12} /> {cliente.email}
                      </small>
                    </div>
                  </td>
                  <td>
                    <span className="badge">
                      {cliente.osCount}{" "}
                      {cliente.osCount === 1
                        ? "Ordem de Serviço"
                        : "Ordens de Serviço"}
                    </span>
                  </td>
                  <td className="actions-cell">
                    <button
                      className="btn-icon view"
                      title="Visualizar Ordens de Serviço"
                      onClick={() => handleViewOrders(cliente.id)}
                    >
                      <NotepadText size={16} />
                    </button>
                    <button
                      className="btn-icon edit"
                      title="Editar cliente"
                      onClick={() => handleEdit(cliente.id)}
                    >
                      <Pencil size={16} />
                    </button>
                    <button
                      className="btn-icon delete"
                      title="Excluir cliente"
                      onClick={() => handleDelete(cliente.id)}
                    >
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
