import { api } from "./api";
import type {
  AtualizarStatusOSRequest,
  AtribuirClienteRequest,
  AtribuirMecanicoRequest,
  OrdemDeServico,
  OrdemDeServicoRequest,
  FluxoMensalOS,
} from "../types/ordemDeServico/ordemDeServico";
import type { StatusOrdemDeServico } from "../enums/StatusOrdemDeServico";

export async function listarOrdensServico(): Promise<OrdemDeServico[]> {
  return api<OrdemDeServico[]>("/ordens-servico");
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
): Promise<OrdemDeServico[]> {
  return api<OrdemDeServico[]>(`/ordens-servico/veiculo/${veiculoId}`);
}

export async function listarOrdensPorMecanico(
  mecanicoId: number,
): Promise<OrdemDeServico[]> {
  return api<OrdemDeServico[]>(`/ordens-servico/mecanico/${mecanicoId}`);
}

export async function listarOrdensPorUnidade(
  unidadeId: number,
): Promise<OrdemDeServico[]> {
  return api<OrdemDeServico[]>(`/ordens-servico/unidade/${unidadeId}`);
}

export async function listarOrdensPorCliente(
  clienteId: number,
): Promise<OrdemDeServico[]> {
  return api<OrdemDeServico[]>(`/ordens-servico/cliente/${clienteId}`);
}

export async function listarOrdensPorStatus(
  status: StatusOrdemDeServico,
): Promise<OrdemDeServico[]> {
  return api<OrdemDeServico[]>(`/ordens-servico/status/${status}`);
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
  const response = await fetch(`/api/ordens-servico/${id}/pdf`, {
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
  const response = await fetch(
    `/api/ordens-servico/${id}/comprovante-pagamento`,
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

export function getStatusPermitidos(
  statusAtual: StatusOrdemDeServico,
): StatusOrdemDeServico[] {
  switch (statusAtual) {
    case "ABERTA":
      return ["DIAGNOSTICO", "CANCELADA"];

    case "DIAGNOSTICO":
      return ["AGUARDANDO_APROVACAO", "CANCELADA"];

    case "AGUARDANDO_APROVACAO":
      return ["AGUARDANDO_PECAS", "CANCELADA"];

    case "AGUARDANDO_PECAS":
      return ["EM_EXECUCAO", "CANCELADA"];

    case "EM_EXECUCAO":
      return ["FINALIZADA", "CANCELADA"];

    case "FINALIZADA":
      return ["ENTREGUE", "ABERTA"];

    case "ENTREGUE":
      return ["FECHADA", "ABERTA"];

    case "FECHADA":
      return ["ABERTA"];

    case "CANCELADA":
      return [];

    default:
      return [];
  }
}
