import "./tableCardClient.style.css";
import { TBodyTableClient } from "./TBodyTableClient";
import { TheadTableClient } from "./TheadTableClient";
import { type Cliente } from "./TBodyTableClient/ClientTableRow";

interface TableCardClientProps {
  clientes: Cliente[];
  searchTerm: string;
  onViewOrders: (id: number) => void;
  onEdit: (id: number) => void;
  onDelete: (id: number) => void;
}

export function TableCardClient({
  clientes,
  searchTerm,
  onViewOrders,
  onEdit,
  onDelete,
}: TableCardClientProps) {
  return (
    <div className="table-card">
      <div className="table-wrapper">
        <table className="table">
          <TheadTableClient />
          <TBodyTableClient
            clientes={clientes}
            searchTerm={searchTerm}
            onViewOrders={onViewOrders}
            onEdit={onEdit}
            onDelete={onDelete}
          />
        </table>
      </div>
    </div>
  );
}
