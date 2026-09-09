import { formatCurrencyDisplay } from "../../../services/formatters";

interface ViewValorProps {
  text: string;
  valor: number;
}

export function ViewValor({ text, valor }: ViewValorProps) {
  return (
    <>
      <span>{text}</span>
      <strong>{formatCurrencyDisplay(valor)}</strong>
    </>
  );
}
