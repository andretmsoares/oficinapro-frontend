import { useState, useEffect, useCallback } from "react";
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
import { StatusFilter } from "../../components/StatusFilter";
import { EntityTable } from "../../components/EntityTable";
import { Pagination } from "../../components/Pagination";
import type { Column, EntityAction } from "../../components/EntityTable/types";

import { EntityForm } from "../../components/EntityForm";
import {
  ordensServicoFields,
  type OrdemDeServicoFormData,
} from "./ordensServicoFields";

import { ConfirmDeleteEntity } from "../../components/ConfirmDeleteEntity";
import { SelectStatusModal } from "../../components/SelectStatusModal";

import { formatCurrencyDisplay } from "../../utils/formatters";

import type { OrdemDeServico } from "../../types/ordemDeServico/ordemDeServico";

import "./ordensServico.style.css";

import { ViewOrdemServicoModal } from "../../components/ViewOrdemServicoModal";
import type { Usuario } from "../../types/usuario/usuario";
import { HeaderPage } from "../../components/HeaderPage";

import {
  listarOrdensServicoPaginado,
  criarOrdemServico,
  atualizarOrdemServico,
  deletarOrdemServico,
  atualizarStatusOrdemServico,
  imprimirOrdemServico,
} from "../../services/ordemDeServicoService";

import { buscarPagamentosPorOsIds } from "../../services/pagamentoService";
import { useServerSearch } from "../../hooks/useServerSearch";

import { StatusOrdemDeServico } from "../../enums/StatusOrdemDeServico";
import { useSearchParams } from "react-router-dom";

interface OrdensServicoProps {
  usuarioLogado: Usuario;
}

function formatStatusOrdemServico(status: StatusOrdemDeServico): string {
  const labels: Record<StatusOrdemDeServico, string> = {
    [StatusOrdemDeServico.ABERTA]: "Aberta",
    [StatusOrdemDeServico.DIAGNOSTICO]: "Diagnóstico",
    [StatusOrdemDeServico.AGUARDANDO_APROVACAO]: "Aguardando aprovação",
    [StatusOrdemDeServico.AGUARDANDO_PECAS]: "Aguardando peças",
    [StatusOrdemDeServico.EM_EXECUCAO]: "Em execução",
    [StatusOrdemDeServico.FINALIZADA]: "Finalizada",
    [StatusOrdemDeServico.ENTREGUE]: "Entregue",
    [StatusOrdemDeServico.FECHADA]: "Fechada",
    [StatusOrdemDeServico.CANCELADA]: "Cancelada",
  };

  return labels[status];
}

const STATUS_FILTER_OPTIONS = Object.values(StatusOrdemDeServico).map(
  (status) => ({ value: status, label: formatStatusOrdemServico(status) }),
);

// O backend nega estes destinos ao MECANICO (403); a UI nem os oferece.
const STATUS_SOMENTE_GERENTE: StatusOrdemDeServico[] = [
  StatusOrdemDeServico.FINALIZADA,
  StatusOrdemDeServico.ENTREGUE,
  StatusOrdemDeServico.CANCELADA,
];

function getStatusPermitidos(
  statusAtual: StatusOrdemDeServico,
): StatusOrdemDeServico[] {
  switch (statusAtual) {
    case StatusOrdemDeServico.ABERTA:
      return [StatusOrdemDeServico.DIAGNOSTICO, StatusOrdemDeServico.CANCELADA];

    case StatusOrdemDeServico.DIAGNOSTICO:
      return [
        StatusOrdemDeServico.AGUARDANDO_APROVACAO,
        StatusOrdemDeServico.CANCELADA,
      ];

    case StatusOrdemDeServico.AGUARDANDO_APROVACAO:
      return [
        StatusOrdemDeServico.AGUARDANDO_PECAS,
        StatusOrdemDeServico.CANCELADA,
      ];

    case StatusOrdemDeServico.AGUARDANDO_PECAS:
      return [StatusOrdemDeServico.EM_EXECUCAO, StatusOrdemDeServico.CANCELADA];

    case StatusOrdemDeServico.EM_EXECUCAO:
      return [StatusOrdemDeServico.FINALIZADA, StatusOrdemDeServico.CANCELADA];

    case StatusOrdemDeServico.FINALIZADA:
      return [StatusOrdemDeServico.ENTREGUE, StatusOrdemDeServico.ABERTA];

    case StatusOrdemDeServico.ENTREGUE:
      return [StatusOrdemDeServico.FECHADA, StatusOrdemDeServico.ABERTA];

    case StatusOrdemDeServico.FECHADA:
      return [StatusOrdemDeServico.ABERTA];

    case StatusOrdemDeServico.CANCELADA:
      return [];

    default:
      return [];
  }
}

