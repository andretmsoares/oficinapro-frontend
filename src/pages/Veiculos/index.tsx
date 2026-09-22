import { useEffect, useState } from "react";
import { Car, Pencil, Trash2, NotepadText } from "lucide-react";

import { StatCard } from "../../components/StatCard";
import { HeaderPageWithButton } from "../../components/HeaderPageWithButton";
import { HeaderPage } from "../../components/HeaderPage";
import { SearchBar } from "../../components/SearchBar";
import { EntityTable } from "../../components/EntityTable";
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
  listarVeiculos,
  type VeiculoRequest,
} from "../../services/veiculo/veiculoService";

import { formatPlate } from "../../utils/formatters";

import "./veiculos.style.css";

interface VeiculoProps {
  usuarioLogado: Usuario;
}

export function Veiculos({ usuarioLogado }: VeiculoProps) {
  const isGerente = usuarioLogado.role === "GERENTE";

  const [veiculos, setVeiculos] = useState<Veiculo[]>([]);
  const [loading, setLoading] = useState(true);

  const [searchTerm, setSearchTerm] = useState("");

  const [isModalOpen, setIsModalOpen] = useState(false);

  const [editingVeiculo, setEditingVeiculo] = useState<Veiculo | null>(null);

  const [deletingVeiculo, setDeletingVeiculo] = useState<Veiculo | null>(null);

  const [submitError, setSubmitError] = useState("");

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
      };

      const novoVeiculo = await criarVeiculo(request);

      setVeiculos((prev) => [...prev, novoVeiculo]);

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

  function handleViewOrders(id: number) {
    console.log("Visualizar ordens de serviço do veículo:", id);
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
      };

      const veiculoAtualizado = await atualizarVeiculo(
        editingVeiculo.id,
        request,
      );

      setVeiculos((prev) =>
        prev.map((veiculo) =>
          veiculo.id === editingVeiculo.id ? veiculoAtualizado : veiculo,
        ),
      );

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

      setVeiculos((prev) =>
        prev.filter((veiculo) => veiculo.id !== deletingVeiculo.id),
      );

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

  useEffect(() => {
    async function carregarVeiculos() {
      try {
        const data = await listarVeiculos();
        setVeiculos(data.content);
      } catch (error) {
        console.error("Erro ao carregar veículos:", error);
      } finally {
        setLoading(false);
      }
    }

    carregarVeiculos();
  }, []);

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
      width: "20%",
    },
    {
      key: "modelo",
      header: "Modelo",
      width: "25%",
    },
    {
      key: "ano",
      header: "Ano",
      width: "15",
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
          value={veiculos.length}
          description="Total na base de dados"
          icon={Car}
        />
      </div>

      <div className="vehicles-toolbar">
        <SearchBar
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          placeholder="Buscar veículo por Modelo, Placa ou Marca"
        />
      </div>

      <EntityTable
        data={veiculos}
        columns={columns}
        actions={actions}
        getRowKey={(veiculo) => veiculo.id}
        searchTerm={searchTerm}
        searchFields={["placa", "marca", "modelo", "ano"]}
        loading={loading}
        emptyMessage="Nenhum veículo cadastrado"
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
