import { EntityForm } from "../../EntityForm";
import {
  createMaoDeObraFields,
  type MaoDeObraFormData,
} from "./maoDeObraFields";

interface MaoDeObraModalProps {
  osId: number;
  onClose: () => void;
  onSave: (data: MaoDeObraFormData) => void;
}

export function MaoDeObraModal({ osId, onClose, onSave }: MaoDeObraModalProps) {
  return (
    <EntityForm<MaoDeObraFormData>
      title="Adicionar Mão de Obra"
      fields={createMaoDeObraFields()}
      initialValues={{ osId }}
      onSubmit={onSave}
      onClose={onClose}
    />
  );
}
