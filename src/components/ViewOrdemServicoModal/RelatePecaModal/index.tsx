import { useMemo, useState } from "react";
import { X } from "lucide-react";

import { SearchBar } from "../../SearchBar";
import { formatCurrencyDisplay } from "../../../utils/formatters";
import type { ItemOsPeca } from "../../../types/itemOsPeca/itemOsPeca";

import "./relatePecaModal.style.css";

interface RelatePecaModalProps {
  osId: number;
  todasAsPecas: ItemOsPeca[];
  pecasDaOsAtual: ItemOsPeca[];
  onClose: () => void;
  onSelecionar: (peca: ItemOsPeca) => void | Promise<void>;
}

export function RelatePecaModal({
  osId,
  todasAsPecas,
  onClose,
  onSelecionar,
}: RelatePecaModalProps) {
  const [searchTerm, setSearchTerm] = useState("");

  const catalogo = useMemo(() => dedupeByNome(todasAsPecas), [todasAsPecas]);

  const pecasFiltradas = catalogo.filter((peca) =>
    peca.nome.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  function isPecaJaRelacionada(peca: ItemOsPeca): boolean {
    return peca.osId !== null;
  }

  async function handleSelectPeca(peca: ItemOsPeca) {
    if (isPecaJaRelacionada(peca)) {
      return;
    }

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
            setSearchTerm={setSearchTerm}
          />
        </div>

        <div className="relate-peca-list">
          {pecasFiltradas.length === 0 ? (
            <div className="relate-peca-empty">Nenhuma peça encontrada.</div>
          ) : (
            pecasFiltradas.map((peca) => {
              const jaRelacionada = isPecaJaRelacionada(peca);

              return (
                <button
                  key={peca.id}
                  type="button"
                  className="relate-peca-item"
                  disabled={jaRelacionada}
                  onClick={() => handleSelectPeca(peca)}
                >
                  <div>
                    <strong>{peca.nome}</strong>

                    <span>
                      Valor unitário:{" "}
                      {formatCurrencyDisplay(peca.valorUnitario)}
                    </span>
                  </div>

                  <span className="relate-peca-select">
                    {jaRelacionada ? "Já relacionada" : "Selecionar"}
                  </span>
                </button>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}

function dedupeByNome(pecas: ItemOsPeca[]): ItemOsPeca[] {
  const map = new Map<string, ItemOsPeca>();

  for (const peca of pecas) {
    map.set(peca.nome.toLowerCase(), peca);
  }

  return Array.from(map.values());
}
