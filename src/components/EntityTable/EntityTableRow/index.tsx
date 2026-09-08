import type { Column, EntityAction } from "../types";

interface EntityTableRowProps<T> {
  item: T;
  columns: Column<T>[];
  actions?: EntityAction<T>[];
}

export function EntityTableRow<T>({ item, columns, actions }: EntityTableRowProps<T>) {
  return (
    <tr>
      {columns.map((col) => (
        <td key={String(col.key)} className={col.className}>
          {col.render ? col.render(item) : renderDefault(item, col.key)}
        </td>
      ))}
      {actions && actions.length > 0 && (
        <td className="actions-cell">
          {actions
            .filter((action) => !action.hidden?.(item))
            .map((action) => (
              <button
                key={action.label}
                className={`btn-icon ${action.variant ?? "default"}`}
                title={action.label}
                onClick={() => action.onClick(item)}
              >
                <action.icon size={16} />
              </button>
            ))}
        </td>
      )}
    </tr>
  );
}

function renderDefault<T>(item: T, key: Column<T>["key"]): React.ReactNode {
  const value = (item as Record<string, unknown>)[key as string];
  return value == null ? "" : String(value);
}