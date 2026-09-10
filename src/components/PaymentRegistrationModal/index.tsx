import { EntityForm } from "../EntityForm";
import {
  createRegistroPagamentoFields,
  type RegistroPagamentoFormData,
} from "./registroPagamentoFields";
import type { Pagamento } from "../../types/pagamento/pagamento";

interface PaymentRegistrationModalProps {
  pagamento: Pagamento;
  onSave: (data: RegistroPagamentoFormData) => void;
  onClose: () => void;
}

export function PaymentRegistrationModal({
  pagamento,
  onSave,
  onClose,
}: PaymentRegistrationModalProps) {
  const saldoRestante = Math.max(pagamento.valorTotal - pagamento.valorPago, 0);

  return (
    <EntityForm<RegistroPagamentoFormData>
      title={`Registrar Pagamento - OS #${pagamento.osId.toString().padStart(4, "0")}`}
      fields={createRegistroPagamentoFields(saldoRestante)}
      onSubmit={onSave}
      onClose={onClose}
    />
  );
}
