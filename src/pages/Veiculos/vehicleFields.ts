import { defineFields } from "../../components/EntityForm/types";

export type VeiculoFormData = {
  placa: string;
  marca: string;
  modelo: string;
  ano: number;
}

export const vehicleFields =
  defineFields<VeiculoFormData>([
    {
      name: "placa",
      label: "Placa",
      type: "plate",
      required: true,
    },
    {
      name: "marca",
      label: "Marca",
      type: "text",
      required: true,
    },
    {
      name: "modelo",
      label: "Modelo",
      type: "text",
      required: true,
    },
    {
      name: "ano",
      label: "Ano",
      type: "number",
      required: true,
    },
  ]);