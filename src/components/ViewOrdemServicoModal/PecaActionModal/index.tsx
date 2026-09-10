import { Package, Plus, Search, X } from "lucide-react";
import "./pecaActionModal.style.css";

interface PecaActionModalProps {
  osId: number;
  onClose: () => void;
  onCriarPeca: () => void;
  onRelacionarPeca: () => void;
}

export function PecaActionModal({
  osId,
  onClose,
  onCriarPeca,
  onRelacionarPeca,
}: PecaActionModalProps) {
  return (
    <div className="peca-action-overlay">
      <div className="peca-action-modal">
        <header className="peca-action-header">
          <div>
            <div className="peca-action-title">
              <Package size={20} />
              <h2>Adicionar Peça</h2>
            </div>
            <span>
              Como deseja adicionar uma peça à OS #
              {osId.toString().padStart(4, "0")}?
            </span>
          </div>
          <button type="button" className="peca-action-close" onClick={onClose}>
            <X size={20} />
          </button>
        </header>

        <div className="peca-action-options">
          <button
            type="button"
            className="peca-action-option"
            onClick={onCriarPeca}
          >
            <div className="peca-action-option-icon">
              <Plus size={22} />
            </div>
            <div>
              <strong>Criar nova peça</strong>
              <span>
                Cadastre uma nova peça e adicione diretamente a esta Ordem de
                Serviço.
              </span>
            </div>
          </button>

          <button
            type="button"
            className="peca-action-option"
            onClick={onRelacionarPeca}
          >
            <div className="peca-action-option-icon">
              <Search size={22} />
            </div>
            <div>
              <strong>Relacionar peça existente</strong>
              <span>
                Pesquise uma peça já cadastrada e adicione-a a esta Ordem de
                Serviço.
              </span>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}
