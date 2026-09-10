import { Plus } from "lucide-react";

import type { RegistroPagamento } from "../../../types/pagamento/pagamento";

import "./paymentHistory.style.css";
import { PaymentHistoryTable } from "./PaymentHistoryTable";

interface PaymentHistoryProps {
  registros: RegistroPagamento[];
  valorRestante: number;
  onAddPagamento: () => void;
}

export function PaymentHistory({
  registros,
  valorRestante,
  onAddPagamento,
}: PaymentHistoryProps) {
  return (
    <section className="payment-history">
      <div className="payment-section-header">
        <div>
          <h3>Histórico de pagamentos</h3>

          <span>Registros realizados para esta OS</span>
        </div>

        {valorRestante > 0 && (
          <button
            type="button"
            className="payment-add-button"
            onClick={onAddPagamento}
          >
            <Plus size={16} />
            Registrar pagamento
          </button>
        )}
      </div>

      <PaymentHistoryTable registros={registros} />
    </section>
  );
}
