'use client';

import React from 'react';

interface QuoteLineItemsTableProps {
  lineItems: Array<{
    description: string;
    quantity: number;
    unitPrice?: number;
    totalPrice?: number;
    total?: number;
  }>;
}

export function QuoteLineItemsTable({ lineItems }: QuoteLineItemsTableProps) {
  if (!lineItems || lineItems.length === 0) {
    return null;
  }

  return (
    <div className="space-y-4">
      <table className="w-full">
        <thead>
          <tr className="border-b border-border">
            <th className="py-2 text-label text-muted-foreground text-left">Description</th>
            <th className="py-2 text-label text-muted-foreground text-right">Qty</th>
            <th className="py-2 text-label text-muted-foreground text-right">Unit Price</th>
            <th className="py-2 text-label text-muted-foreground text-right">Total</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border/50">
          {lineItems.map((item, index) => (
            <tr key={index}>
              <td className="py-2 text-body-small text-foreground">{item.description}</td>
              <td className="py-2 text-body-small text-foreground text-right">{item.quantity}</td>
              <td className="py-2 text-body-small text-foreground text-right">
                ${item.unitPrice?.toLocaleString() || '0'}
              </td>
              <td className="py-2 text-body-small text-foreground text-right">
                ${(item.totalPrice || item.total || 0).toLocaleString()}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
