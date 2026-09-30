import { render, screen } from "@testing-library/react";

import { PaymentStatus } from "../../src/components/ViewOrdemServicoModal/PaymentSection/PaymentStatus";
import { PaymentInfo } from "../../src/components/ViewPagamentoModal/PaymentInfo";
import { pagamento } from "../mocks/factories";

/**
 * BUG CONHECIDO: estes dois componentes traduzem os status "PAGO", "PARCIAL" e
 * "PENDENTE", mas o backend (e o enum StatusPagamento) usa "PAGA",
 * "PAGO_PARCIALMENTE" e "PAGAMENTO_PENDENTE". Por isso a tela mostra o código cru.
 *
 * `it.fails` mantém a suíte verde enquanto o bug existir e FALHA quando ele for
 * corrigido - nesse momento basta trocar `it.fails` por `it`.
 */
describe("rótulos de status de pagamento", () => {
  it.fails(
    "PaymentStatus (seção de pagamento da OS) traduz PAGO_PARCIALMENTE para 'Parcial'",
    () => {
      render(<PaymentStatus status="PAGO_PARCIALMENTE" />);

      expect(screen.getByText("Parcial")).toBeInTheDocument();
    },
  );

  it.fails(
    "PaymentInfo (detalhes do pagamento) traduz PAGAMENTO_PENDENTE para 'Pendente'",
    () => {
      render(
        <PaymentInfo pagamento={pagamento({ status: "PAGAMENTO_PENDENTE" })} />,
      );

      expect(screen.getByText("Pendente")).toBeInTheDocument();
    },
  );
});
