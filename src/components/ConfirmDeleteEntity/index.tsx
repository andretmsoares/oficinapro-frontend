import { Trash2, type LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
import "./confirmDeleteEntity.style.css";

interface ConfirmDeleteEntityProps {
  text: string;
  entity: string;
  entityName: string;
  onConfirm: () => void;
  onCancel: () => void;
  title?: string;
  message?: ReactNode;
  confirmText?: string;
  icon?: LucideIcon;
}

export function ConfirmDeleteEntity({
  text,
  entity,
  entityName,
  onConfirm,
  onCancel,
  title,
  message,
  confirmText = "Excluir",
  icon: Icon = Trash2,
}: ConfirmDeleteEntityProps) {
  return (
    <div className="delete-modal-overlay" onClick={onCancel}>
      <div className="delete-modal" onClick={(e) => e.stopPropagation()}>
        <div className="delete-modal-icon">
          <Icon size={24} />
        </div>

        <div className="delete-modal-content">
          <h2>{title ?? `Excluir ${text}`}</h2>

          <p>
            {message ?? (
              <>
                Tem certeza que deseja excluir {entity}{" "}
                <strong>{entityName}</strong>?
              </>
            )}
          </p>

          <span>Essa ação não poderá ser desfeita.</span>
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
            <Icon size={16} />
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
