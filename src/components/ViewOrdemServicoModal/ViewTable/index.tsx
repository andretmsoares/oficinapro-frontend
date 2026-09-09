import "./viewTable.style.css";

export interface ViewTableColumn<T> {
  key: keyof T | string;
  header: string;
  render?: (item: T) => React.ReactNode;
  className?: string;
}

interface ViewTableProps<T> {
  columns: ViewTableColumn<T>[];
  data: T[];
  emptyMessage?: string;
}

export function ViewTable<T>({
  columns,
  data,
  emptyMessage = "Nenhum registro encontrado",
}: ViewTableProps<T>) {
  return (
    <div className="view-os-table-wrapper">
      <table className="view-os-table">
        <thead>
          <tr>
            {columns.map((column) => (
              <th
                key={String(column.key)}
                className={column.className}
              >
                {column.header}
              </th>
            ))}
          </tr>
        </thead>

        <tbody>
          {data.length === 0 ? (
            <tr>
              <td
                colSpan={columns.length}
                className="view-os-table-empty"
              >
                {emptyMessage}
              </td>
            </tr>
          ) : (
            data.map((item, index) => (
              <tr key={getRowKey(item, index)}>
                {columns.map((column) => (
                  <td
                    key={String(column.key)}
                    className={column.className}
                  >
                    {column.render
                      ? column.render(item)
                      : String(
                          item[column.key as keyof T] ?? "",
                        )}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

function getRowKey<T>(item: T, index: number): string | number {
  if (
    typeof item === "object" &&
    item !== null &&
    "id" in item
  ) {
    return String((item as { id: unknown }).id);
  }

  return index;
}