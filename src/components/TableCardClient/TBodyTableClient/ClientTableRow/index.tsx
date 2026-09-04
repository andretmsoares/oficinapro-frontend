import { NotepadText, Pencil, Phone, Trash2 } from "lucide-react";

export interface Cliente {
  id: number;
  nome: string;
  cpf: string;
  telefone: string;
  osCount: number;
}

interface ClientTableRowProps {
  cliente: Cliente;
  onViewOrders: (id: number) => void;
  onEdit: (id: number) => void;
  onDelete: (id: number) => void;
}

export function ClientTableRow({
  cliente,
  onViewOrders,
  onEdit,
  onDelete,
}: ClientTableRowProps) {
  return (
    <tr>
      <td>#{cliente.id.toString().padStart(4, "0")}</td>
      <td>
        <strong className="client-name">{cliente.nome}</strong>
      </td>
      <td>{cliente.cpf}</td>
      <td>
        <div className="contact-info">
          <span>
            <Phone size={14} /> {cliente.telefone}
          </span>
        </div>
      </td>
      <td>
        <span className="badge-os">
          {cliente.osCount}{" "}
          {cliente.osCount === 1 ? "Ordem de Serviço" : "Ordens de Serviço"}
        </span>
      </td>
      <td className="actions-cell">
        <button
          className="btn-icon view"
          title="Visualizar Ordens de Serviço"
          onClick={() => onViewOrders(cliente.id)}
        >
          <NotepadText size={16} />
        </button>
        <button
          className="btn-icon edit"
          title="Editar cliente"
          onClick={() => onEdit(cliente.id)}
        >
          <Pencil size={16} />
        </button>
        <button
          className="btn-icon delete"
          title="Excluir cliente"
          onClick={() => onDelete(cliente.id)}
        >
          <Trash2 size={16} />
        </button>
      </td>
    </tr>
  );
}