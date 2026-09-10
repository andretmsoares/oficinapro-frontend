import { Wallet } from "lucide-react";

import type { Pagamento } from "../../../types/pagamento/pagamento";

import { SectionTitle } from "../SectionTitle";
import { PaymentStatus } from "./PaymentStatus";
import { PaymentValues } from "./PaymentValues";
import { PaymentAction } from "./PaymentAction";

import "./paymentSection.style.css";

interface PaymentSectionProps {
  pagamento: Pagamento;
  onRegistrarPagamento?: () => void;
}

export function PaymentSection({
  pagamento,
  onRegistrarPagamento,
}: PaymentSectionProps) {
  const valorPago = pagamento.valorPago;
  const valorTotal = pagamento.valorTotal;

  const saldoRestante = Math.max(valorTotal - valorPago, 0);

  return (
    <section className="view-os-payment">
      <SectionTitle icon={Wallet} title="Pagamento" />

      <div className="view-os-payment-content">
        <PaymentStatus status={pagamento.status} />

        <PaymentValues
          valorTotal={valorTotal}
          valorPago={valorPago}
          saldoRestante={saldoRestante}
        />

        {saldoRestante > 0 && onRegistrarPagamento && (
          <PaymentAction onClick={onRegistrarPagamento} />
        )}
      </div>
    </section>
  );
}
