import { useState } from "react";
import { CircleDollarSign, Clock, Eye, Printer, Wallet } from "lucide-react";

import { StatCard } from "../../components/StatCard";
import { SearchBar } from "../../components/SearchBar";
import { EntityTable } from "../../components/EntityTable";
import type { Column, EntityAction } from "../../components/EntityTable/types";

import { ViewPagamentoModal } from "../../components/ViewPagamentoModal";
import { EntityForm } from "../../components/EntityForm";

import type {
  Pagamento,
  StatusPagamento,
} from "../../types/pagamento/pagamento";
import type { RegistroPagamento } from "../../types/pagamento/pagamento";

import { MOCK_PAGAMENTOS } from "../../mocks/pagamento";

import { MOCK_REGISTROS_PAGAMENTO } from "../../mocks/registroPagamento";

import {
  registroPagamentoFields,
  type RegistroPagamentoFormData,
} from "./pagamentoFields";

import { formatCurrencyDisplay } from "../../services/formatters";

import "./pagamentos.style.css";
import { MOCK_ORDENS_SERVICO } from "../../mocks/ordemDeServico";
import { HeaderPage } from "../../components/HeaderPage";

export function Pagamentos() {
  const [pagamentos, setPagamentos] = useState<Pagamento[]>(MOCK_PAGAMENTOS);

  const [registros, setRegistros] = useState<RegistroPagamento[]>(
    MOCK_REGISTROS_PAGAMENTO,
  );

  const [searchTerm, setSearchTerm] = useState("");

  const [viewingPagamento, setViewingPagamento] = useState<Pagamento | null>(
    null,
  );

  const [isRegistroModalOpen, setIsRegistroModalOpen] = useState(false);

  const totalRecebido = pagamentos.reduce(
    (total, pagamento) => total + pagamento.valorPago,
    0,
  );

  const totalAReceber = pagamentos.reduce(
    (total, pagamento) =>
      total + Math.max(pagamento.valorTotal - pagamento.valorPago, 0),
    0,
  );

  const pagamentosPendentes = pagamentos.filter(
    (pagamento) => pagamento.valorPago === 0,
  ).length;

  function handleViewPagamento(id: number) {
    const pagamento = pagamentos.find((item) => item.id === id);

    if (!pagamento) return;

    setViewingPagamento(pagamento);
  }

  function handleAddRegistro(data: RegistroPagamentoFormData) {
    if (!viewingPagamento) return;

    const novoRegistro: RegistroPagamento = {
      id: registros.length + 1,
      pagamentoId: viewingPagamento.id,
      valor: data.valorPago,
      formaPagamento: data.meioPagamento,
      dataPagamento: new Date().toISOString(),
    };

    setRegistros((prev) => [...prev, novoRegistro]);

    setPagamentos((prev) =>
      prev.map((pagamento) => {
        if (pagamento.id !== viewingPagamento.id) {
          return pagamento;
        }

        const novoValorPago = pagamento.valorPago + data.valorPago;

        return {
          ...pagamento,
          valorPago: novoValorPago,
          status: getPagamentoStatus(novoValorPago, pagamento.valorTotal),
        };
      }),
    );

    setIsRegistroModalOpen(false);

    const pagamentoAtualizado = {
      ...viewingPagamento,
      valorPago: viewingPagamento.valorPago + data.valorPago,
    };

    setViewingPagamento(pagamentoAtualizado);
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
      onClick: (pagamento) => handleViewPagamento(pagamento.id),
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
            (registro) => registro.pagamentoId === viewingPagamento.id,
          )}
          onAddPagamento={() => setIsRegistroModalOpen(true)}
          onClose={() => setViewingPagamento(null)}
        />
      )}

      {isRegistroModalOpen && viewingPagamento && (
        <EntityForm<RegistroPagamentoFormData>
          title={`Registrar Pagamento - OS #${viewingPagamento.osId
            .toString()
            .padStart(4, "0")}`}
          fields={registroPagamentoFields}
          onSubmit={handleAddRegistro}
          onClose={() => setIsRegistroModalOpen(false)}
        />
      )}
    </div>
  );
}

function getPagamentoStatus(
  valorPago: number,
  valorTotal: number,
): StatusPagamento {
  if (valorPago <= 0) {
    return "PENDENTE";
  }

  if (valorPago >= valorTotal) {
    return "PAGO";
  }

  return "PARCIAL";
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

  // TODO:
  // implementar impressão do comprovante
}
