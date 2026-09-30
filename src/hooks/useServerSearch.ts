import { useEffect, useState } from "react";

export interface PageResponse<T> {
  content: T[];
  totalPages: number;
  totalElements: number;
}

const SEARCH_DEBOUNCE_MS = 300;

/**
 * Listagem com busca e paginação feitas no servidor.
 *
 * `fetchPage` precisa ter identidade estável (função de módulo, como os services),
 * senão a consulta é refeita a cada render.
 */
export function useServerSearch<T>(
  fetchPage: (termo: string, page: number) => Promise<PageResponse<T>>,
) {
  const [items, setItems] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let ativo = true;

    // Sem termo carrega na hora; com termo espera o usuário parar de digitar.
    const timeout = setTimeout(
      async () => {
        try {
          const response = await fetchPage(searchTerm, page);

          if (!ativo) return;

          // Excluiu o último item da última página: volta uma página.
          if (response.content.length === 0 && page > 0) {
            setPage(page - 1);
            return;
          }

          setItems(response.content);
          setTotalPages(response.totalPages);
          setTotalElements(response.totalElements);
        } catch (err) {
          console.error("Erro ao carregar a listagem", err);
        } finally {
          if (ativo) setLoading(false);
        }
      },
      searchTerm.trim() ? SEARCH_DEBOUNCE_MS : 0,
    );

    return () => {
      ativo = false;
      clearTimeout(timeout);
    };
  }, [fetchPage, searchTerm, page, reloadKey]);

  function handleSearch(term: string) {
    setSearchTerm(term);
    setPage(0);
  }

  function reload() {
    setReloadKey((key) => key + 1);
  }

  return {
    items,
    loading,
    searchTerm,
    buscando: searchTerm.trim() !== "",
    page,
    totalPages,
    totalElements,
    setPage,
    handleSearch,
    reload,
  };
}
