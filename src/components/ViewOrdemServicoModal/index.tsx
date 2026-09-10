import { Plus, Wrench, DollarSign, Package, Tag } from "lucide-react";

import type { OrdemDeServico } from "../../types/ordemDeServico/ordemDeServico";
import { formatCurrencyDisplay } from "../../services/formatters";

import "./viewOrdemServicoModal.style.css";
import { MOCK_PECAS } from "../../mocks/pecas";
import { MOCK_MAO_DE_OBRA } from "../../mocks/maoDeObra";
import { HeaderOs } from "./HeaderOs";
import { DataOS } from "./DataOs";
import { SectionTitle } from "./SectionTitle";
import { ViewSection } from "./ViewSection";
import { ViewTable } from "./ViewTable";
import { ButtonClose } from "../Buttons/ButtonClose";
import { ViewValor } from "./ViewValor";

interface ViewOrdemServicoModalProps {
  ordemServico: OrdemDeServico;
  onClose: () => void;
}

export function ViewOrdemServicoModal({
  ordemServico,
  onClose,
}: ViewOrdemServicoModalProps) {
  function handleAddPeca() {
    console.log("Adicionar peça");
  }

  function handleAddMaoDeObra() {
    console.log("Adicionar mão de obra");
  }

  function handleAddDesconto() {
    console.log("Adicionar desconto");
  }

  return (
    <div className="view-os-overlay">
      <div className="view-os-modal">
        <HeaderOs id={ordemServico.id} />
        <DataOS ordemServico={ordemServico} />

        <ViewSection
          icon={Package}
          title="Peças"
          onClick={handleAddPeca}
          buttonText="Adicionar Peça"
          iconButton={Plus}
        >
          <ViewTable
            data={MOCK_PECAS}
            columns={[
              {
                key: "descricao",
                header: "Descrição",
              },
              {
                key: "quantidade",
                header: "Qtd.",
              },
              {
                key: "valorUnitario",
                header: "Valor Unit.",
                render: (peca) => formatCurrencyDisplay(peca.valorUnitario),
              },
              {
                key: "valorTotal",
                header: "Valor Total",
                render: (peca) => (
                  <strong className="view-os-table-value">
                    {formatCurrencyDisplay(
                      peca.valorUnitario * peca.quantidade,
                    )}
                  </strong>
                ),
              },
            ]}
          />
        </ViewSection>

        <ViewSection
          icon={Wrench}
          title="Mão de Obra"
          onClick={handleAddMaoDeObra}
          buttonText="Adicionar Mão de Obra"
          iconButton={Plus}
        >
          <ViewTable
            data={MOCK_MAO_DE_OBRA}
            columns={[
              {
                key: "descricao",
                header: "Serviço",
              },
              {
                key: "valor",
                header: "Valor",
                render: (item) => (
                  <strong className="view-os-table-value">
                    {formatCurrencyDisplay(item.valor)}
                  </strong>
                ),
              },
            ]}
          />
        </ViewSection>

        <section className="view-os-financial">
          <SectionTitle
            icon={DollarSign}
            title="Resumo financeiro"
            onClick={handleAddDesconto}
            buttonText="Adicionar Desconto"
            iconButton={Tag}
          />

          <div className="view-os-totals">
            <div className="view-os-total-item">
              <ViewValor text="Valor Total" valor={ordemServico.valorTotal} />
            </div>

            <div className="view-os-total-item view-os-total-final">
              <ViewValor
                text="Valor com Desconto"
                valor={ordemServico.valorComDesconto}
              />
            </div>
          </div>
        </section>

        <footer className="view-os-footer">
          <ButtonClose onClose={onClose} />
        </footer>
      </div>
    </div>
  );
}
