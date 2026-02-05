"use client";

import * as React from "react";

import { Button } from "../primitives/Button";
import { DataGrid } from "./DataGrid";
import { type DataTableColumn } from "./DataTable";

export type ResourceRow = {
  id: string;
  name: string;
  updatedAt?: string;
  status?: "active" | "pending" | "disabled";
};

export type ResourceTableProps = {
  title?: string;
  rows: ResourceRow[];
  onCreate?: () => void;
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
};

export function ResourceTable({ title = "Resources", rows, onCreate, onEdit, onDelete }: ResourceTableProps) {
  const cols: Array<DataTableColumn<ResourceRow>> = [
    { id: "name", header: "Name", sortable: true, sortValue: (r) => r.name, cell: (r) => <span className="text-body-small">{r.name}</span> },
    {
      id: "updated",
      header: "Updated",
      sortable: true,
      sortValue: (r) => r.updatedAt ?? "",
      cell: (r) => <span className="text-body-small ui-text-muted">{r.updatedAt ?? "—"}</span>,
      width: "shrink",
    },
    {
      id: "actions",
      header: "",
      cell: (r) => (
        <div className="ui-row">
          <Button size="sm" variant="secondary" onClick={() => onEdit?.(r.id)}>
            Edit
          </Button>
          <Button size="sm" variant="secondary" onClick={() => onDelete?.(r.id)}>
            Delete
          </Button>
        </div>
      ),
      width: "shrink",
      align: "end",
    },
  ];

  return (
    <div className="ui-stack">
      <div className="ui-row ui-row--between">
        <div className="text-heading-4">{title}</div>
        {onCreate ? (
          <Button size="sm" onClick={onCreate}>
            Create
          </Button>
        ) : null}
      </div>
      <DataGrid caption={title} searchable rows={rows} getRowId={(r) => r.id} columns={cols} pageSize={5} />
    </div>
  );
}
