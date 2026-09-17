import type { PecaOrdemServico } from "../types/pecas/pecas";
import type { MaoDeObraOrdemServico } from "../types/maoDeObra/maoDeObra";

export function calcularValorTotal(
  pecasDaOs: PecaOrdemServico[],
  maoDeObraDaOs: MaoDeObraOrdemServico[],
): number {
  const totalPecas = pecasDaOs.reduce(
    (soma, peca) => soma + peca.valorUnitario * peca.quantidade,
    0,
  );
  const totalMaoDeObra = maoDeObraDaOs.reduce(
    (soma, item) => soma + item.valor,
    0,
  );
  return totalPecas + totalMaoDeObra;
}

export function calcularValorComDesconto(
  valorTotal: number,
  desconto: number,
): number {
  return Math.max(valorTotal - desconto, 0);
}
