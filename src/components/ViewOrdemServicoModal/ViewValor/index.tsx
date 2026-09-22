import { formatCurrencyDisplay } from "../../../utils/formatters";

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
