import { Plus } from "lucide-react";

import "./paymentHistory.style.css";
import { PaymentHistoryTable } from "./PaymentHistoryTable";
import type { RegistroPagamento } from "../../../types/registroPagamento/registroPagamento";

interface PaymentHistoryProps {
  registros: RegistroPagamento[];
  valorRestante: number;
  onAddPagamento: () => void;
  onDeletePagamento: (registroId: number) => void;
}

export function PaymentHistory({
  registros,
  valorRestante,
  onAddPagamento,
  onDeletePagamento,
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

      <PaymentHistoryTable
        registros={registros}
        onDeletePagamento={onDeletePagamento}
      />
    </section>
  );
}
