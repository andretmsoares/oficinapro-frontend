import { defineFields } from "../EntityForm/types";

export type EditUsuarioFormData = {
  nome: string;
  documento: string;
  telefone: string;
  username: string;
  novaSenha: string;
};

export const editUsuarioFields = defineFields<EditUsuarioFormData>([
  {
    name: "nome",
    label: "Nome",
    placeholder: "Digite o nome do usuário",
    type: "text",
    required: true,
  },
  {
    name: "documento",
    label: "CPF",
    placeholder: "Digite o CPF do usuário",
    type: "document",
    required: true,
  },
  {
    name: "telefone",
    label: "Telefone",
    placeholder: "Digite o telefone do usuário",
    type: "phone",
    required: true,
  },
  {
    name: "username",
    label: "Username",
    placeholder: "Digite o username do usuário",
    type: "text",
    required: true,
  },
  {
    name: "novaSenha",
    label: "Nova senha",
    placeholder: "Nova senha (deixe em branco para manter a atual)",
    type: "password",
  },
]);
