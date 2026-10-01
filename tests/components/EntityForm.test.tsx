import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { EntityForm } from "../../src/components/EntityForm";
import { defineFields } from "../../src/components/EntityForm/types";
import { validateForm } from "../../src/components/EntityForm/validators";

type FormData = {
  nome: string;
  telefone: string;
  documento: string;
  valor: number;
  placa: string;
  meio: string;
  obs: string;
};

const fields = defineFields<FormData>([
  {
    name: "nome",
    label: "Nome",
    placeholder: "Nome completo",
    type: "text",
    required: true,
  },
  {
    name: "telefone",
    label: "Telefone",
    placeholder: "Telefone",
    type: "phone",
    required: true,
  },
  {
    name: "documento",
    label: "CPF/CNPJ",
    placeholder: "Documento",
    type: "document",
    required: true,
  },
  {
    name: "valor",
    label: "Valor",
    placeholder: "Valor",
    type: "currency",
    validate: (v) =>
      Number(v) > 10000 ? "Valor máximo: R$ 100,00" : undefined,
  },
  {
    name: "placa",
    label: "Placa",
    placeholder: "Placa",
    type: "plate",
  },
  {
    name: "meio",
    label: "Meio",
    placeholder: "Selecione o meio",
    type: "select",
    options: [
      { label: "Dinheiro", value: "DINHEIRO" },
      { label: "PIX", value: "PIX" },
    ],
  },
  {
    name: "obs",
    label: "Observações",
    placeholder: "Observações",
    type: "textarea",
  },
]);

function renderForm(
  props: Partial<Parameters<typeof EntityForm<FormData>>[0]> = {},
) {
  const onSubmit = vi.fn();
  const onClose = vi.fn();
  const user = userEvent.setup();

  render(
    <EntityForm<FormData>
      title="Cadastro de Teste"
      fields={fields}
      onSubmit={onSubmit}
      onClose={onClose}
      {...props}
    />,
  );

  return { onSubmit, onClose, user };
}

async function preencherObrigatorios(user: ReturnType<typeof userEvent.setup>) {
  await user.type(screen.getByPlaceholderText("Nome completo"), "Maria Souza");
  await user.type(screen.getByPlaceholderText("Telefone"), "83988887777");
  await user.type(screen.getByPlaceholderText("Documento"), "12345678901");
}

