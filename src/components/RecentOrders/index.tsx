import { useEffect, useState } from "react";

import { listarOrdensServico } from "../../services/ordemDeServicoService";
import type { OrdemDeServico } from "../../types/ordemDeServico/ordemDeServico";

import "./recentOrders.style.css";

export function RecentOrders() {
  const [orders, setOrders] = useState<OrdemDeServico[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    let ativo = true;

    async function carregarOrdens() {
      try {
        setLoading(true);
        setError(false);

        const ordens = await listarOrdensServico();

        if (ativo) {
          const ordensRecentes = [...ordens]
            .sort(
              (a, b) =>
                new Date(b.dataAbertura).getTime() -
                new Date(a.dataAbertura).getTime(),
            )
            .slice(0, 5);

          setOrders(ordensRecentes);
        }
      } catch {
        if (ativo) {
          setError(true);
        }
      } finally {
        if (ativo) {
          setLoading(false);
        }
      }
    }

    carregarOrdens();

    return () => {
      ativo = false;
    };
  }, []);

  return (
    <div className="recent-orders">
      <div className="section-header">
        <h3>Ordens recentes</h3>
        <button>Ver todas</button>
      </div>

      <div className="order-list">
        {loading ? (
          <p>Carregando ordens...</p>
        ) : error ? (
          <p>Não foi possível carregar as ordens.</p>
        ) : orders.length === 0 ? (
          <p>Nenhuma ordem de serviço encontrada.</p>
        ) : (
          orders.map((order) => (
            <div className="order-item" key={order.id}>
              <div>
                <strong>#{order.id.toString().padStart(5, "0")}</strong>
                <span>{order.placaVeiculo}</span>
                <small>{order.nomeCliente || "Cliente não informado"}</small>
              </div>

              <span className="status">{order.status}</span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
