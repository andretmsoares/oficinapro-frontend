import "./entityViewModal.style.css";
import { InfoItem } from "../InfoItem";
import { ButtonClose } from "../Buttons/ButtonClose";
import type { ViewField } from "./types";

interface EntityViewModalProps {
  title: string;
  subtitle?: string;
  fields: ViewField[];
  onClose: () => void;
}

export function EntityViewModal({
  title,
  subtitle,
  fields,
  onClose,
}: EntityViewModalProps) {
  return (
    <div className="entity-view-overlay">
      <div className="entity-view-modal">
        <header className="entity-view-header">
          <div>
            <h2>{title}</h2>
            {subtitle && <span>{subtitle}</span>}
          </div>
        </header>

        <div className="entity-view-grid">
          {fields.map((field) => (
            <InfoItem
              key={field.label}
              icon={field.icon}
              label={field.label}
              value={String(field.value)}
            />
          ))}
        </div>

        <footer className="entity-view-footer">
          <ButtonClose onClose={onClose} />
        </footer>
      </div>
    </div>
  );
}
