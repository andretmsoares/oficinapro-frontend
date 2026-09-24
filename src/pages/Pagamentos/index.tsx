import { useEffect, useMemo, useState } from "react";
import {
  CircleDollarSign,
  Clock,
  Eye,
  Plus,
  Printer,
  Wallet,
} from "lucide-react";

import { StatCard } from "../../components/StatCard";
import { SearchBar } from "../../components/SearchBar";
import { EntityTable } from "../../components/EntityTable";
import type { Column, EntityAction } from "../../components/EntityTable/types";

import { ViewPagamentoModal } from "../../components/ViewPagamentoModal";
import { PaymentRegistrationModal } from "../../components/PaymentRegistrationModal";
import type { RegistroPagamentoFormData } from "../../components/PaymentRegistrationModal/registroPagamentoFields";

import type { Pagamento } from "../../types/pagamento/pagamento";
import type { RegistroPagamento } from "../../types/registroPagamento/registroPagamento";

import {
  buscarPagamentosPorOficina,
  calcularValorParaReceber,
} from "../../services/pagamentoService";

import {
  criarRegistroPagamento,
  deletarRegistroPagamento,
  listarRegistrosPorPagamento,
} from "../../services/registroPagamentoService";

import {
  formatCurrencyDisplay,
  formatPagamentoStatus,
} from "../../utils/formatters";

import "./pagamentos.style.css";

import { HeaderPage } from "../../components/HeaderPage";
import { StatusPagamento } from "../../enums/StatusPagamento";

interface PagamentosProps {
  oficinaId: number;
}

export function Pagamentos({ oficinaId }: PagamentosProps) {
  const [pagamentos, setPagamentos] = useState<Pagamento[]>([]);
  const [valorAReceber, setValorAReceber] = useState(0);

  const [registros, setRegistros] = useState<RegistroPagamento[]>([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [submitError, setSubmitError] = useState("");

  const [searchTerm, setSearchTerm] = useState("");

  const [viewingPagamentoId, setViewingPagamentoId] = useState<number | null>(
    null,
  );

  const [registeringPagamentoId, setRegisteringPagamentoId] = useState<
    number | null
  >(null);

  const viewingPagamento = useMemo(
    () =>
      pagamentos.find((pagamento) => pagamento.id === viewingPagamentoId) ??
      null,
    [pagamentos, viewingPagamentoId],
  );

  const registeringPagamento = useMemo(
    () =>
      pagamentos.find((pagamento) => pagamento.id === registeringPagamentoId) ??
      null,
    [pagamentos, registeringPagamentoId],
  );

  const paymentStatusClass: Record<string, string> = {
    [StatusPagamento.PAGAMENTO_PENDENTE]: "payment-status-pendente",
    [StatusPagamento.PAGO_PARCIALMENTE]: "payment-status-parcial",
    [StatusPagamento.PAGA]: "payment-status-pago",
  };

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

  useEffect(() => {
    async function carregarRegistros() {
      if (!viewingPagamentoId) {
        setRegistros([]);
        return;
      }

      try {
        setRegistros([]);

        const registrosResponse =
          await listarRegistrosPorPagamento(viewingPagamentoId);

        setRegistros(registrosResponse);
      } catch (err) {
        console.error("Erro ao carregar registros de pagamento:", err);

        setRegistros([]);
      }
    }

    carregarRegistros();
  }, [viewingPagamentoId]);

  const totalRecebido = pagamentos.reduce(
    (total, pagamento) => total + pagamento.valorPago,
    0,
  );

  const pagamentosPendentes = pagamentos.filter(
    (pagamento) => pagamento.valorPendente > 0,
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

  async function recarregarPagamentos() {
    try {
      setError("");

      const [pagamentosResponse, valorAReceberResponse] = await Promise.all([
        buscarPagamentosPorOficina(oficinaId),
        calcularValorParaReceber(oficinaId),
      ]);

      setPagamentos(pagamentosResponse);
      setValorAReceber(valorAReceberResponse);
    } catch (err) {
      console.error("Erro ao recarregar pagamentos:", err);

      setError("Não foi possível atualizar os pagamentos.");
    }
  }

  async function handleSaveRegistroPagamento(data: RegistroPagamentoFormData) {
    if (!registeringPagamentoId) {
      return;
    }

    try {
      setSubmitError("");

      await criarRegistroPagamento({
        pagamentoId: registeringPagamentoId,
        valor: data.valorPago,
        meioPagamento: data.meioPagamento,
      });

      setRegisteringPagamentoId(null);

      await recarregarPagamentos();
    } catch (err) {
      console.error("Erro ao registrar pagamento:", err);

      setSubmitError(
        err instanceof Error
          ? err.message
          : "Não foi possível registrar o pagamento.",
      );
    }
  }

  async function handleDeleteRegistroPagamento(registroId: number) {
    try {
      await deletarRegistroPagamento(registroId);

      if (viewingPagamentoId) {
        const registrosResponse =
          await listarRegistrosPorPagamento(viewingPagamentoId);

        setRegistros(registrosResponse);
      }

      await recarregarPagamentos();
    } catch (err) {
      console.error("Erro ao remover pagamento:", err);

      setError(
        err instanceof Error
          ? err.message
          : "Não foi possível remover o pagamento.",
      );
    }
  }

  const columns: Column<Pagamento>[] = [
    {
      key: "osId",
      header: "OS",
      width: "13%",
      render: (pagamento) => (
        <strong>#{pagamento.osId.toString().padStart(4, "0")}</strong>
      ),
    },
    {
      key: "valorTotal",
      header: "Valor OS",
      width: "18%",
      render: (pagamento) => formatCurrencyDisplay(pagamento.valorTotal),
    },
    {
      key: "valorPago",
      header: "Recebido",
      width: "18%",
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
          className={`payment-status ${paymentStatusClass[pagamento.status]}`}
        >
          {formatPagamentoStatus(pagamento.status)}
        </span>
      ),
    },
  ];

  const actions: EntityAction<Pagamento>[] = [
    {
      label: "Registrar Pagamento",
      icon: Plus,
      variant: "edit",
      onClick: (pagamento) => {
        setSubmitError("");
        setRegisteringPagamentoId(pagamento.id);
      },
    },
    {
      label: "Visualizar pagamento",
      icon: Eye,
      variant: "view",
      onClick: (pagamento) => {
        setSubmitError("");
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
        placeholder="Pesquisar pelo código da OS"
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
          registros={registros}
          onAddPagamento={() => {
            setViewingPagamentoId(null);
            setSubmitError("");
            setRegisteringPagamentoId(viewingPagamento.id);
          }}
          onDeletePagamento={handleDeleteRegistroPagamento}
          onClose={() => {
            setViewingPagamentoId(null);
            setRegistros([]);
          }}
        />
      )}

      {registeringPagamento && (
        <PaymentRegistrationModal
          pagamento={registeringPagamento}
          onSave={handleSaveRegistroPagamento}
          onClose={() => {
            setRegisteringPagamentoId(null);
            setSubmitError("");
          }}
          submitError={submitError}
        />
      )}
    </div>
  );
}

function handlePrintPagamento(pagamentoId: number) {
  console.log("Imprimir pagamento:", pagamentoId);

  // TODO: implementar impressão do comprovante
}
