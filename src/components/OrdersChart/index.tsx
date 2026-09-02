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

const data = [
  { day: "01", abertas: 8, finalizadas: 5 },
  { day: "03", abertas: 12, finalizadas: 8 },
  { day: "06", abertas: 10, finalizadas: 9 },
  { day: "09", abertas: 15, finalizadas: 11 },
  { day: "12", abertas: 9, finalizadas: 13 },
  { day: "15", abertas: 17, finalizadas: 12 },
  { day: "18", abertas: 14, finalizadas: 16 },
  { day: "21", abertas: 11, finalizadas: 10 },
  { day: "24", abertas: 19, finalizadas: 15 },
  { day: "27", abertas: 16, finalizadas: 18 },
  { day: "30", abertas: 21, finalizadas: 17 },
];

export function OrdersChart() {
  return (
    <div className="chart-card">
      <div className="chart-header">
        <h3>Fluxo de Ordens de Serviço</h3>

        <p>
          Acompanhamento das OS durante o mês
        </p>
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
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />

            <XAxis dataKey="day" />

            <YAxis />

            <Tooltip />

            <Line
              type="monotone"
              dataKey="abertas"
              stroke="#2563eb"
              strokeWidth={2}
              dot={false}
            />

            <Line
              type="monotone"
              dataKey="finalizadas"
              stroke="#16a34a"
              strokeWidth={2}
              dot={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}