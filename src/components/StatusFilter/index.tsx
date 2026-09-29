import { Filter } from "lucide-react";

import "./statusFilter.style.css";

export interface StatusFilterOption<T extends string> {
  label: string;
  value: T;
}

interface StatusFilterProps<T extends string> {
  label: string;
  value: T | "";
  options: StatusFilterOption<T>[];
  onChange: (value: T | "") => void;
}

export function StatusFilter<T extends string>({
  label,
  value,
  options,
  onChange,
}: StatusFilterProps<T>) {
  return (
    <div className="status-filter-wrapper">
      <Filter size={18} className="status-filter-icon" />
      <select
        aria-label={label}
        value={value}
        onChange={(e) => onChange(e.target.value as T | "")}
      >
        <option value="">Todos</option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
}
