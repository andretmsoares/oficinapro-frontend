import type { PecaOrdemServico } from "../types/pecas/pecas";

export const MOCK_PECAS: PecaOrdemServico[] = [
  { id: 1, osId: 1, nome: "Filtro de óleo", quantidade: 1, valorUnitario: 45 },
  {
    id: 2,
    osId: 1,
    nome: "Óleo do motor 5W30",
    quantidade: 4,
    valorUnitario: 38,
  },
  {
    id: 3,
    osId: 3,
    nome: "Pastilha de freio dianteira",
    quantidade: 1,
    valorUnitario: 280,
  },
];