export function OrdensServico({ usuarioLogado }: OrdensServicoProps) {
  const isGerente = usuarioLogado.role === "GERENTE";

  const [searchParams] = useSearchParams();

  const clienteBusca = searchParams.get("cliente") ?? "";
  const veiculoBusca = searchParams.get("veiculo") ?? "";

  const [statusFilter, setStatusFilter] = useState<StatusOrdemDeServico | "">(
    "",
  );

  // Busca, filtro de status e paginação rodam no SERVIDOR, sobre todas as OS da oficina. Assim uma
  // OS que não está na página carregada continua sendo encontrada. A identidade de fetchOrdens
  // muda junto com o filtro de status, o que refaz a consulta.
  const fetchOrdens = useCallback(
    (termo: string, pagina: number) =>
      listarOrdensServicoPaginado(termo, statusFilter, pagina),
    [statusFilter],
  );

  const {
    items: ordensServico,
    loading,
    searchTerm,
    buscando,
    page,
    totalPages,
    totalElements,
    setPage,
    handleSearch,
    reload,
  } = useServerSearch<OrdemDeServico>(
    fetchOrdens,
    clienteBusca || veiculoBusca,
  );

  function handleStatusFilterChange(novo: StatusOrdemDeServico | "") {
    setStatusFilter(novo);
    setPage(0);
  }

  // osId -> valorPendente, exatamente como calculado pelo backend (Pagamento).
  const [valoresPendentes, setValoresPendentes] = useState<
    Record<number, number>
  >({});

  const [isModalOpen, setIsModalOpen] = useState(false);

  const [editingOrdem, setEditingOrdem] = useState<OrdemDeServico | null>(null);

  const [deletingOrdem, setDeletingOrdem] = useState<OrdemDeServico | null>(
    null,
  );

  const [selectingStatusOrdem, setSelectingStatusOrdem] =
    useState<OrdemDeServico | null>(null);

  const [viewingOrdem, setViewingOrdem] = useState<OrdemDeServico | null>(null);

  const [submitError, setSubmitError] = useState("");

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

  function handleImprimir(id: number) {
    try {
      imprimirOrdemServico(id);
    } catch (error) {
      console.error("Erro ao imprimir OS:", error);
    }
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

  async function handleConfirmStatus(newStatus: string) {
    if (!selectingStatusOrdem) return;

    try {
      setSubmitError("");

      await atualizarStatusOrdemServico(selectingStatusOrdem.id, {
        status: newStatus as StatusOrdemDeServico,
      });

      reload();

      setSelectingStatusOrdem(null);
    } catch (error) {
      console.error("Erro ao atualizar status da OS:", error);

      setSubmitError(
        error instanceof Error
          ? error.message
          : "Não foi possível atualizar o status da OS.",
      );
    }
  }

  // Valor pendente SÓ das OS da página atual (até 100 ids): o financeiro é do GERENTE, e o
  // backend recusa os demais papéis.
  const podeVerFinanceiro = isGerente && usuarioLogado.oficinaId !== null;
  const oficinaId = usuarioLogado.oficinaId;

  useEffect(() => {
    let ativo = true;

    async function carregarValoresPendentes() {
      const pagamentos = await (podeVerFinanceiro &&
      oficinaId !== null &&
      ordensServico.length > 0
        ? buscarPagamentosPorOsIds(
            oficinaId,
            ordensServico.map((os) => os.id),
          )
        : Promise.resolve([]));

      if (!ativo) return;

      setValoresPendentes(
        Object.fromEntries(
          pagamentos.map((pagamento) => [
            pagamento.osId,
            pagamento.valorPendente,
          ]),
        ),
      );
    }

    carregarValoresPendentes().catch((error) => {
      console.error("Erro ao carregar valores pendentes das OS:", error);
    });

    return () => {
      ativo = false;
    };
  }, [ordensServico, podeVerFinanceiro, oficinaId]);

  function handleUpdateOrdemServico(ordemAtualizada: OrdemDeServico) {
    // Recarrega a página: valores, status e saldo pendente vêm sempre do servidor.
    reload();

    setViewingOrdem((prev) =>
      prev && prev.id === ordemAtualizada.id ? ordemAtualizada : prev,
    );
  }

  async function handleAddOrdem(data: OrdemDeServicoFormData) {
    try {
      setSubmitError("");

      await criarOrdemServico(data);

      reload();

      setIsModalOpen(false);
    } catch (error) {
      console.error("Erro ao criar ordem de serviço:", error);

      setSubmitError(
        error instanceof Error ? error.message : "Não foi possível criar a OS.",
      );
    }
  }

  async function handleUpdateOrdem(data: OrdemDeServicoFormData) {
    if (!editingOrdem) return;

    try {
      setSubmitError("");

      await atualizarOrdemServico(editingOrdem.id, data);

      reload();

      setEditingOrdem(null);
      setIsModalOpen(false);
    } catch (error) {
      console.error("Erro ao atualizar ordem de serviço:", error);

      setSubmitError(
        error instanceof Error
          ? error.message
          : "Não foi possível atualizar a OS.",
      );
    }
  }

  async function handleConfirmDelete() {
    if (!deletingOrdem) return;

    try {
      setSubmitError("");

      await deletarOrdemServico(deletingOrdem.id);

      reload();

      setDeletingOrdem(null);
    } catch (error) {
      console.error("Erro ao excluir ordem de serviço:", error);

      setSubmitError(
        error instanceof Error
          ? error.message
          : "Não foi possível excluir a OS.",
      );
    }
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
      width: "10%",
      render: (os) => (
        <strong className="os-vehicle">{formatPlate(os.placaVeiculo)}</strong>
      ),
    },
    {
      key: "nomeCliente",
      header: "Cliente",
      width: "25%",
      render: (os) => <strong className="os-client">{os.nomeCliente}</strong>,
    },
    {
      key: "status",
      header: "Status",
      width: "10%",
      render: (os) => (
        <span className={`status-badge status-${os.status.toLowerCase()}`}>
          {formatStatusOrdemServico(os.status)}
        </span>
      ),
    },
    {
      key: "valorTotal",
      header: "Valor Total",
      width: "15%",
      render: (os) => formatCurrencyDisplay(os.valorTotal),
    },
    {
      key: "valorPendente",
      header: "Valor Pendente",
      width: "15%",
      render: (os) => {
        const pendente = valoresPendentes[os.id];

        return pendente === undefined
          ? "—"
          : formatCurrencyDisplay(Math.max(pendente, 0));
      },
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
      label: "Imprimir ordem de serviço",
      icon: Printer,
      variant: "print",
      onClick: (os) => handleImprimir(os.id),
    },
    ...(isGerente
      ? [
          {
            label: "Editar ordem de serviço",
            icon: Pencil,
            variant: "edit" as const,
            onClick: (os: OrdemDeServico) => handleEdit(os.id),
          },
          {
            label: "Excluir ordem de serviço",
            icon: Trash2,
            variant: "delete" as const,
            onClick: (os: OrdemDeServico) => handleDelete(os.id),
          },
        ]
      : []),
  ];

  const statusOptions: {
    label: string;
    value: StatusOrdemDeServico;
  }[] = selectingStatusOrdem
    ? getStatusPermitidos(selectingStatusOrdem.status)
        .filter(
          (status) => isGerente || !STATUS_SOMENTE_GERENTE.includes(status),
        )
        .map((status) => ({
          value: status,
          label: formatStatusOrdemServico(status),
        }))
    : [];

  return (
    <div className="page">
      {isGerente ? (
        <HeaderPageWithButton
          title="Ordens de Serviço"
          subtitle="Gerencie as ordens de serviço da oficina"
          onButtonClick={() => {
            setEditingOrdem(null);
            setIsModalOpen(true);
          }}
          buttonText="Nova Ordem de Serviço"
        />
      ) : (
        <HeaderPage
          title="Ordens de Serviço"
          subtitle="Gerencie as ordens de serviço da oficina"
        />
      )}

      <StatCard
        title="Ordens de Serviço"
        value={totalElements.toString()}
        description="Total na base de dados"
        icon={ClipboardList}
      />

      <div className="list-filters">
        <SearchBar
          placeholder="Pesquisar por veículo, cliente ou status"
          searchTerm={searchTerm}
          setSearchTerm={handleSearch}
        />

        <StatusFilter
          label="Filtrar por status"
          value={statusFilter}
          options={STATUS_FILTER_OPTIONS}
          onChange={handleStatusFilterChange}
        />
      </div>

      <EntityTable
        data={ordensServico}
        columns={columns}
        actions={actions}
        loading={loading}
        getRowKey={(os) => os.id}
        emptyMessage={
          buscando || statusFilter
            ? "Nenhuma ordem de serviço encontrada para o filtro"
            : "Nenhuma ordem de serviço cadastrada"
        }
      />

      <Pagination
        page={page}
        totalPages={totalPages}
        totalElements={totalElements}
        onPageChange={setPage}
      />

      {isModalOpen && (
        <EntityForm<OrdemDeServicoFormData>
          title={
            editingOrdem
              ? "Editar Ordem de Serviço"
              : "Cadastro de Ordem de Serviço"
          }
          fields={ordensServicoFields}
          submitError={submitError}
          initialValues={
            editingOrdem
              ? {
                  unidadeId: editingOrdem.unidadeId,
                  veiculoId: editingOrdem.veiculoId,
                  clienteId: editingOrdem.clienteId ?? undefined,
                  mecanicoId: editingOrdem.mecanicoId ?? undefined,
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
          onClose={() => {
            setSelectingStatusOrdem(null);
            setSubmitError("");
          }}
        />
      )}

      {deletingOrdem && (
        <ConfirmDeleteEntity
          text="Ordem de serviço"
          entity="a ordem de serviço"
          entityName={`#${deletingOrdem.id.toString().padStart(4, "0")}`}
          onConfirm={handleConfirmDelete}
          onCancel={() => setDeletingOrdem(null)}
        />
      )}

      {viewingOrdem && (
        <ViewOrdemServicoModal
          usuarioLogado={usuarioLogado}
          ordemServico={viewingOrdem}
          onClose={() => setViewingOrdem(null)}
          onUpdateOrdemServico={handleUpdateOrdemServico}
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
