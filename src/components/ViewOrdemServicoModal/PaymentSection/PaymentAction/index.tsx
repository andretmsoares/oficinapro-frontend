import { Plus } from "lucide-react";
import "./paymentAction.style.css";

interface PaymentActionProps {
  onClick: () => void;
}

export function PaymentAction({ onClick }: PaymentActionProps) {
  return (
    <button type="button" className="view-os-payment-button" onClick={onClick}>
      <Plus size={16} />
      Registrar pagamento
    </button>
  );
}
