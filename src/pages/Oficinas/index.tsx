import { useState, useEffect } from "react";
import {
  Building2,
  Eye,
  Pencil,
  Trash2,
  Phone,
  IdCard,
  Power,
  PowerOff,
} from "lucide-react";

import { StatCard } from "../../components/StatCard";
import { HeaderPageWithButton } from "../../components/HeaderPageWithButton";
import { SearchBar } from "../../components/SearchBar";
import { EntityTable } from "../../components/EntityTable";
import type { Column, EntityAction } from "../../components/EntityTable/types";
import { EntityForm } from "../../components/EntityForm";
import { ConfirmDeleteEntity } from "../../components/ConfirmDeleteEntity";
import { EntityViewModal } from "../../components/EntityViewModal";
import {
  listarOficinas,
  criarOficina,
  atualizarOficina,
  deletarOficina,
  ativarOficina,
  desativarOficina,
} from "../../services/oficina/oficinaService";

import { buscarEstatisticasSistema } from "../../services/estatisticas/estatisticasService";
import type { Oficina } from "../../types/oficina/oficina";
import { formatDocument, formatPhone } from "../../utils/formatters";

import { oficinaFields, type OficinaFormData } from "./oficinasFields";

import "./oficinas.style.css";

export function Oficinas() {
  const [oficinas, setOficinas] = useState<Oficina[]>([]);
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

  async function handleConfirmDelete() {
    if (!deletingOficina) return;

    try {
      await deletarOficina(deletingOficina.id);

      setOficinas((prev) =>
        prev.filter((oficina) => oficina.id !== deletingOficina.id),
      );

      setDeletingOficina(null);
    } catch (err) {
      console.error("Erro ao excluir oficina:", err);
    }
  }

  async function handleAddOficina(data: OficinaFormData) {
    try {
      const novaOficina = await criarOficina({
        nome: data.nome,
        cnpj: data.cnpj,
        telefone: data.telefone,
      });

      setOficinas((prev) => [
        ...prev,
        {
          ...novaOficina,
          totalClientes: 0,
          totalVeiculos: 0,
          totalOrdensServico: 0,
        },
      ]);

      setIsModalOpen(false);
    } catch (err) {
      console.error("Erro ao criar oficina:", err);
    }
  }

  async function handleUpdateOficina(data: OficinaFormData) {
    if (!editingOficina) return;

    try {
      const oficinaAtualizada = await atualizarOficina(editingOficina.id, {
        nome: data.nome,
        cnpj: data.cnpj,
        telefone: data.telefone,
      });

      setOficinas((prev) =>
        prev.map((oficina) =>
          oficina.id === editingOficina.id
            ? {
                ...oficinaAtualizada,
              }
            : oficina,
        ),
      );

      setEditingOficina(null);
      setIsModalOpen(false);
    } catch (err) {
      console.error("Erro ao atualizar oficina:", err);
    }
  }

  async function handleToggleStatus(oficina: Oficina) {
    try {
      if (oficina.ativo) {
        await desativarOficina(oficina.id);
      } else {
        await ativarOficina(oficina.id);
      }

      setOficinas((prev) =>
        prev.map((item) =>
          item.id === oficina.id ? { ...item, ativo: !item.ativo } : item,
        ),
      );
    } catch (err) {
      console.error(
        `Erro ao ${oficina.ativo ? "desativar" : "ativar"} oficina:`,
        err,
      );
    }
  }

  useEffect(() => {
    async function carregarOficinas() {
      try {
        const [oficinasResponse, estatisticas] = await Promise.all([
          listarOficinas(),
          buscarEstatisticasSistema(),
        ]);

        const oficinasComEstatisticas = oficinasResponse.map((oficina) => {
          const estatistica = estatisticas.porOficina.find(
            (item) => item.oficinaId === oficina.id,
          );

          return {
            ...oficina,
            totalClientes: estatistica?.clientes ?? 0,
            totalVeiculos: estatistica?.veiculos ?? 0,
            totalOrdensServico: estatistica?.ordensDeServico ?? 0,
          };
        });

        setOficinas(oficinasComEstatisticas);
      } catch (err) {
        console.error("Erro ao carregar oficinas:", err);
      }
    }

    carregarOficinas();
  }, []);

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
      render: (o) => formatDocument(o.telefone).display,
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
      hidden: (o) => o.ativo,
    },
    {
      label: "Ativar oficina",
      icon: Power,
      variant: "edit",
      onClick: (o) => handleToggleStatus(o),
      hidden: (o) => !o.ativo,
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
