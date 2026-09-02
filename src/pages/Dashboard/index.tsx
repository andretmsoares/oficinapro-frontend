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
import { useEffect, useState } from "react";

export function Dashboard() {

  const [ordensAbertas, setOrdensAbertas] = useState<number>(0);

  useEffect(() => {
    async function carregarOrdensAbertas() {
      try {
        const token = localStorage.getItem("token");
        const response = await fetch("http://localhost:8080/api/ordens-servico/status/ABERTA", {
          headers: {
            "Authorization": `Bearer ${token}`
          }
        });
        if (response.ok) {
          const data = await response.json();
          setOrdensAbertas(data.length);
        }
      } catch (error) {
        console.error("Erro ao carregar ordens abertas:", error);
      }
    }

    carregarOrdensAbertas();
  }, []);

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
          value={ordensAbertas.toString()}
          description="Neste momento"
          icon={ClipboardList}
        />

        <StatCard
          title="Veículos Cadastrados"
          value="7"
          description="Neste momento"
          icon={Car}
        />

        <StatCard
          title="Clientes Cadastrados"
          value="248"
          description="Neste momento"
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