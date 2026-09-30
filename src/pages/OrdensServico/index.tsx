import { useState, useEffect, useMemo } from "react";
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
import type { ItemOsPeca } from "../../types/itemOsPeca/itemOsPeca";

import "./ordensServico.style.css";

import { ViewOrdemServicoModal } from "../../components/ViewOrdemServicoModal";
import type { Usuario } from "../../types/usuario/usuario";
import { HeaderPage } from "../../components/HeaderPage";

import {
  listarOrdensServico,
  criarOrdemServico,
  atualizarOrdemServico,
  deletarOrdemServico,
  atualizarStatusOrdemServico,
  imprimirOrdemServico,
} from "../../services/ordemDeServicoService";

import { listarItemOsPecas } from "../../services/itemOsPecaService";
import { buscarPagamentosPorOficina } from "../../services/pagamentoService";

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

  const [ordensServico, setOrdensServico] = useState<OrdemDeServico[]>([]);
  const [loading, setLoading] = useState(true);
  const [pecas, setPecas] = useState<ItemOsPeca[]>([]);

  const [searchParams] = useSearchParams();

  const clienteBusca = searchParams.get("cliente") ?? "";
  const veiculoBusca = searchParams.get("veiculo") ?? "";

  const [searchTerm, setSearchTerm] = useState(clienteBusca || veiculoBusca);

  const [statusFilter, setStatusFilter] = useState<StatusOrdemDeServico | "">(
    "",
  );

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

      const ordemAtualizada = await atualizarStatusOrdemServico(
        selectingStatusOrdem.id,
        {
          status: newStatus as StatusOrdemDeServico,
        },
      );

      setOrdensServico((prev) =>
        prev.map((os) => (os.id === ordemAtualizada.id ? ordemAtualizada : os)),
      );

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

  function handleAddPeca(peca: ItemOsPeca) {
    setPecas((prev) => {
      const existe = prev.some((item) => item.id === peca.id);

      if (existe) {
        return prev.map((item) => (item.id === peca.id ? peca : item));
      }

      return [...prev, peca];
    });
  }

  function handleUpdatePeca(pecaAtualizada: ItemOsPeca) {
    setPecas((prev) =>
      prev.map((peca) =>
        peca.id === pecaAtualizada.id ? pecaAtualizada : peca,
      ),
    );
  }

  async function recarregarValoresPendentes() {
    if (usuarioLogado.oficinaId === null) return;

    try {
      const pagamentos = await buscarPagamentosPorOficina(
        usuarioLogado.oficinaId,
      );

      setValoresPendentes(
        Object.fromEntries(
          pagamentos.map((pagamento) => [
            pagamento.osId,
            pagamento.valorPendente,
          ]),
        ),
      );
    } catch (error) {
      console.error("Erro ao carregar valores pendentes das OS:", error);
    }
  }

  function handleUpdateOrdemServico(ordemAtualizada: OrdemDeServico) {
    recarregarValoresPendentes();

    setOrdensServico((prev) =>
      prev.map((ordem) =>
        ordem.id === ordemAtualizada.id ? ordemAtualizada : ordem,
      ),
    );

    setViewingOrdem((prev) =>
      prev && prev.id === ordemAtualizada.id ? ordemAtualizada : prev,
    );
  }

  async function handleAddOrdem(data: OrdemDeServicoFormData) {
    try {
      setSubmitError("");

      const novaOrdem = await criarOrdemServico(data);

      setOrdensServico((prev) => [...prev, novaOrdem]);
      recarregarValoresPendentes();

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

      const ordemAtualizada = await atualizarOrdemServico(
        editingOrdem.id,
        data,
      );

      setOrdensServico((prev) =>
        prev.map((ordem) =>
          ordem.id === ordemAtualizada.id ? ordemAtualizada : ordem,
        ),
      );

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

      setOrdensServico((prev) =>
        prev.filter((ordem) => ordem.id !== deletingOrdem.id),
      );

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

  useEffect(() => {
    let ativo = true;

    async function carregarDados() {
      try {
        const [ordens, pecasData, pagamentos] = await Promise.all([
          listarOrdensServico(),
          listarItemOsPecas(),
          usuarioLogado.oficinaId === null
            ? Promise.resolve([])
            : buscarPagamentosPorOficina(usuarioLogado.oficinaId),
        ]);

        if (!ativo) return;

        setOrdensServico(ordens);
        setPecas(pecasData);
        setValoresPendentes(
          Object.fromEntries(
            pagamentos.map((pagamento) => [
              pagamento.osId,
              pagamento.valorPendente,
            ]),
          ),
        );
      } catch (error) {
        if (!ativo) return;

        console.error("Erro ao carregar ordens de serviço e peças:", error);
      } finally {
        if (ativo) {
          setLoading(false);
        }
      }
    }

    carregarDados();

    return () => {
      ativo = false;
    };
  }, [usuarioLogado.oficinaId]);

  const ordensFiltradas = useMemo(
    () =>
      statusFilter
        ? ordensServico.filter((os) => os.status === statusFilter)
        : ordensServico,
    [ordensServico, statusFilter],
  );

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
        value={ordensServico.length.toString()}
        description="Total na base de dados"
        icon={ClipboardList}
      />

      <div className="list-filters">
        <SearchBar
          placeholder="Pesquisar por veículo, cliente ou status"
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
        />

        <StatusFilter
          label="Filtrar por status"
          value={statusFilter}
          options={STATUS_FILTER_OPTIONS}
          onChange={setStatusFilter}
        />
      </div>

      <EntityTable
        data={ordensFiltradas}
        columns={columns}
        actions={actions}
        loading={loading}
        getRowKey={(os) => os.id}
        searchTerm={searchTerm}
        searchFields={["placaVeiculo", "nomeCliente", "status"]}
        emptyMessage={
          statusFilter
            ? "Nenhuma ordem de serviço com este status"
            : "Nenhuma ordem de serviço cadastrada"
        }
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
          todasAsPecas={pecas}
          onClose={() => setViewingOrdem(null)}
          onAddPeca={handleAddPeca}
          onUpdatePeca={handleUpdatePeca}
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
