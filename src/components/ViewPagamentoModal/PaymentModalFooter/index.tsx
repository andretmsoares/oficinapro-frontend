import { formatCurrencyDisplay } from "../../../services/formatters";

import "./paymentModalFooter.style.css";

interface PaymentModalFooterProps {
  valorRestante: number;
  onClose: () => void;
}

export function PaymentModalFooter({
  valorRestante,
  onClose,
}: PaymentModalFooterProps) {
  return (
    <div className="payment-modal-footer">
      <div>
        <span>Saldo restante</span>

        <strong>{formatCurrencyDisplay(valorRestante)}</strong>
      </div>

      <button type="button" className="payment-close-button" onClick={onClose}>
        Fechar
      </button>
    </div>
  );
}
