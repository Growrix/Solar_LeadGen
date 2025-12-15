'use client'

import React from 'react';
import { Home, Upload } from 'lucide-react';
import { ROOF_TYPES, ORIENTATIONS, SHADING_LEVELS, PHASE_TYPES } from './Presets';
import Button from '@/components/ui/button';

interface RoofSiteDetailsProps {
  roofType: string;
  pitchDeg: number;
  arrays: number;
  orientations: string[];
  shadingLevel: number;
  phaseType: string;
  switchboardUpgrade: boolean;
  smartMeterRequired: boolean;
  distanceToSwitchboardM: number;
  notes: string;
  photos: string[];
  // Phase 9 - Installer-only fields
  arrayLayoutNotes?: string;
  roofAccessNotes?: string;
  structuralNotes?: string;
  mountingSystemPreferred?: string;
  conduitRunComplexity?: 'low' | 'medium' | 'high';
  inverterLocationNotes?: string;
  // Metadata
  prefilledFields?: string[];
  onUpdate: (data: Partial<RoofSiteDetailsData>) => void;
}

export interface RoofSiteDetailsData {
  roofType: string;
  pitchDeg: number;
  arrays: number;
  orientations: string[];
  shadingLevel: number;
  phaseType: string;
  switchboardUpgrade: boolean;
  smartMeterRequired: boolean;
  distanceToSwitchboardM: number;
  notes: string;
  photos: string[];
  // Phase 9 - Installer-only fields
  arrayLayoutNotes?: string;
  roofAccessNotes?: string;
  structuralNotes?: string;
  mountingSystemPreferred?: string;
  conduitRunComplexity?: 'low' | 'medium' | 'high';
  inverterLocationNotes?: string;
}

const RoofSiteDetails: React.FC<RoofSiteDetailsProps> = ({
  roofType,
  pitchDeg,
  arrays,
  orientations,
  shadingLevel,
  phaseType,
  switchboardUpgrade,
  smartMeterRequired,
  distanceToSwitchboardM,
  notes,
  photos,
  onUpdate
}) => {
  const toggleOrientation = (orientation: string) => {
    const newOrientations = orientations.includes(orientation)
      ? orientations.filter((o) => o !== orientation)
      : [...orientations, orientation];
    onUpdate({ orientations: newOrientations });
  };

  return (
    <div className="bg-background rounded-2xl shadow-neu-inset p-6 space-y-6">
      <h3 className="text-heading-5 text-foreground flex items-center gap-2">
        <Home className="h-5 w-5 text-primary" />
        Roof & Site Details
      </h3>

      {/* Row 1: Roof Type, Pitch, Arrays */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="text-label text-foreground block mb-2">
            Roof Type
          </label>
          <select
            value={roofType}
            onChange={(e) => onUpdate({ roofType: e.target.value })}
            className="form-select w-full px-4 py-3"
          >
            <option value="">Select type...</option>
            {ROOF_TYPES.map((type) => (
              <option key={type.value} value={type.value}>
                {type.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="text-label text-foreground block mb-2">
            Roof Pitch (degrees)
          </label>
          <input
            type="number"
            min="0"
            max="90"
            value={pitchDeg}
            onChange={(e) => onUpdate({ pitchDeg: parseFloat(e.target.value) || 0 })}
            className="form-input w-full px-4 py-3"
            placeholder="e.g. 22"
          />
        </div>

        <div>
          <label className="text-label text-foreground block mb-2">
            Number of Arrays
          </label>
          <input
            type="number"
            min="1"
            max="10"
            value={arrays}
            onChange={(e) => onUpdate({ arrays: parseInt(e.target.value) || 1 })}
            className="form-input w-full px-4 py-3"
          />
        </div>
      </div>

      {/* Row 2: Orientations (Multi-select chips) */}
      <div>
        <label className="text-label text-foreground block mb-3">
          Array Orientations
        </label>
        <div className="flex flex-wrap gap-2">
          {ORIENTATIONS.map((orientation) => (
            <button
              key={orientation}
              onClick={() => toggleOrientation(orientation)}
              className={orientations.includes(orientation) ? 'selection-chip-active' : 'selection-chip'}
            >
              {orientation}
            </button>
          ))}
        </div>
        <p className="text-caption text-muted-foreground mt-2">
          Select all orientations where panels will be installed
        </p>
      </div>

      {/* Row 3: Shading Level */}
      <div>
        <label className="text-label text-foreground block mb-2">
          Shading Level
        </label>
        <select
          value={shadingLevel}
          onChange={(e) => onUpdate({ shadingLevel: parseFloat(e.target.value) })}
          className="form-select w-full px-4 py-3"
        >
          {SHADING_LEVELS.map((level) => (
            <option key={level.value} value={level.value}>
              {level.label}
            </option>
          ))}
        </select>
      </div>

      {/* Row 4: Metering & Switchboard */}
      <div className="space-y-4">
        <h4 className="text-body text-foreground">Metering & Switchboard</h4>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-label text-foreground block mb-2">
              Phase Type
            </label>
            <select
              value={phaseType}
              onChange={(e) => onUpdate({ phaseType: e.target.value })}
              className="form-select w-full px-4 py-3"
            >
              {PHASE_TYPES.map((type) => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-label text-foreground block mb-2">
              Distance to Switchboard (m)
            </label>
            <input
              type="number"
              min="0"
              max="100"
              value={distanceToSwitchboardM}
              onChange={(e) =>
                onUpdate({ distanceToSwitchboardM: parseFloat(e.target.value) || 0 })
              }
              className="form-input w-full px-4 py-3"
              placeholder="e.g. 15"
            />
          </div>
        </div>

        <div className="space-y-3">
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={switchboardUpgrade}
              onChange={(e) => onUpdate({ switchboardUpgrade: e.target.checked })}
              className="w-5 h-5 rounded border-border bg-background text-primary focus:ring-primary"
            />
            <span className="text-body-small text-foreground">
              Switchboard Upgrade Required
            </span>
          </label>

          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={smartMeterRequired}
              onChange={(e) => onUpdate({ smartMeterRequired: e.target.checked })}
              className="w-5 h-5 rounded border-border bg-background text-primary focus:ring-primary"
            />
            <span className="text-body-small text-foreground">
              Smart Meter Required
            </span>
          </label>
        </div>
      </div>

      {/* Row 5: Site Notes */}
      <div>
        <label className="text-label text-foreground block mb-2">
          Site Notes
        </label>
        <textarea
          value={notes}
          onChange={(e) => onUpdate({ notes: e.target.value })}
          rows={4}
          className="form-input w-full px-4 py-3 resize-none"
          placeholder="Any special considerations, access issues, or site-specific requirements..."
        />
      </div>

      {/* Row 6: Photos Upload (Stub) */}
      <div>
        <label className="text-label text-foreground block mb-2">
          Site Photos
        </label>
        <div className="border-2 border-dashed border-border rounded-lg p-6 text-center space-y-3">
          <Upload className="h-8 w-8 text-muted-foreground mx-auto" />
          <div>
            <p className="text-body-small text-foreground mb-1">
              Upload site photos
            </p>
            <p className="text-caption text-muted-foreground">
              Roof, switchboard, obstructions, etc.
            </p>
          </div>
          <Button variant="secondary" className="mx-auto">
            Choose Files
          </Button>
        </div>
        {photos.length > 0 && (
          <div className="mt-3 text-body-small text-foreground">
            {photos.length} photo(s) uploaded
          </div>
        )}
      </div>
    </div>
  );
};

export default RoofSiteDetails;