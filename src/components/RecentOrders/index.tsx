import { useEffect, useState } from "react";
import {type Order} from "../../types/ordemDeServico/ordemDeServico";

import "./recentOrders.style.css";

// Dados mockados de ordens recentes
const MOCK_RECENT_ORDERS: Order[] = [
  {
    id: 1,
    unidade: "Unidade Matriz - SP",
    veiculo: "Toyota Corolla 2.0 (2022) - ABC1D23",
    cliente: "João Silva",
    mecanico: "Carlos Eduardo",
    dataAbertura: new Date("2026-03-01T08:30:00Z"),
    dataFecahamento: new Date("2026-03-02T16:45:00Z"),
    obs: "Troca de óleo, filtro e alinhamento concluídos.",
    status: "Concluída",
    valorTotal: BigInt(450) as unknown as BigInteger,
    valorComDesconto: BigInt(400) as unknown as BigInteger
  },
  {
    id: 2,
    unidade: "Unidade Filial - RJ",
    veiculo: "Honda Civic 2.0 (2021) - XYZ9K88",
    cliente: "Maria Oliveira",
    mecanico: "Roberto Santos",
    dataAbertura: new Date("2026-03-08T10:00:00Z"),
    dataFecahamento: new Date("2026-03-08T18:00:00Z"),
    obs: "Revisão do sistema de freios e troca de pastilhas.",
    status: "Em Andamento",
    valorTotal: BigInt(1200) as unknown as BigInteger,
    valorComDesconto: BigInt(1100) as unknown as BigInteger
  }
];

export function RecentOrders() {
  const [orders, setOrders] = useState<Order[]>(MOCK_RECENT_ORDERS);
  const [loading, setLoading] = useState(false);

  return (
    <div className="recent-orders">
      <div className="section-header">
        <h3>Ordens recentes</h3>
        <button>Ver todas</button>
      </div>

      <div className="order-list">
        {loading ? (
          <p>Carregando ordens...</p>
        ) : orders.length === 0 ? (
          <p>Nenhuma ordem de serviço encontrada.</p>
        ) : (
          orders.map((order) => (
            <div className="order-item" key={order.id}>
              <div>
                <strong>#{order.id.toString().padStart(5, "0")}</strong>
                <span>{order.veiculo}</span>
                <small>{order.cliente}</small>
              </div>

              <span className="status">{order.status}</span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}