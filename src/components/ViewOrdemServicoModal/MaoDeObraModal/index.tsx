import { EntityForm } from "../../EntityForm";
import {
  createMaoDeObraFields,
  type MaoDeObraFormData,
} from "./maoDeObraFields";

interface MaoDeObraModalProps {
  osId: number;
  onClose: () => void;
  onSave: (data: MaoDeObraFormData) => void | Promise<void>;
  submitError?: string;
}

export function MaoDeObraModal({
  osId,
  onClose,
  onSave,
  submitError,
}: MaoDeObraModalProps) {
  return (
    <EntityForm<MaoDeObraFormData>
      title="Adicionar Mão de Obra"
      fields={createMaoDeObraFields()}
      initialValues={{ osId }}
      submitError={submitError}
      onSubmit={onSave}
      onClose={onClose}
    />
  );
}
