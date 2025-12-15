'use client'

import React from 'react';
import { Zap, Plus, Minus } from 'lucide-react';
import { SYSTEM_TYPES } from './Presets';

interface SystemSelectionProps {
  systemType: string;
  systemSize: number;
  projectType?: string;
  desiredPriceRange?: { min: number; max: number };
  prefilledFields?: string[];
  onUpdate: (data: Partial<SystemSelectionData>) => void;
}

export interface SystemSelectionData {
  systemType: string;
  systemSize: number;
  projectType?: string;
  desiredPriceRange?: { min: number; max: number };
}

const SystemSelection: React.FC<SystemSelectionProps> = ({
  systemType,
  systemSize,
  projectType = 'Residential',
  desiredPriceRange,
  prefilledFields = [],
  onUpdate
}) => {
  const handleSizeChange = (value: number) => {
    onUpdate({ systemSize: value });
  };
  
  const adjustSystemSize = (delta: number) => {
    const newSize = Math.max(0, Math.round((systemSize + delta) * 10) / 10);
    onUpdate({ systemSize: newSize });
  };

  return (
    <div className="bg-background rounded-2xl shadow-neu-inset p-6">
      <h3 className="text-heading-5 text-foreground flex items-center gap-2 mb-6">
        <Zap className="h-5 w-5 text-primary" />
        System Selection
      </h3>
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:gap-6">
        {/* Project Type */}
        <div className="flex-1 min-w-[160px]">
          <label className="text-label text-foreground block mb-2">Project Type</label>
          <select
            value={projectType}
            onChange={(e) => onUpdate({ projectType: e.target.value })}
            className="form-select w-full px-4 py-3"
          >
            <option value="Residential">Residential</option>
            <option value="Commercial">Commercial</option>
          </select>
          {prefilledFields.includes('system.projectType') && (
            <p className="text-caption text-muted-foreground mt-1">
              Prefilled from homeowner Instant Quote
            </p>
          )}
        </div>
        {/* System Type */}
        <div className="flex-1 min-w-[200px]">
          <label className="text-label text-foreground block mb-2">System Type</label>
          <select
            value={systemType}
            onChange={(e) => onUpdate({ systemType: e.target.value })}
            className="form-select w-full px-4 py-3"
          >
            {SYSTEM_TYPES.map((type) => (
              <option key={type.value} value={type.value}>
                {type.label}
              </option>
            ))}
          </select>
        </div>
        {/* System Size */}
        <div className="flex-1 min-w-[140px]">
          <label className="text-label text-foreground block mb-2">System Size (kW)</label>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => adjustSystemSize(-0.5)}
              className="btn-secondary p-2 rounded-lg"
              title="Decrease by 0.5 kW"
            >
              <Minus className="h-4 w-4" />
            </button>
            <input
              type="number"
              min="0"
              max="100"
              step="0.1"
              value={systemSize}
              onChange={(e) => handleSizeChange(parseFloat(e.target.value) || 0)}
              className="form-input max-w-[100px] px-4 py-3"
            />
            <button
              type="button"
              onClick={() => adjustSystemSize(0.5)}
              className="btn-secondary p-2 rounded-lg"
              title="Increase by 0.5 kW"
            >
              <Plus className="h-4 w-4" />
            </button>
            <span className="text-body text-muted-foreground">kW</span>
          </div>
          {prefilledFields.includes('system.systemSize') && (
            <p className="text-caption text-muted-foreground mt-1">
              Prefilled from homeowner Instant Quote
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default SystemSelection;
