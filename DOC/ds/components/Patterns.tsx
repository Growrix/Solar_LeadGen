"use client";

import * as React from "react";

import { Button } from "../primitives/Button";
import { Card } from "./Card";
import { Field } from "./Field";
import { Input } from "../primitives/Input";
import { Select } from "../primitives/Select";
import { Stack } from "../primitives/Stack";
import { Switch } from "../primitives/Switch";
import { Text } from "../primitives/Text";
import { DataGrid } from "./DataGrid";
import { Timeline } from "./Timeline";
import { StatusIndicator, StatusButton } from "./Status";

export type UserRow = { id: string; name: string; role: string; status: "active" | "pending" | "disabled" };

export function UserTable({ rows }: { rows: UserRow[] }) {
  return (
    <DataGrid
      caption="Users"
      searchable
      rows={rows}
      getRowId={(r) => r.id}
      pageSize={5}
      bulkActions={[
        { id: "enable", label: "Enable", onClick: () => {} },
        { id: "disable", label: "Disable", onClick: () => {} },
      ]}
      columns={[
        { id: "name", header: "Name", sortable: true, sortValue: (r) => r.name, cell: (r) => <span className="text-body-small">{r.name}</span> },
        { id: "role", header: "Role", sortable: true, sortValue: (r) => r.role, cell: (r) => <span className="text-body-small">{r.role}</span> },
        {
          id: "status",
          header: "Status",
          sortable: true,
          sortValue: (r) => r.status,
          cell: (r) => <StatusIndicator tone={r.status} label={r.status} />,
          width: "shrink",
        },
        { id: "actions", header: "", cell: (r) => <StatusButton tone={r.status} label="Change" onClick={() => {}} />, width: "shrink", align: "end" },
      ]}
    />
  );
}

export type Role = { id: string; name: string };
export type Permission = { id: string; label: string };

export function RolePermissionManager({
  roles,
  permissions,
  assignments,
  onAssignmentsChange,
}: {
  roles: Role[];
  permissions: Permission[];
  assignments: Record<string, string[]>;
  onAssignmentsChange: (next: Record<string, string[]>) => void;
}) {
  const toggle = (roleId: string, permId: string) => {
    const current = assignments[roleId] ?? [];
    const next = current.includes(permId) ? current.filter((p) => p !== permId) : [...current, permId];
    onAssignmentsChange({ ...assignments, [roleId]: next });
  };

  return (
    <Card>
      <Stack>
        <div className="text-heading-4">Role/Permission Manager</div>
        <div className="ui-table">
          <table className="ui-table__table">
            <thead className="ui-table__head">
              <tr>
                <th className="ui-table__th">Permission</th>
                {roles.map((r) => (
                  <th key={r.id} className="ui-table__th ui-table__th--center">
                    {r.name}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="ui-table__body">
              {permissions.map((p) => (
                <tr key={p.id} className="ui-table__tr">
                  <td className="ui-table__td">{p.label}</td>
                  {roles.map((r) => (
                    <td key={r.id} className="ui-table__td ui-table__td--center">
                      <button
                        type="button"
                        className="ui-focus-ring ui-perm"
                        aria-label={`Toggle ${p.label} for ${r.name}`}
                        onClick={() => toggle(r.id, p.id)}
                        data-on={(assignments[r.id] ?? []).includes(p.id) ? "1" : "0"}
                      />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Stack>
    </Card>
  );
}

export function AuditLog({ items }: { items: Array<{ id: string; title: string; meta?: string }> }) {
  return (
    <Card>
      <Stack gap="compact">
        <div className="text-heading-4">Audit log</div>
        <Timeline items={items.map((i) => ({ id: i.id, title: i.title, meta: i.meta }))} />
      </Stack>
    </Card>
  );
}

export function SettingsPanel() {
  return (
    <Card>
      <Stack>
        <div className="text-heading-4">Settings</div>
        <Text tone="muted">Profile, preferences, notifications.</Text>
        <Field id="sp-name" label="Display name">
          <Input placeholder="Jane Doe" />
        </Field>
        <Field id="sp-role" label="Default role">
          <Select defaultValue="admin">
            <option value="admin">Admin</option>
            <option value="staff">Staff</option>
            <option value="viewer">Viewer</option>
          </Select>
        </Field>
        <Switch label="Email notifications" defaultChecked />
        <div className="ui-row">
          <Button size="sm">Save</Button>
          <Button size="sm" variant="secondary">
            Reset
          </Button>
        </div>
      </Stack>
    </Card>
  );
}
