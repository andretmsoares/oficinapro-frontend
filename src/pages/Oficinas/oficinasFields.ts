import { defineFields } from "../../components/EntityForm/types";

export type OficinaFormData = {
  nome: string;
  cnpj: string;
  telefone: string;
};

export const oficinaFields = defineFields<OficinaFormData>([
  { name: "nome", label: "Nome", type: "text", required: true },
  { name: "cnpj", label: "CNPJ", type: "document", required: true },
  { name: "telefone", label: "Telefone", type: "phone", required: true },
]);
