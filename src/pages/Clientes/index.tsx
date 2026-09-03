import { StatCard } from "../../components/StatCard";

export function Clientes() {
  return (
    <div>
      <StatCard
          title="Clientes Cadastrados"
          value={clientesCadastrados.toString()}
          description="Neste momento"
          icon={Users}
        />
    </div>
  );
}