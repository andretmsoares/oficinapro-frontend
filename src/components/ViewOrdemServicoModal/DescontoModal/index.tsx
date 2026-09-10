import { EntityForm } from "../../EntityForm";
import { defineFields } from "../../EntityForm/types";
import { formatCurrencyDisplay } from "../../../services/formatters";

export type DescontoFormData = {
  novoDesconto: number;
};

const descontoFields = defineFields<DescontoFormData>([
  {
    name: "novoDesconto",
    label: "Novo desconto",
    type: "currency",
    required: true,
  },
]);

interface DescontoModalProps {
  osId: number;
  descontoAtual: number;
  onClose: () => void;
  onSave: (novoDesconto: number) => void;
}

export function DescontoModal({
  osId,
  descontoAtual,
  onClose,
  onSave,
}: DescontoModalProps) {
  return (
    <EntityForm<DescontoFormData>
      title={`Desconto - OS #${osId.toString().padStart(4, "0")} (atual: ${formatCurrencyDisplay(descontoAtual)})`}
      fields={descontoFields}
      initialValues={{ novoDesconto: descontoAtual }}
      onSubmit={(data) => onSave(data.novoDesconto)}
      onClose={onClose}
    />
  );
}
