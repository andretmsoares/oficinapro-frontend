import {
  Car,
  ClipboardList,
  CreditCard,
  Users,
} from "lucide-react";

import { OrdersChart } from "../../components/OrdersChart";
import { RecentOrders } from "../../components/RecentOrders";
import { StatCard } from "../../components/StatCard";

import "./dashboard.style.css";

export function Dashboard() {
  return (
    <div className="dashboard">

      <div className="dashboard-header">
        <h1>Dashboard</h1>

        <p>
          Visão geral da sua oficina.
        </p>
      </div>

      <section className="stats-grid">

        <StatCard
          title="Ordens abertas"
          value="18"
          description="+12% este mês"
          icon={ClipboardList}
        />

        <StatCard
          title="Veículos em manutenção"
          value="7"
          description="Neste momento"
          icon={Car}
        />

        <StatCard
          title="Clientes"
          value="248"
          description="+18 este mês"
          icon={Users}
        />

        <StatCard
          title="A receber"
          value="R$ 8.420"
          description="12 pagamentos pendentes"
          icon={CreditCard}
        />

      </section>

      <section className="dashboard-grid">

        <OrdersChart />

        <RecentOrders />

      </section>

    </div>
  );
}