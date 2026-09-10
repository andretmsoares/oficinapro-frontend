import { useState } from "react";
import { Plus, Wrench, DollarSign, Package, Tag } from "lucide-react";

import type { OrdemDeServico } from "../../types/ordemDeServico/ordemDeServico";
import type { Pagamento } from "../../types/pagamento/pagamento";
import type { PecaOrdemServico } from "../../types/pecas/pecas";
import type { MaoDeObraOrdemServico } from "../../types/maoDeObra/maoDeObra";

import { formatCurrencyDisplay } from "../../services/formatters";

import "./viewOrdemServicoModal.style.css";

import { HeaderOs } from "./HeaderOs";
import { DataOS } from "./DataOs";
import { SectionTitle } from "./SectionTitle";
import { ViewSection } from "./ViewSection";
import { ViewTable } from "./ViewTable";
import { ButtonClose } from "../Buttons/ButtonClose";
import { ViewValor } from "./ViewValor";
import { PaymentSection } from "./PaymentSection";

import { PecaActionModal } from "./PecaActionModal";
import { PecaCreateModal } from "./PecaCreateModal";
import { RelatePecaModal } from "./RelatePecaModal";
import { MaoDeObraModal } from "./MaoDeObraModal";
import { DescontoModal } from "./DescontoModal";
import { PaymentRegistrationModal } from "../PaymentRegistrationModal";

import type { PecaFormData } from "../../pages/Pecas/pecasFields";
import type { MaoDeObraFormData } from "./MaoDeObraModal/maoDeObraFields";
import type { RegistroPagamentoFormData } from "../PaymentRegistrationModal/registroPagamentoFields";

interface ViewOrdemServicoModalProps {
  ordemServico: OrdemDeServico;
  pagamento?: Pagamento;
  todasAsPecas: PecaOrdemServico[];
  todaAMaoDeObra: MaoDeObraOrdemServico[];
  onClose: () => void;
  onAddPeca: (peca: Omit<PecaOrdemServico, "id">) => void;
  onAddMaoDeObra: (item: Omit<MaoDeObraOrdemServico, "id">) => void;
  onUpdateDesconto: (novoDesconto: number) => void;
  onRegistrarPagamento: (data: RegistroPagamentoFormData) => void;
}

type PecaFlow = "action" | "create" | "relate" | null;

