import { useState } from "react";
import { Car, Pencil, Trash2, NotepadText } from "lucide-react";

import { StatCard } from "../../components/StatCard";
import { HeaderPageWithButton } from "../../components/HeaderPageWithButton";
import { HeaderPage } from "../../components/HeaderPage";
import { SearchBar } from "../../components/SearchBar";
import { EntityTable } from "../../components/EntityTable";
import { Pagination } from "../../components/Pagination";
import type { Column, EntityAction } from "../../components/EntityTable/types";

import { EntityForm } from "../../components/EntityForm";
import { vehicleFields, type VeiculoFormData } from "./vehicleFields";

import { ConfirmDeleteEntity } from "../../components/ConfirmDeleteEntity";

import type { Veiculo } from "../../types/veiculo/veiculo";
import type { Usuario } from "../../types/usuario/usuario";

import {
  criarVeiculo,
  atualizarVeiculo,
  deletarVeiculo,
  buscarVeiculosPaginado,
  type VeiculoRequest,
} from "../../services/veiculoService";
import { useServerSearch } from "../../hooks/useServerSearch";

import { formatPlate } from "../../utils/formatters";

import "./veiculos.style.css";
import { useNavigate } from "react-router-dom";

interface VeiculoProps {
  usuarioLogado: Usuario;
}

