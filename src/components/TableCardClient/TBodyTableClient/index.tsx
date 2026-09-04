import "./tBodyTableClient.style.css";
import { ClientTableRow, type Cliente } from "./ClientTableRow";

interface TBodyTableClientProps {
  clientes: Cliente[];
  searchTerm: string;
  onViewOrders: (id: number) => void;
  onEdit: (id: number) => void;
  onDelete: (id: number) => void;
}

export function TBodyTableClient({
  clientes,
  searchTerm,
  onViewOrders,
  onEdit,
  onDelete,
}: TBodyTableClientProps) {
  const clientesFiltrados = clientes.filter((cliente) => {
    const termo = searchTerm.toLowerCase();
    return (
      cliente.nome.toLowerCase().includes(termo) ||
      cliente.cpf.includes(termo) ||
      cliente.telefone.includes(termo)
    );
  });

  return (
    <tbody className="tbody-table">
      {clientesFiltrados.map((cliente) => (
        <ClientTableRow
          key={cliente.id}
          cliente={cliente}
          onViewOrders={onViewOrders}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ))}
    </tbody>
  );
}