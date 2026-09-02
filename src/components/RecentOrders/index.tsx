import "./recentOrders.style.css";

interface Order {
  id: string;
  vehicle: string;
  client: string;
  status: string;
}

const orders: Order[] = [
  {
    id: "#00153",
    vehicle: "Honda Civic",
    client: "João da Silva",
    status: "Em execução",
  },
  {
    id: "#00152",
    vehicle: "Toyota Corolla",
    client: "Maria Oliveira",
    status: "Aguardando peças",
  },
  {
    id: "#00151",
    vehicle: "Chevrolet Onix",
    client: "Carlos Souza",
    status: "Finalizada",
  },
  {
    id: "#00150",
    vehicle: "Volkswagen Polo",
    client: "Ana Santos",
    status: "Aberta",
  },
];

export function RecentOrders() {
  return (
    <div className="recent-orders">
      <div className="section-header">
        <h3>Ordens recentes</h3>

        <button>
          Ver todas
        </button>
      </div>

      <div className="order-list">
        {orders.map((order) => (
          <div
            className="order-item"
            key={order.id}
          >
            <div>
              <strong>{order.id}</strong>

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
        ))}
      </div>
    </div>
  );
}