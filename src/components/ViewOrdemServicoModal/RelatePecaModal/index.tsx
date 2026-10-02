import { X } from "lucide-react";

import { SearchBar } from "../../SearchBar";
import { Pagination } from "../../Pagination";
import { formatCurrencyDisplay } from "../../../utils/formatters";
import { useServerSearch } from "../../../hooks/useServerSearch";
import { listarItemOsPecasPaginado } from "../../../services/itemOsPecaService";
import type { ItemOsPeca } from "../../../types/itemOsPeca/itemOsPeca";

import "./relatePecaModal.style.css";

interface RelatePecaModalProps {
  osId: number;
  onClose: () => void;
  onSelecionar: (peca: ItemOsPeca) => void | Promise<void>;
}

const PECAS_POR_PAGINA = 10;

// Função de módulo (identidade estável): o hook refaz a consulta a cada mudança dela.
function buscarPecasAvulsas(termo: string, pagina: number) {
  return listarItemOsPecasPaginado(termo, pagina, PECAS_POR_PAGINA, true);
}

/**
 * Escolha de uma peça já cadastrada para vincular à OS. A lista são só as peças AVULSAS (sem OS,
 * as únicas que podem ser vinculadas) e a busca roda no servidor sobre todas elas: uma peça que
 * não está na página carregada continua sendo encontrada ao digitar o nome.
 */
export function RelatePecaModal({
  osId,
  onClose,
  onSelecionar,
}: RelatePecaModalProps) {
  const {
    items: pecas,
    loading,
    searchTerm,
    page,
    totalPages,
    totalElements,
    setPage,
    handleSearch,
  } = useServerSearch<ItemOsPeca>(buscarPecasAvulsas);

  async function handleSelectPeca(peca: ItemOsPeca) {
    await onSelecionar(peca);
  }

  return (
    <div className="relate-peca-overlay">
      <div className="relate-peca-modal">
        <header className="relate-peca-header">
          <div>
            <h2>Relacionar peça</h2>

            <span>
              Selecione uma peça já cadastrada para a OS #
              {osId.toString().padStart(4, "0")}
            </span>
          </div>

          <button type="button" className="relate-peca-close" onClick={onClose}>
            <X size={20} />
          </button>
        </header>

        <div className="relate-peca-search">
          <SearchBar
            placeholder="Pesquisar peça pelo nome..."
            searchTerm={searchTerm}
            setSearchTerm={handleSearch}
          />
        </div>

        <div className="relate-peca-list">
          {loading ? (
            <div className="relate-peca-empty">Carregando...</div>
          ) : pecas.length === 0 ? (
            <div className="relate-peca-empty">Nenhuma peça encontrada.</div>
          ) : (
            pecas.map((peca) => (
              <button
                key={peca.id}
                type="button"
                className="relate-peca-item"
                onClick={() => handleSelectPeca(peca)}
              >
                <div>
                  <strong>{peca.nome}</strong>

                  <span>
                    Valor unitário: {formatCurrencyDisplay(peca.valorUnitario)}
                  </span>
                </div>

                <span className="relate-peca-select">Selecionar</span>
              </button>
            ))
          )}
        </div>

        <Pagination
          page={page}
          totalPages={totalPages}
          totalElements={totalElements}
          onPageChange={setPage}
        />
      </div>
    </div>
  );
}
