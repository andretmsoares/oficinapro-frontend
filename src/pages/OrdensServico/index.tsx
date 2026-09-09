import { useState } from "react";
import {
  Eye,
  Pencil,
  Printer,
  Trash2,
  ClipboardList,
  RefreshCw,
} from "lucide-react";

import { StatCard } from "../../components/StatCard";
import { HeaderPageWithButton } from "../../components/HeaderPageWithButton";
import { SearchBar } from "../../components/SearchBar";
import { EntityTable } from "../../components/EntityTable";
import type { Column, EntityAction } from "../../components/EntityTable/types";

import { EntityForm } from "../../components/EntityForm";
import {
  ordensServicoFields,
  type OrdemDeServicoFormData,
} from "./ordensServicoFields";

import { ConfirmDeleteEntity } from "../../components/ConfirmDeleteEntity";
import { SelectStatusModal } from "../../components/SelectStatusModal";

import { formatCurrencyDisplay } from "../../services/formatters";

import type { OrdemDeServico } from "../../types/ordemDeServico/ordemDeServico";

import { MOCK_CLIENTES } from "../../mocks/cliente";
import { MOCK_VEICULOS } from "../../mocks/veiculo";
import { MOCK_ORDENS_SERVICO } from "../../mocks/ordemDeServico";

import "./ordensServico.style.css";
import { ViewOrdemServicoModal } from "../../components/ViewOrdemServicoModal";

function formatStatus(status: string): string {
  const labels: Record<string, string> = {
    ABERTA: "Aberta",
    EM_ANDAMENTO: "Em andamento",
    AGUARDANDO_PECAS: "Aguardando peças",
    FINALIZADA: "Finalizada",
    CANCELADA: "Cancelada",
  };

  return labels[status] ?? status;
}

const statusOptions = [
  {
    label: "Aberta",
    value: "ABERTA",
  },
  {
    label: "Em andamento",
    value: "EM_ANDAMENTO",
  },
  {
    label: "Aguardando peças",
    value: "AGUARDANDO_PECAS",
  },
  {
    label: "Finalizada",
    value: "FINALIZADA",
  },
  {
    label: "Cancelada",
    value: "CANCELADA",
  },
];

