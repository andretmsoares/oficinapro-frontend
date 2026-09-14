import { defineFields } from "../EntityForm/types";

export type EditUsuarioFormData = {
  nome: string;
  documento: string;
  telefone: string;
  username: string;
  novaSenha: string;
};

export const editUsuarioFields = defineFields<EditUsuarioFormData>([
  { name: "nome", label: "Nome", type: "text", required: true },
  { name: "documento", label: "CPF", type: "document", required: true },
  { name: "telefone", label: "Telefone", type: "phone", required: true },
  { name: "username", label: "Username", type: "text", required: true },
  {
    name: "novaSenha",
    label: "Nova senha (deixe em branco para manter a atual)",
    type: "password",
  },
]);