export function ViewOrdemServicoModal({
  ordemServico,
  pagamento,
  todasAsPecas,
  todaAMaoDeObra,
  onClose,
  onAddPeca,
  onAddMaoDeObra,
  onUpdateDesconto,
  onRegistrarPagamento,
}: ViewOrdemServicoModalProps) {
  const [pecaFlow, setPecaFlow] = useState<PecaFlow>(null);
  const [isMaoDeObraModalOpen, setIsMaoDeObraModalOpen] = useState(false);
  const [isDescontoModalOpen, setIsDescontoModalOpen] = useState(false);
  const [isPagamentoModalOpen, setIsPagamentoModalOpen] = useState(false);

  const pecasDaOs = todasAsPecas.filter(
    (peca) => peca.osId === ordemServico.id,
  );
  const maoDeObraDaOs = todaAMaoDeObra.filter(
    (item) => item.osId === ordemServico.id,
  );

  function handleSalvarPecaCriada(data: PecaFormData) {
    onAddPeca({
      nome: data.nome,
      quantidade: data.quantidade,
      valorUnitario: data.valorUnitario,
      osId: ordemServico.id,
    });
    setPecaFlow(null);
  }

  function handleSelecionarPecaExistente(peca: {
    nome: string;
    valorUnitario: number;
  }) {
    onAddPeca({
      nome: peca.nome,
      valorUnitario: peca.valorUnitario,
      quantidade: 1,
      osId: ordemServico.id,
    });
    setPecaFlow(null);
  }

  function handleSalvarMaoDeObra(data: MaoDeObraFormData) {
    onAddMaoDeObra({
      descricao: data.descricao,
      valor: data.valor,
      osId: ordemServico.id,
    });
    setIsMaoDeObraModalOpen(false);
  }

  function handleSalvarDesconto(novoDesconto: number) {
    onUpdateDesconto(novoDesconto);
    setIsDescontoModalOpen(false);
  }

  function handleSalvarPagamento(data: RegistroPagamentoFormData) {
    onRegistrarPagamento(data);
    setIsPagamentoModalOpen(false);
  }

  return (
    <div className="view-os-overlay">
      <div className="view-os-modal">
        <HeaderOs id={ordemServico.id} />

        <DataOS ordemServico={ordemServico} />

        <ViewSection
          icon={Package}
          title="Peças"
          onClick={() => setPecaFlow("action")}
          buttonText="Adicionar Peça"
          iconButton={Plus}
        >
          <ViewTable
            data={pecasDaOs}
            emptyMessage="Nenhuma peça adicionada a esta OS"
            columns={[
              { key: "nome", header: "Descrição" },
              { key: "quantidade", header: "Qtd." },
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
          onClick={() => setIsMaoDeObraModalOpen(true)}
          buttonText="Adicionar Mão de Obra"
          iconButton={Plus}
        >
          <ViewTable
            data={maoDeObraDaOs}
            emptyMessage="Nenhuma mão de obra adicionada a esta OS"
            columns={[
              { key: "descricao", header: "Serviço" },
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
            onClick={() => setIsDescontoModalOpen(true)}
            buttonText="Adicionar Desconto"
            iconButton={Tag}
          />

          <div className="view-os-totals">
            <div className="view-os-total-item">
              <ViewValor text="Valor Total" valor={ordemServico.valorTotal} />
            </div>

            <div className="view-os-total-item">
              <ViewValor text="Desconto" valor={ordemServico.desconto} />
            </div>

            <div className="view-os-total-item view-os-total-final">
              <ViewValor
                text="Valor com Desconto"
                valor={ordemServico.valorComDesconto}
              />
            </div>
          </div>
        </section>

        {pagamento && (
          <PaymentSection
            pagamento={pagamento}
            onRegistrarPagamento={() => setIsPagamentoModalOpen(true)}
          />
        )}

        <footer className="view-os-footer">
          <ButtonClose onClose={onClose} />
        </footer>

        {pecaFlow === "action" && (
          <PecaActionModal
            osId={ordemServico.id}
            onClose={() => setPecaFlow(null)}
            onCriarPeca={() => setPecaFlow("create")}
            onRelacionarPeca={() => setPecaFlow("relate")}
          />
        )}

        {pecaFlow === "create" && (
          <PecaCreateModal
            osId={ordemServico.id}
            onClose={() => setPecaFlow(null)}
            onSave={handleSalvarPecaCriada}
          />
        )}

        {pecaFlow === "relate" && (
          <RelatePecaModal
            osId={ordemServico.id}
            todasAsPecas={todasAsPecas}
            pecasDaOsAtual={pecasDaOs}
            onClose={() => setPecaFlow(null)}
            onSelecionar={handleSelecionarPecaExistente}
          />
        )}

        {isMaoDeObraModalOpen && (
          <MaoDeObraModal
            osId={ordemServico.id}
            onClose={() => setIsMaoDeObraModalOpen(false)}
            onSave={handleSalvarMaoDeObra}
          />
        )}

        {isDescontoModalOpen && (
          <DescontoModal
            osId={ordemServico.id}
            descontoAtual={ordemServico.desconto}
            onClose={() => setIsDescontoModalOpen(false)}
            onSave={handleSalvarDesconto}
          />
        )}

        {isPagamentoModalOpen && pagamento && (
          <PaymentRegistrationModal
            pagamento={pagamento}
            onClose={() => setIsPagamentoModalOpen(false)}
            onSave={handleSalvarPagamento}
          />
        )}
      </div>
    </div>
  );
}
