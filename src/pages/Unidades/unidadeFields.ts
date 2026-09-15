import { defineFields } from "../../components/EntityForm/types";

export type UnidadeFormData = {
  nome: string;
  endereco: string;
  telefone: string;
};

export const unidadeFields = defineFields<UnidadeFormData>([
  {
    name: "nome",
    label: "Nome",
    placeholder: "Digite o nome da unidade",
    type: "text",
    required: true,
  },
  {
    name: "endereco",
    label: "Endereço",
    placeholder: "Digite o endereço da unidade",
    type: "text",
    required: true,
  },
  {
    name: "telefone",
    label: "Telefone",
    placeholder: "Digite o telefone de contato da unidade",
    type: "phone",
    required: true,
  },
]);
