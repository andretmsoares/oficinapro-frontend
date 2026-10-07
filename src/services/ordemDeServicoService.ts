import { api, API_URL, trackedFetch } from "./api";
import type {
  AtualizarStatusOSRequest,
  AtribuirClienteRequest,
  AtribuirMecanicoRequest,
  OrdemDeServico,
  OrdemDeServicoRequest,
  FluxoMensalOS,
} from "../types/ordemDeServico/ordemDeServico";
import type { StatusOrdemDeServico } from "../enums/StatusOrdemDeServico";

export interface OrdemDeServicoPage {
  content: OrdemDeServico[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
  first: boolean;
  last: boolean;
}

/**
 * Uma página das OS da oficina. A busca (placa, cliente, status ou número da OS) e o filtro de
 * status são feitos no servidor sobre TODAS as OS, e não sobre o que já foi carregado.
 */
export async function listarOrdensServicoPaginado(
  termo: string,
  status: StatusOrdemDeServico | "",
  page = 0,
  size = 20,
): Promise<OrdemDeServicoPage> {
  const params = new URLSearchParams({
    page: String(page),
    size: String(size),
  });

  if (termo.trim()) {
    params.set("q", termo.trim());
  }

  if (status) {
    params.set("status", status);
  }

  return api<OrdemDeServicoPage>(`/ordens-servico?${params.toString()}`);
}

/** As OS mais recentes (ex.: card do dashboard), sem carregar a lista inteira. */
export async function listarOrdensRecentes(
  quantidade = 5,
): Promise<OrdemDeServico[]> {
  const params = new URLSearchParams({
    page: "0",
    size: String(quantidade),
    sort: "dataAbertura,desc",
  });

  const pagina = await api<OrdemDeServicoPage>(
    `/ordens-servico?${params.toString()}`,
  );

  return pagina.content;
}

export async function buscarOrdemServico(id: number): Promise<OrdemDeServico> {
  return api<OrdemDeServico>(`/ordens-servico/${id}`);
}

export async function criarOrdemServico(
  data: OrdemDeServicoRequest,
): Promise<OrdemDeServico> {
  return api<OrdemDeServico>("/ordens-servico", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function atualizarOrdemServico(
  id: number,
  data: OrdemDeServicoRequest,
): Promise<OrdemDeServico> {
  return api<OrdemDeServico>(`/ordens-servico/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

export async function deletarOrdemServico(id: number): Promise<void> {
  await api<void>(`/ordens-servico/${id}`, {
    method: "DELETE",
  });
}

export async function atualizarStatusOrdemServico(
  id: number,
  data: AtualizarStatusOSRequest,
): Promise<OrdemDeServico> {
  return api<OrdemDeServico>(`/ordens-servico/${id}/status`, {
    method: "PATCH",
    body: JSON.stringify(data),
  });
}

export async function atribuirMecanico(
  id: number,
  data: AtribuirMecanicoRequest,
): Promise<OrdemDeServico> {
  return api<OrdemDeServico>(`/ordens-servico/${id}/mecanico`, {
    method: "PATCH",
    body: JSON.stringify(data),
  });
}

export async function atribuirCliente(
  id: number,
  data: AtribuirClienteRequest,
): Promise<OrdemDeServico> {
  return api<OrdemDeServico>(`/ordens-servico/${id}/cliente`, {
    method: "PATCH",
    body: JSON.stringify(data),
  });
}

export async function aplicarDesconto(
  id: number,
  desconto: number,
): Promise<OrdemDeServico> {
  return api<OrdemDeServico>(`/ordens-servico/${id}/desconto`, {
    method: "PATCH",
    body: JSON.stringify(desconto),
  });
}

export async function listarOrdensPorVeiculo(
  veiculoId: number,
  page = 0,
  size = 20,
): Promise<OrdemDeServicoPage> {
  return api<OrdemDeServicoPage>(
    `/ordens-servico/veiculo/${veiculoId}?page=${page}&size=${size}`,
  );
}

export async function listarOrdensPorMecanico(
  mecanicoId: number,
  page = 0,
  size = 20,
): Promise<OrdemDeServicoPage> {
  return api<OrdemDeServicoPage>(
    `/ordens-servico/mecanico/${mecanicoId}?page=${page}&size=${size}`,
  );
}

export async function listarOrdensPorUnidade(
  unidadeId: number,
  page = 0,
  size = 20,
): Promise<OrdemDeServicoPage> {
  return api<OrdemDeServicoPage>(
    `/ordens-servico/unidade/${unidadeId}?page=${page}&size=${size}`,
  );
}

export async function listarOrdensPorCliente(
  clienteId: number,
  page = 0,
  size = 20,
): Promise<OrdemDeServicoPage> {
  return api<OrdemDeServicoPage>(
    `/ordens-servico/cliente/${clienteId}?page=${page}&size=${size}`,
  );
}

export async function listarOrdensPorStatus(
  status: StatusOrdemDeServico,
  page = 0,
  size = 20,
): Promise<OrdemDeServicoPage> {
  return api<OrdemDeServicoPage>(
    `/ordens-servico/status/${status}?page=${page}&size=${size}`,
  );
}

export async function listarFluxoMensalOS(
  mes: number,
  ano: number,
): Promise<FluxoMensalOS[]> {
  return api<FluxoMensalOS[]>(
    `/ordens-servico/fluxo-mensal?mes=${mes}&ano=${ano}`,
  );
}

export async function imprimirOrdemServico(id: number): Promise<void> {
  const pdf = await baixarPdfOrdemServico(id);
  baixarArquivo(pdf, `ordem-servico-${id}.pdf`);
}

export async function imprimirComprovantePagamento(id: number): Promise<void> {
  const pdf = await baixarComprovantePagamento(id);
  baixarArquivo(pdf, `comprovante-pagamento-os-${id}.pdf`);
}

/** Dispara o download do blob no navegador, sem abrir nenhuma aba/página nova. */
function baixarArquivo(blob: Blob, nomeArquivo: string): void {
  const url = URL.createObjectURL(blob);

  const link = document.createElement("a");
  link.href = url;
  link.download = nomeArquivo;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  setTimeout(() => {
    URL.revokeObjectURL(url);
  }, 60_000);
}

export async function baixarPdfOrdemServico(id: number): Promise<Blob> {
  const response = await trackedFetch(`${API_URL}/ordens-servico/${id}/pdf`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
    },
  });

  if (!response.ok) {
    throw new Error("Não foi possível gerar o PDF da ordem de serviço.");
  }

  return response.blob();
}

export async function baixarComprovantePagamento(id: number): Promise<Blob> {
  const response = await trackedFetch(
    `${API_URL}/ordens-servico/${id}/comprovante-pagamento`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
      },
    },
  );

  if (!response.ok) {
    throw new Error("Não foi possível gerar o comprovante de pagamento.");
  }

  return response.blob();
}
