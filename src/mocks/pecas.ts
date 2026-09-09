import type { PecaOrdemServico } from "../types/pecas/pecas";

export const MOCK_PECAS: PecaOrdemServico[] = [
  {
    id: 1,
    descricao: "Filtro de óleo",
    quantidade: 1,
    valorUnitario: 45,
    valorTotal: 45,
  },
  {
    id: 2,
    descricao: "Óleo do motor 5W30",
    quantidade: 4,
    valorUnitario: 38,
    valorTotal: 152,
  },
  {
    id: 3,
    descricao: "Pastilha de freio dianteira",
    quantidade: 1,
    valorUnitario: 280,
    valorTotal: 280,
  },
];