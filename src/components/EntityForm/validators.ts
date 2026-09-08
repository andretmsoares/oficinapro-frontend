import type { FormField } from "./types";

function isEmpty(value: unknown): boolean {
  if (value === null || value === undefined) return true;
  if (typeof value === "string") return value.trim() === "";
  if (typeof value === "number") return Number.isNaN(value);
  return false;
}

export function validateForm<T>(fields: FormField<T>[], rawValues: Partial<T>): Record<string, string> {
  const errors: Record<string, string> = {};
  for (const field of fields) {
    const value = rawValues[field.name];
    if (field.required && isEmpty(value)) {
      errors[field.name] = `${field.label} é obrigatório`;
      continue;
    }
    const customError = field.validate?.(value, rawValues);
    if (customError) errors[field.name] = customError;
  }
  return errors;
}