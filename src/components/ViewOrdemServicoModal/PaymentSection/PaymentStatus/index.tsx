import "./paymentStatus.style.css";

interface PaymentStatusProps {
  status: string;
}

function getStatusLabel(status: string): string {
  const labels: Record<string, string> = {
    PAGO: "Pago",
    PARCIAL: "Parcial",
    PENDENTE: "Pendente",
  };

  return labels[status] ?? status;
}

export function PaymentStatus({ status }: PaymentStatusProps) {
  return (
    <div className="view-os-payment-status">
      <span>Status</span>

      <strong
        className={`payment-status payment-status-${status.toLowerCase()}`}
      >
        {getStatusLabel(status)}
      </strong>
    </div>
  );
}
