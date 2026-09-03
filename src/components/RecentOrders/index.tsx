import { useEffect, useState } from "react";

import "./recentOrders.style.css";

interface Order {
  id: number;
  vehicle: string;
  client: string;
  status: string;
}

// Dados mockados de ordens recentes
const MOCK_RECENT_ORDERS: Order[] = [
  {
    id: 104,
    vehicle: "Honda Civic 2.0 (2020)",
    client: "Carlos Eduardo",
    status: "Em execução",
  },
  {
    id: 103,
    vehicle: "Toyota Corolla 1.8 (2018)",
    client: "Mariana Souza",
    status: "Aguardando peças",
  },
  {
    id: 102,
    vehicle: "Volkswagen Gol 1.0 (2022)",
    client: "Roberto Alves",
    status: "Aberta",
  },
  {
    id: 101,
    vehicle: "Fiat Toro 2.0 (2021)",
    client: "Fernanda Lima",
    status: "Finalizada",
  },
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
                <span>{order.vehicle}</span>
                <small>{order.client}</small>
              </div>

              <span className="status">{order.status}</span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}