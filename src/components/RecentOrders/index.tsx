import { useEffect, useState } from "react";
import {type OrdemDeServico} from "../../types/ordemDeServico/ordemDeServico";

import "./recentOrders.style.css";
import { MOCK_ORDENS_SERVICO } from "../../mocks/ordemDeServico";


export function RecentOrders() {
  const [orders, setOrders] = useState<OrdemDeServico[]>(MOCK_ORDENS_SERVICO);
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
                <span>{order.placaVeiculo}</span>
                <small>{order.nomeCliente}</small>
              </div>

              <span className="status">{order.status}</span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}