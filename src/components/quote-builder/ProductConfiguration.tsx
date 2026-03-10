'use client'

import React, { useState } from 'react';
import { INVERTER_TYPES, BATTERY_CHEMISTRY, ADDON_OPTIONS } from './Presets';
import { Autocomplete, Button, Input, Package, Plus, Trash2, Upload } from '@/ds';

interface ProductConfigurationProps {
  panels: PanelConfig;
  inverter: InverterConfig;
  battery?: BatteryConfig;
  addons: AddonConfig[];
  onUpdate: (data: Partial<ProductConfigurationData>) => void;
}

export interface PanelConfig {
  brand: string;
  model: string;
  wattage: number;
  efficiency: number;
  qty: number;
  productWarranty: number;
  performanceWarranty: number;
  tier1: boolean;
  datasheetKey?: string;
}

export interface InverterConfig {
  brand: string;
  model: string;
  type: string;
  capacityKw: number;
  mppts: number;
  warranty: number;
  datasheetKey?: string;
}

export interface BatteryConfig {
  brand: string;
  model: string;
  usableKwh: number;
  powerKw: number;
  expandable: boolean;
  warranty: number;
  chemistry: string;
  backupSupported: boolean;
  backupCircuitRequired: boolean;
  datasheetKey?: string;
}

export interface AddonConfig {
  key: string;
  label: string;
  qty: number;
  unitPrice: number;
}

export interface ProductConfigurationData {
  panels: PanelConfig;
  inverter: InverterConfig;
  battery?: BatteryConfig;
  addons: AddonConfig[];
}

