import type { Pagamento } from "../../../types/pagamento/pagamento";

import "./paymentInfo.style.css";

interface PaymentInfoProps {
  pagamento: Pagamento;
}

export function PaymentInfo({ pagamento }: PaymentInfoProps) {
  return (
    <div className="payment-info">
      <div>
        <span>Pagamento</span>

        <strong>#{pagamento.id.toString().padStart(4, "0")}</strong>
      </div>

      <div>
        <span>Ordem de Serviço</span>

        <strong>#{pagamento.osId.toString().padStart(4, "0")}</strong>
      </div>

      <div>
        <span>Status</span>

        <strong>{formatPagamentoStatus(pagamento.status)}</strong>
      </div>
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
