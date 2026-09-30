import { useEffect, useRef, useState } from "react";
import { ImagePlus, Trash2, Upload } from "lucide-react";
import { ButtonClose } from "../Buttons/ButtonClose";
import type { Oficina } from "../../types/oficina/oficina";
import {
  buscarLogoOficina,
  enviarLogoOficina,
  removerLogoOficina,
} from "../../services/oficinaService";
import "../EntityViewModal/entityViewModal.style.css";
import "./oficinaLogoModal.style.css";

const TIPOS_ACEITOS = ["image/png", "image/jpeg"];
const TAMANHO_MAXIMO = 2 * 1024 * 1024;

interface OficinaLogoModalProps {
  oficina: Oficina;
  onClose: () => void;
}

export function OficinaLogoModal({ oficina, onClose }: OficinaLogoModalProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  const [logoAtualUrl, setLogoAtualUrl] = useState<string | null>(null);
  const [arquivo, setArquivo] = useState<File | null>(null);
  const [novaUrl, setNovaUrl] = useState<string | null>(null);
  const [carregando, setCarregando] = useState(true);
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState("");

  async function carregarLogoAtual() {
    setCarregando(true);
    try {
      const blob = await buscarLogoOficina(oficina.id);
      setLogoAtualUrl((anterior) => {
        if (anterior) URL.revokeObjectURL(anterior);
        return blob ? URL.createObjectURL(blob) : null;
      });
    } catch (err) {
      setErro(
        err instanceof Error ? err.message : "Não foi possível carregar a logo.",
      );
    } finally {
      setCarregando(false);
    }
  }

  useEffect(() => {
    carregarLogoAtual();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [oficina.id]);

  useEffect(() => {
    return () => {
      if (logoAtualUrl) URL.revokeObjectURL(logoAtualUrl);
      if (novaUrl) URL.revokeObjectURL(novaUrl);
    };
  }, [logoAtualUrl, novaUrl]);

  function handleSelecionar(event: React.ChangeEvent<HTMLInputElement>) {
    const selecionado = event.target.files?.[0];
    event.target.value = "";
    if (!selecionado) return;

    if (!TIPOS_ACEITOS.includes(selecionado.type)) {
      setErro("Formato inválido. Envie uma imagem PNG ou JPEG.");
      return;
    }
    if (selecionado.size > TAMANHO_MAXIMO) {
      setErro("A logo deve ter no máximo 2 MB.");
      return;
    }

    setErro("");
    setArquivo(selecionado);
    setNovaUrl(URL.createObjectURL(selecionado));
  }

  function handleCancelarSelecao() {
    setArquivo(null);
    setNovaUrl(null);
  }

  async function handleSalvar() {
    if (!arquivo) return;
    setSalvando(true);
    setErro("");
    try {
      await enviarLogoOficina(oficina.id, arquivo);
      handleCancelarSelecao();
      await carregarLogoAtual();
    } catch (err) {
      setErro(
        err instanceof Error ? err.message : "Não foi possível salvar a logo.",
      );
    } finally {
      setSalvando(false);
    }
  }

  async function handleRemover() {
    setSalvando(true);
    setErro("");
    try {
      await removerLogoOficina(oficina.id);
      await carregarLogoAtual();
    } catch (err) {
      setErro(
        err instanceof Error ? err.message : "Não foi possível remover a logo.",
      );
    } finally {
      setSalvando(false);
    }
  }

  const previewUrl = novaUrl ?? logoAtualUrl;

  return (
    <div className="entity-view-overlay">
      <div className="entity-view-modal">
        <header className="entity-view-header">
          <div>
            <h2>Logo da oficina</h2>
            <span>{oficina.nome}</span>
          </div>
        </header>

        <div className="oficina-logo-preview">
          {carregando ? (
            <span>Carregando...</span>
          ) : previewUrl ? (
            <img src={previewUrl} alt={`Logo de ${oficina.nome}`} />
          ) : (
            <span>
              Sem logo cadastrada. Os PDFs usam a logo padrão do sistema.
            </span>
          )}
        </div>

        {novaUrl && (
          <p className="oficina-logo-hint">
            Pré-visualização da nova logo. Clique em "Salvar logo" para aplicá-la.
          </p>
        )}

        {erro && (
          <p className="oficina-logo-error" role="alert">
            {erro}
          </p>
        )}

        <input
          ref={inputRef}
          type="file"
          accept="image/png,image/jpeg"
          onChange={handleSelecionar}
          hidden
        />

        <div className="oficina-logo-actions">
          {arquivo ? (
            <>
              <button
                type="button"
                className="oficina-logo-btn"
                onClick={handleCancelarSelecao}
                disabled={salvando}
              >
                Cancelar
              </button>
              <button
                type="button"
                className="oficina-logo-btn oficina-logo-btn-primary"
                onClick={handleSalvar}
                disabled={salvando}
              >
                <Upload size={16} />
                {salvando ? "Salvando..." : "Salvar logo"}
              </button>
            </>
          ) : (
            <>
              {logoAtualUrl && (
                <button
                  type="button"
                  className="oficina-logo-btn oficina-logo-btn-danger"
                  onClick={handleRemover}
                  disabled={salvando}
                >
                  <Trash2 size={16} />
                  Remover
                </button>
              )}
              <button
                type="button"
                className="oficina-logo-btn oficina-logo-btn-primary"
                onClick={() => inputRef.current?.click()}
                disabled={salvando || carregando}
              >
                <ImagePlus size={16} />
                {logoAtualUrl ? "Trocar logo" : "Enviar logo"}
              </button>
            </>
          )}
        </div>

        <p className="oficina-logo-hint">PNG ou JPEG, até 2 MB.</p>

        <footer className="entity-view-footer">
          <ButtonClose onClose={onClose} />
        </footer>
      </div>
    </div>
  );
}
