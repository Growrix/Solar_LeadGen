"use client";
import React from 'react';
import { WQEvent, formatMoney } from './mock';

type Props = {
  events: WQEvent[];
};

const label = (e: WQEvent) =>
  e.type === 'OFFER' ? 'Installer offer' : e.type === 'COUNTER' ? 'Homeowner counter' : 'Done deal';

export function HistoryList({ events }: Props) {
  return (
    <div className="neu-card bg-surface shadow-neu-outset border border-border rounded-xl p-4 flex flex-col gap-3">
      <h3 className="text-heading-3 text-foreground">History</h3>
      <ul className="flex flex-col gap-2">
        {events.slice(0, 6).map((e) => (
          <li key={e.id} className="bg-background rounded-lg shadow-neu-inset border border-border p-3 flex items-center justify-between">
            <div>
              <div className="text-body text-foreground">{label(e)}</div>
              <div className="text-caption text-muted-foreground">{new Date(e.createdAt).toLocaleString()}</div>
            </div>
            <div className="text-body text-foreground">{e.amount !== null ? formatMoney(e.amount) : '—'}</div>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default HistoryList;
