import { defineFields } from "../../components/EntityForm/types";

import {
  buscarUnidadesAutocomplete,
  buscarUnidadeAutocompletePorId,
} from "../../services/unidadeService";

import {
  buscarClientesAutocomplete,
  buscarClienteAutocompletePorId,
} from "../../services/clienteService";

import {
  buscarVeiculosAutocomplete,
  buscarVeiculoAutocompletePorId,
} from "../../services/veiculoService";

import {
  buscarMecanicosAutocomplete,
  buscarMecanicoAutocompletePorId,
} from "../../services/mecanicoService";

export type OrdemDeServicoFormData = {
  unidadeId: number;
  veiculoId: number;
  clienteId: number | null;
  mecanicoId: number | null;
  obs: string;
};

export const ordensServicoFields = defineFields<OrdemDeServicoFormData>([
  {
    name: "unidadeId",
    label: "Unidade",
    placeholder: "Digite o nome da unidade...",
    type: "entity-select",
    required: true,
    fetchOptions: buscarUnidadesAutocomplete,
    fetchOptionById: buscarUnidadeAutocompletePorId,
    minChars: 2,
    debounceMs: 400,
    noResultsText: "Nenhuma unidade encontrada",
  },

  {
    name: "veiculoId",
    label: "Veículo",
    placeholder: "Digite a placa ou modelo...",
    type: "entity-select",
    required: true,
    fetchOptions: buscarVeiculosAutocomplete,
    fetchOptionById: buscarVeiculoAutocompletePorId,
    minChars: 2,
    debounceMs: 400,
    noResultsText: "Nenhum veículo encontrado",
  },

  {
    name: "clienteId",
    label: "Cliente",
    placeholder: "Digite o nome ou CPF...",
    type: "entity-select",
    fetchOptions: buscarClientesAutocomplete,
    fetchOptionById: buscarClienteAutocompletePorId,
    minChars: 2,
    debounceMs: 400,
    noResultsText: "Nenhum cliente encontrado",
  },

  {
    name: "mecanicoId",
    label: "Mecânico",
    placeholder: "Digite o nome ou documento...",
    type: "entity-select",
    fetchOptions: buscarMecanicosAutocomplete,
    fetchOptionById: buscarMecanicoAutocompletePorId,
    minChars: 2,
    debounceMs: 400,
    noResultsText: "Nenhum mecânico encontrado",
  },

  {
    name: "obs",
    label: "Observações",
    placeholder: "Digite observações quando necessário",
    type: "textarea",
  },
]);
