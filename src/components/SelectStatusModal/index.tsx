import { useState } from "react";
import { ButtonsForm } from "../Buttons/ButtonsForm";
import "./selectStatusModal.style.css";

export interface StatusOption {
  label: string;
  value: string;
}

interface SelectStatusModalProps {
  title?: string;
  currentStatus: string;
  statuses: StatusOption[];
  onSave: (status: string) => void;
  onClose: () => void;
}

export function SelectStatusModal({
  title = "Atualizar Status",
  currentStatus,
  statuses,
  onSave,
  onClose,
}: SelectStatusModalProps) {
  const [selectedStatus, setSelectedStatus] = useState(currentStatus);

  return (
    <div className="form">
      <div className="form-content">
        <h2>{title}</h2>

        <div className="input-create-entity">
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
          >
            {statuses.map((status) => (
              <option key={status.value} value={status.value}>
                {status.label}
              </option>
            ))}
          </select>
        </div>

        <ButtonsForm
          onClose={onClose}
          onSave={() => onSave(selectedStatus)}
        />
      </div>
    </div>
  );
}