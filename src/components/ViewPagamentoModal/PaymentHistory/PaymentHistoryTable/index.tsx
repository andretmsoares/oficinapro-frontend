import type { RegistroPagamento } from "../../../../types/pagamento/pagamento";

import { formatCurrencyDisplay } from "../../../../services/formatters";

import "./paymentHistoryTable.style.css";

interface PaymentHistoryTableProps {
  registros: RegistroPagamento[];
}

export function PaymentHistoryTable({ registros }: PaymentHistoryTableProps) {
  return (
    <div className="payment-table-wrapper">
      <table className="payment-table">
        <thead>
          <tr>
            <th>Data</th>
            <th>Forma de pagamento</th>
            <th>Valor</th>
          </tr>
        </thead>

        <tbody>
          {registros.length === 0 ? (
            <tr>
              <td colSpan={3} className="payment-empty">
                Nenhum pagamento registrado.
              </td>
            </tr>
          ) : (
            registros.map((registro) => (
              <tr key={registro.id}>
                <td>{formatDate(registro.dataPagamento)}</td>

                <td>{formatMeioPagamento(registro.formaPagamento)}</td>

                <td className="payment-table-value">
                  {formatCurrencyDisplay(registro.valor)}
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

function formatDate(date: string): string {
  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(new Date(date));
}

function formatMeioPagamento(meio: string): string {
  switch (meio) {
    case "DINHEIRO":
      return "Dinheiro";

    case "PIX":
      return "PIX";

    case "CARTAO_CREDITO":
      return "Cartão de Crédito";

    case "CARTAO_DEBITO":
      return "Cartão de Débito";

    case "CHEQUE":
      return "Cheque";

    default:
      return meio;
  }
}
