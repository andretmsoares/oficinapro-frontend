import { Car, ClipboardList, CreditCard, Users } from "lucide-react";

import { OrdersChart } from "../../components/OrdersChart";
import { RecentOrders } from "../../components/RecentOrders";
import { StatCard } from "../../components/StatCard";

import "./dashboard.style.css";
import { useEffect, useState } from "react";

export function Dashboard() {
  const [ordensAbertas, setOrdensAbertas] = useState<number>(0);
  const [veiculosCadastrados, setVeiculosCadastrados] = useState<number>(0);
  const [clientesCadastrados, setClientesCadastrados] = useState<number>(0);
  const [aReceber, setAReceber] = useState<number>(0);
  const [pagamentosPendentes, setPagamentosPendentes] = useState<number>(0);

  useEffect(() => {
    async function carregarOrdensAbertas() {
      try {
        const token = localStorage.getItem("token");
        const response = await fetch(
          "http://localhost:8080/api/ordens-servico/status/ABERTA",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        );
        if (response.ok) {
          const data = await response.json();
          setOrdensAbertas(data.length);
        }
      } catch (error) {
        console.error("Erro ao carregar ordens abertas:", error);
      }
    }

    async function carregarVeiculosCadastrados() {
      try {
        const token = localStorage.getItem("token");
        const response = await fetch("http://localhost:8080/api/veiculos", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (response.ok) {
          const data = await response.json();
          setVeiculosCadastrados(data.length);
        }
      } catch (error) {
        console.error("Erro ao carregar veículos cadastrados:", error);
      }
    }

    async function carregarClientesCadastrados() {
      try {
        const token = localStorage.getItem("token");
        const response = await fetch("http://localhost:8080/api/clientes", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (response.ok) {
          const data = await response.json();
          setClientesCadastrados(data.length);
        }
      } catch (error) {
        console.error("Erro ao carregar clientes cadastrados:", error);
      }
    }

    async function carregarPagamentosPendentes() {
      try {
        const token = localStorage.getItem("token");
        const response = await fetch("http://localhost:8080/api/pagamentos/pendentes", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (response.ok) {
          const data = await response.json();
          setPagamentosPendentes(data.length);
        }
      } catch (error) {
        console.error("Erro ao carregar pagamentos pendentes:", error);
      }
    }

    async function carregarAReceber() {
      try {
        const token = localStorage.getItem("token");
        const response = await fetch("http://localhost:8080/api/pagamentos/pendentes", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (response.ok) {
          const data = await response.json();
          const totalAReceber = data.reduce((total: number, pagamento: any) => {
            return total + pagamento.valor;
          }, 0);
          setAReceber(totalAReceber);
        }
      } catch (error) {
        console.error("Erro ao carregar valor a receber:", error);
      }
    }


    carregarOrdensAbertas();
    carregarVeiculosCadastrados();
    carregarClientesCadastrados();
    carregarPagamentosPendentes();
    carregarAReceber();
  }, []);

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h1>Dashboard</h1>

        <p>Visão geral da sua oficina.</p>
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
          value={`R$ ${aReceber.toFixed(2)}`}
          description={`${pagamentosPendentes.toString()} pagamentos pendentes`}
          icon={CreditCard}
        />
      </section>

      <section className="dashboard-grid">
        <OrdersChart oficinaId={1}/>

        <RecentOrders />
      </section>
    </div>
  );
}
