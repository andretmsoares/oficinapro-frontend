import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import "./ordersChart.style.css";
import { useEffect, useState } from "react";

interface FluxoMensalOS {
  day: number;
  abertas: number;
  finalizadas: number;
}

interface OrdersChartProps {
  oficinaId: number;
}

export function OrdersChart({ oficinaId }: OrdersChartProps) {
  const [data, setData] = useState<FluxoMensalOS[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const hoje = new Date();
  const mes = hoje.getMonth() + 1;
  const ano = hoje.getFullYear();

  useEffect(() => {
    async function buscarFluxoMensal() {
      try {
        setLoading(true);
        setError(false);

        const response = await fetch(
          `/api/ordens-servico/oficina/${oficinaId}/fluxo-mensal?mes=${mes}&ano=${ano}`
        );

        if (!response.ok) {
          throw new Error("Erro ao buscar fluxo mensal das OS");
        }

        const result: FluxoMensalOS[] = await response.json();

        setData(result);
      } catch (err) {
        console.error("Erro ao buscar fluxo mensal:", err);
        setError(true);
      } finally {
        setLoading(false);
      }
    }

    buscarFluxoMensal();
  }, [oficinaId, mes, ano]);

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
          <div className="chart-message">
            Carregando dados...
          </div>
        ) : error ? (
          <div className="chart-message">
            Não foi possível carregar os dados.
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
