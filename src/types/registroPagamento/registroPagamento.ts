import type { MeioPagamento } from "../../enums/MeioPagamento";

export interface RegistroPagamento {
  id: number;
  pagamentoId: number;
  valor: number;
  meioPagamento: MeioPagamento;
  data: string;
}
