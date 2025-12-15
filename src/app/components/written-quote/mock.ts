export type WQActor = 'INSTALLER' | 'HOMEOWNER';
export type WQEventType = 'OFFER' | 'COUNTER' | 'DONE_DEAL';

export interface WQEvent {
  id: string;
  actor: WQActor;
  type: WQEventType;
  amount: number | null;
  createdAt: string; // ISO
}

export interface WQStateSnapshot {
  status: 'OPEN' | 'CLOSED';
  lastPriceByInstaller: number;
  lastCounterByHomeowner: number | null;
  responseSlaHours?: number | null;
}

export const mockState: WQStateSnapshot = {
  status: 'OPEN',
  lastPriceByInstaller: 5000,
  lastCounterByHomeowner: 4800,
  responseSlaHours: 12,
};

export const mockEvents: WQEvent[] = [
  { id: 'e3', actor: 'HOMEOWNER', type: 'COUNTER', amount: 4800, createdAt: new Date(Date.now() - 1000 * 60 * 30).toISOString() },
  { id: 'e2', actor: 'INSTALLER', type: 'OFFER', amount: 5000, createdAt: new Date(Date.now() - 1000 * 60 * 60).toISOString() },
  { id: 'e1', actor: 'INSTALLER', type: 'OFFER', amount: 5200, createdAt: new Date(Date.now() - 1000 * 60 * 120).toISOString() },
];

export const formatMoney = (amount: number) =>
  new Intl.NumberFormat(undefined, { style: 'currency', currency: 'AUD', maximumFractionDigits: 0 }).format(amount);
