function onlyDigits(value: string): string {
  return value.replace(/\D/g, "");
}

export function formatPhone(value: string): string {
  const digits = onlyDigits(value).slice(0, 11);
  if (!digits) return "";
  const area = digits.slice(0, 2);
  if (digits.length <= 2) return `(${area}`;
  const rest = digits.slice(2);
  if (rest.length <= 5) return `(${area}) ${rest}`;
  return `(${area}) ${rest.slice(0, 5)}-${rest.slice(5)}`;
}

export function unformatPhone(value: string): string {
  return onlyDigits(value).slice(0, 11);
}

function formatCPF(d: string): string {
  let r = d;
  if (d.length > 3) r = `${d.slice(0, 3)}.${d.slice(3)}`;
  if (d.length > 6) r = `${d.slice(0, 3)}.${d.slice(3, 6)}.${d.slice(6)}`;
  if (d.length > 9)
    r = `${d.slice(0, 3)}.${d.slice(3, 6)}.${d.slice(6, 9)}-${d.slice(9)}`;
  return r;
}

function formatCNPJ(d: string): string {
  let r = d;
  if (d.length > 2) r = `${d.slice(0, 2)}.${d.slice(2)}`;
  if (d.length > 5) r = `${d.slice(0, 2)}.${d.slice(2, 5)}.${d.slice(5)}`;
  if (d.length > 8)
    r = `${d.slice(0, 2)}.${d.slice(2, 5)}.${d.slice(5, 8)}/${d.slice(8)}`;
  if (d.length > 12)
    r = `${d.slice(0, 2)}.${d.slice(2, 5)}.${d.slice(5, 8)}/${d.slice(8, 12)}-${d.slice(12)}`;
  return r;
}

export function formatDocument(value: string): {
  display: string;
  kind: "cpf" | "cnpj";
} {
  const digits = onlyDigits(value).slice(0, 14);
  return digits.length <= 11
    ? { display: formatCPF(digits), kind: "cpf" }
    : { display: formatCNPJ(digits), kind: "cnpj" };
}

export function unformatDocument(value: string): string {
  return onlyDigits(value).slice(0, 14);
}

export function parseCurrencyToCents(value: string): number {
  const digits = value.replace(/\D/g, "");

  return digits ? Number(digits) : 0;
}

export function formatCurrencyDisplay(value: number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value / 100);
}

export function formatPlate(value: string): string {
  const plate = value
    .replace(/[^a-zA-Z0-9]/g, "")
    .toUpperCase()
    .slice(0, 7);

  if (plate.length <= 3) {
    return plate;
  }

  return `${plate.slice(0, 3)}-${plate.slice(3)}`;
}

export function normalizePlate(value: string): string {
  return value
    .replace(/[^a-zA-Z0-9]/g, "")
    .toUpperCase()
    .slice(0, 7);
}

export function formatStatus(status: string): string {
  const labels: Record<string, string> = {
    ABERTA: "Aberta",
    EM_ANDAMENTO: "Em andamento",
    AGUARDANDO_PECAS: "Aguardando peças",
    FINALIZADA: "Finalizada",
    CANCELADA: "Cancelada",
  };

  return labels[status] ?? status;
}

export function formatDate(date: string | null): string {
  if (!date) return "Em aberto";

  return new Date(date).toLocaleString("pt-BR", {
    dateStyle: "short",
    timeStyle: "short",
  });
}
