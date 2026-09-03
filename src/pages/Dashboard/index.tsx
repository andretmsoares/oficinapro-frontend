import { useEffect, useState } from "react";
import { Car, ClipboardList, CreditCard, Users } from "lucide-react";

import { OrdersChart } from "../../components/OrdersChart";
import { RecentOrders } from "../../components/RecentOrders";
import { StatCard } from "../../components/StatCard";

import "./dashboard.style.css";
import { HeaderPage } from "../../components/HeaderPage";

// Dados mockados temporários
const MOCK_DATA = {
  ordensAbertas: 18,
  veiculosCadastrados: 42,
  clientesCadastrados: 128,
  aReceber: 8420.5,
  pagamentosPendentes: 12,
};

export function Dashboard() {
  const [ordensAbertas, setOrdensAbertas] = useState<number>(MOCK_DATA.ordensAbertas);
  const [veiculosCadastrados, setVeiculosCadastrados] = useState<number>(MOCK_DATA.veiculosCadastrados);
  const [clientesCadastrados, setClientesCadastrados] = useState<number>(MOCK_DATA.clientesCadastrados);
  const [aReceber, setAReceber] = useState<number>(MOCK_DATA.aReceber);
  const [pagamentosPendentes, setPagamentosPendentes] = useState<number>(MOCK_DATA.pagamentosPendentes);

  const aReceberFormatado = new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(aReceber);

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <HeaderPage title="Dashboard" subtitle="Visão geral da oficina" />
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
          value={veiculosCadastrados.toString()}
          description="Neste momento"
          icon={Car}
        />

        <StatCard
          title="Clientes Cadastrados"
          value={clientesCadastrados.toString()}
          description="Neste momento"
          icon={Users}
        />

        <StatCard
          title="A receber"
          value={aReceberFormatado}
          description={`${pagamentosPendentes} pagamentos pendentes`}
          icon={CreditCard}
        />
      </section>

      <section className="dashboard-grid">
        <OrdersChart oficinaId={1} />
        <RecentOrders />
      </section>
    </div>
  );
}