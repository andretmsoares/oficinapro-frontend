import { EntityForm } from "../../EntityForm";
import {
  createPecaFields,
  type PecaFormData,
} from "../../../pages/Pecas/pecasFields";

interface PecaCreateModalProps {
  osId: number;
  onClose: () => void;
  onSave: (data: PecaFormData) => void;
}

export function PecaCreateModal({
  osId,
  onClose,
  onSave,
}: PecaCreateModalProps) {
  return (
    <EntityForm<PecaFormData>
      title="Cadastrar Peça"
      fields={createPecaFields(osId)}
      initialValues={{ osId, quantidade: 1 }}
      onSubmit={onSave}
      onClose={onClose}
    />
  );
}
