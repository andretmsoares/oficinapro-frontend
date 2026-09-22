export type FieldType =
  | "text"
  | "number"
  | "email"
  | "phone"
  | "document"
  | "date"
  | "currency"
  | "plate"
  | "select"
  | "entity-select"
  | "textarea"
  | "password";

export interface SelectOption {
  label: string;
  value: string;
}

/**
 * Item retornado por uma busca de entidade (oficina, cliente, veículo, etc.)
 * usada pelo campo "entity-select".
 */
export interface EntityOption {
  id: number | string;
  label: string;
  /** Texto auxiliar exibido abaixo do label, ex: "CNPJ: 12.345.678/0001-90" */
  description?: string;
}

interface BaseField<T> {
  name: keyof T & string;
  label: string;
  placeholder: string;
  required?: boolean;
  readOnly?: boolean;
  hidden?: (formData: Partial<T>) => boolean;
  validate?: (rawValue: unknown, formData: Partial<T>) => string | undefined;
}

export interface SelectField<T> extends BaseField<T> {
  type: "select";
  options: SelectOption[];
}

/**
 * Campo de busca/autocomplete assíncrono para vincular uma entidade (por ID)
 * sem carregar a lista completa antecipadamente. Reutilizável para Oficina,
 * Cliente, Veículo, Mecânico, Fornecedor, etc — basta fornecer `fetchOptions`.
 */
export interface EntitySelectField<T> extends BaseField<T> {
  type: "entity-select";
  /** Recebe o termo já digitado (após debounce) e retorna as opções encontradas. */
  fetchOptions: (search: string) => Promise<EntityOption[]>;
  /** Nº mínimo de caracteres para disparar a busca. Padrão: 2. */
  minChars?: number;
  /** Debounce em ms antes de consultar o backend. Padrão: 400. */
  debounceMs?: number;
  /** Mensagem exibida quando a busca não retorna resultados. */
  noResultsText?: string;
}

export interface RegularField<T> extends BaseField<T> {
  type: Exclude<FieldType, "select" | "entity-select">;
}

export function defineFields<T>(fields: FormField<T>[]): FormField<T>[] {
  return fields;
}

export type FormField<T> =
  SelectField<T> | EntitySelectField<T> | RegularField<T>;

export interface EntityFormProps<T> {
  title: string;
  fields: FormField<T>[];
  initialValues?: Partial<T>;
  onSubmit: (data: T) => void;
  onClose: () => void;
}