export function Veiculos({ usuarioLogado }: VeiculoProps) {
  const isGerente = usuarioLogado.role === "GERENTE";

  const {
    items: veiculos,
    loading,
    searchTerm,
    buscando,
    page,
    totalPages,
    totalElements,
    setPage,
    handleSearch,
    reload,
  } = useServerSearch<Veiculo>(buscarVeiculosPaginado);

  const [isModalOpen, setIsModalOpen] = useState(false);

  const [editingVeiculo, setEditingVeiculo] = useState<Veiculo | null>(null);

  const [deletingVeiculo, setDeletingVeiculo] = useState<Veiculo | null>(null);

  const [submitError, setSubmitError] = useState("");

  const navigate = useNavigate();

  function fecharModal() {
    setEditingVeiculo(null);
    setIsModalOpen(false);
  }

  async function handleAddVehicle(data: VeiculoFormData) {
    try {
      setSubmitError("");
      const request: VeiculoRequest = {
        placa: data.placa,
        marca: data.marca,
        modelo: data.modelo,
        ano: data.ano,
        cor: data.cor,
      };

      await criarVeiculo(request);

      reload();

      fecharModal();
    } catch (error) {
      console.error("Erro ao cadastrar veículo:", error);
      setSubmitError(
        error instanceof Error
          ? error.message
          : "Não foi possível atualizar a unidade.",
      );
    }
  }

  function handleViewOrders(veiculoId: number) {
    const veiculo = veiculos.find((v) => v.id === veiculoId);

    if (!veiculo) {
      return;
    }

    const busca = veiculo.placa.trim();

    navigate(`/ordens-servico?veiculo=${encodeURIComponent(busca)}`);
  }

  function handleEdit(id: number) {
    const veiculo = veiculos.find((veiculo) => veiculo.id === id);

    if (!veiculo) return;

    setEditingVeiculo(veiculo);
    setIsModalOpen(true);
  }

  async function handleUpdateVehicle(data: VeiculoFormData) {
    if (!editingVeiculo) return;

    try {
      setSubmitError("");
      const request: VeiculoRequest = {
        placa: data.placa,
        marca: data.marca,
        modelo: data.modelo,
        ano: data.ano,
        cor: data.cor,
      };

      await atualizarVeiculo(editingVeiculo.id, request);

      reload();

      fecharModal();
    } catch (error) {
      console.error("Erro ao atualizar veículo:", error);
      setSubmitError(
        error instanceof Error
          ? error.message
          : "Não foi possível atualizar a unidade.",
      );
    }
  }

  function handleDelete(id: number) {
    const veiculo = veiculos.find((veiculo) => veiculo.id === id);

    if (!veiculo) return;

    setDeletingVeiculo(veiculo);
  }

  async function handleConfirmDelete() {
    if (!deletingVeiculo) return;

    try {
      setSubmitError("");
      await deletarVeiculo(deletingVeiculo.id);

      reload();

      setDeletingVeiculo(null);
    } catch (error) {
      console.error("Erro ao excluir veículo:", error);
      setSubmitError(
        error instanceof Error
          ? error.message
          : "Não foi possível atualizar a unidade.",
      );
    }
  }

  const columns: Column<Veiculo>[] = [
    {
      key: "codigo",
      header: "Código",
      width: "10%",
      render: (veiculo) => `#${veiculo.id.toString().padStart(4, "0")}`,
    },
    {
      key: "placa",
      header: "Placa",
      width: "15%",
      format: (value) => (value ? formatPlate(String(value)) : ""),
    },
    {
      key: "marca",
      header: "Marca",
      width: "15%",
    },
    {
      key: "modelo",
      header: "Modelo",
      width: "20%",
    },
    {
      key: "cor",
      header: "Cor",
      width: "20%",
    },
    {
      key: "ano",
      header: "Ano",
      width: "10",
    },
  ];

  const actions: EntityAction<Veiculo>[] = [
    {
      label: "Visualizar Ordens de Serviço",
      icon: NotepadText,
      variant: "view",
      onClick: (veiculo) => handleViewOrders(veiculo.id),
    },
    ...(isGerente
      ? [
          {
            label: "Editar veículo",
            icon: Pencil,
            variant: "edit" as const,
            onClick: (veiculo: Veiculo) => handleEdit(veiculo.id),
          },
          {
            label: "Excluir veículo",
            icon: Trash2,
            variant: "delete" as const,
            onClick: (veiculo: Veiculo) => handleDelete(veiculo.id),
          },
        ]
      : []),
  ];

  return (
    <div className="page">
      {isGerente ? (
        <HeaderPageWithButton
          title="Veículos"
          subtitle="Gerencie os veículos cadastrados"
          buttonText="Novo Veículo"
          onButtonClick={() => {
            setEditingVeiculo(null);
            setIsModalOpen(true);
          }}
        />
      ) : (
        <HeaderPage
          title="Veículos"
          subtitle="Gerencie os veículos cadastrados"
        />
      )}

      <div className="vehicles-stats">
        <StatCard
          title="Total de Veículos"
          value={totalElements}
          description={
            buscando ? "Encontrados na busca" : "Total na base de dados"
          }
          icon={Car}
        />
      </div>

      <div className="vehicles-toolbar">
        <SearchBar
          searchTerm={searchTerm}
          setSearchTerm={handleSearch}
          placeholder="Buscar veículo por Modelo, Placa ou Marca"
        />
      </div>

      <EntityTable
        data={veiculos}
        columns={columns}
        actions={actions}
        getRowKey={(veiculo) => veiculo.id}
        loading={loading}
        emptyMessage={
          buscando
            ? "Nenhum veículo encontrado para a busca"
            : "Nenhum veículo cadastrado"
        }
      />

      <Pagination
        page={page}
        totalPages={totalPages}
        totalElements={totalElements}
        onPageChange={setPage}
      />

      {isModalOpen && isGerente && (
        <EntityForm<VeiculoFormData>
          title={editingVeiculo ? "Editar Veículo" : "Cadastro de Veículo"}
          fields={vehicleFields}
          submitError={submitError}
          initialValues={
            editingVeiculo
              ? {
                  placa: editingVeiculo.placa,
                  marca: editingVeiculo.marca,
                  modelo: editingVeiculo.modelo,
                  ano: editingVeiculo.ano,
                }
              : undefined
          }
          onSubmit={editingVeiculo ? handleUpdateVehicle : handleAddVehicle}
          onClose={fecharModal}
        />
      )}

      {deletingVeiculo && (
        <ConfirmDeleteEntity
          text="Veículo"
          entity="o veículo"
          entityName={`${deletingVeiculo.marca} ${deletingVeiculo.modelo} - ${deletingVeiculo.placa}`}
          onConfirm={handleConfirmDelete}
          onCancel={() => setDeletingVeiculo(null)}
        />
      )}
    </div>
  );
}
