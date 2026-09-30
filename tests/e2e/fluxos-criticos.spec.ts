import { expect, test } from "@playwright/test";

import { entrarComoGerente, mockApi } from "./support/mockApi";

test.describe("Fluxo 1 - Login", () => {
  test("login válido leva ao dashboard da oficina", async ({ page }) => {
    await mockApi(page);

    await entrarComoGerente(page);

    await expect(page).toHaveURL(/\/dashboard$/);
    await expect(page.getByText("Olá, Ana Gerente")).toBeVisible();
    await expect(
      page.getByRole("heading", { name: "Dashboard" }),
    ).toBeVisible();
    await expect(page.getByText("1 pagamentos pendentes")).toBeVisible();
  });

  test("senha inválida mostra erro e permanece no login", async ({ page }) => {
    await mockApi(page);
    await page.goto("/");

    await page.getByPlaceholder("Usuário").fill("ana.gerente");
    await page.getByPlaceholder("Senha").fill("errada");
    await page.getByRole("button", { name: "Entrar" }).click();

    await expect(page.getByText("Usuário ou senha inválidos.")).toBeVisible();
    await expect(
      page.getByRole("heading", { name: "Seja Bem-vindo" }),
    ).toBeVisible();
  });

  test("a sessão sobrevive a um reload e o logout a encerra", async ({
    page,
  }) => {
    await mockApi(page);
    await entrarComoGerente(page);
    await expect(page.getByText("Olá, Ana Gerente")).toBeVisible();

    await page.reload();
    await expect(page.getByText("Olá, Ana Gerente")).toBeVisible();

    await page.getByRole("button", { name: /Sair/ }).click();
    await expect(
      page.getByRole("heading", { name: "Seja Bem-vindo" }),
    ).toBeVisible();
  });
});

test.describe("Fluxo 2 - Cliente", () => {
  test("cria um cliente e o encontra na listagem", async ({ page }) => {
    const api = await mockApi(page);
    await entrarComoGerente(page);

    await page.getByRole("link", { name: "Clientes" }).click();
    await expect(page.getByText("JOAO SILVA")).toBeVisible();

    await page.getByRole("button", { name: /Novo Cliente/ }).click();
    await page.getByPlaceholder(/nome do cleinte/).fill("Maria Souza");
    await page.getByPlaceholder(/documento do cliente/).fill("98765432100");
    await page.getByPlaceholder(/telefone do cliente/).fill("83911112222");
    await page.getByRole("button", { name: "Salvar" }).click();

    await expect(page.getByText("MARIA SOUZA")).toBeVisible();
    await expect(page.getByText("987.654.321-00")).toBeVisible();
    expect(api.clientes).toHaveLength(2);
  });
});

test.describe("Fluxo 3 - Ordem de Serviço", () => {
  test("lista a OS com código, placa, cliente e status", async ({ page }) => {
    await mockApi(page);
    await entrarComoGerente(page);

    await page.getByRole("link", { name: "Ordens de Serviço" }).click();

    const linha = page.getByRole("row", { name: /#0001/ });
    await expect(linha).toContainText("ABC-1234");
    await expect(linha).toContainText("JOAO SILVA");
    await expect(linha).toContainText("Aberta");
  });

  test("vindo de Clientes, a busca de OS já vem filtrada pelo cliente", async ({
    page,
  }) => {
    await mockApi(page);
    await entrarComoGerente(page);
    await page.getByRole("link", { name: "Clientes" }).click();

    await page.getByTitle("Visualizar Ordens de Serviço").click();

    await expect(page).toHaveURL(/\/ordens-servico\?cliente=JOAO%20SILVA$/);
    await expect(page.getByPlaceholder(/Pesquisar por veículo/)).toHaveValue(
      "JOAO SILVA",
    );
    await expect(page.getByRole("row", { name: /#0001/ })).toBeVisible();
  });
});

test.describe("Fluxo 4 - Pagamento", () => {
  test("registra um pagamento parcial e a tela reflete status e valores", async ({
    page,
  }) => {
    const api = await mockApi(page);
    await entrarComoGerente(page);
    await page.getByRole("link", { name: "Pagamentos" }).click();

    const linha = page.getByRole("row", { name: /#0001/ });
    await expect(linha).toContainText("Pendente");

    await linha.getByTitle("Registrar Pagamento").click();
    await page.getByPlaceholder("Digite o valor pago").fill("20000");
    await page
      .locator(".form-content")
      .getByRole("combobox")
      .selectOption("PIX");
    await page.getByRole("button", { name: "Salvar" }).click();

    await expect(linha).toContainText("Parcial");
    await expect(linha).toContainText(/R\$\s*200,00/);
    await expect(linha).toContainText(/R\$\s*300,00/);
    expect(api.pagamentos[0].valorPago).toBe(20000);
  });

  test("não deixa registrar mais do que o saldo da OS", async ({ page }) => {
    const api = await mockApi(page);
    await entrarComoGerente(page);
    await page.getByRole("link", { name: "Pagamentos" }).click();

    await page
      .getByRole("row", { name: /#0001/ })
      .getByTitle("Registrar Pagamento")
      .click();
    await page.getByPlaceholder("Digite o valor pago").fill("50001");
    await page
      .locator(".form-content")
      .getByRole("combobox")
      .selectOption("DINHEIRO");
    await page.getByRole("button", { name: "Salvar" }).click();

    await expect(
      page.getByText(/Valor máximo permitido: R\$\s*500,00/),
    ).toBeVisible();
    expect(api.pagamentos[0].valorPago).toBe(0);
  });
});
