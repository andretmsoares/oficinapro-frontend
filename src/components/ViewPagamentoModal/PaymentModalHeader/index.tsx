import { X } from "lucide-react";

import "./paymentModalHeader.style.css";

interface PaymentModalHeaderProps {
  osId: number;
  onClose: () => void;
}

export function PaymentModalHeader({ osId, onClose }: PaymentModalHeaderProps) {
  return (
    <div className="payment-modal-header">
      <div>
        <h2>Pagamento da OS #{osId.toString().padStart(4, "0")}</h2>

        <span className="payment-modal-subtitle">
          Histórico financeiro da ordem de serviço
        </span>
      </div>

      <button type="button" className="payment-modal-close" onClick={onClose}>
        <X size={20} />
      </button>
    </div>
  );
}
