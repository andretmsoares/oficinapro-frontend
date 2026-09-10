import { useMemo, useState } from "react";
import { CircleDollarSign, Clock, Eye, Printer, Wallet } from "lucide-react";

import { StatCard } from "../../components/StatCard";
import { SearchBar } from "../../components/SearchBar";
import { EntityTable } from "../../components/EntityTable";
import type { Column, EntityAction } from "../../components/EntityTable/types";

import { ViewPagamentoModal } from "../../components/ViewPagamentoModal";
import { PaymentRegistrationModal } from "../../components/PaymentRegistrationModal";
import type { RegistroPagamentoFormData } from "../../components/PaymentRegistrationModal/registroPagamentoFields";

import type {
  Pagamento,
  RegistroPagamento,
  MeioDePagamento,
} from "../../types/pagamento/pagamento";

import { formatCurrencyDisplay } from "../../services/formatters";

import "./pagamentos.style.css";
import { MOCK_ORDENS_SERVICO } from "../../mocks/ordemDeServico";
import { HeaderPage } from "../../components/HeaderPage";

interface PagamentosProps {
  pagamentos: Pagamento[];
  registros: RegistroPagamento[];
  onAddRegistroPagamento: (
    pagamentoId: number,
    valor: number,
    formaPagamento: MeioDePagamento,
  ) => void;
}

export function Pagamentos({
  pagamentos,
  registros,
  onAddRegistroPagamento,
}: PagamentosProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [viewingPagamentoId, setViewingPagamentoId] = useState<number | null>(
    null,
  );
  const [isRegistroModalOpen, setIsRegistroModalOpen] = useState(false);

  const viewingPagamento = useMemo(
    () => pagamentos.find((p) => p.id === viewingPagamentoId) ?? null,
    [pagamentos, viewingPagamentoId],
  );

  const totalRecebido = pagamentos.reduce((total, p) => total + p.valorPago, 0);

  const totalAReceber = pagamentos.reduce(
    (total, p) => total + Math.max(p.valorTotal - p.valorPago, 0),
    0,
  );

  const pagamentosPendentes = pagamentos.filter(
    (p) => p.valorPago === 0,
  ).length;

  function handleAddRegistro(data: RegistroPagamentoFormData) {
    if (!viewingPagamento) return;
    onAddRegistroPagamento(
      viewingPagamento.id,
      data.valorPago,
      data.meioPagamento,
    );
    setIsRegistroModalOpen(false);
  }

  const columns: Column<Pagamento>[] = [
    {
      key: "osId",
      header: "OS",
      width: "10%",
      render: (pagamento) => (
        <strong>#{pagamento.osId.toString().padStart(4, "0")}</strong>
      ),
    },
    {
      key: "id",
      header: "Pagamento",
      width: "10%",
      render: (pagamento) => (
        <span>#{pagamento.id.toString().padStart(4, "0")}</span>
      ),
    },
    {
      key: "cliente",
      header: "Cliente",
      width: "22%",
      render: (pagamento) => (
        <strong className="payment-client-name">
          {getClienteNome(pagamento.osId)}
        </strong>
      ),
    },
    {
      key: "valorTotal",
      header: "Valor OS",
      width: "17%",
      render: (pagamento) => formatCurrencyDisplay(pagamento.valorTotal),
    },
    {
      key: "valorPago",
      header: "Recebido",
      width: "17%",
      render: (pagamento) => (
        <span className="payment-received">
          {formatCurrencyDisplay(pagamento.valorPago)}
        </span>
      ),
    },
    {
      key: "status",
      header: "Status",
      width: "16%",
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
      onClick: (pagamento) => setViewingPagamentoId(pagamento.id),
    },
    {
      label: "Imprimir pagamento",
      icon: Printer,
      variant: "print",
      onClick: (pagamento) => handlePrintPagamento(pagamento.id),
    },
  ];

  return (
    <div className="page">
      <HeaderPage
        title="Pagamentos"
        subtitle="Gerencie os pagamentos das ordens de serviço"
      />

      <div className="payments-stats">
        <StatCard
          title="Total Recebido"
          value={formatCurrencyDisplay(totalRecebido)}
          description="Total já recebido"
          icon={CircleDollarSign}
        />
        <StatCard
          title="A Receber"
          value={formatCurrencyDisplay(totalAReceber)}
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
        data={pagamentos}
        columns={columns}
        actions={actions}
        getRowKey={(pagamento) => pagamento.id}
        searchTerm={searchTerm}
        searchFn={(pagamento, term) => {
          const cliente = getClienteNome(pagamento.osId);
          return (
            pagamento.osId.toString().includes(term) ||
            pagamento.id.toString().includes(term) ||
            cliente.toLowerCase().includes(term.toLowerCase())
          );
        }}
        emptyMessage="Nenhum pagamento cadastrado"
      />

      {viewingPagamento && (
        <ViewPagamentoModal
          pagamento={viewingPagamento}
          registros={registros.filter(
            (r) => r.pagamentoId === viewingPagamento.id,
          )}
          onAddPagamento={() => setIsRegistroModalOpen(true)}
          onClose={() => setViewingPagamentoId(null)}
        />
      )}

      {isRegistroModalOpen && viewingPagamento && (
        <PaymentRegistrationModal
          pagamento={viewingPagamento}
          onSave={handleAddRegistro}
          onClose={() => setIsRegistroModalOpen(false)}
        />
      )}
    </div>
  );
}

function formatPagamentoStatus(status: string): string {
  switch (status) {
    case "PAGO":
      return "Pago";
    case "PARCIAL":
      return "Parcial";
    case "PENDENTE":
      return "Pendente";
    default:
      return status;
  }
}

function getClienteNome(osId: number): string {
  const ordem = MOCK_ORDENS_SERVICO.find((os) => os.id === osId);
  return ordem?.nomeCliente ?? "Cliente não encontrado";
}

function handlePrintPagamento(pagamentoId: number) {
  console.log("Imprimir pagamento:", pagamentoId);
  // TODO: implementar impressão do comprovante
}
