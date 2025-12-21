'use client';

import React from 'react';

interface QuoteSystemSpecsCardProps {
  systemData: {
    systemType?: string;
    capacityKw?: number;
    solarPanelsArray?: Array<{ quantity: number }>;
    annualProduction?: number;
  };
}

export function QuoteSystemSpecsCard({ systemData }: QuoteSystemSpecsCardProps) {
  const totalPanels = systemData?.solarPanelsArray?.reduce((sum, arr) => sum + arr.quantity, 0) || 0;
  const annualProduction = systemData?.annualProduction || 0;

  return (
    <div className="bg-surface rounded-xl p-6 border border-border space-y-4">
      <h4 className="text-heading-4 text-foreground border-b border-border pb-2">
        Solar System Specifications
      </h4>
      <table className="w-full">
        <tbody className="divide-y divide-border">
          <tr>
            <td className="py-2 text-body text-muted-foreground">System Type</td>
            <td className="py-2 text-body text-foreground text-right">
              {systemData?.systemType || 'Grid-Tied'}
            </td>
          </tr>
          <tr>
            <td className="py-2 text-body text-muted-foreground">System Size</td>
            <td className="py-2 text-body text-foreground text-right">
              {systemData?.capacityKw || 0} kW
            </td>
          </tr>
          <tr>
            <td className="py-2 text-body text-muted-foreground">Total Panels</td>
            <td className="py-2 text-body text-foreground text-right">
              {totalPanels} panels
            </td>
          </tr>
          <tr>
            <td className="py-2 text-body text-muted-foreground">Annual Production (Est.)</td>
            <td className="py-2 text-body text-foreground text-right">
              {annualProduction.toLocaleString()} kWh/year
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}
