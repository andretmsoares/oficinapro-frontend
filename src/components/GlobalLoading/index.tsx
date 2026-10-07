import { useEffect, useState, useSyncExternalStore } from "react";

import { getPendingRequests, subscribeLoading } from "../../services/api";

import "./globalLoading.style.css";

// Evita "piscar" o aviso em respostas muito rápidas.
const SHOW_DELAY_MS = 150;

export function GlobalLoading() {
  const isLoading =
    useSyncExternalStore(subscribeLoading, getPendingRequests) > 0;
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!isLoading) {
      const hide = setTimeout(() => setVisible(false), 0);
      return () => clearTimeout(hide);
    }

    const show = setTimeout(() => setVisible(true), SHOW_DELAY_MS);
    return () => clearTimeout(show);
  }, [isLoading]);

  // Bloqueia cliques e teclado em toda a interface (inclusive botões) desde o
  // início da requisição, evitando envios duplicados antes do aviso aparecer.
  useEffect(() => {
    const root = document.getElementById("root");
    const html = document.documentElement;

    if (isLoading) {
      root?.setAttribute("inert", "");
      html.setAttribute("data-loading", "");
    } else {
      root?.removeAttribute("inert");
      html.removeAttribute("data-loading");
    }

    return () => {
      root?.removeAttribute("inert");
      html.removeAttribute("data-loading");
    };
  }, [isLoading]);

  if (!visible) {
    return null;
  }

  return (
    <div
      className="global-loading"
      role="alert"
      aria-busy="true"
      aria-live="assertive"
    >
      <div className="global-loading__box">
        <span className="global-loading__spinner" aria-hidden="true" />
        <span>Carregando...</span>
      </div>
    </div>
  );
}
