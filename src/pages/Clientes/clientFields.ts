import { defineFields } from "../../components/EntityForm/types";

export type ClienteFormData = {
  nome: string;
  cpf: string;
  telefone: string;
}

export const clientFields = defineFields<ClienteFormData>([
  { name: "nome", label: "Nome", type: "text", required: true },
  { name: "cpf", label: "CPF/CNPJ", type: "document", required: true },
  { name: "telefone", label: "Telefone", type: "phone", required: true },
]);