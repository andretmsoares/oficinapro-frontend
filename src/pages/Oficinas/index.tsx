import { useState } from "react";
import {
  Building2,
  Eye,
  Pencil,
  Trash2,
  Users,
  Car,
  ClipboardList,
  Phone,
  IdCard,
} from "lucide-react";

import { StatCard } from "../../components/StatCard";
import { HeaderPageWithButton } from "../../components/HeaderPageWithButton";
import { SearchBar } from "../../components/SearchBar";
import { EntityTable } from "../../components/EntityTable";
import type { Column, EntityAction } from "../../components/EntityTable/types";
import { EntityForm } from "../../components/EntityForm";
import { ConfirmDeleteEntity } from "../../components/ConfirmDeleteEntity";
import { EntityViewModal } from "../../components/EntityViewModal";

import type { Oficina } from "../../types/oficina/oficina";
import { formatDocument, formatPhone } from "../../utils/formatters";

import { oficinaFields, type OficinaFormData } from "./oficinasFields";
import { MOCK_OFICINAS } from "../../mocks/oficina";

import "./oficinas.style.css";

export function Oficinas() {
  const [oficinas, setOficinas] = useState<Oficina[]>(MOCK_OFICINAS);
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingOficina, setEditingOficina] = useState<Oficina | null>(null);
  const [viewingOficina, setViewingOficina] = useState<Oficina | null>(null);
  const [deletingOficina, setDeletingOficina] = useState<Oficina | null>(null);

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

  function handleDelete(id: number) {
    const oficina = oficinas.find((o) => o.id === id);
    if (!oficina) return;
    setDeletingOficina(oficina);
  }

  function handleConfirmDelete() {
    if (!deletingOficina) return;
    // TODO: chamada real ao backend (DELETE /admin/oficinas/{id}).
    // ⚠️ O backend precisa bloquear/validar exclusão se houver Pessoa/
    // Usuario/Cliente/Veiculo/OrdemDeServico vinculados (FK) — ver pendência.
    setOficinas((prev) => prev.filter((o) => o.id !== deletingOficina.id));
    setDeletingOficina(null);
  }

  function handleAddOficina(data: OficinaFormData) {
    const novoId =
      oficinas.length > 0 ? Math.max(...oficinas.map((o) => o.id)) + 1 : 1;
    // TODO: chamada real ao backend (POST /admin/oficinas).
    setOficinas((prev) => [
      ...prev,
      {
        id: novoId,
        ...data,
        totalClientes: 0,
        totalVeiculos: 0,
        totalOrdensServico: 0,
      },
    ]);
    setIsModalOpen(false);
  }

  function handleUpdateOficina(data: OficinaFormData) {
    if (!editingOficina) return;
    // TODO: chamada real ao backend (PUT /admin/oficinas/{id}).
    setOficinas((prev) =>
      prev.map((oficina) =>
        oficina.id === editingOficina.id ? { ...oficina, ...data } : oficina,
      ),
    );
    setEditingOficina(null);
    setIsModalOpen(false);
  }

  const columns: Column<Oficina>[] = [
    {
      key: "nome",
      header: "Nome",
      width: "26%",
      render: (o) => <strong className="oficina-name">{o.nome}</strong>,
    },
    {
      key: "cnpj",
      header: "CNPJ",
      width: "20%",
      render: (o) => formatDocument(o.cnpj).display,
    },
    {
      key: "totalClientes",
      header: "Clientes",
      width: "14%",
      render: (o) => <span className="count-badge">{o.totalClientes}</span>,
    },
    {
      key: "totalVeiculos",
      header: "Veículos",
      width: "14%",
      render: (o) => <span className="count-badge">{o.totalVeiculos}</span>,
    },
    {
      key: "totalOrdensServico",
      header: "Ordens de Serviço",
      width: "16%",
      render: (o) => (
        <span className="count-badge">{o.totalOrdensServico}</span>
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
      label: "Remover oficina",
      icon: Trash2,
      variant: "delete",
      onClick: (o) => handleDelete(o.id),
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
        value={oficinas.length.toString()}
        description="Total de oficinas"
        icon={Building2}
      />

      <SearchBar
        placeholder="Pesquisar por nome ou CNPJ"
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
      />

      <EntityTable
        data={oficinas}
        columns={columns}
        actions={actions}
        getRowKey={(o) => o.id}
        searchTerm={searchTerm}
        searchFields={["nome", "cnpj"]}
        emptyMessage="Nenhuma oficina cadastrada"
      />

      {isModalOpen && (
        <EntityForm<OficinaFormData>
          title={editingOficina ? "Editar Oficina" : "Cadastro de Oficina"}
          fields={oficinaFields}
          initialValues={
            editingOficina
              ? {
                  nome: editingOficina.nome,
                  cnpj: editingOficina.cnpj,
                  telefone: editingOficina.telefone,
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
            {
              icon: Users,
              label: "Clientes cadastrados",
              value: String(viewingOficina.totalClientes),
            },
            {
              icon: Car,
              label: "Veículos cadastrados",
              value: String(viewingOficina.totalVeiculos),
            },
            {
              icon: ClipboardList,
              label: "Ordens de Serviço",
              value: String(viewingOficina.totalOrdensServico),
            },
          ]}
        />
      )}

      {deletingOficina && (
        <ConfirmDeleteEntity
          text="Oficina"
          entity="a oficina"
          entityName={deletingOficina.nome}
          onConfirm={handleConfirmDelete}
          onCancel={() => setDeletingOficina(null)}
        />
      )}
    </div>
  );
}
