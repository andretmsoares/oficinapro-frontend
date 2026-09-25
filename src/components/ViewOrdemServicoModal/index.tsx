import { useCallback, useEffect, useState } from "react";
import {
  Plus,
  Wrench,
  DollarSign,
  Package,
  Tag,
  Trash2,
  Link2Off,
} from "lucide-react";

import type { OrdemDeServico } from "../../types/ordemDeServico/ordemDeServico";
import type { Pagamento } from "../../types/pagamento/pagamento";
import type { ItemOsPeca } from "../../types/itemOsPeca/itemOsPeca";
import type { MaoObra } from "../../types/maoObra/maoObra";

import {
  criarMaoObra,
  deletarMaoObra,
  listarMaoObraPorOrdemServico,
} from "../../services/maoObraService";

import {
  criarItemOsPeca,
  desvincularItemOsPecaOs,
  listarItemOsPecaPorOs,
  vincularItemOsPecaOs,
} from "../../services/itemOsPecaService";

import {
  aplicarDesconto,
  buscarOrdemServico,
} from "../../services/ordemDeServicoService";

import { buscarPagamentoPorOsId } from "../../services/pagamentoService";
import { criarRegistroPagamento } from "../../services/registroPagamentoService";

import { formatCurrencyDisplay } from "../../utils/formatters";

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

import type { ItemOsPecaFormData } from "../../pages/Pecas/itemOsPecasFields";
import type { MaoDeObraFormData } from "./MaoDeObraModal/maoDeObraFields";
import type { RegistroPagamentoFormData } from "../PaymentRegistrationModal/registroPagamentoFields";
import type { Usuario } from "../../types/usuario/usuario";
import { ConfirmDeleteEntity } from "../ConfirmDeleteEntity";

interface ViewOrdemServicoModalProps {
  usuarioLogado: Usuario;
  ordemServico: OrdemDeServico;
  todasAsPecas: ItemOsPeca[];

  onClose: () => void;

  onAddPeca: (peca: ItemOsPeca) => void;
  onUpdatePeca: (peca: ItemOsPeca) => void;

  onUpdateOrdemServico: (ordemAtualizada: OrdemDeServico) => void;
}

type PecaFlow = "action" | "create" | "relate" | null;

