import {
  formatCurrencyDisplay,
  formatDate,
  formatDocument,
  formatPagamentoStatus,
  formatPhone,
  formatPlate,
  formatStatus,
  normalizePlate,
  parseCurrencyToCents,
  unformatDocument,
  unformatPhone,
} from "../../src/utils/formatters";

// Intl usa espaço não separável entre "R$" e o número.
const semNbsp = (texto: string) => texto.replace(/\s/g, " ");

describe("formatPhone", () => {
  it("formata celular completo com DDD", () => {
    expect(formatPhone("83988887777")).toBe("(83) 98888-7777");
  });

  it("formata progressivamente enquanto o usuário digita", () => {
    expect(formatPhone("8")).toBe("(8");
    expect(formatPhone("83")).toBe("(83");
    expect(formatPhone("839")).toBe("(83) 9");
    expect(formatPhone("83988887")).toBe("(83) 98888-7");
  });

  it("ignora caracteres não numéricos e limita a 11 dígitos", () => {
    expect(formatPhone("(83) 98888-7777 999")).toBe("(83) 98888-7777");
  });

  it("devolve 'Não informado' para valor vazio ou nulo", () => {
    expect(formatPhone(null)).toBe("Não informado");
    expect(formatPhone(undefined)).toBe("Não informado");
    expect(formatPhone("")).toBe("Não informado");
  });

  it("unformatPhone guarda só os dígitos", () => {
    expect(unformatPhone("(83) 98888-7777")).toBe("83988887777");
  });
});

describe("formatDocument", () => {
  it("formata CPF (até 11 dígitos)", () => {
    expect(formatDocument("12345678901")).toEqual({
      display: "123.456.789-01",
      kind: "cpf",
    });
  });

  it("formata CNPJ (mais de 11 dígitos)", () => {
    expect(formatDocument("12345678000195")).toEqual({
      display: "12.345.678/0001-95",
      kind: "cnpj",
    });
  });

  it("formata CPF parcialmente enquanto digita", () => {
    expect(formatDocument("1234").display).toBe("123.4");
    expect(formatDocument("1234567").display).toBe("123.456.7");
  });

  it("formata CNPJ parcialmente enquanto digita", () => {
    expect(formatDocument("123456789012").display).toBe("12.345.678/9012");
  });

  it("limita a 14 dígitos", () => {
    expect(unformatDocument("12.345.678/0001-95999")).toBe("12345678000195");
  });

  it("devolve 'Não informado' para valor vazio", () => {
    expect(formatDocument(null).display).toBe("Não informado");
    expect(formatDocument("").display).toBe("Não informado");
  });
});

describe("valores monetários (em centavos)", () => {
  it("parseCurrencyToCents mantém apenas os dígitos", () => {
    expect(parseCurrencyToCents("R$ 1.234,56")).toBe(123456);
    expect(parseCurrencyToCents("")).toBe(0);
    expect(parseCurrencyToCents("abc")).toBe(0);
  });

  it("formatCurrencyDisplay converte centavos para reais no padrão pt-BR", () => {
    expect(semNbsp(formatCurrencyDisplay(123456))).toBe("R$ 1.234,56");
    expect(semNbsp(formatCurrencyDisplay(0))).toBe("R$ 0,00");
    expect(semNbsp(formatCurrencyDisplay(5))).toBe("R$ 0,05");
  });
});

describe("placa", () => {
  it("formatPlate coloca hífen após a terceira letra e usa caixa alta", () => {
    expect(formatPlate("abc1234")).toBe("ABC-1234");
    expect(formatPlate("abc")).toBe("ABC");
    expect(formatPlate("abc1d23")).toBe("ABC-1D23");
  });

  it("formatPlate ignora símbolos e limita a 7 caracteres", () => {
    expect(formatPlate("abc-12345678")).toBe("ABC-1234");
  });

  it("normalizePlate remove o hífen para enviar ao backend", () => {
    expect(normalizePlate("abc-1234")).toBe("ABC1234");
  });
});

describe("status e datas", () => {
  it("formatStatus traduz status conhecidos e preserva os desconhecidos", () => {
    expect(formatStatus("ABERTA")).toBe("Aberta");
    expect(formatStatus("CANCELADA")).toBe("Cancelada");
    expect(formatStatus("OUTRO")).toBe("OUTRO");
  });

  it("formatPagamentoStatus traduz os status de pagamento", () => {
    expect(formatPagamentoStatus("PAGA")).toBe("Pago");
    expect(formatPagamentoStatus("PAGO_PARCIALMENTE")).toBe("Parcial");
    expect(formatPagamentoStatus("PAGAMENTO_PENDENTE")).toBe("Pendente");
    expect(formatPagamentoStatus("DESCONHECIDO")).toBe("DESCONHECIDO");
  });

  it("formatDate mostra 'Em aberto' quando não há data", () => {
    expect(formatDate(null)).toBe("Em aberto");
  });

  it("formatDate formata no padrão brasileiro", () => {
    expect(formatDate("2026-01-15T10:30:00")).toMatch(/15\/01\/2026/);
  });
});
