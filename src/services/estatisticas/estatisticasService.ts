import { api } from "../api";

export interface EstatisticasOficina {
  oficinaId: number;
  nomeOficina: string;
  clientes: number;
  mecanicos: number;
  veiculos: number;
  ordensDeServico: number;
}

export interface EstatisticasSistema {
  oficinas: number;
  clientes: number;
  mecanicos: number;
  veiculos: number;
  ordensDeServico: number;
  porOficina: EstatisticasOficina[];
}

export async function buscarEstatisticasSistema(): Promise<EstatisticasSistema> {
  return api<EstatisticasSistema>("/admin/estatisticas");
}

export async function buscarEstatisticasOficina(
  oficinaId: number,
): Promise<EstatisticasOficina> {
  return api<EstatisticasOficina>(`/admin/estatisticas/oficina/${oficinaId}`);
}
