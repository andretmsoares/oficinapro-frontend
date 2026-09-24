import { useEffect, useState } from "react";
import { Car, ClipboardList, CreditCard, Users } from "lucide-react";

import { OrdersChart } from "../../components/OrdersChart";
import { RecentOrders } from "../../components/RecentOrders";
import { StatCard } from "../../components/StatCard";
import { HeaderPage } from "../../components/HeaderPage";

import type { Usuario } from "../../types/usuario/usuario";
import type { DashboardData } from "../../types/dashboard/dashboard";

import { buscarDadosDashboard } from "../../services/dashboardService";

import "./dashboard.style.css";
import { formatCurrencyDisplay } from "../../utils/formatters";

interface DashboardProps {
  usuarioLogado: Usuario;
}

const INITIAL_DATA: DashboardData = {
  ordensAbertas: 0,
  veiculosCadastrados: 0,
  clientesCadastrados: 0,
  aReceber: 0,
  pagamentosPendentes: 0,
};

export function Dashboard({ usuarioLogado }: DashboardProps) {
  const isGerente = usuarioLogado.role === "GERENTE";

  const [data, setData] = useState<DashboardData>(INITIAL_DATA);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function carregarDashboard() {
      try {
        setLoading(true);
        setError(null);

        const dashboardData = await buscarDadosDashboard();

        setData(dashboardData);
      } catch (err) {
        console.error("Erro ao carregar dashboard:", err);

        setError("Não foi possível carregar os dados do dashboard.");
      } finally {
        setLoading(false);
      }
    }

    carregarDashboard();
  }, []);

  const aReceberFormatado = formatCurrencyDisplay(data.aReceber);

  if (loading) {
    return (
      <div className="dashboard">
        <div className="dashboard-header">
          <HeaderPage title="Dashboard" subtitle="Visão geral da oficina" />
        </div>

        <section className="stats-grid">
          <StatCard
            title="Ordens abertas"
            value="..."
            description="Carregando"
            icon={ClipboardList}
          />

          <StatCard
            title="Veículos Cadastrados"
            value="..."
            description="Carregando"
            icon={Car}
          />

          <StatCard
            title="Clientes Cadastrados"
            value="..."
            description="Carregando"
            icon={Users}
          />

          {isGerente && (
            <StatCard
              title="A receber"
              value="..."
              description="Carregando"
              icon={CreditCard}
            />
          )}
        </section>
      </div>
    );
  }

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <HeaderPage title="Dashboard" subtitle="Visão geral da oficina" />
      </div>

      {error && <div className="dashboard-error">{error}</div>}

      <section className="stats-grid">
        <StatCard
          title="Ordens abertas"
          value={data.ordensAbertas.toString()}
          description="Neste momento"
          icon={ClipboardList}
        />

        <StatCard
          title="Veículos Cadastrados"
          value={data.veiculosCadastrados.toString()}
          description="Neste momento"
          icon={Car}
        />

        <StatCard
          title="Clientes Cadastrados"
          value={data.clientesCadastrados.toString()}
          description="Neste momento"
          icon={Users}
        />

        {isGerente && (
          <StatCard
            title="A receber"
            value={aReceberFormatado}
            description={`${data.pagamentosPendentes} pagamentos pendentes`}
            icon={CreditCard}
          />
        )}
      </section>

      <section className="dashboard-grid">
        <OrdersChart />
        <RecentOrders />
      </section>
    </div>
  );
}