export function OrdemDeServico() {
  const [ordensServico, setOrdensServico] =
    useState<OrdemDeServico[]>(MOCK_ORDENS_SERVICO);

  const [searchTerm, setSearchTerm] = useState("");

  const [isModalOpen, setIsModalOpen] = useState(false);

  const [editingOrdem, setEditingOrdem] = useState<OrdemDeServico | null>(null);

  const [deletingOrdem, setDeletingOrdem] = useState<OrdemDeServico | null>(
    null,
  );

  const [selectingStatusOrdem, setSelectingStatusOrdem] =
    useState<OrdemDeServico | null>(null);

  const [viewingOrdem, setViewingOrdem] = useState<OrdemDeServico | null>(null);
  function handleView(id: number) {
    const ordem = ordensServico.find((os) => os.id === id);

    if (!ordem) return;

    setViewingOrdem(ordem);
  }

  function handleEdit(id: number) {
    const ordem = ordensServico.find((os) => os.id === id);

    if (!ordem) return;

    setEditingOrdem(ordem);
    setIsModalOpen(true);
  }

  function handlePrint(id: number) {
    console.log("Imprimir Ordem de Serviço:", id);
  }

  function handleDelete(id: number) {
    const ordem = ordensServico.find((os) => os.id === id);

    if (!ordem) return;

    setDeletingOrdem(ordem);
  }

  function handleUpdateStatus(id: number) {
    const ordem = ordensServico.find((os) => os.id === id);

    if (!ordem) return;

    setSelectingStatusOrdem(ordem);
  }

  function handleConfirmStatus(newStatus: string) {
    if (!selectingStatusOrdem) return;

    setOrdensServico((prev) =>
      prev.map((ordem) =>
        ordem.id === selectingStatusOrdem.id
          ? {
              ...ordem,
              status: newStatus,
            }
          : ordem,
      ),
    );

    setSelectingStatusOrdem(null);
  }

  function handleAddOrdem(data: OrdemDeServicoFormData) {
    setOrdensServico((prev) => {
      const nextId =
        prev.length > 0 ? Math.max(...prev.map((os) => os.id)) + 1 : 1;

      const veiculo = MOCK_VEICULOS.find(
        (veiculo) => veiculo.id === data.veiculoId,
      );

      const cliente = MOCK_CLIENTES.find(
        (cliente) => cliente.id === data.clienteId,
      );

      return [
        ...prev,
        {
          id: nextId,

          oficinaId: data.oficinaId,
          unidadeId: data.unidadeId,
          veiculoId: data.veiculoId,
          clienteId: data.clienteId,
          mecanicoId: data.mecanicoId,

          placaVeiculo: veiculo?.placa ?? "",
          nomeCliente: cliente?.nome ?? "",

          dataAbertura: new Date().toISOString(),
          dataFechamento: null,

          status: "ABERTA",

          obs: data.obs,

          valorTotal: 0,
          valorComDesconto: 0,
        },
      ];
    });

    setIsModalOpen(false);
  }

  function handleUpdateOrdem(data: OrdemDeServicoFormData) {
    if (!editingOrdem) return;

    const veiculo = MOCK_VEICULOS.find(
      (veiculo) => veiculo.id === data.veiculoId,
    );

    const cliente = MOCK_CLIENTES.find(
      (cliente) => cliente.id === data.clienteId,
    );

    setOrdensServico((prev) =>
      prev.map((ordem) =>
        ordem.id === editingOrdem.id
          ? {
              ...ordem,
              oficinaId: data.oficinaId,
              unidadeId: data.unidadeId,
              veiculoId: data.veiculoId,
              clienteId: data.clienteId,
              mecanicoId: data.mecanicoId,
              placaVeiculo: veiculo?.placa ?? "",
              nomeCliente: cliente?.nome ?? "",
              obs: data.obs,
            }
          : ordem,
      ),
    );

    setEditingOrdem(null);
    setIsModalOpen(false);
  }

  function handleConfirmDelete() {
    if (!deletingOrdem) return;

    setOrdensServico((prev) =>
      prev.filter((ordem) => ordem.id !== deletingOrdem.id),
    );

    setDeletingOrdem(null);
  }

  const columns: Column<OrdemDeServico>[] = [
    {
      key: "codigo",
      header: "Código",
      width: "8%",
      render: (os) => `#${os.id.toString().padStart(4, "0")}`,
    },
    {
      key: "placaVeiculo",
      header: "Veículo",
      width: "14%",
      render: (os) => (
        <strong className="os-vehicle">{formatPlate(os.placaVeiculo)}</strong>
      ),
    },
    {
      key: "nomeCliente",
      header: "Cliente",
      width: "28%",
      render: (os) => <strong className="os-client">{os.nomeCliente}</strong>,
    },
    {
      key: "status",
      header: "Status",
      width: "18%",
      render: (os) => (
        <span className={`status-badge status-${os.status.toLowerCase()}`}>
          {formatStatus(os.status)}
        </span>
      ),
    },
    {
      key: "valorTotal",
      header: "Valor Total",
      width: "15%",
      format: (value) => formatCurrencyDisplay(Number(value)),
    },
  ];

  const actions: EntityAction<OrdemDeServico>[] = [
    {
      label: "Visualizar ordem de serviço",
      icon: Eye,
      variant: "view",
      onClick: (os) => handleView(os.id),
    },
    {
      label: "Atualizar status",
      icon: RefreshCw,
      variant: "status",
      onClick: (os) => handleUpdateStatus(os.id),
    },
    {
      label: "Editar ordem de serviço",
      icon: Pencil,
      variant: "edit",
      onClick: (os) => handleEdit(os.id),
    },
    {
      label: "Imprimir ordem de serviço",
      icon: Printer,
      variant: "print",
      onClick: (os) => handlePrint(os.id),
    },
    {
      label: "Excluir ordem de serviço",
      icon: Trash2,
      variant: "delete",
      onClick: (os) => handleDelete(os.id),
    },
  ];

  return (
    <div className="ordens-servico-page">
      <HeaderPageWithButton
        title="Ordens de Serviço"
        subtitle="Gerencie as ordens de serviço da oficina"
        onButtonClick={() => {
          setEditingOrdem(null);
          setIsModalOpen(true);
        }}
        buttonText="Nova Ordem de Serviço"
      />

      <StatCard
        title="Ordens de Serviço"
        value={ordensServico.length.toString()}
        description="Total na base de dados"
        icon={ClipboardList}
      />

      <SearchBar
        placeholder="Pesquisar por veículo, cliente ou status"
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
      />

      <EntityTable
        data={ordensServico}
        columns={columns}
        actions={actions}
        getRowKey={(os) => os.id}
        searchTerm={searchTerm}
        searchFields={["placaVeiculo", "nomeCliente", "status"]}
        emptyMessage="Nenhuma ordem de serviço cadastrada"
      />

      {isModalOpen && (
        <EntityForm<OrdemDeServicoFormData>
          title={
            editingOrdem
              ? "Editar Ordem de Serviço"
              : "Cadastro de Ordem de Serviço"
          }
          fields={ordensServicoFields}
          initialValues={
            editingOrdem
              ? {
                  oficinaId: editingOrdem.oficinaId,
                  unidadeId: editingOrdem.unidadeId,
                  veiculoId: editingOrdem.veiculoId,
                  clienteId: editingOrdem.clienteId,
                  mecanicoId: editingOrdem.mecanicoId,
                  obs: editingOrdem.obs,
                }
              : undefined
          }
          onSubmit={editingOrdem ? handleUpdateOrdem : handleAddOrdem}
          onClose={() => {
            setEditingOrdem(null);
            setIsModalOpen(false);
          }}
        />
      )}

      {selectingStatusOrdem && (
        <SelectStatusModal
          title={`Atualizar Status - OS #${selectingStatusOrdem.id
            .toString()
            .padStart(4, "0")}`}
          currentStatus={selectingStatusOrdem.status}
          statuses={statusOptions}
          onSave={handleConfirmStatus}
          onClose={() => setSelectingStatusOrdem(null)}
        />
      )}

      {deletingOrdem && (
        <ConfirmDeleteEntity
          entityName={`OS #${deletingOrdem.id.toString().padStart(4, "0")}`}
          onConfirm={handleConfirmDelete}
          onCancel={() => setDeletingOrdem(null)}
        />
      )}

      {viewingOrdem && (
        <ViewOrdemServicoModal
          ordemServico={viewingOrdem}
          onClose={() => setViewingOrdem(null)}
        />
      )}
    </div>
  );
}

function formatPlate(value: string): string {
  const plate = value
    .replace(/[^a-zA-Z0-9]/g, "")
    .toUpperCase()
    .slice(0, 7);

  if (plate.length <= 3) {
    return plate;
  }

  return `${plate.slice(0, 3)}-${plate.slice(3)}`;
}
