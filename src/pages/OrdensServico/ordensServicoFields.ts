import { defineFields } from "../../components/EntityForm/types";

export type OrdemDeServicoFormData = {
  oficinaId: number;
  unidadeId: number;
  veiculoId: number;
  clienteId: number;
  mecanicoId: number;
  obs: string;
};

export const ordensServicoFields = defineFields<OrdemDeServicoFormData>([
  {
    name: "unidadeId",
    label: "Unidade",
    placeholder: "Digite o ID da unidade",
    type: "number",
  },
  {
    name: "veiculoId",
    label: "ID do Veículo",
    placeholder: "Digite o ID do veículo",
    type: "number",
    required: true,
  },
  {
    name: "clienteId",
    label: "ID do cliente",
    placeholder: "Digite o ID do cliente",
    type: "number",
  },
  {
    name: "mecanicoId",
    label: "ID do Mecânico",
    placeholder: "Digite o ID do mecânico",
    type: "number",
  },
  {
    name: "obs",
    label: "Observações",
    placeholder: "Digite observações quando necessário",
    type: "textarea",
  },
]);