const ProductConfiguration: React.FC<ProductConfigurationProps> = ({
  panels,
  inverter,
  battery,
  addons,
  onUpdate
}) => {
  const [includeBattery, setIncludeBattery] = useState(!!battery);
  const [showAddonSelector, setShowAddonSelector] = useState(false);

  const handlePanelUpdate = (field: keyof PanelConfig, value: any) => {
    onUpdate({ panels: { ...panels, [field]: value } });
  };

  const handleInverterUpdate = (field: keyof InverterConfig, value: any) => {
    onUpdate({ inverter: { ...inverter, [field]: value } });
  };

  const handleBatteryUpdate = (field: keyof BatteryConfig, value: any) => {
    if (battery) {
      onUpdate({ battery: { ...battery, [field]: value } });
    }
  };

  const addAddon = (addonKey: string) => {
    const addon = ADDON_OPTIONS.find((a) => a.key === addonKey);
    if (addon && !addons.find((a) => a.key === addonKey)) {
      onUpdate({
        addons: [
          ...addons,
          { key: addon.key, label: addon.label, qty: 1, unitPrice: addon.defaultPrice }
        ]
      });
    }
    setShowAddonSelector(false);
  };

  const removeAddon = (addonKey: string) => {
    onUpdate({ addons: addons.filter((a) => a.key !== addonKey) });
  };

  const updateAddon = (addonKey: string, field: 'qty' | 'unitPrice', value: number) => {
    onUpdate({
      addons: addons.map((a) => (a.key === addonKey ? { ...a, [field]: value } : a))
    });
  };

  const toggleBattery = () => {
    if (includeBattery) {
      onUpdate({ battery: undefined });
      setIncludeBattery(false);
    } else {
      onUpdate({
        battery: {
          brand: '',
          model: '',
          usableKwh: 10,
          powerKw: 5,
          expandable: false,
          warranty: 10,
          chemistry: 'LFP',
          backupSupported: false,
          backupCircuitRequired: false
        }
      });
      setIncludeBattery(true);
    }
  };

  return (
    <div className="bg-background rounded-2xl shadow-inner p-6 space-y-6">
      <h3 className="text-heading-5 text-foreground flex items-center gap-2">
        <Package className="h-5 w-5 text-primary" />
        Product Configuration
      </h3>

      {/* Solar Panels */}
      <div className="space-y-4">
        <h4 className="text-body text-foreground">Solar Panels</h4>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div>
            <label className="text-label text-foreground block mb-2">Brand</label>
            <Autocomplete
              value={panels.brand}
              onValueChange={(value) => handlePanelUpdate('brand', value)}
              options={[
                { id: 'Trina Solar', label: 'Trina Solar' },
                { id: 'JinkoSolar', label: 'JinkoSolar' },
                { id: 'Canadian Solar', label: 'Canadian Solar' },
                { id: 'LONGi', label: 'LONGi' },
                { id: 'JA Solar', label: 'JA Solar' },
                { id: 'Risen Energy', label: 'Risen Energy' },
                { id: 'Seraphim', label: 'Seraphim' },
                { id: 'Suntech', label: 'Suntech' }
              ]}
              placeholder="Select or type panel brand"
              label="Panel brand"
            />
          </div>

          <div>
            <label className="text-label text-foreground block mb-2">Model</label>
            <Autocomplete
              value={panels.model}
              onValueChange={(value) => handlePanelUpdate('model', value)}
              options={[
                { id: 'Vertex S+ 430W', label: 'Vertex S+ 430W (Trina)', value: 'Vertex S+ 430W' },
                { id: 'Tiger Neo 440W', label: 'Tiger Neo 440W (JinkoSolar)', value: 'Tiger Neo 440W' },
                { id: 'HiKu6 450W', label: 'HiKu6 450W (Canadian Solar)', value: 'HiKu6 450W' },
                { id: 'Hi-MO 5 435W', label: 'Hi-MO 5 435W (LONGi)', value: 'Hi-MO 5 435W' },
                { id: 'DeepBlue 3.0 425W', label: 'DeepBlue 3.0 425W (JA Solar)', value: 'DeepBlue 3.0 425W' },
                { id: 'Titan 420W', label: 'Titan 420W (Risen Energy)', value: 'Titan 420W' }
              ]}
              placeholder="Select or type panel model"
              label="Panel model"
            />
          </div>

          <div>
            <label className="text-label text-foreground block mb-2">Wattage (W)</label>
            <Input
              type="number"
              value={panels.wattage}
              onChange={(e) => handlePanelUpdate('wattage', parseFloat(e.target.value) || 0)}
              className="w-full px-4 py-3"
              placeholder="e.g. 430"
            />
          </div>

          <div>
            <label className="text-label text-foreground block mb-2">Efficiency (%)</label>
            <Input
              type="number"
              step="0.1"
              value={panels.efficiency}
              onChange={(e) => handlePanelUpdate('efficiency', parseFloat(e.target.value) || 0)}
              className="w-full px-4 py-3"
              placeholder="e.g. 21.5"
            />
          </div>

          <div>
            <label className="text-label text-foreground block mb-2">Quantity</label>
            <Input
              type="number"
              value={panels.qty}
              onChange={(e) => handlePanelUpdate('qty', parseInt(e.target.value) || 0)}
              className="w-full px-4 py-3"
              placeholder="e.g. 16"
            />
          </div>

          <div>
            <label className="text-label text-foreground block mb-2">Product Warranty (yrs)</label>
            <Input
              type="number"
              value={panels.productWarranty}
              onChange={(e) => handlePanelUpdate('productWarranty', parseInt(e.target.value) || 0)}
              className="w-full px-4 py-3"
              placeholder="e.g. 12"
            />
          </div>

          <div>
            <label className="text-label text-foreground block mb-2">Performance Warranty (yrs)</label>
            <Input
              type="number"
              value={panels.performanceWarranty}
              onChange={(e) => handlePanelUpdate('performanceWarranty', parseInt(e.target.value) || 0)}
              className="w-full px-4 py-3"
              placeholder="e.g. 25"
            />
          </div>

          <div className="flex items-end">
            <label className="flex items-center gap-3 cursor-pointer pb-3">
              <input
                type="checkbox"
                checked={panels.tier1}
                onChange={(e) => handlePanelUpdate('tier1', e.target.checked)}
                className="w-5 h-5 rounded border-border bg-background text-primary focus:ring-primary"
              />
              <span className="text-body-small text-foreground">Tier 1 Manufacturer</span>
            </label>
          </div>

          <div className="flex items-end">
            <Button variant="secondary" className="w-full">
              <Upload className="h-4 w-4" />
              Upload Datasheet
            </Button>
          </div>
        </div>
      </div>

      {/* Inverter */}
      <div className="space-y-4">
        <h4 className="text-body text-foreground">Inverter</h4>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div>
            <label className="text-label text-foreground block mb-2">Brand</label>
            <Autocomplete
              value={inverter.brand}
              onValueChange={(value) => handleInverterUpdate('brand', value)}
              options={[
                { id: 'Fronius', label: 'Fronius' },
                { id: 'SolarEdge', label: 'SolarEdge' },
                { id: 'Sungrow', label: 'Sungrow' },
                { id: 'Huawei', label: 'Huawei' },
                { id: 'GoodWe', label: 'GoodWe' },
                { id: 'Enphase', label: 'Enphase' },
                { id: 'SMA', label: 'SMA' },
                { id: 'Growatt', label: 'Growatt' }
              ]}
              placeholder="Select or type inverter brand"
              label="Inverter brand"
            />
          </div>

          <div>
            <label className="text-label text-foreground block mb-2">Model</label>
            <Autocomplete
              value={inverter.model}
              onValueChange={(value) => handleInverterUpdate('model', value)}
              options={[
                { id: 'Primo GEN24', label: 'Primo GEN24 (Fronius)', value: 'Primo GEN24' },
                { id: 'HD-Wave SE5000', label: 'HD-Wave SE5000 (SolarEdge)', value: 'HD-Wave SE5000' },
                { id: 'SH5K', label: 'SH5K (Sungrow)', value: 'SH5K' },
                { id: 'SUN2000-5KTL', label: 'SUN2000-5KTL (Huawei)', value: 'SUN2000-5KTL' },
                { id: 'GW5000-EH', label: 'GW5000-EH (GoodWe)', value: 'GW5000-EH' },
                { id: 'IQ8+', label: 'IQ8+ (Enphase)', value: 'IQ8+' }
              ]}
              placeholder="Select or type inverter model"
              label="Inverter model"
            />
          </div>

          <div>
            <label className="text-label text-foreground block mb-2">Type</label>
            <Autocomplete
              value={inverter.type}
              onValueChange={(value) => handleInverterUpdate('type', value)}
              options={INVERTER_TYPES.map((o) => ({ id: o.value, label: o.label, value: o.value }))}
              placeholder="Select or type inverter type"
              label="Inverter type"
            />
          </div>

          <div>
            <label className="text-label text-foreground block mb-2">Capacity (kW)</label>
            <Input
              type="number"
              step="0.1"
              value={inverter.capacityKw}
              onChange={(e) => handleInverterUpdate('capacityKw', parseFloat(e.target.value) || 0)}
              className="w-full px-4 py-3"
              placeholder="e.g. 5.0"
            />
          </div>

          <div>
            <label className="text-label text-foreground block mb-2">MPPTs</label>
            <Input
              type="number"
              value={inverter.mppts}
              onChange={(e) => handleInverterUpdate('mppts', parseInt(e.target.value) || 0)}
              className="w-full px-4 py-3"
              placeholder="e.g. 2"
            />
          </div>

          <div>
            <label className="text-label text-foreground block mb-2">Warranty (yrs)</label>
            <Input
              type="number"
              value={inverter.warranty}
              onChange={(e) => handleInverterUpdate('warranty', parseInt(e.target.value) || 0)}
              className="w-full px-4 py-3"
              placeholder="e.g. 10"
            />
          </div>

          <div className="flex items-end">
            <Button variant="secondary" className="w-full">
              <Upload className="h-4 w-4" />
              Upload Datasheet
            </Button>
          </div>
        </div>
      </div>

      {/* Battery */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h4 className="text-body text-foreground">Battery Storage</h4>
          <label className="flex items-center gap-3 cursor-pointer">
            <span className="text-body-small text-muted-foreground">Include Battery</span>
            <input
              type="checkbox"
              checked={includeBattery}
              onChange={toggleBattery}
              className="w-5 h-5 rounded border-border bg-background text-primary focus:ring-primary"
            />
          </label>
        </div>

        {includeBattery && battery && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className="text-label text-foreground block mb-2">Brand</label>
              <Autocomplete
                value={battery.brand}
                onValueChange={(value) => handleBatteryUpdate('brand', value)}
                options={[
                  { id: 'Tesla', label: 'Tesla' },
                  { id: 'LG Chem', label: 'LG Chem' },
                  { id: 'BYD', label: 'BYD' },
                  { id: 'Sungrow', label: 'Sungrow' },
                  { id: 'Huawei', label: 'Huawei' },
                  { id: 'Sonnen', label: 'Sonnen' },
                  { id: 'Alpha ESS', label: 'Alpha ESS' },
                  { id: 'Pylontech', label: 'Pylontech' }
                ]}
                placeholder="Select or type battery brand"
                label="Battery brand"
              />
            </div>

            <div>
              <label className="text-label text-foreground block mb-2">Model</label>
              <Autocomplete
                value={battery.model}
                onValueChange={(value) => handleBatteryUpdate('model', value)}
                options={[
                  { id: 'Powerwall 2', label: 'Powerwall 2 (Tesla)', value: 'Powerwall 2' },
                  { id: 'Powerwall 3', label: 'Powerwall 3 (Tesla)', value: 'Powerwall 3' },
                  { id: 'RESU10H', label: 'RESU10H (LG Chem)', value: 'RESU10H' },
                  { id: 'Battery-Box Premium HVS', label: 'Battery-Box HVS (BYD)', value: 'Battery-Box Premium HVS' },
                  { id: 'SBR096', label: 'SBR096 (Sungrow)', value: 'SBR096' },
                  { id: 'LUNA2000', label: 'LUNA2000 (Huawei)', value: 'LUNA2000' },
                  { id: 'SonnenBatterie 10', label: 'SonnenBatterie 10', value: 'SonnenBatterie 10' }
                ]}
                placeholder="Select or type battery model"
                label="Battery model"
              />
            </div>

            <div>
              <label className="text-label text-foreground block mb-2">Usable Capacity (kWh)</label>
              <Input
                type="number"
                step="0.1"
                value={battery.usableKwh}
                onChange={(e) => handleBatteryUpdate('usableKwh', parseFloat(e.target.value) || 0)}
                className="w-full px-4 py-3"
                placeholder="e.g. 13.5"
              />
            </div>

            <div>
              <label className="text-label text-foreground block mb-2">Power Output (kW)</label>
              <Input
                type="number"
                step="0.1"
                value={battery.powerKw}
                onChange={(e) => handleBatteryUpdate('powerKw', parseFloat(e.target.value) || 0)}
                className="w-full px-4 py-3"
                placeholder="e.g. 5.0"
              />
            </div>

            <div>
              <label className="text-label text-foreground block mb-2">Chemistry</label>
              <Autocomplete
                value={battery.chemistry}
                onValueChange={(value) => handleBatteryUpdate('chemistry', value)}
                options={BATTERY_CHEMISTRY.map((o) => ({ id: o.value, label: o.label, value: o.value }))}
                placeholder="Select or type chemistry"
                label="Battery chemistry"
              />
            </div>

            <div>
              <label className="text-label text-foreground block mb-2">Warranty (yrs)</label>
              <Input
                type="number"
                value={battery.warranty}
                onChange={(e) => handleBatteryUpdate('warranty', parseInt(e.target.value) || 0)}
                className="w-full px-4 py-3"
                placeholder="e.g. 10"
              />
            </div>

            <div className="flex items-end">
              <label className="flex items-center gap-3 cursor-pointer pb-3">
                <input
                  type="checkbox"
                  checked={battery.expandable}
                  onChange={(e) => handleBatteryUpdate('expandable', e.target.checked)}
                  className="w-5 h-5 rounded border-border bg-background text-primary focus:ring-primary"
                />
                <span className="text-body-small text-foreground">Expandable</span>
              </label>
            </div>

            <div className="flex items-end">
              <label className="flex items-center gap-3 cursor-pointer pb-3">
                <input
                  type="checkbox"
                  checked={battery.backupSupported}
                  onChange={(e) => handleBatteryUpdate('backupSupported', e.target.checked)}
                  className="w-5 h-5 rounded border-border bg-background text-primary focus:ring-primary"
                />
                <span className="text-body-small text-foreground">Backup Supported</span>
              </label>
            </div>

            <div className="flex items-end">
              <label className="flex items-center gap-3 cursor-pointer pb-3">
                <input
                  type="checkbox"
                  checked={battery.backupCircuitRequired}
                  onChange={(e) => handleBatteryUpdate('backupCircuitRequired', e.target.checked)}
                  className="w-5 h-5 rounded border-border bg-background text-primary focus:ring-primary"
                />
                <span className="text-body-small text-foreground">Backup Circuit Required</span>
              </label>
            </div>

            <div className="flex items-end md:col-span-2 lg:col-span-1">
              <Button variant="secondary" className="w-full">
                <Upload className="h-4 w-4" />
                Upload Datasheet
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Add-ons */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h4 className="text-body text-foreground">Add-ons</h4>
          <Button
            variant="secondary"
            onClick={() => setShowAddonSelector(!showAddonSelector)}
          >
            <Plus className="h-4 w-4" />
            Add Item
          </Button>
        </div>

        {showAddonSelector && (
          <div className="border border-border rounded-lg p-4 space-y-2">
            <p className="text-caption text-muted-foreground mb-3">Select add-on to include:</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {ADDON_OPTIONS.map((addon) => (
                <button
                  key={addon.key}
                  onClick={() => addAddon(addon.key)}
                  disabled={addons.some((a) => a.key === addon.key)}
                  className={`
                    text-left transition-all
                    ${addons.some((a) => a.key === addon.key)
                      ? 'px-4 py-2 rounded-lg text-body-small bg-background-alt text-muted-foreground cursor-not-allowed'
                      : 'selection-chip'
                    }
                  `}
                >
                  {addon.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {addons.length > 0 && (
          <div className="space-y-3">
            {/* Header Row */}
            <div className="grid grid-cols-12 gap-3 text-caption text-muted-foreground pb-2 border-b border-border">
              <div className="col-span-4">Item</div>
              <div className="col-span-2 text-center">Qty</div>
              <div className="col-span-2 text-right">Price</div>
              <div className="col-span-2 text-right">Total</div>
              <div className="col-span-2"></div>
            </div>
            
            {/* Data Rows */}
            {addons.map((addon) => (
              <div key={addon.key} className="grid grid-cols-12 gap-3 items-center">
                <div className="col-span-4 text-body-small text-foreground">{addon.label}</div>
                <div className="col-span-2">
                  <Input
                    type="number"
                    min="1"
                    value={addon.qty}
                    onChange={(e) => updateAddon(addon.key, 'qty', parseInt(e.target.value) || 1)}
                    className="w-full px-3 py-2 text-center text-body-small"
                  />
                </div>
                <div className="col-span-2">
                  <Input
                    type="number"
                    min="0"
                    value={addon.unitPrice}
                    onChange={(e) =>
                      updateAddon(addon.key, 'unitPrice', parseFloat(e.target.value) || 0)
                    }
                    className="w-full px-3 py-2 text-right text-body-small"
                  />
                </div>
                <div className="col-span-2 text-right text-body-small text-foreground">
                  ${(addon.qty * addon.unitPrice).toLocaleString()}
                </div>
                <div className="col-span-2 flex justify-end">
                  <button
                    type="button"
                    className="btn-delete"
                    onClick={() => removeAddon(addon.key)}
                    title="Remove item"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductConfiguration;
