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

import "./ordersChart.style.css";

interface FluxoMensalOS {
  day: number;
  abertas: number;
  finalizadas: number;
}

interface OrdersChartProps {
  oficinaId: number;
}

// Dados mockados do fluxo mensal
const MOCK_FLUXO_MENSUAL: FluxoMensalOS[] = [
  { day: 1, abertas: 3, finalizadas: 2 },
  { day: 3, abertas: 5, finalizadas: 4 },
  { day: 6, abertas: 2, finalizadas: 3 },
  { day: 9, abertas: 8, finalizadas: 5 },
  { day: 12, abertas: 6, finalizadas: 7 },
  { day: 15, abertas: 9, finalizadas: 6 },
  { day: 18, abertas: 4, finalizadas: 8 },
  { day: 21, abertas: 7, finalizadas: 5 },
  { day: 24, abertas: 10, finalizadas: 9 },
  { day: 27, abertas: 5, finalizadas: 7 },
  { day: 30, abertas: 4, finalizadas: 6 },
];

export function OrdersChart({ oficinaId }: OrdersChartProps) {
  const [data, setData] = useState<FluxoMensalOS[]>(MOCK_FLUXO_MENSUAL);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

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