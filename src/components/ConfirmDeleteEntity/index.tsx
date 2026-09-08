import { Trash2, X } from "lucide-react";
import "./confirmDeleteEntity.style.css";

interface ConfirmDeleteEntityProps {
  entityName: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmDeleteEntity({
  entityName,
  onConfirm,
  onCancel,
}: ConfirmDeleteEntityProps) {
  return (
    <div className="delete-modal-overlay" onClick={onCancel}>
      <div
        className="delete-modal"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          className="delete-modal-close"
          onClick={onCancel}
          aria-label="Fechar"
        >
          <X size={20} />
        </button>

        <div className="delete-modal-icon">
          <Trash2 size={24} />
        </div>

        <div className="delete-modal-content">
          <h2>Excluir cliente?</h2>

          <p>
            Tem certeza que deseja excluir o cliente{" "}
            <strong>{entityName}</strong>?
          </p>

          <span>
            Essa ação não poderá ser desfeita.
          </span>
        </div>

        <div className="delete-modal-actions">
          <button
            type="button"
            className="delete-modal-cancel"
            onClick={onCancel}
          >
            Cancelar
          </button>

          <button
            type="button"
            className="delete-modal-confirm"
            onClick={onConfirm}
          >
            <Trash2 size={16} />
            Excluir
          </button>
        </div>
      </div>
    </div>
  );
}