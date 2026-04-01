"use client";
import React from 'react';
import { formatMoney, WQStateSnapshot } from './mock';

type Props = {
  state: WQStateSnapshot;
};

export function CurrentStateCard({ state }: Props) {
  return (
    <div className="bg-surface shadow-card border border-border rounded-xl p-4 flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <h3 className="text-heading-3 text-foreground">Written Quote</h3>
        <span className={`text-caption px-2 py-0.5 rounded-lg shadow-inner ${state.status === 'OPEN' ? 'text-success bg-success/10' : 'text-muted-foreground bg-muted/10'}`}>
          {state.status === 'OPEN' ? 'Open' : 'Closed'}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="bg-background rounded-lg shadow-inner border border-border p-3">
          <div className="text-caption text-muted-foreground">Installer latest price</div>
          <div className="text-heading-2 text-foreground">{formatMoney(state.lastPriceByInstaller)}</div>
          <div className="text-caption text-muted-foreground mt-1">Masked for homeowners</div>
        </div>
        <div className="bg-background rounded-lg shadow-inner border border-border p-3">
          <div className="text-caption text-muted-foreground">Your last counter</div>
          <div className="text-heading-2 text-foreground">{state.lastCounterByHomeowner ? formatMoney(state.lastCounterByHomeowner) : '—'}</div>
        </div>
      </div>

      <div className="flex items-center justify-between text-caption text-muted-foreground">
        <span>Only one open negotiation per installer and lead</span>
        {state.responseSlaHours ? <span>Typical reply within ~{state.responseSlaHours}h</span> : null}
      </div>
    </div>
  );
}

export default CurrentStateCard;
