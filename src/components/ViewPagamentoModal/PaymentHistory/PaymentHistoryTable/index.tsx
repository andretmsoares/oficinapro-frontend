import { useState } from "react";
import { Trash2 } from "lucide-react";

import type { RegistroPagamento } from "../../../../types/registroPagamento/registroPagamento";
import { formatCurrencyDisplay } from "../../../../utils/formatters";
import { ConfirmDeleteEntity } from "../../../../components/ConfirmDeleteEntity";

import "./paymentHistoryTable.style.css";

interface PaymentHistoryTableProps {
  registros: RegistroPagamento[];
  onDeletePagamento: (registroId: number) => void;
}

export function PaymentHistoryTable({
  registros,
  onDeletePagamento,
}: PaymentHistoryTableProps) {
  const [registroParaExcluir, setRegistroParaExcluir] =
    useState<RegistroPagamento | null>(null);

  const handleConfirmarExclusao = () => {
    if (!registroParaExcluir) {
      return;
    }

    onDeletePagamento(registroParaExcluir.id);
    setRegistroParaExcluir(null);
  };

  return (
    <>
      <div className="payment-table-wrapper">
        <table className="payment-table">
          <thead>
            <tr>
              <th>Data</th>
              <th>Forma de pagamento</th>
              <th>Valor</th>
              <th>Ações</th>
            </tr>
          </thead>

          <tbody>
            {registros.length === 0 ? (
              <tr>
                <td colSpan={4} className="payment-empty">
                  Nenhum pagamento registrado.
                </td>
              </tr>
            ) : (
              registros.map((registro) => (
                <tr key={registro.id}>
                  <td>{formatDate(registro.data)}</td>

                  <td>{formatMeioPagamento(registro.meioPagamento)}</td>

                  <td className="payment-table-value">
                    {formatCurrencyDisplay(registro.valor)}
                  </td>

                  <td className="payment-table-actions">
                    <button
                      type="button"
                      className="payment-delete-button"
                      title="Remover pagamento"
                      aria-label="Remover pagamento"
                      onClick={() => setRegistroParaExcluir(registro)}
                    >
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      {registroParaExcluir && (
        <ConfirmDeleteEntity
          entityName={formatCurrencyDisplay(registroParaExcluir.valor)}
          onConfirm={handleConfirmarExclusao}
          onCancel={() => setRegistroParaExcluir(null)}
          title="Remover pagamento"
          text={""}
          entity={"o Registro de Pagamento no valor de "}
        />
      )}
    </>
  );
}

function formatDate(date: string): string {
  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(new Date(date));
}

function formatMeioPagamento(meio: string): string {
  switch (meio) {
    case "DINHEIRO":
      return "Dinheiro";

    case "PIX":
      return "PIX";

    case "CARTAO_CREDITO":
      return "Cartão de Crédito";

    case "CARTAO_DEBITO":
      return "Cartão de Débito";

    case "CHEQUE":
      return "Cheque";

    default:
      return meio;
  }
}
