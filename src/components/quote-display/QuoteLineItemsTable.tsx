'use client';

import React from 'react';
import { DollarSign } from 'lucide-react';

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

  // Calculate grand total (Sprint 4.16.17.2)
  const grandTotal = lineItems.reduce((sum, item) => {
    return sum + (item.totalPrice || item.total || 0);
  }, 0);

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
        <tfoot>
          <tr className="border-t-2 border-primary">
            <td colSpan={3} className="py-3 text-heading-4 text-foreground text-right flex items-center justify-end gap-2">
              <DollarSign className="h-5 w-5 text-primary" />
              Grand Total:
            </td>
            <td className="py-3 text-heading-2 text-primary text-right">
              ${grandTotal.toLocaleString()}
            </td>
          </tr>
        </tfoot>
      </table>
    </div>
  );
}
