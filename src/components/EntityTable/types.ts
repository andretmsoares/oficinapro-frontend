import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

export interface Column<T> {
  key: keyof T | (string & {}); // autocomplete pros campos reais, mas aceita chaves derivadas (ex: "codigo")
  header: string;
  width?: string;      // ex: "12%" — substitui o nth-child fixo
  className?: string;
  render?: (item: T) => ReactNode; // se ausente, renderiza item[key] como string
}

export interface EntityAction<T> {
  label: string;
  icon: LucideIcon;
  variant?: "view" | "edit" | "delete" | "default";
  onClick: (item: T) => void;
  hidden?: (item: T) => boolean;
}

export interface EntityTableProps<T> {
  data: T[];
  columns: Column<T>[];
  actions?: EntityAction<T>[];
  getRowKey: (item: T) => string | number;
  searchTerm?: string;
  searchFields?: (keyof T)[];
  searchFn?: (item: T, term: string) => boolean;
  loading?: boolean;
  emptyMessage?: string;
}