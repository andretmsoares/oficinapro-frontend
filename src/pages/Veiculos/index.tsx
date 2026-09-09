import { useState } from "react";
import { Car, Pencil, Trash2, NotepadText } from "lucide-react";

import { StatCard } from "../../components/StatCard";
import { HeaderPageWithButton } from "../../components/HeaderPageWithButton";
import { SearchBar } from "../../components/SearchBar";
import { EntityTable } from "../../components/EntityTable";
import type { Column, EntityAction } from "../../components/EntityTable/types";

import { EntityForm } from "../../components/EntityForm";
import { vehicleFields, type VeiculoFormData } from "./vehicleFields";

import { ConfirmDeleteEntity } from "../../components/ConfirmDeleteEntity";

import type { Veiculo } from "../../types/veiculo/veiculo";

import { formatPlate } from "../../services/formatters";

import "./veiculos.style.css";

import { MOCK_VEICULOS } from "../../mocks/veiculo";

export function Veiculos() {
  const [veiculos, setVeiculos] = useState<Veiculo[]>(MOCK_VEICULOS);

  const [searchTerm, setSearchTerm] = useState("");

  const [isModalOpen, setIsModalOpen] = useState(false);

  const [editingVeiculo, setEditingVeiculo] = useState<Veiculo | null>(null);

  const [deletingVeiculo, setDeletingVeiculo] = useState<Veiculo | null>(null);

  function handleAddVehicle(data: VeiculoFormData) {
    setVeiculos((prev) => {
      const nextId =
        prev.length > 0
          ? Math.max(...prev.map((veiculo) => veiculo.id)) + 1
          : 1;

      return [
        ...prev,
        {
          id: nextId,
          ...data,
          osCount: 0,
        },
      ];
    });

    setIsModalOpen(false);
  }

  function handleViewOrders(id: number) {
    console.log("Visualizar ordens de serviço do veículo:", id);
  }

  function handleEdit(id: number) {
    const veiculo = veiculos.find((v) => v.id === id);

    if (!veiculo) return;

    setEditingVeiculo(veiculo);
    setIsModalOpen(true);
  }

  function handleUpdateVehicle(data: VeiculoFormData) {
    if (!editingVeiculo) return;

    setVeiculos((prev) =>
      prev.map((veiculo) =>
        veiculo.id === editingVeiculo.id
          ? {
              ...veiculo,
              ...data,
            }
          : veiculo,
      ),
    );

    setEditingVeiculo(null);
    setIsModalOpen(false);
  }

  function handleDelete(id: number) {
    const veiculo = veiculos.find((v) => v.id === id);

    if (!veiculo) return;

    setDeletingVeiculo(veiculo);
  }

  function handleConfirmDelete() {
    if (!deletingVeiculo) return;

    setVeiculos((prev) =>
      prev.filter((veiculo) => veiculo.id !== deletingVeiculo.id),
    );

    setDeletingVeiculo(null);
  }

  const columns: Column<Veiculo>[] = [
    {
      key: "codigo",
      header: "Código",
      width: "10%",
      render: (c) => `#${c.id.toString().padStart(4, "0")}`,
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
      key: "ano",
      header: "Ano",
      width: "10%",
    },
    {
      key: "osCount",
      header: "Ordens de Serviço",
      width: "20%",
      render: (c) => <span className="badge-os">{c.osCount} </span>,
    },
  ];

  const actions: EntityAction<Veiculo>[] = [
    {
      label: "Visualizar Ordens de Serviço",
      icon: NotepadText,
      variant: "view",
      onClick: (veiculo) => handleViewOrders(veiculo.id),
    },
    {
      label: "Editar veículo",
      icon: Pencil,
      variant: "edit",
      onClick: (veiculo) => handleEdit(veiculo.id),
    },
    {
      label: "Excluir veículo",
      icon: Trash2,
      variant: "delete",
      onClick: (veiculo) => handleDelete(veiculo.id),
    },
  ];

  return (
    <div className="vehicles-page">
      <HeaderPageWithButton
        title="Veículos"
        subtitle="Gerencie os veículos cadastrados"
        buttonText="Novo Veículo"
        onButtonClick={() => {
          setEditingVeiculo(null);
          setIsModalOpen(true);
        }}
      />

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
        emptyMessage="Nenhum veículo cadastrado"
      />

      {isModalOpen && (
        <EntityForm<VeiculoFormData>
          title={editingVeiculo ? "Editar Veículo" : "Cadastro de Veículo"}
          fields={vehicleFields}
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
          onClose={() => {
            setEditingVeiculo(null);
            setIsModalOpen(false);
          }}
        />
      )}

      {deletingVeiculo && (
        <ConfirmDeleteEntity
          entityName={`${deletingVeiculo.marca} ${deletingVeiculo.modelo} - ${deletingVeiculo.placa}`}
          onConfirm={handleConfirmDelete}
          onCancel={() => setDeletingVeiculo(null)}
        />
      )}
    </div>
  );
}
