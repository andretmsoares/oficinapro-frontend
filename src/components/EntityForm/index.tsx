import { useState } from "react";
import "./entityForm.style.css";
import { ButtonsForm } from "../Buttons/ButtonsForm";
import { EntityField } from "./EntityField";
import { validateForm } from "./validators";
import {
  formatPhone,
  formatDocument,
  formatCurrencyDisplay,
  formatPlate,
  normalizePlate,
} from "../../services/formatters";
import type { EntityFormProps, FormField } from "./types";

function buildInitialDisplay<T>(
  fields: FormField<T>[],
  initialValues?: Partial<T>,
): Record<string, string> {
  const display: Record<string, string> = {};
  for (const field of fields) {
    const raw = initialValues?.[field.name];
    if (raw === undefined || raw === null || raw === "") {
      display[field.name] = "";
    } else if (field.type === "phone") {
      display[field.name] = formatPhone(String(raw));
    } else if (field.type === "document") {
      display[field.name] = formatDocument(String(raw)).display;
    } else if (field.type === "currency") {
      display[field.name] = formatCurrencyDisplay(Number(raw));
    } else if (field.type === "plate") {
      display[field.name] = formatPlate(String(raw));
    } else {
      display[field.name] = String(raw);
    }
  }
  return display;
}

export function EntityForm<T extends Record<string, unknown>>({
  title,
  fields,
  initialValues,
  onSubmit,
  onClose,
}: EntityFormProps<T>) {
  const [rawValues, setRawValues] = useState<Partial<T>>(initialValues ?? {});
  const [displayValues, setDisplayValues] = useState(() =>
    buildInitialDisplay(fields, initialValues),
  );
  const [errors, setErrors] = useState<Record<string, string>>({});

  function handleFieldChange(
    name: keyof T & string,
    raw: unknown,
    display: string,
  ) {
    setRawValues((prev) => ({ ...prev, [name]: raw }));
    setDisplayValues((prev) => ({ ...prev, [name]: display }));
  }

  function handleSubmit() {
    const validationErrors = validateForm(fields, rawValues);
    setErrors(validationErrors);
    if (Object.keys(validationErrors).length > 0) return;
    onSubmit(rawValues as T);
  }

  return (
    <div className="form">
      <div className="form-content">
        <h2>{title}</h2>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSubmit();
          }}
        >
          {fields.map((field) => (
            <EntityField
              key={field.name}
              field={field}
              displayValue={displayValues[field.name] ?? ""}
              error={errors[field.name]}
              onChangeRaw={handleFieldChange}
            />
          ))}
        </form>
        <ButtonsForm onClose={onClose} onSave={handleSubmit} />
      </div>
    </div>
  );
}
