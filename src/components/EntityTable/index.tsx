import "./entityTable.style.css";
import { EntityTableRow } from "./EntityTableRow";
import type { EntityTableProps } from "./types";

export function EntityTable<T>({
  data,
  columns,
  actions,
  getRowKey,
  searchTerm = "",
  searchFields,
  searchFn,
  loading = false,
  emptyMessage = "Nenhum registro encontrado",
}: EntityTableProps<T>) {
  const filtered = filterData(data, searchTerm, searchFields, searchFn);
  const colSpan = columns.length + (actions?.length ? 1 : 0);

  return (
    <div className="table-card">
      <div className="table-wrapper">
        <table className="table">
          <thead className="thead-table">
            <tr>
              {columns.map((col) => (
                <th key={String(col.key)} style={{ width: col.width }} className={col.className}>
                  {col.header}
                </th>
              ))}
              {actions && actions.length > 0 && <th className="actions-header">Ações</th>}
            </tr>
          </thead>
          <tbody className="tbody-table">
            {loading ? (
              <tr>
                <td colSpan={colSpan} className="empty-message">Carregando...</td>
              </tr>
            ) : filtered.length === 0 ? (
              <tr>
                <td colSpan={colSpan} className="empty-message">
                  {data.length === 0
                    ? emptyMessage
                    : `Nenhum resultado encontrado para "${searchTerm}"`}
                </td>
              </tr>
            ) : (
              filtered.map((item) => (
                <EntityTableRow key={getRowKey(item)} item={item} columns={columns} actions={actions} />
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function filterData<T>(
  data: T[],
  term: string,
  fields?: (keyof T)[],
  searchFn?: (item: T, term: string) => boolean
): T[] {
  if (!term.trim()) return data;
  const normalized = term.toLowerCase();

  if (searchFn) return data.filter((item) => searchFn(item, normalized));
  if (!fields?.length) return data;

  return data.filter((item) =>
    fields.some((field) => {
      const value = item[field];
      return value != null && String(value).toLowerCase().includes(normalized);
    })
  );
}