import { formatCurrencyDisplay } from "../../../../services/formatters";
import "./paymentValues.style.css";

interface PaymentValuesProps {
  valorTotal: number;
  valorPago: number;
  saldoRestante: number;
}

export function PaymentValues({
  valorTotal,
  valorPago,
  saldoRestante,
}: PaymentValuesProps) {
  return (
    <div className="view-os-payment-values">
      <div>
        <span>Valor da OS</span>
        <strong>{formatCurrencyDisplay(valorTotal)}</strong>
      </div>

      <div>
        <span>Valor recebido</span>
        <strong>{formatCurrencyDisplay(valorPago)}</strong>
      </div>

      <div>
        <span>Saldo restante</span>
        <strong>{formatCurrencyDisplay(saldoRestante)}</strong>
      </div>
    </div>
  );
}
