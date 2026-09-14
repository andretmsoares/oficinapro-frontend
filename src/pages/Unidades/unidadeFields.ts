import { defineFields } from "../../components/EntityForm/types";

export type UnidadeFormData = {
  nome: string;
  endereco: string;
  telefone: string;
};

export const unidadeFields = defineFields<UnidadeFormData>([
  { name: "nome", label: "Nome", type: "text", required: true },
  { name: "endereco", label: "Endereço", type: "text", required: true },
  { name: "telefone", label: "Telefone", type: "phone", required: true },
]);
