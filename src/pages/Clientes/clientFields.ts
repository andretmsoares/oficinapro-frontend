import { defineFields } from "../../components/EntityForm/types";

export type ClienteFormData = {
  nome: string;
  cpf: string;
  telefone: string;
};

export const clientFields = defineFields<ClienteFormData>([
  {
    name: "nome",
    label: "Nome",
    placeholder: "Digite o nome do cleinte",
    type: "text",
    required: true,
  },
  {
    name: "cpf",
    label: "CPF/CNPJ",
    placeholder: "Digite o documento do cliente (CPF/CNPJ)",
    type: "document",
    required: true,
  },
  {
    name: "telefone",
    label: "Telefone",
    placeholder: "Digite o telefone do cliente",
    type: "phone",
    required: true,
  },
]);
