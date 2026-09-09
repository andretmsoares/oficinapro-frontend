import { defineFields } from "../../components/EntityForm/types";

export type OrdemDeServicoFormData = {
  oficinaId: number;
  unidadeId: number;
  veiculoId: number;
  clienteId: number;
  mecanicoId: number;
  obs: string;
};

export const ordensServicoFields =
  defineFields<OrdemDeServicoFormData>([
    {
      name: "unidadeId",
      label: "ID da Unidade",
      type: "number",
    },
    {
      name: "veiculoId",
      label: "ID do Veículo",
      type: "number",
      required: true,
    },
    {
      name: "clienteId",
      label: "ID do Cliente",
      type: "number",
    },
    {
      name: "mecanicoId",
      label: "ID do Mecânico",
      type: "number",
    },
    {
      name: "obs",
      label: "Observações",
      type: "textarea",
    },
  ]);