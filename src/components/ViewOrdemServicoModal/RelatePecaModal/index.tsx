import { useMemo, useState } from "react";
import { X } from "lucide-react";

import { SearchBar } from "../../SearchBar";
import { formatCurrencyDisplay } from "../../../services/formatters";
import type { PecaOrdemServico } from "../../../types/pecas/pecas";

import "./relatePecaModal.style.css";

interface RelatePecaModalProps {
  osId: number;
  todasAsPecas: PecaOrdemServico[];
  pecasDaOsAtual: PecaOrdemServico[];
  onClose: () => void;
  onSelecionar: (peca: { nome: string; valorUnitario: number }) => void;
}

export function RelatePecaModal({
  osId,
  todasAsPecas,
  pecasDaOsAtual,
  onClose,
  onSelecionar,
}: RelatePecaModalProps) {
  const [searchTerm, setSearchTerm] = useState("");

  const catalogo = useMemo(() => dedupeByNome(todasAsPecas), [todasAsPecas]);

  const pecasFiltradas = catalogo.filter((peca) =>
    peca.nome.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  function isPecaJaRelacionada(nome: string): boolean {
    return pecasDaOsAtual.some(
      (peca) => peca.nome.toLowerCase() === nome.toLowerCase(),
    );
  }

  function handleSelectPeca(peca: PecaOrdemServico) {
    if (isPecaJaRelacionada(peca.nome)) return;
    onSelecionar({ nome: peca.nome, valorUnitario: peca.valorUnitario });
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
              const jaRelacionada = isPecaJaRelacionada(peca.nome);

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

function dedupeByNome(pecas: PecaOrdemServico[]): PecaOrdemServico[] {
  const map = new Map<string, PecaOrdemServico>();
  for (const peca of pecas) {
    map.set(peca.nome.toLowerCase(), peca);
  }
  return Array.from(map.values());
}
