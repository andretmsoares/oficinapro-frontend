import { ChevronLeft, ChevronRight } from "lucide-react";

import "./pagination.style.css";

interface PaginationProps {
  page: number;
  totalPages: number;
  totalElements: number;
  onPageChange: (page: number) => void;
}

export function Pagination({
  page,
  totalPages,
  totalElements,
  onPageChange,
}: PaginationProps) {
  const paginaAtual = totalPages === 0 ? 0 : page + 1;

  return (
    <div className="pagination">
      <span className="pagination-info">
        {totalElements} registro(s) · página {paginaAtual} de {totalPages}
      </span>

      <div className="pagination-buttons">
        <button
          type="button"
          disabled={page <= 0}
          onClick={() => onPageChange(page - 1)}
        >
          <ChevronLeft size={16} />
          Anterior
        </button>

        <button
          type="button"
          disabled={page + 1 >= totalPages}
          onClick={() => onPageChange(page + 1)}
        >
          Próxima
          <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
}
