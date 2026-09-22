import { EntityForm } from "../EntityForm";
import {
  editUsuarioFields,
  type EditUsuarioFormData,
} from "./editUsuarioFields";
import type { Usuario } from "../../types/usuario/usuario";

interface EditUsuarioModalProps {
  usuarioLogado: Usuario;
  onClose: () => void;
  onSave: (data: EditUsuarioFormData) => void;
  submitError: string;
}

export function EditUsuarioModal({
  usuarioLogado,
  onClose,
  onSave,
  submitError,
}: EditUsuarioModalProps) {
  return (
    <EntityForm<EditUsuarioFormData>
      title="Editar meus dados"
      fields={editUsuarioFields}
      initialValues={{
        nome: usuarioLogado.nome,
        documento: usuarioLogado.documento,
        telefone: usuarioLogado.telefone,
        username: usuarioLogado.username,
        novaSenha: "",
      }}
      onSubmit={onSave}
      onClose={onClose}
      submitError={submitError}
    />
  );
}
