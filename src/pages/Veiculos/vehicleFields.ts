import { defineFields } from "../../components/EntityForm/types";

export type VeiculoFormData = {
  placa: string;
  marca: string;
  modelo: string;
  ano: number;
  cor: string;
};

export const vehicleFields = defineFields<VeiculoFormData>([
  {
    name: "placa",
    label: "Placa",
    placeholder: "Digite a placa do veículo",
    type: "plate",
    required: true,
  },
  {
    name: "marca",
    label: "Marca",
    placeholder: "Digite a marca do veículo",
    type: "text",
    required: true,
  },
  {
    name: "modelo",
    label: "Modelo",
    placeholder: "Digite o modelo do veículo",
    type: "text",
    required: true,
  },
  {
    name: "cor",
    label: "Cor",
    placeholder: "Digite a cor do veículo",
    type: "text",
    required: true,
  },
  {
    name: "ano",
    label: "Ano",
    placeholder: "Digite o ano de fabricação do veículo",
    type: "number",
    required: true,
  },
]);
