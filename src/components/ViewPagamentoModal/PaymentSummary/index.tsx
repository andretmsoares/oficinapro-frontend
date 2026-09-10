import { CircleDollarSign, CreditCard, Wallet } from "lucide-react";

import { formatCurrencyDisplay } from "../../../services/formatters";

import "./paymentSummary.style.css";

interface PaymentSummaryProps {
  valorTotal: number;
  valorPago: number;
  valorRestante: number;
}

export function PaymentSummary({
  valorTotal,
  valorPago,
  valorRestante,
}: PaymentSummaryProps) {
  return (
    <div className="payment-summary">
      <PaymentSummaryCard
        icon={CircleDollarSign}
        label="Valor da OS"
        value={valorTotal}
      />

      <PaymentSummaryCard
        icon={Wallet}
        label="Valor recebido"
        value={valorPago}
      />

      <PaymentSummaryCard
        icon={CreditCard}
        label="Valor restante"
        value={valorRestante}
      />
    </div>
  );
}

interface PaymentSummaryCardProps {
  icon: React.ElementType;
  label: string;
  value: number;
}

function PaymentSummaryCard({
  icon: Icon,
  label,
  value,
}: PaymentSummaryCardProps) {
  return (
    <div className="payment-summary-card">
      <Icon size={20} />

      <div>
        <span>{label}</span>
        <strong>{formatCurrencyDisplay(value)}</strong>
      </div>
    </div>
  );
}
