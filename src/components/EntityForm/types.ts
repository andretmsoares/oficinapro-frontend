export type FieldType =
  | "text"
  | "number"
  | "email"
  | "phone"
  | "document"
  | "date"
  | "currency"
  | "select"
  | "textarea"
  | "password";

export interface SelectOption {
  label: string;
  value: string;
}

interface BaseField<T> {
  name: keyof T & string;
  label: string;
  required?: boolean;
  validate?: (rawValue: unknown, formData: Partial<T>) => string | undefined;
}

export interface SelectField<T> extends BaseField<T> {
  type: "select";
  options: SelectOption[];
}

export interface RegularField<T> extends BaseField<T> {
  type: Exclude<FieldType, "select">;
}

export function defineFields<T>(
  fields: FormField<T>[],
): FormField<T>[] {
  return fields;
}

export type FormField<T> = SelectField<T> | RegularField<T>;

export interface EntityFormProps<T> {
  title: string;
  fields: FormField<T>[];
  initialValues?: Partial<T>;
  onSubmit: (data: T) => void;
  onClose: () => void;
}
