const API_URL = import.meta.env.VITE_API_URL;

export async function api<T>(
  endpoint: string,
  options: RequestInit = {},
): Promise<T> {
  const token = localStorage.getItem("accessToken");

  const headers = new Headers(options.headers);

  headers.set("Content-Type", "application/json");

  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    let message = "Erro ao realizar requisição.";

    try {
      const error = await response.json();

      message = error.message ?? error.detail ?? message;
    } catch {
      // Resposta sem JSON
    }

    throw new Error(message);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return response.json();
}
