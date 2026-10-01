import { act, renderHook, waitFor } from "@testing-library/react";

import {
  useServerSearch,
  type PageResponse,
} from "../../src/hooks/useServerSearch";

function pagina(items: string[], totalPages = 1): PageResponse<string> {
  return { content: items, totalPages, totalElements: items.length };
}

describe("useServerSearch", () => {
  beforeEach(() => {
    vi.spyOn(console, "error").mockImplementation(() => undefined);
  });

  it("carrega a primeira página imediatamente (sem debounce) e sai do loading", async () => {
    const fetchPage = vi.fn().mockResolvedValue(pagina(["a", "b"], 3));

    const { result } = renderHook(() => useServerSearch(fetchPage));

    expect(result.current.loading).toBe(true);
    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(fetchPage).toHaveBeenCalledWith("", 0);
    expect(result.current.items).toEqual(["a", "b"]);
    expect(result.current.totalPages).toBe(3);
    expect(result.current.totalElements).toBe(2);
    expect(result.current.buscando).toBe(false);
  });

  it("busca com termo espera o debounce e junta as digitações numa só consulta", async () => {
    const fetchPage = vi.fn().mockResolvedValue(pagina([]));
    const { result } = renderHook(() => useServerSearch(fetchPage));
    await waitFor(() => expect(result.current.loading).toBe(false));
    fetchPage.mockClear();

    act(() => result.current.handleSearch("jo"));
    act(() => result.current.handleSearch("joa"));
    act(() => result.current.handleSearch("joao"));

    expect(result.current.buscando).toBe(true);
    expect(fetchPage).not.toHaveBeenCalled();

    await waitFor(() => expect(fetchPage).toHaveBeenCalledTimes(1));
    expect(fetchPage).toHaveBeenCalledWith("joao", 0);
  });

  it("nova busca volta para a primeira página", async () => {
    const fetchPage = vi.fn().mockResolvedValue(pagina(["x"], 5));
    const { result } = renderHook(() => useServerSearch(fetchPage));
    await waitFor(() => expect(result.current.loading).toBe(false));

    act(() => result.current.setPage(3));
    await waitFor(() => expect(fetchPage).toHaveBeenLastCalledWith("", 3));

    act(() => result.current.handleSearch("ana"));

    expect(result.current.page).toBe(0);
    await waitFor(() => expect(fetchPage).toHaveBeenLastCalledWith("ana", 0));
  });

  it("limpar a busca volta a carregar na hora", async () => {
    const fetchPage = vi.fn().mockResolvedValue(pagina(["x"]));
    const { result } = renderHook(() => useServerSearch(fetchPage));
    await waitFor(() => expect(result.current.loading).toBe(false));
    act(() => result.current.handleSearch("ana"));
    await waitFor(() => expect(fetchPage).toHaveBeenLastCalledWith("ana", 0));

    act(() => result.current.handleSearch(""));

    await waitFor(() => expect(fetchPage).toHaveBeenLastCalledWith("", 0));
    expect(result.current.buscando).toBe(false);
  });

  it("termo só com espaços não conta como busca", async () => {
    const fetchPage = vi.fn().mockResolvedValue(pagina([]));
    const { result } = renderHook(() => useServerSearch(fetchPage));

    act(() => result.current.handleSearch("   "));

    expect(result.current.buscando).toBe(false);
  });

  it("reload refaz a consulta com os mesmos parâmetros", async () => {
    const fetchPage = vi
      .fn()
      .mockResolvedValueOnce(pagina(["antigo"]))
      .mockResolvedValueOnce(pagina(["antigo", "novo"]));
    const { result } = renderHook(() => useServerSearch(fetchPage));
    await waitFor(() => expect(result.current.items).toEqual(["antigo"]));

    act(() => result.current.reload());

    await waitFor(() =>
      expect(result.current.items).toEqual(["antigo", "novo"]),
    );
    expect(fetchPage).toHaveBeenLastCalledWith("", 0);
  });

  it("se a página ficou vazia depois de excluir o último item, recua uma página", async () => {
    const fetchPage = vi.fn((_termo: string, page: number) =>
      Promise.resolve(page === 2 ? pagina([], 3) : pagina(["da página 1"], 3)),
    );
    const { result } = renderHook(() => useServerSearch(fetchPage));
    await waitFor(() => expect(result.current.loading).toBe(false));

    act(() => result.current.setPage(2));

    await waitFor(() => expect(result.current.page).toBe(1));
    await waitFor(() => expect(result.current.items).toEqual(["da página 1"]));
  });

  it("em caso de erro registra no console e para de carregar, mantendo os itens", async () => {
    const fetchPage = vi.fn().mockRejectedValue(new Error("500"));

    const { result } = renderHook(() => useServerSearch(fetchPage));

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.items).toEqual([]);
    expect(console.error).toHaveBeenCalled();
  });
});
