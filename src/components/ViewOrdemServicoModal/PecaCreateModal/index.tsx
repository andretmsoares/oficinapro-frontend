import { EntityForm } from "../../EntityForm";
import {
  createPecaFields,
  type ItemOsPecaFormData,
} from "../../../pages/Pecas/itemOsPecasFields";

interface PecaCreateModalProps {
  osId: number;
  onClose: () => void;
  onSave: (data: ItemOsPecaFormData) => void | Promise<void>;
}

export function PecaCreateModal({
  osId,
  onClose,
  onSave,
}: PecaCreateModalProps) {
  return (
    <EntityForm<ItemOsPecaFormData>
      title="Cadastrar Peça"
      fields={createPecaFields(osId)}
      initialValues={{ osId, quantidade: 1 }}
      onSubmit={onSave}
      onClose={onClose}
    />
  );
}
