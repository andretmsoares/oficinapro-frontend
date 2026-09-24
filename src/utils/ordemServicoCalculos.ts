import type { ItemOsPeca } from "../types/itemOsPeca/itemOsPeca";
import type { MaoObra } from "../types/maoObra/maoObra";

export function calcularValorTotal(
  pecasDaOs: ItemOsPeca[],
  maoDeObraDaOs: MaoObra[],
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
