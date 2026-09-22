import { useEffect, useRef, useState } from "react";
import type { EntityOption, EntitySelectField } from "../types";
import "./entityAutocompleteField.style.css";

interface EntityAutocompleteFieldProps<T> {
  field: EntitySelectField<T>;
  displayValue: string;
  error?: string;
  onChangeRaw: (name: keyof T & string, raw: unknown, display: string) => void;
}

export function EntityAutocompleteField<T>({
  field,
  displayValue,
  error,
  onChangeRaw,
}: EntityAutocompleteFieldProps<T>) {
  const {
    name,
    label,
    placeholder,
    fetchOptions,
    minChars = 2,
    debounceMs = 400,
    noResultsText = "Nenhum resultado encontrado",
  } = field;

  const [inputText, setInputText] = useState(displayValue);
  const [hasSelection, setHasSelection] = useState(displayValue !== "");

  const [options, setOptions] = useState<EntityOption[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const abortRef = useRef<AbortController | null>(null);
  const lastQueryRef = useRef<string | null>(null);

  // Guarda o último valor que o PRÓPRIO componente emitiu via onChangeRaw.
  // Serve para distinguir "displayValue mudou porque eu mesmo mandei essa
  // mudança" (não deve resincronizar) de "displayValue mudou por causa
  // externa ao componente, ex: reset do form" (deve resincronizar).
  const lastEmittedRef = useRef<string>(displayValue);

  // Resync durante a renderização (sem useEffect) — só quando a mudança de
  // displayValue não veio do próprio componente.
  useEffect(() => {
    if (displayValue === lastEmittedRef.current) {
      return;
    }
    lastEmittedRef.current = displayValue;
    setInputText(displayValue);
    setHasSelection(displayValue !== "");
  }, [displayValue]);

  // Limpeza ao desmontar
  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
      if (abortRef.current) abortRef.current.abort();
    };
  }, []);

  // Fecha o dropdown ao clicar fora
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  function emit(raw: unknown, display: string) {
    lastEmittedRef.current = display;
    onChangeRaw(name, raw, display);
  }

  function runSearch(term: string) {
    if (debounceRef.current) clearTimeout(debounceRef.current);

    const trimmed = term.trim();

    if (trimmed.length < minChars) {
      setOptions([]);
      setOpen(false);
      return;
    }

    debounceRef.current = setTimeout(async () => {
      if (lastQueryRef.current === trimmed) return;
      lastQueryRef.current = trimmed;

      if (abortRef.current) abortRef.current.abort();
      const controller = new AbortController();
      abortRef.current = controller;

      setLoading(true);
      setSearchError(null);
      setOpen(true);

      try {
        const results = await fetchOptions(trimmed);
        if (controller.signal.aborted) return;
        setOptions(results);
      } catch (err) {
        if (controller.signal.aborted) return;
        console.error(`Erro ao buscar opções para "${name}":`, err);
        setOptions([]);
        setSearchError("Erro ao buscar. Tente novamente.");
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }, debounceMs);
  }

  function handleInputChange(value: string) {
    setInputText(value);
    setHasSelection(false);
    emit(undefined, value);

    if (value.trim() === "") {
      lastQueryRef.current = null;
      setOptions([]);
      setOpen(false);
      if (abortRef.current) abortRef.current.abort();
      if (debounceRef.current) clearTimeout(debounceRef.current);
      return;
    }

    runSearch(value);
  }

  function handleSelect(option: EntityOption) {
    setHasSelection(true);
    setInputText(option.label);
    setOptions([]);
    setOpen(false);
    emit(option.id, option.label);
  }

  function handleClear() {
    setHasSelection(false);
    setInputText("");
    setOptions([]);
    setOpen(false);
    lastQueryRef.current = null;
    emit(undefined, "");
  }

  return (
    <div className="input-create-entity entity-autocomplete" ref={containerRef}>
      <label>{label}</label>
      <div className="entity-autocomplete-input-wrapper">
        <input
          type="text"
          placeholder={placeholder}
          value={inputText}
          readOnly={hasSelection}
          onChange={(e) => handleInputChange(e.target.value)}
        />
        {hasSelection && inputText !== "" && (
          <button
            type="button"
            className="entity-autocomplete-clear"
            onClick={handleClear}
            aria-label={`Limpar ${label}`}
          >
            ×
          </button>
        )}
      </div>

      {open && (
        <div className="entity-autocomplete-dropdown">
          {loading && (
            <div className="entity-autocomplete-status">Buscando...</div>
          )}

          {!loading && searchError && (
            <div className="entity-autocomplete-status entity-autocomplete-error">
              {searchError}
            </div>
          )}

          {!loading && !searchError && options.length === 0 && (
            <div className="entity-autocomplete-status">{noResultsText}</div>
          )}

          {!loading &&
            !searchError &&
            options.map((option) => (
              <button
                type="button"
                key={option.id}
                className="entity-autocomplete-option"
                onClick={() => handleSelect(option)}
              >
                <span className="entity-autocomplete-option-label">
                  {option.label}
                </span>
                {option.description && (
                  <span className="entity-autocomplete-option-description">
                    {option.description}
                  </span>
                )}
              </button>
            ))}
        </div>
      )}

      {error && <span className="field-error">{error}</span>}
    </div>
  );
}
