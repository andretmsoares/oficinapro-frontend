import { render } from "@testing-library/react";
import type { ReactElement } from "react";
import { MemoryRouter, useLocation } from "react-router-dom";

function LocalizacaoAtual() {
  const { pathname, search } = useLocation();

  return <output data-testid="localizacao">{`${pathname}${search}`}</output>;
}

/** Renderiza dentro de um roteador em memória e expõe a URL atual (data-testid="localizacao"). */
export function renderComRota(ui: ReactElement, rota = "/") {
  return render(
    <MemoryRouter initialEntries={[rota]}>
      {ui}
      <LocalizacaoAtual />
    </MemoryRouter>,
  );
}
