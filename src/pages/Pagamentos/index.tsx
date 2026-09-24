import { useEffect, useMemo, useState } from "react";
import { CircleDollarSign, Clock, Eye, Printer, Wallet } from "lucide-react";

import { StatCard } from "../../components/StatCard";
import { SearchBar } from "../../components/SearchBar";
import { EntityTable } from "../../components/EntityTable";
import type { Column, EntityAction } from "../../components/EntityTable/types";

import { ViewPagamentoModal } from "../../components/ViewPagamentoModal";

import type { Pagamento } from "../../types/pagamento/pagamento";
import { StatusPagamento } from "../../enums/StatusPagamento";

import {
  buscarPagamentosPorOficina,
  calcularValorParaReceber,
} from "../../services/pagamentoService";

import {
  formatCurrencyDisplay,
  formatPagamentoStatus,
} from "../../utils/formatters";

import "./pagamentos.style.css";
import { HeaderPage } from "../../components/HeaderPage";

interface PagamentosProps {
  oficinaId: number;
}

export function Pagamentos({ oficinaId }: PagamentosProps) {
  const [pagamentos, setPagamentos] = useState<Pagamento[]>([]);
  const [valorAReceber, setValorAReceber] = useState(0);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [searchTerm, setSearchTerm] = useState("");

  const [viewingPagamentoId, setViewingPagamentoId] = useState<number | null>(
    null,
  );

  const viewingPagamento = useMemo(
    () =>
      pagamentos.find((pagamento) => pagamento.id === viewingPagamentoId) ??
      null,
    [pagamentos, viewingPagamentoId],
  );

  useEffect(() => {
    async function carregarPagamentos() {
      try {
        setLoading(true);
        setError("");

        const [pagamentosResponse, valorAReceberResponse] = await Promise.all([
          buscarPagamentosPorOficina(oficinaId),
          calcularValorParaReceber(oficinaId),
        ]);

        setPagamentos(pagamentosResponse);
        setValorAReceber(valorAReceberResponse);
      } catch (err) {
        console.error("Erro ao carregar pagamentos:", err);

        setError("Não foi possível carregar os pagamentos.");
      } finally {
        setLoading(false);
      }
    }

    carregarPagamentos();
  }, [oficinaId]);

  const totalRecebido = pagamentos.reduce(
    (total, pagamento) => total + pagamento.valorPago,
    0,
  );

  const pagamentosPendentes = pagamentos.filter(
    (pagamento) => pagamento.status === StatusPagamento.PAGAMENTO_PENDENTE,
  ).length;

  const pagamentosFiltrados = useMemo(() => {
    const termo = searchTerm.trim().toLowerCase();

    if (!termo) {
      return pagamentos;
    }

    return pagamentos.filter((pagamento) => {
      return (
        pagamento.osId.toString().includes(termo) ||
        pagamento.id.toString().includes(termo)
      );
    });
  }, [pagamentos, searchTerm]);

  const columns: Column<Pagamento>[] = [
    {
      key: "osId",
      header: "OS",
      width: "15%",
      render: (pagamento) => (
        <strong>#{pagamento.osId.toString().padStart(4, "0")}</strong>
      ),
    },
    {
      key: "valorTotal",
      header: "Valor OS",
      width: "20%",
      render: (pagamento) => formatCurrencyDisplay(pagamento.valorTotal),
    },
    {
      key: "valorPago",
      header: "Recebido",
      width: "20%",
      render: (pagamento) => formatCurrencyDisplay(pagamento.valorPago),
    },
    {
      key: "valorPendente",
      header: "A Receber",
      width: "20%",
      render: (pagamento) => formatCurrencyDisplay(pagamento.valorPendente),
    },
    {
      key: "status",
      header: "Status",
      width: "20%",
      render: (pagamento) => (
        <span
          className={`payment-status payment-status-${pagamento.status.toLowerCase()}`}
        >
          {formatPagamentoStatus(pagamento.status)}
        </span>
      ),
    },
  ];

  const actions: EntityAction<Pagamento>[] = [
    {
      label: "Visualizar pagamento",
      icon: Eye,
      variant: "view",
      onClick: (pagamento) => {
        setViewingPagamentoId(pagamento.id);
      },
    },
    {
      label: "Imprimir pagamento",
      icon: Printer,
      variant: "print",
      onClick: (pagamento) => {
        handlePrintPagamento(pagamento.id);
      },
    },
  ];

  return (
    <div className="page">
      <HeaderPage
        title="Pagamentos"
        subtitle="Gerencie os pagamentos das ordens de serviço"
      />

      {error && (
        <div className="page-error">
          <p>{error}</p>
        </div>
      )}

      <div className="payments-stats">
        <StatCard
          title="Total Recebido"
          value={formatCurrencyDisplay(totalRecebido)}
          description="Total já recebido"
          icon={CircleDollarSign}
        />

        <StatCard
          title="A Receber"
          value={formatCurrencyDisplay(valorAReceber)}
          description="Valor pendente"
          icon={Wallet}
        />

        <StatCard
          title="Pagamentos"
          value={pagamentos.length.toString()}
          description="Total de pagamentos"
          icon={CircleDollarSign}
        />

        <StatCard
          title="Pendentes"
          value={pagamentosPendentes.toString()}
          description="Sem nenhum pagamento"
          icon={Clock}
        />
      </div>

      <SearchBar
        placeholder="Pesquisar por OS ou pagamento"
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
      />

      <EntityTable
        data={pagamentosFiltrados}
        columns={columns}
        actions={actions}
        loading={loading}
        getRowKey={(pagamento) => pagamento.id}
        searchTerm=""
        searchFn={() => true}
        emptyMessage="Nenhum pagamento cadastrado"
      />

      {viewingPagamento && (
        <ViewPagamentoModal
          pagamento={viewingPagamento}
          registros={[]}
          onAddPagamento={() => {
            console.warn(
              "Registro de pagamento ainda não possui endpoint no backend.",
            );
          }}
          onClose={() => setViewingPagamentoId(null)}
        />
      )}
    </div>
  );
}

function handlePrintPagamento(pagamentoId: number) {
  console.log("Imprimir pagamento:", pagamentoId);

  // TODO: implementar impressão do comprovante
}