export function ViewOrdemServicoModal({
  usuarioLogado,
  ordemServico,
  todasAsPecas,
  onClose,
  onAddPeca,
  onUpdatePeca,
  onUpdateOrdemServico,
}: ViewOrdemServicoModalProps) {
  const isGerente = usuarioLogado.role === "GERENTE";

  const [ordemServicoAtual, setOrdemServicoAtual] =
    useState<OrdemDeServico>(ordemServico);

  const [pecaFlow, setPecaFlow] = useState<PecaFlow>(null);

  const [pecasDaOs, setPecasDaOs] = useState<ItemOsPeca[]>([]);
  const [loadingPecas, setLoadingPecas] = useState(true);
  const [pecaSubmitError, setPecaSubmitError] = useState("");

  const [maoDeObra, setMaoDeObra] = useState<MaoObra[]>([]);
  const [loadingMaoDeObra, setLoadingMaoDeObra] = useState(true);

  const [maoDeObraSubmitError, setMaoDeObraSubmitError] = useState("");

  const [isMaoDeObraModalOpen, setIsMaoDeObraModalOpen] = useState(false);

  const [isDescontoModalOpen, setIsDescontoModalOpen] = useState(false);

  const [descontoError, setDescontoError] = useState("");

  const [isPagamentoModalOpen, setIsPagamentoModalOpen] = useState(false);

  const [pagamentoSubmitError, setPagamentoSubmitError] = useState("");

  const [pagamento, setPagamento] = useState<Pagamento | null>(null);

  const [desvinculandoPeca, setDesvinculandoPeca] = useState<ItemOsPeca | null>(
    null,
  );

  const [excluindoMaoDeObra, setExcluindoMaoDeObra] = useState<MaoObra | null>(
    null,
  );

  /*
   * ============================
   * PAGAMENTO (fonte: backend)
   * ============================
   */

  const carregarPagamento = useCallback(async () => {
    try {
      const data = await buscarPagamentoPorOsId(ordemServico.id);

      setPagamento(data);
    } catch (error) {
      console.error("Erro ao carregar pagamento da OS:", error);

      setPagamento(null);
    }
  }, [ordemServico.id]);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      carregarPagamento();
    }, 0);

    return () => clearTimeout(timeoutId);
  }, [carregarPagamento]);

  /*
   * ============================
   * PEÇAS
   * ============================
   */

  useEffect(() => {
    let ativo = true;

    async function carregarPecas() {
      try {
        setLoadingPecas(true);
        setPecaSubmitError("");

        const data = await listarItemOsPecaPorOs(ordemServico.id);

        if (ativo) {
          setPecasDaOs(data);
        }
      } catch (error) {
        console.error("Erro ao carregar peças da OS:", error);

        if (ativo) {
          setPecaSubmitError(
            error instanceof Error
              ? error.message
              : "Não foi possível carregar as peças da OS.",
          );
        }
      } finally {
        if (ativo) {
          setLoadingPecas(false);
        }
      }
    }

    carregarPecas();

    return () => {
      ativo = false;
    };
  }, [ordemServico.id]);

  /*
   * ============================
   * ATUALIZAÇÃO DA OS
   * ============================
   */

  async function atualizarDadosOrdemServico(): Promise<OrdemDeServico> {
    const ordemAtualizada = await buscarOrdemServico(ordemServicoAtual.id);

    setOrdemServicoAtual(ordemAtualizada);

    onUpdateOrdemServico(ordemAtualizada);

    await carregarPagamento();

    return ordemAtualizada;
  }

  /*
   * ============================
   * MÃO DE OBRA
   * ============================
   */

  async function handleExcluirMaoDeObra() {
    if (!excluindoMaoDeObra) return;

    try {
      setMaoDeObraSubmitError("");

      await deletarMaoObra(excluindoMaoDeObra.id);

      setMaoDeObra((prev) =>
        prev.filter((item) => item.id !== excluindoMaoDeObra.id),
      );

      setExcluindoMaoDeObra(null);

      await atualizarDadosOrdemServico();
    } catch (error) {
      console.error("Erro ao excluir mão de obra:", error);

      setMaoDeObraSubmitError(
        error instanceof Error
          ? error.message
          : "Não foi possível excluir a mão de obra.",
      );
    }
  }

  useEffect(() => {
    let ativo = true;

    async function carregarMaoDeObra() {
      setLoadingMaoDeObra(true);
      setMaoDeObraSubmitError("");
      setMaoDeObra([]);

      try {
        const data = await listarMaoObraPorOrdemServico(ordemServico.id);

        if (ativo) {
          setMaoDeObra(data);
        }
      } catch (error) {
        console.error("Erro ao carregar mão de obra:", error);

        if (ativo) {
          setMaoDeObraSubmitError(
            error instanceof Error
              ? error.message
              : "Não foi possível carregar a mão de obra.",
          );
        }
      }

      if (ativo) {
        setLoadingMaoDeObra(false);
      }
    }

    carregarMaoDeObra();

    return () => {
      ativo = false;
    };
  }, [ordemServico.id]);

  async function handleSalvarMaoDeObra(data: MaoDeObraFormData) {
    try {
      setMaoDeObraSubmitError("");

      const novaMaoDeObra = await criarMaoObra({
        osId: ordemServicoAtual.id,
        valor: data.valor,
        descricao: data.descricao,
      });

      setMaoDeObra((prev) => [...prev, novaMaoDeObra]);

      await atualizarDadosOrdemServico();

      setIsMaoDeObraModalOpen(false);
    } catch (error) {
      console.error("Erro ao criar mão de obra:", error);

      setMaoDeObraSubmitError(
        error instanceof Error
          ? error.message
          : "Não foi possível adicionar a mão de obra.",
      );
    }
  }

  /*
   * ============================
   * PEÇAS
   * ============================
   */

  async function handleSalvarPecaCriada(data: ItemOsPecaFormData) {
    try {
      setPecaSubmitError("");

      const novaPeca = await criarItemOsPeca({
        nome: data.nome,
        quantidade: data.quantidade,
        valorUnitario: data.valorUnitario,
        osId: ordemServicoAtual.id,
      });

      setPecasDaOs((prev) => [...prev, novaPeca]);

      onAddPeca(novaPeca);

      await atualizarDadosOrdemServico();

      setPecaFlow(null);
    } catch (error) {
      console.error("Erro ao criar peça:", error);

      setPecaSubmitError(
        error instanceof Error
          ? error.message
          : "Não foi possível adicionar a peça.",
      );
    }
  }

  async function handleSelecionarPecaExistente(peca: ItemOsPeca) {
    try {
      setPecaSubmitError("");

      const pecaVinculada = await vincularItemOsPecaOs(
        peca.id,
        ordemServicoAtual.id,
      );

      setPecasDaOs((prev) => {
        const existe = prev.some((item) => item.id === pecaVinculada.id);

        if (existe) {
          return prev.map((item) =>
            item.id === pecaVinculada.id ? pecaVinculada : item,
          );
        }

        return [...prev, pecaVinculada];
      });

      onAddPeca(pecaVinculada);
      onUpdatePeca(pecaVinculada);

      await atualizarDadosOrdemServico();

      setPecaFlow(null);
    } catch (error) {
      console.error("Erro ao vincular peça à OS:", error);

      setPecaSubmitError(
        error instanceof Error
          ? error.message
          : "Não foi possível selecionar a peça.",
      );
    }
  }

  async function handleDesvincularPeca() {
    if (!desvinculandoPeca) return;

    try {
      setPecaSubmitError("");

      await desvincularItemOsPecaOs(desvinculandoPeca.id);

      setPecasDaOs((prev) =>
        prev.filter((peca) => peca.id !== desvinculandoPeca.id),
      );

      const pecaAtualizada: ItemOsPeca = {
        ...desvinculandoPeca,
        osId: null,
      };

      onUpdatePeca(pecaAtualizada);
      setDesvinculandoPeca(null);

      await atualizarDadosOrdemServico();
    } catch (error) {
      console.error("Erro ao desvincular peça:", error);

      setPecaSubmitError(
        error instanceof Error
          ? error.message
          : "Não foi possível desvincular a peça.",
      );
    }
  }

  /*
   * ============================
   * DESCONTO
   * ============================
   */

  async function handleSalvarDesconto(novoDesconto: number) {
    try {
      setDescontoError("");

      const ordemAtualizada = await aplicarDesconto(
        ordemServicoAtual.id,
        novoDesconto,
      );

      setOrdemServicoAtual(ordemAtualizada);

      onUpdateOrdemServico(ordemAtualizada);

      await carregarPagamento();

      setIsDescontoModalOpen(false);
    } catch (error) {
      console.error("Erro ao aplicar desconto:", error);

      setDescontoError(
        error instanceof Error
          ? error.message
          : "Não foi possível aplicar o desconto.",
      );
    }
  }

  /*
   * ============================
   * PAGAMENTO
   * ============================
   */

  async function handleSalvarPagamento(data: RegistroPagamentoFormData) {
    if (!pagamento) return;

    try {
      setPagamentoSubmitError("");

      await criarRegistroPagamento({
        pagamentoId: pagamento.id,
        valor: data.valorPago,
        meioPagamento: data.meioPagamento,
      });

      await carregarPagamento();

      setIsPagamentoModalOpen(false);
    } catch (error) {
      console.error("Erro ao registrar pagamento:", error);

      setPagamentoSubmitError(
        error instanceof Error
          ? error.message
          : "Não foi possível registrar o pagamento.",
      );
    }
  }

  const pecasParaRelacionar = todasAsPecas;

  return (
    <div className="view-os-overlay">
      <div className="view-os-modal">
        <HeaderOs id={ordemServicoAtual.id} />

        <DataOS ordemServico={ordemServicoAtual} />

        {/* ================= PEÇAS ================= */}

        <ViewSection
          icon={Package}
          title="Peças"
          onClick={
            isGerente
              ? () => {
                  setPecaSubmitError("");
                  setPecaFlow("action");
                }
              : undefined
          }
          buttonText={isGerente ? "Adicionar Peça" : undefined}
          iconButton={isGerente ? Plus : undefined}
        >
          {loadingPecas ? (
            <p>Carregando peças...</p>
          ) : pecaSubmitError ? (
            <p>{pecaSubmitError}</p>
          ) : (
            <ViewTable
              data={pecasDaOs}
              emptyMessage="Nenhuma peça adicionada a esta OS"
              columns={[
                {
                  key: "nome",
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
                {
                  key: "acoes",
                  header: "Ações",
                  className: "view-os-table-actions",
                  render: (peca) =>
                    isGerente ? (
                      <button
                        type="button"
                        className="view-os-table-action view-os-table-action-unlink"
                        title="Desvincular peça"
                        onClick={() => setDesvinculandoPeca(peca)}
                      >
                        <Link2Off size={16} />
                      </button>
                    ) : null,
                },
              ]}
            />
          )}
        </ViewSection>

        {/* ================= MÃO DE OBRA ================= */}

        <ViewSection
          icon={Wrench}
          title="Mão de Obra"
          onClick={
            isGerente
              ? () => {
                  setMaoDeObraSubmitError("");
                  setIsMaoDeObraModalOpen(true);
                }
              : undefined
          }
          buttonText={isGerente ? "Adicionar Mão de Obra" : undefined}
          iconButton={isGerente ? Plus : undefined}
        >
          {loadingMaoDeObra ? (
            <p>Carregando mão de obra...</p>
          ) : maoDeObraSubmitError ? (
            <p>{maoDeObraSubmitError}</p>
          ) : (
            <ViewTable
              data={maoDeObra}
              emptyMessage="Nenhuma mão de obra adicionada a esta OS"
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
                {
                  key: "acoes",
                  header: "Ações",
                  className: "view-os-table-actions",
                  render: (item) =>
                    isGerente ? (
                      <button
                        type="button"
                        className="view-os-table-action view-os-table-action-delete"
                        title="Excluir mão de obra"
                        onClick={() => setExcluindoMaoDeObra(item)}
                      >
                        <Trash2 size={16} />
                      </button>
                    ) : null,
                },
              ]}
            />
          )}
        </ViewSection>

        {/* ================= FINANCEIRO ================= */}

        <section className="view-os-financial">
          <SectionTitle
            icon={DollarSign}
            title="Resumo financeiro"
            onClick={
              isGerente
                ? () => {
                    setDescontoError("");
                    setIsDescontoModalOpen(true);
                  }
                : undefined
            }
            buttonText={isGerente ? "Adicionar Desconto" : undefined}
            iconButton={isGerente ? Tag : undefined}
          />

          <div className="view-os-totals">
            <div className="view-os-total-item">
              <ViewValor
                text="Valor Total"
                valor={ordemServicoAtual.valorTotal}
              />
            </div>

            <div className="view-os-total-item">
              <ViewValor text="Desconto" valor={ordemServicoAtual.desconto} />
            </div>

            <div className="view-os-total-item view-os-total-final">
              <ViewValor
                text="Valor com Desconto"
                valor={ordemServicoAtual.valorComDesconto}
              />
            </div>
          </div>
        </section>

        {/* ================= PAGAMENTO ================= */}

        {pagamento && (
          <PaymentSection
            pagamento={pagamento}
            onRegistrarPagamento={
              isGerente
                ? () => {
                    setPagamentoSubmitError("");
                    setIsPagamentoModalOpen(true);
                  }
                : undefined
            }
          />
        )}

        <footer className="view-os-footer">
          <ButtonClose onClose={onClose} />
        </footer>

        {/* ================= MODAL PEÇA ================= */}

        {pecaFlow === "action" && (
          <PecaActionModal
            osId={ordemServicoAtual.id}
            onClose={() => setPecaFlow(null)}
            onCriarPeca={() => setPecaFlow("create")}
            onRelacionarPeca={() => setPecaFlow("relate")}
          />
        )}

        {pecaFlow === "create" && (
          <PecaCreateModal
            osId={ordemServicoAtual.id}
            onClose={() => {
              setPecaFlow(null);
              setPecaSubmitError("");
            }}
            onSave={handleSalvarPecaCriada}
          />
        )}

        {pecaFlow === "relate" && (
          <RelatePecaModal
            osId={ordemServicoAtual.id}
            todasAsPecas={pecasParaRelacionar}
            pecasDaOsAtual={pecasDaOs}
            onClose={() => {
              setPecaFlow(null);
              setPecaSubmitError("");
            }}
            onSelecionar={handleSelecionarPecaExistente}
          />
        )}

        {desvinculandoPeca && (
          <ConfirmDeleteEntity
            text="Peça"
            entity="a peça"
            entityName={desvinculandoPeca.nome}
            onConfirm={handleDesvincularPeca}
            onCancel={() => setDesvinculandoPeca(null)}
          />
        )}

        {/* ================= MODAL MÃO DE OBRA ================= */}

        {isMaoDeObraModalOpen && (
          <MaoDeObraModal
            osId={ordemServicoAtual.id}
            onClose={() => {
              setIsMaoDeObraModalOpen(false);
              setMaoDeObraSubmitError("");
            }}
            onSave={handleSalvarMaoDeObra}
            submitError={maoDeObraSubmitError}
          />
        )}

        {excluindoMaoDeObra && (
          <ConfirmDeleteEntity
            text="Mão de obra"
            entity="a mão de obra"
            entityName={excluindoMaoDeObra.descricao}
            onConfirm={handleExcluirMaoDeObra}
            onCancel={() => setExcluindoMaoDeObra(null)}
          />
        )}

        {/* ================= MODAL DESCONTO ================= */}

        {isDescontoModalOpen && (
          <DescontoModal
            osId={ordemServicoAtual.id}
            descontoAtual={ordemServicoAtual.desconto}
            onClose={() => {
              setIsDescontoModalOpen(false);
              setDescontoError("");
            }}
            onSave={handleSalvarDesconto}
            submitError={descontoError}
          />
        )}

        {/* ================= MODAL PAGAMENTO ================= */}

        {isPagamentoModalOpen && pagamento && (
          <PaymentRegistrationModal
            pagamento={pagamento}
            onClose={() => {
              setIsPagamentoModalOpen(false);
              setPagamentoSubmitError("");
            }}
            onSave={handleSalvarPagamento}
            submitError={pagamentoSubmitError}
          />
        )}
      </div>
    </div>
  );
}