describe("EntityForm", () => {
  it("mostra título e botões Salvar/Fechar", () => {
    renderForm();

    expect(
      screen.getByRole("heading", { name: "Cadastro de Teste" }),
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Salvar" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Fechar" })).toBeInTheDocument();
  });

  it("não envia e mostra erro em cada campo obrigatório vazio", async () => {
    const { onSubmit, user } = renderForm();

    await user.click(screen.getByRole("button", { name: "Salvar" }));

    expect(onSubmit).not.toHaveBeenCalled();
    expect(screen.getByText("Nome é obrigatório")).toBeInTheDocument();
    expect(screen.getByText("Telefone é obrigatório")).toBeInTheDocument();
    expect(screen.getByText("CPF/CNPJ é obrigatório")).toBeInTheDocument();
    expect(screen.queryByText("Valor é obrigatório")).not.toBeInTheDocument();
  });

  it("trata texto só com espaços como vazio", async () => {
    const { onSubmit, user } = renderForm();

    await user.type(screen.getByPlaceholderText("Nome completo"), "   ");
    await user.click(screen.getByRole("button", { name: "Salvar" }));

    expect(onSubmit).not.toHaveBeenCalled();
    expect(screen.getByText("Nome é obrigatório")).toBeInTheDocument();
  });

  it("remove o erro do campo assim que o usuário volta a digitar nele", async () => {
    const { user } = renderForm();
    await user.click(screen.getByRole("button", { name: "Salvar" }));
    expect(screen.getByText("Nome é obrigatório")).toBeInTheDocument();

    await user.type(screen.getByPlaceholderText("Nome completo"), "M");

    expect(screen.queryByText("Nome é obrigatório")).not.toBeInTheDocument();
    expect(screen.getByText("Telefone é obrigatório")).toBeInTheDocument();
  });

  it("máscara telefone/documento exibe formatado e envia só dígitos", async () => {
    const { onSubmit, user } = renderForm();

    await preencherObrigatorios(user);

    expect(screen.getByPlaceholderText("Telefone")).toHaveValue(
      "(83) 98888-7777",
    );
    expect(screen.getByPlaceholderText("Documento")).toHaveValue(
      "123.456.789-01",
    );

    await user.click(screen.getByRole("button", { name: "Salvar" }));

    expect(onSubmit).toHaveBeenCalledWith(
      expect.objectContaining({
        nome: "Maria Souza",
        telefone: "83988887777",
        documento: "12345678901",
      }),
    );
  });

  it("campo de moeda guarda centavos e mostra em reais", async () => {
    const { onSubmit, user } = renderForm();
    await preencherObrigatorios(user);

    await user.type(screen.getByPlaceholderText("Valor"), "1234");

    expect(
      (screen.getByPlaceholderText("Valor") as HTMLInputElement).value.replace(
        /\s/g,
        " ",
      ),
    ).toBe("R$ 12,34");

    await user.click(screen.getByRole("button", { name: "Salvar" }));
    expect(onSubmit).toHaveBeenCalledWith(
      expect.objectContaining({ valor: 1234 }),
    );
  });

  it("validação customizada bloqueia o envio e mostra a mensagem", async () => {
    const { onSubmit, user } = renderForm();
    await preencherObrigatorios(user);

    await user.type(screen.getByPlaceholderText("Valor"), "20000");
    await user.click(screen.getByRole("button", { name: "Salvar" }));

    expect(onSubmit).not.toHaveBeenCalled();
    expect(screen.getByText("Valor máximo: R$ 100,00")).toBeInTheDocument();
  });

  it("placa é normalizada em caixa alta com hífen", async () => {
    const { onSubmit, user } = renderForm();
    await preencherObrigatorios(user);

    await user.type(screen.getByPlaceholderText("Placa"), "abc1d23");
    expect(screen.getByPlaceholderText("Placa")).toHaveValue("ABC-1D23");

    await user.click(screen.getByRole("button", { name: "Salvar" }));
    expect(onSubmit).toHaveBeenCalledWith(
      expect.objectContaining({ placa: "ABC1D23" }),
    );
  });

  it("select e textarea entram no payload", async () => {
    const { onSubmit, user } = renderForm();
    await preencherObrigatorios(user);

    await user.selectOptions(screen.getByRole("combobox"), "PIX");
    await user.type(screen.getByPlaceholderText("Observações"), "Cliente VIP");
    await user.click(screen.getByRole("button", { name: "Salvar" }));

    expect(onSubmit).toHaveBeenCalledWith(
      expect.objectContaining({ meio: "PIX", obs: "Cliente VIP" }),
    );
  });

  it("preenche os campos com initialValues formatados (edição)", () => {
    renderForm({
      initialValues: {
        nome: "JOAO SILVA",
        telefone: "83988887777",
        documento: "12345678901",
      },
    });

    expect(screen.getByPlaceholderText("Nome completo")).toHaveValue(
      "JOAO SILVA",
    );
    expect(screen.getByPlaceholderText("Telefone")).toHaveValue(
      "(83) 98888-7777",
    );
    expect(screen.getByPlaceholderText("Documento")).toHaveValue(
      "123.456.789-01",
    );
  });

  it("edição sem alterar nada envia os valores originais", async () => {
    const { onSubmit, user } = renderForm({
      initialValues: {
        nome: "JOAO SILVA",
        telefone: "83988887777",
        documento: "12345678901",
      },
    });

    await user.click(screen.getByRole("button", { name: "Salvar" }));

    expect(onSubmit).toHaveBeenCalledWith({
      nome: "JOAO SILVA",
      telefone: "83988887777",
      documento: "12345678901",
    });
  });

  it("exibe o erro de envio recebido do pai", () => {
    renderForm({ submitError: "Cliente já cadastrado com esse documento" });

    expect(
      screen.getByText("Cliente já cadastrado com esse documento"),
    ).toBeInTheDocument();
  });

  it("Fechar chama onClose sem enviar", async () => {
    const { onSubmit, onClose, user } = renderForm();

    await user.click(screen.getByRole("button", { name: "Fechar" }));

    expect(onClose).toHaveBeenCalledTimes(1);
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it("campos com hidden() não aparecem e não são validados", async () => {
    const onSubmit = vi.fn();
    const user = userEvent.setup();
    const condicionais = defineFields<{ tipo: string; extra: string }>([
      { name: "tipo", label: "Tipo", placeholder: "Tipo", type: "text" },
      {
        name: "extra",
        label: "Extra",
        placeholder: "Extra",
        type: "text",
        required: true,
        hidden: (dados) => dados.tipo !== "completo",
      },
    ]);
    render(
      <EntityForm
        title="Condicional"
        fields={condicionais}
        onSubmit={onSubmit}
        onClose={vi.fn()}
      />,
    );

    expect(screen.queryByPlaceholderText("Extra")).not.toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Salvar" }));
    expect(onSubmit).toHaveBeenCalledTimes(1);

    await user.type(screen.getByPlaceholderText("Tipo"), "completo");
    expect(screen.getByPlaceholderText("Extra")).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Salvar" }));
    await waitFor(() =>
      expect(screen.getByText("Extra é obrigatório")).toBeInTheDocument(),
    );
    expect(onSubmit).toHaveBeenCalledTimes(1);
  });
});

describe("validateForm", () => {
  const campos = defineFields<{ a: string; b: number }>([
    {
      name: "a",
      label: "Campo A",
      placeholder: "",
      type: "text",
      required: true,
    },
    {
      name: "b",
      label: "Campo B",
      placeholder: "",
      type: "number",
      required: true,
    },
  ]);

  it("aceita número zero (não é vazio)", () => {
    expect(validateForm(campos, { a: "x", b: 0 })).toEqual({});
  });

  it("rejeita NaN, null e undefined", () => {
    expect(validateForm(campos, { a: undefined, b: Number.NaN })).toEqual({
      a: "Campo A é obrigatório",
      b: "Campo B é obrigatório",
    });
  });

  it("não roda validação customizada quando o obrigatório falhou", () => {
    const validate = vi.fn(() => "não deveria aparecer");
    const comCustom = defineFields<{ a: string }>([
      {
        name: "a",
        label: "A",
        placeholder: "",
        type: "text",
        required: true,
        validate,
      },
    ]);

    expect(validateForm(comCustom, {})).toEqual({ a: "A é obrigatório" });
    expect(validate).not.toHaveBeenCalled();
  });
});
