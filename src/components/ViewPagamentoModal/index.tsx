import type { Pagamento } from "../../types/pagamento/pagamento";
import type { RegistroPagamento } from "../../types/pagamento/pagamento";

import { PaymentModalHeader } from "./PaymentModalHeader";
import { PaymentSummary } from "./PaymentSummary";
import { PaymentInfo } from "./PaymentInfo";
import { PaymentHistory } from "./PaymentHistory";
import { PaymentObservation } from "./PaymentObservation";
import { PaymentModalFooter } from "./PaymentModalFooter";

import "./viewPagamentoModal.style.css";

interface ViewPagamentoModalProps {
  pagamento: Pagamento;
  registros: RegistroPagamento[];
  onAddPagamento: () => void;
  onClose: () => void;
}

export function ViewPagamentoModal({
  pagamento,
  registros,
  onAddPagamento,
  onClose,
}: ViewPagamentoModalProps) {
  const valorRestante = Math.max(pagamento.valorTotal - pagamento.valorPago, 0);

  return (
    <div className="payment-modal">
      <div className="payment-modal-content">
        <PaymentModalHeader osId={pagamento.osId} onClose={onClose} />

        <PaymentSummary
          valorTotal={pagamento.valorTotal}
          valorPago={pagamento.valorPago}
          valorRestante={valorRestante}
        />

        <PaymentInfo pagamento={pagamento} />

        <PaymentHistory
          registros={registros}
          valorRestante={valorRestante}
          onAddPagamento={onAddPagamento}
        />

        <PaymentObservation observation={pagamento.obs} />

        <PaymentModalFooter valorRestante={valorRestante} onClose={onClose} />
      </div>
    </div>
  );
}
