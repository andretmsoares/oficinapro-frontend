export const API_URL = import.meta.env.VITE_API_URL;

export const UNAUTHORIZED_EVENT = "auth:unauthorized";

export class ApiError extends Error {
  status: number;
  fields: Record<string, string>;

  constructor(
    message: string,
    status: number,
    fields: Record<string, string> = {},
  ) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.fields = fields;
  }
}

function buildMessage(message: string, fields: Record<string, string>): string {
  const details = Object.entries(fields).map(
    ([field, detail]) => `${field}: ${detail}`,
  );

  return details.length > 0 ? `${message} (${details.join("; ")})` : message;
}

export async function api<T>(
  endpoint: string,
  options: RequestInit = {},
): Promise<T> {
  const token = localStorage.getItem("accessToken");

  const headers = new Headers(options.headers);

  // Em FormData (upload) o navegador define o Content-Type com o boundary; forçar JSON quebra.
  if (!(options.body instanceof FormData)) {
    headers.set("Content-Type", "application/json");
  }

  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    let message = "Erro ao realizar requisição.";
    let fields: Record<string, string> = {};

    try {
      const error = await response.json();

      message = error.message ?? error.detail ?? message;
      fields = error.fields ?? {};
    } catch {
      // Resposta sem JSON
    }

    if (response.status === 401 && token) {
      // Token expirado, inválido ou oficina desativada: encerra a sessão.
      localStorage.removeItem("accessToken");
      window.dispatchEvent(new Event(UNAUTHORIZED_EVENT));
    }

    throw new ApiError(buildMessage(message, fields), response.status, fields);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return response.json();
}
