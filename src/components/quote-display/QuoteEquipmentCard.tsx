'use client';

import React from 'react';
import { Zap, Battery } from 'lucide-react';

interface QuoteEquipmentCardProps {
  productsData: {
    solarPanels?: Array<{
      brand: string;
      model: string;
      wattage: number;
      quantity: number;
      warranty: string;
    }>;
    inverter?: {
      brand: string;
      model: string;
      type: string;
      capacityKw: number;
      warranty: string;
    };
    battery?: {
      brand: string;
      model: string;
      capacityKwh: number;
      warranty: string;
    };
  };
}

export function QuoteEquipmentCard({ productsData }: QuoteEquipmentCardProps) {
  return (
    <div className="bg-surface rounded-xl p-6 border border-border space-y-4">
      <h4 className="text-heading-4 text-foreground border-b border-border pb-2">
        Equipment & Products
      </h4>
      
      {/* Solar Panels */}
      {productsData?.solarPanels && productsData.solarPanels.length > 0 && (
        <div className="space-y-2">
          <h5 className="text-label text-foreground flex items-center gap-2">
            <Zap className="h-4 w-4" />
            Solar Panels
          </h5>
          <table className="w-full">
            <tbody className="divide-y divide-border/50">
              <tr>
                <td className="py-1.5 text-body-small text-muted-foreground">Brand & Model</td>
                <td className="py-1.5 text-body-small text-foreground text-right">
                  {productsData.solarPanels[0].brand} {productsData.solarPanels[0].model}
                </td>
              </tr>
              <tr>
                <td className="py-1.5 text-body-small text-muted-foreground">Wattage</td>
                <td className="py-1.5 text-body-small text-foreground text-right">
                  {productsData.solarPanels[0].wattage}W
                </td>
              </tr>
              <tr>
                <td className="py-1.5 text-body-small text-muted-foreground">Quantity</td>
                <td className="py-1.5 text-body-small text-foreground text-right">
                  {productsData.solarPanels[0].quantity} panels
                </td>
              </tr>
              <tr>
                <td className="py-1.5 text-body-small text-muted-foreground">Warranty</td>
                <td className="py-1.5 text-body-small text-foreground text-right">
                  {productsData.solarPanels[0].warranty}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      )}

      {/* Inverter */}
      {productsData?.inverter && (
        <div className="space-y-2">
          <h5 className="text-label text-foreground">Inverter</h5>
          <table className="w-full">
            <tbody className="divide-y divide-border/50">
              <tr>
                <td className="py-1.5 text-body-small text-muted-foreground">Brand & Model</td>
                <td className="py-1.5 text-body-small text-foreground text-right">
                  {productsData.inverter.brand} {productsData.inverter.model}
                </td>
              </tr>
              <tr>
                <td className="py-1.5 text-body-small text-muted-foreground">Type</td>
                <td className="py-1.5 text-body-small text-foreground text-right">
                  {productsData.inverter.type}
                </td>
              </tr>
              <tr>
                <td className="py-1.5 text-body-small text-muted-foreground">Capacity</td>
                <td className="py-1.5 text-body-small text-foreground text-right">
                  {productsData.inverter.capacityKw} kW
                </td>
              </tr>
              <tr>
                <td className="py-1.5 text-body-small text-muted-foreground">Warranty</td>
                <td className="py-1.5 text-body-small text-foreground text-right">
                  {productsData.inverter.warranty}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      )}

      {/* Battery (if included) */}
      {productsData?.battery && (
        <div className="space-y-2">
          <h5 className="text-label text-foreground flex items-center gap-2">
            <Battery className="h-4 w-4" />
            Battery Storage
          </h5>
          <table className="w-full">
            <tbody className="divide-y divide-border/50">
              <tr>
                <td className="py-1.5 text-body-small text-muted-foreground">Brand & Model</td>
                <td className="py-1.5 text-body-small text-foreground text-right">
                  {productsData.battery.brand} {productsData.battery.model}
                </td>
              </tr>
              <tr>
                <td className="py-1.5 text-body-small text-muted-foreground">Capacity</td>
                <td className="py-1.5 text-body-small text-foreground text-right">
                  {productsData.battery.capacityKwh} kWh
                </td>
              </tr>
              <tr>
                <td className="py-1.5 text-body-small text-muted-foreground">Warranty</td>
                <td className="py-1.5 text-body-small text-foreground text-right">
                  {productsData.battery.warranty}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
