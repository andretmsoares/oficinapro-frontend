import { defineFields } from "../../components/EntityForm/types";

export type OficinaFormData = {
  nome: string;
  cnpj: string;
  telefone: string;
};

export const oficinaFields = defineFields<OficinaFormData>([
  {
    name: "nome",
    label: "Nome",
    placeholder: "Digite o nome da Oficina",
    type: "text",
    required: true,
  },
  {
    name: "cnpj",
    label: "CNPJ",
    placeholder: "Digite o CNPJ da oficina",
    type: "document",
    required: true,
  },
  {
    name: "telefone",
    label: "Telefone",
    placeholder: "Digite o telefone da oficina",
    type: "phone",
    required: true,
  },
]);
