import { CreateEntityInput } from "../../CreateEntityInput";
import {
  formatPhone, unformatPhone,
  formatDocument, unformatDocument,
  formatCurrencyDisplay, parseCurrencyToCents,
} from "../formatters";
import type { FormField } from "../types";

interface EntityFieldProps<T> {
  field: FormField<T>;
  displayValue: string;
  error?: string;
  onChangeRaw: (name: keyof T & string, raw: unknown, display: string) => void;
}

export function EntityField<T>({ field, displayValue, error, onChangeRaw }: EntityFieldProps<T>) {
  const { name, label, type } = field;

  if (type === "select") {
    return (
      <div className="input-create-entity">
        <select value={displayValue} onChange={(e) => onChangeRaw(name, e.target.value, e.target.value)}>
          <option value="" disabled>{label}</option>
          {field.options.map((opt) => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
        {error && <span className="field-error">{error}</span>}
      </div>
    );
  }

  if (type === "textarea") {
    return (
      <div className="input-create-entity">
        <textarea
          placeholder={label}
          value={displayValue}
          onChange={(e) => onChangeRaw(name, e.target.value, e.target.value)}
        />
        {error && <span className="field-error">{error}</span>}
      </div>
    );
  }

  if (type === "phone") {
    return (
      <>
        <CreateEntityInput
          label={label}
          type="tel"
          value={displayValue}
          onChange={(val) => onChangeRaw(name, unformatPhone(val), formatPhone(val))}
        />
        {error && <span className="field-error">{error}</span>}
      </>
    );
  }

  if (type === "document") {
    return (
      <>
        <CreateEntityInput
          label={label}
          type="text"
          value={displayValue}
          onChange={(val) => onChangeRaw(name, unformatDocument(val), formatDocument(val).display)}
        />
        {error && <span className="field-error">{error}</span>}
      </>
    );
  }

  if (type === "currency") {
    return (
      <>
        <CreateEntityInput
          label={label}
          type="text"
          value={displayValue}
          onChange={(val) => {
            const cents = parseCurrencyToCents(val);
            onChangeRaw(name, cents, formatCurrencyDisplay(cents));
          }}
        />
        {error && <span className="field-error">{error}</span>}
      </>
    );
  }

  // text, number, email, date, password — CreateEntityInput cobre direto
  return (
    <>
      <CreateEntityInput
        label={label}
        type={type}
        value={displayValue}
        onChange={(val) => onChangeRaw(name, type === "number" ? (val === "" ? "" : Number(val)) : val, val)}
      />
      {error && <span className="field-error">{error}</span>}
    </>
  );
}