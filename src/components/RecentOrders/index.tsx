import { useEffect, useState } from "react";

import "./recentOrders.style.css";

interface Order {
  id: number;
  vehicle: string;
  client: string;
  status: string;
}

interface OrdemDeServicoResponse {
  id: number;
  veiculoId: number;
  clienteId: number | null;
  status: string;
}

export function RecentOrders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function carregarOrdensRecentes() {
      try {
        const token = localStorage.getItem("token");

        const response = await fetch(
          "http://localhost:8080/api/ordens-servico",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        );

        if (!response.ok) {
          throw new Error("Erro ao buscar ordens de serviço");
        }

        const data: OrdemDeServicoResponse[] = await response.json();

        const recentes = data.slice(-4).reverse();

        const ordensFormatadas: Order[] = recentes.map((os) => ({
          id: os.id,
          vehicle: `Veículo #${os.veiculoId}`,
          client:
            os.clienteId !== null
              ? `Cliente #${os.clienteId}`
              : "Cliente não informado",
          status: formatarStatus(os.status),
        }));

        setOrders(ordensFormatadas);
      } catch (error) {
        console.error("Erro ao carregar ordens recentes:", error);
      } finally {
        setLoading(false);
      }
    }

    carregarOrdensRecentes();
  }, []);

  function formatarStatus(status: string): string {
    const statusMap: Record<string, string> = {
      ABERTA: "Aberta",
      EM_EXECUCAO: "Em execução",
      AGUARDANDO_PECAS: "Aguardando peças",
      FINALIZADA: "Finalizada",
      ENTREGUE: "Entregue",
      CANCELADA: "Cancelada",
    };

    return statusMap[status] ?? status;
  }

  return (
    <div className="recent-orders">
      <div className="section-header">
        <h3>Ordens recentes</h3>

        <button>
          Ver todas
        </button>
      </div>

      <div className="order-list">
        {loading ? (
          <p>Carregando ordens...</p>
        ) : orders.length === 0 ? (
          <p>Nenhuma ordem de serviço encontrada.</p>
        ) : (
          orders.map((order) => (
            <div
              className="order-item"
              key={order.id}
            >
              <div>
                <strong>#{order.id.toString().padStart(5, "0")}</strong>

                <span>
                  {order.vehicle}
                </span>

                <small>
                  {order.client}
                </small>
              </div>

              <span className="status">
                {order.status}
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}