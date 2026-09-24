import { useEffect, useState } from "react";
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { listarFluxoMensalOS } from "../../services/ordemDeServicoService";
import type { FluxoMensalOS } from "../../types/ordemDeServico/ordemDeServico";

import "./ordersChart.style.css";

export function OrdersChart() {
  const [data, setData] = useState<FluxoMensalOS[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    let ativo = true;

    async function carregarFluxoMensal() {
      try {
        setLoading(true);
        setError(false);

        const hoje = new Date();
        const mes = hoje.getMonth() + 1;
        const ano = hoje.getFullYear();

        const fluxo = await listarFluxoMensalOS(mes, ano);

        console.log("Fluxo mensal recebido:", fluxo);

        if (ativo) {
          setData(fluxo);
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

    carregarFluxoMensal();

    return () => {
      ativo = false;
    };
  }, []);

  return (
    <div className="chart-card">
      <div className="chart-header">
        <h3>Fluxo de Ordens de Serviço</h3>
        <p>Acompanhamento das OS durante o mês</p>
      </div>

      <div className="chart-legend">
        <span>
          <i className="legend-dot abertas" />
          OS abertas
        </span>

        <span>
          <i className="legend-dot finalizadas" />
          OS finalizadas
        </span>
      </div>

      <div className="chart-container">
        {loading ? (
          <div className="chart-message">Carregando dados...</div>
        ) : error ? (
          <div className="chart-message">
            Não foi possível carregar os dados.
          </div>
        ) : data.length === 0 ? (
          <div className="chart-message">
            Nenhum dado disponível para este mês.
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />

              <XAxis dataKey="day" />

              <YAxis allowDecimals={false} />

              <Tooltip />

              <Line
                type="monotone"
                dataKey="abertas"
                stroke="#2563eb"
                strokeWidth={2}
                dot={false}
                name="OS abertas"
              />

              <Line
                type="monotone"
                dataKey="finalizadas"
                stroke="#16a34a"
                strokeWidth={2}
                dot={false}
                name="OS finalizadas"
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}
