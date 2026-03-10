"use client";

import * as React from "react";

function cx(...classes: Array<string | false | undefined | null>) {
  return classes.filter(Boolean).join(" ");
}

export type SortDirection = "asc" | "desc";

export type DataTableSort = {
  columnId: string;
  direction: SortDirection;
};

export type DataTableColumn<T> = {
  id: string;
  header: React.ReactNode;
  cell: (row: T) => React.ReactNode;
  align?: "start" | "center" | "end";
  sortable?: boolean;
  sortValue?: (row: T) => string | number;
  width?: "auto" | "shrink";
};

export type DataTableProps<T> = {
  rows: T[];
  columns: Array<DataTableColumn<T>>;
  getRowId: (row: T) => string;
  className?: string;
  caption?: string;
  sort?: DataTableSort;
  onSortChange?: (sort: DataTableSort | null) => void;
  selectable?: boolean;
  selectedRowIds?: string[];
  onSelectedRowIdsChange?: (ids: string[]) => void;
  empty?: React.ReactNode;
};

function toggleSort(current: DataTableSort | undefined, columnId: string): DataTableSort {
  if (!current || current.columnId !== columnId) return { columnId, direction: "asc" };
  return { columnId, direction: current.direction === "asc" ? "desc" : "asc" };
}

export function DataTable<T>({
  rows,
  columns,
  getRowId,
  className,
  caption,
  sort,
  onSortChange,
  selectable,
  selectedRowIds,
  onSelectedRowIdsChange,
  empty,
}: DataTableProps<T>) {
  const derivedSelected = selectedRowIds ?? [];

  const sortedRows = React.useMemo(() => {
    if (!sort) return rows;
    const col = columns.find((c) => c.id === sort.columnId);
    if (!col?.sortable || !col.sortValue) return rows;
    const dir = sort.direction === "asc" ? 1 : -1;
    return [...rows].sort((a, b) => {
      const av = col.sortValue!(a);
      const bv = col.sortValue!(b);
      if (typeof av === "number" && typeof bv === "number") return (av - bv) * dir;
      return String(av).localeCompare(String(bv)) * dir;
    });
  }, [rows, columns, sort]);

  const allIds = React.useMemo(() => sortedRows.map(getRowId), [sortedRows, getRowId]);
  const allSelected = selectable ? allIds.length > 0 && allIds.every((id) => derivedSelected.includes(id)) : false;

  const setSelected = (ids: string[]) => {
    onSelectedRowIdsChange?.(ids);
  };

  const toggleRow = (id: string, checked: boolean) => {
    if (!selectable) return;
    if (checked) setSelected(Array.from(new Set([...derivedSelected, id])));
    else setSelected(derivedSelected.filter((x) => x !== id));
  };

  return (
    <div className={cx("ui-table", className)}>
      <table className="ui-table__table">
        {caption ? <caption className="ui-table__caption text-caption ui-text-muted">{caption}</caption> : null}
        <thead className="ui-table__head">
          <tr>
            {selectable ? (
              <th className="ui-table__th ui-table__th--shrink" scope="col">
                <label className="ui-table__check">
                  <input
                    type="checkbox"
                    checked={allSelected}
                    onChange={(e) => setSelected(e.target.checked ? allIds : [])}
                    aria-label="Select all rows"
                  />
                  <span aria-hidden="true" />
                </label>
              </th>
            ) : null}
            {columns.map((c) => {
              const isActiveSort = sort?.columnId === c.id;
              const dir = isActiveSort ? sort?.direction : undefined;
              const isButton = Boolean(c.sortable && onSortChange);
              return (
                <th
                  key={c.id}
                  className={cx(
                    "ui-table__th",
                    c.width === "shrink" && "ui-table__th--shrink",
                    c.align === "center" && "ui-table__th--center",
                    c.align === "end" && "ui-table__th--end"
                  )}
                  scope="col"
                >
                  {isButton ? (
                    <button
                      type="button"
                      className={cx("ui-table__sort ui-focus-ring", isActiveSort && "ui-table__sort--active")}
                      onClick={() => onSortChange?.(toggleSort(sort, c.id))}
                      aria-label={`Sort by ${String(c.id)}`}
                    >
                      <span>{c.header}</span>
                      <span className="ui-table__sorticon" aria-hidden="true" data-dir={dir ?? "none"} />
                    </button>
                  ) : (
                    <span className="ui-table__thtext">{c.header}</span>
                  )}
                </th>
              );
            })}
          </tr>
        </thead>
        <tbody className="ui-table__body">
          {sortedRows.length === 0 ? (
            <tr>
              <td className="ui-table__td" colSpan={columns.length + (selectable ? 1 : 0)}>
                <div className="ui-table__empty">{empty ?? <span className="ui-text-muted">No rows.</span>}</div>
              </td>
            </tr>
          ) : (
            sortedRows.map((row) => {
              const id = getRowId(row);
              const checked = selectable ? derivedSelected.includes(id) : false;
              return (
                <tr key={id} className={cx("ui-table__tr", checked && "ui-table__tr--selected")}>
                  {selectable ? (
                    <td className="ui-table__td ui-table__td--shrink">
                      <label className="ui-table__check">
                        <input type="checkbox" checked={checked} onChange={(e) => toggleRow(id, e.target.checked)} aria-label={`Select row ${id}`} />
                        <span aria-hidden="true" />
                      </label>
                    </td>
                  ) : null}
                  {columns.map((c) => (
                    <td
                      key={c.id}
                      className={cx(
                        "ui-table__td",
                        c.width === "shrink" && "ui-table__td--shrink",
                        c.align === "center" && "ui-table__td--center",
                        c.align === "end" && "ui-table__td--end"
                      )}
                    >
                      {c.cell(row)}
                    </td>
                  ))}
                </tr>
              );
            })
          )}
        </tbody>
      </table>
    </div>
  );
}
