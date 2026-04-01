'use client';

import React, { useState, useEffect } from 'react';
import {
  Alert,
  Battery,
  Button,
  Calculator,
  Field,
  Info,
  Input,
  MapPin,
  Modal,
  Select,
  SlidersHorizontal,
  Spinner,
  Switch,
  X,
} from '@/ds';

const formatCurrency = (amount: number) => new Intl.NumberFormat('en-AU', { style: 'currency', currency: 'AUD', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(amount);

// ---------------------------
// Defaults & helpers
// ---------------------------

const DEFAULT_STC_ZONES: Record<string, number> = { '1': 1.622, '2': 1.536, '3': 1.382, '4': 1.185 };

const postcodeToState = (postcode: string) => {
  if (!postcode || postcode.length !== 4) return 'DEFAULT';
  if (postcode.startsWith('02')) return 'NSW';
  if (postcode.startsWith('08')) return 'NT';
  const first = postcode.charAt(0);
  const map: Record<string, string> = { '2': 'NSW', '3': 'VIC', '4': 'QLD', '5': 'SA', '6': 'WA', '7': 'TAS', '0': 'NT' };
  const n = parseInt(postcode, 10);
  if ((n >= 2600 && n <= 2618) || (n >= 2900 && n <= 2920)) return 'ACT';
  return map[first] || 'DEFAULT';
};

const getZoneByPostcode = (postcode: string) => {
  const n = parseInt(postcode || '0', 10);
  if (n >= 800 && n <= 999) return '1';
  if (n >= 4800 && n <= 4899) return '1';
  if ((n >= 4000 && n <= 4999) || (n >= 6000 && n <= 6797)) return '2';
  if ((n >= 3000 && n <= 3999) || (n >= 7000 && n <= 7999)) return '4';
  return '3';
};

const STATE_PROGRAMS: any = {
  VIC: {
    solar: { enabled: true, type: 'flat', amount: 1400, note: 'Solar Victoria rebate up to $1,400 for eligible owner-occupiers.' },
    battery: { enabled: false, amount: 0, note: 'Battery rebates handled by federal program (if eligible).' }
  },
  NSW: {
    solar: { enabled: false, amount: 0, note: 'No general panel rebate (check NSW programs for targeted schemes).' },
    battery: { enabled: true, amount: 2000, note: 'Peak Demand Reduction Scheme: typical battery subsidy range; eligibility rules apply.' }
  },
  ACT: {
    solar: { enabled: true, type: 'means-tested', amount: 2500, note: 'Home Energy Support � targeted to concession card holders (up to $2,500).' },
    battery: { enabled: false, amount: 0, note: '' }
  },
  WA: {
    solar: { enabled: false, amount: 0, note: 'No general solar panel rebate currently' },
    battery: { enabled: true, amount: 1300, note: 'WA battery subsidy example (SWIS regions) � check regional amounts.' }
  },
  DEFAULT: { solar: { enabled: false, amount: 0, note: 'No state rebate on file.' }, battery: { enabled: false, amount: 0, note: '' } }
};

async function fetchSTCPrice(): Promise<number> {
  return 40;
}

async function fetchStatePrograms(): Promise<any> {
  return STATE_PROGRAMS;
}

// ---------------------------
// Component
// ---------------------------

interface Props { 
  onGetQuotesClick?: () => void;
}

const RebateCalculatorForm: React.FC<Props> = ({ onGetQuotesClick }) => {
  const currentYear = new Date().getFullYear();

  const [inputs, setInputs] = useState({
    systemSizeKw: 6.6,
    postcode: '',
    installationYear: currentYear,
    ownerOccupier: true,
    householdIncome: 80000,
    propertyValue: 600000,
    includeBattery: false,
    batterySizeKwh: 10,
  });

  const [isCalculating, setIsCalculating] = useState(false);
  const [errors, setErrors] = useState<Record<string,string>>({});
  const [stcPrice, setStcPrice] = useState<number | null>(null);
  const [programs, setPrograms] = useState<any | null>(null);
  const [result, setResult] = useState<any|null>(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    fetchSTCPrice().then(p => setStcPrice(p)).catch(() => setStcPrice(40));
    fetchStatePrograms().then(r => setPrograms(r)).catch(() => setPrograms(STATE_PROGRAMS));
  }, []);

  const validatePostcode = (pc: string) => {
    if (!pc) return 'Postcode is required.';
    if (!/^\d{4}$/.test(pc)) return 'Postcode must be a 4-digit number.';

    const code = parseInt(pc, 10);
    const validRanges = [
      [800, 999],   // NT
      [1000, 2999], // NSW & ACT
      [3000, 3999], // VIC
      [4000, 4999], // QLD
      [5000, 5999], // SA
      [6000, 6999], // WA
      [7000, 7999], // TAS
    ];

    const isValid = validRanges.some(([min, max]) => code >= min && code <= max);
    
    if (!isValid) {
        if (pc.startsWith('0') && !pc.startsWith('08') && !pc.startsWith('09')) {
            return 'Invalid format. Only NT postcodes (08xx) start with 0.';
        }
        return `Postcode ${pc} seems to be outside the standard Australian ranges. Please check and re-enter.`;
    }
    
    return '';
  };

  function handleInput<K extends keyof typeof inputs>(key: K, val: typeof inputs[K]) {
    setInputs(prev => ({ ...prev, [key]: val }));
    if (errors[key as string]) setErrors(prev => ({ ...prev, [key as string]: '' }));
  }

  async function handleCalculate() {
    const postcodeErr = validatePostcode(inputs.postcode);
    if (postcodeErr) { 
      setErrors({ postcode: postcodeErr }); 
      return; 
    }

    setIsCalculating(true);
    setResult(null);
    await new Promise(resolve => setTimeout(resolve, 800));

    try {
      const stcUnitPrice = stcPrice ?? await fetchSTCPrice();
      const statePrograms = programs ?? await fetchStatePrograms();

      const deemingYears = Math.max(0, 2030 - inputs.installationYear + 1);
      const zoneKey = getZoneByPostcode(inputs.postcode);
      const zoneMultiplier = DEFAULT_STC_ZONES[zoneKey] ?? DEFAULT_STC_ZONES['3'];
      const numSTCs = Math.floor(inputs.systemSizeKw * zoneMultiplier * deemingYears);
      const federalSTCValue = Math.round(numSTCs * stcUnitPrice);

      const FEDERAL_BATTERY_REBATE_PER_USABLE_KWH = 372;
      let federalBatteryRebate = 0;
      if (inputs.includeBattery && inputs.installationYear >= 2025) {
        const usable = Math.max(0, inputs.batterySizeKwh * 0.9);
        federalBatteryRebate = Math.round(usable * FEDERAL_BATTERY_REBATE_PER_USABLE_KWH);
      }

      const state = postcodeToState(inputs.postcode);
      const stateProgram = (statePrograms && statePrograms[state]) ? statePrograms[state] : statePrograms['DEFAULT'];
      let stateSolar = 0; 
      let stateBattery = 0;
      let stateSolarNote = stateProgram.solar.note || '';
      let stateBatteryNote = stateProgram.battery.note || '';

      if (stateProgram.solar && stateProgram.solar.enabled) {
        const eligible = (() => {
          if (state === 'VIC') return inputs.ownerOccupier && inputs.householdIncome < 180000 && inputs.propertyValue < 3000000;
          if (state === 'ACT') return inputs.householdIncome < 75000;
          return true;
        })();
        if (eligible) {
          stateSolar = stateProgram.solar.amount || 0;
        } else {
          stateSolarNote = 'Not eligible for state solar rebate based on entered details.';
        }
      }

      if (stateProgram.battery && stateProgram.battery.enabled) {
        const eligibleB = (() => {
          if (!inputs.includeBattery) return false;
          if (state === 'NSW') return inputs.installationYear >= 2024;
          if (state === 'WA') return inputs.installationYear >= 2025;
          return true;
        })();
        if (eligibleB) stateBattery = stateProgram.battery.amount || 0; 
        else stateBatteryNote = 'Not eligible for state battery rebate based on entered details.';
      }

      const totalRebate = Math.max(0, federalSTCValue + federalBatteryRebate + stateSolar + stateBattery);
      const batteryTotal = federalBatteryRebate + stateBattery;

      setResult({
        totalRebate,
        federalSTCValue,
        stateSolar,
        batteryTotal,
        numSTCs,
        eligibilityNotes: { 
          stateSolar: stateSolarNote, 
          stateBattery: stateBatteryNote, 
          federalBattery: inputs.includeBattery ? 'Federal battery rebate may apply for eligible systems installed from 2025.' : 'No federal battery rebate because battery not selected.' 
        },
        disclaimers: [
          `STC estimate uses a unit price of $${stcUnitPrice}/STC. Market price may vary.`,
          'State programs and eligibility rules change � always check official state websites for final rules.',
          'All rebates shown are estimates. A certified installer will confirm actual rebate amounts.'
        ]
      });

      setShowModal(true);

    } catch (err) {
      console.error('Rebate calc error', err);
      setErrors({ general: 'Failed to compute rebates � please try again.' });
    } finally {
      setIsCalculating(false);
    }
  }

  return (
    <div className="ui-container animate-fade-in">
      <div className="ui-card">
        <div className="ui-stack">
            <fieldset>
            <legend className="text-heading-3 text-foreground">Location &amp; System</legend>
            <div className="ui-grid ui-grid--2">
                <Field
                  id="postcode"
                  label={<><MapPin /> Postcode *</>}
                  error={errors.postcode}
                  hint={!errors.postcode ? (inputs.postcode && inputs.postcode.length === 4 ? `📍 ${postcodeToState(inputs.postcode)} - STC Zone ${getZoneByPostcode(inputs.postcode)}` : 'Determines STC zone and state rebates') : undefined}
                >
                  <Input
                    type="text"
                    value={inputs.postcode}
                    onChange={(e) => handleInput('postcode', e.target.value)}
                    onBlur={(e) => setErrors({ ...errors, postcode: validatePostcode(e.target.value) })}
                    placeholder="e.g., 2000, 3000, 4000"
                    maxLength={4}
                    aria-required="true"
                  />
                </Field>

                <div className="ui-field">
                  <span className="ui-label">Include Battery Storage</span>
                  <div className="info-section ui-row">
                    <span className="text-body-small text-foreground">
                      {inputs.includeBattery ? 'Battery Included' : 'Solar Only'}
                    </span>
                    <Switch
                      checked={inputs.includeBattery}
                      onCheckedChange={(v) => handleInput('includeBattery', v)}
                      label=""
                    />
                  </div>
                </div>
            </div>

            <div className="info-section info-section--lg">
              <h4 className="text-label text-foreground ui-row">
                System Configuration <SlidersHorizontal />
              </h4>
              <div className="ui-grid ui-grid--2">
                  <Field id="systemSize" label="System Size (kW) *">
                    <Select
                      value={inputs.systemSizeKw}
                      onChange={(e) => handleInput('systemSizeKw', parseFloat(e.target.value))}
                    >
                      {[3, 4, 5, 6, 6.6, 7, 8, 9, 10, 11, 12, 13.2, 15, 20].map(s => (
                        <option key={s} value={s}>
                          {s} kW{s === 6.6 ? ' (most popular)' : ''}
                        </option>
                      ))}
                    </Select>
                  </Field>

                  <Field id="batterySize" label="Battery Size (kWh)">
                    <Input
                      type="number"
                      value={inputs.batterySizeKwh}
                      onChange={(e) => handleInput('batterySizeKwh', Math.max(0, parseFloat(e.target.value || '0')))}
                      disabled={!inputs.includeBattery}
                      min="0" max="100" step="0.5"
                      placeholder="e.g., 13.5"
                    />
                  </Field>
              </div>
            </div>
            </fieldset>

            <fieldset>
            <legend className="text-heading-3 text-foreground">Eligibility Details</legend>
            <div className="ui-grid ui-grid--2">
                <Field id="installationYear" label="Planned Installation Year *">
                  <Select
                    value={inputs.installationYear}
                    onChange={(e) => handleInput('installationYear', parseInt(e.target.value || `${currentYear}`))}
                  >
                    {[...Array(6)].map((_, i) => (
                      <option key={i} value={currentYear + i}>
                        {currentYear + i}{i === 0 ? ' (This year)' : ''}
                      </option>
                    ))}
                  </Select>
                </Field>

                <Field id="propertyStatus" label="Property Status *">
                  <Select
                    value={inputs.ownerOccupier ? 'owner' : 'renter'}
                    onChange={(e) => handleInput('ownerOccupier', e.target.value === 'owner')}
                  >
                    <option value="owner">Owner-occupier</option>
                    <option value="renter">Investor / Landlord</option>
                  </Select>
                </Field>

                <Field id="householdIncome" label="Combined Household Income *">
                  <Select
                    value={inputs.householdIncome}
                    onChange={(e) => handleInput('householdIncome', parseInt(e.target.value || '0'))}
                  >
                    <option value={40000}>Under $75,000</option>
                    <option value={80000}>$75k - $180k</option>
                    <option value={200000}>Over $180k</option>
                  </Select>
                </Field>

                <Field id="propertyValue" label="Property Value (Victoria only) *">
                  <Select
                    value={inputs.propertyValue}
                    onChange={(e) => handleInput('propertyValue', parseInt(e.target.value || '0'))}
                  >
                    <option value={600000}>Under $3M</option>
                    <option value={3500000}>Over $3M</option>
                  </Select>
                </Field>
            </div>
            </fieldset>
        </div>

        {errors.general && (
          <Alert tone="danger">
            <p>{errors.general}</p>
          </Alert>
        )}

        <div>
          <Button
            disabled={isCalculating || !inputs.postcode}
            onClick={handleCalculate}
            variant="primary"
            className="ui-w-full"
          >
            {isCalculating ? (
              <><Spinner size="sm" /><span>Calculating...</span></>
            ) : (
              <>
                <Calculator />
                <span>Calculate My Rebates</span>
              </>
            )}
          </Button>
        </div>
      </div>

      <Modal open={showModal} onClose={() => setShowModal(false)} title="Your Rebate Estimate">
        <div className="ui-stack ui-stack--compact">
          {/* Stat Cards */}
          <div className="ui-grid ui-grid--3">
            <div className="ui-card ui-text-center">
              <h3 className="text-body-small ui-text-muted">Total Rebate</h3>
              <p className="text-heading-1 text-accent">{result && formatCurrency(result.totalRebate)}</p>
            </div>
            <div className="ui-card ui-text-center">
              <h3 className="text-body-small ui-text-muted">Federal Rebate (STC)</h3>
              <p className="text-heading-1 text-success">{result && formatCurrency(result.federalSTCValue)}</p>
            </div>
            <div className="ui-card ui-text-center">
              <h3 className="text-body-small ui-text-muted">State &amp; Battery</h3>
              <p className="text-heading-1 text-info">{result && formatCurrency(result.stateSolar + result.batteryTotal)}</p>
            </div>
          </div>

          {/* Eligibility Notes */}
          <Alert tone="info" title="Eligibility Summary">
            <div className="ui-stack ui-stack--tight">
              <p><strong>Solar Rebate:</strong> {result?.eligibilityNotes.stateSolar}</p>
              {inputs.includeBattery && <p><strong>Battery Rebate:</strong> {result?.eligibilityNotes.stateBattery}</p>}
            </div>
          </Alert>

          {/* Disclaimers */}
          <Alert tone="warning" title="Important Information">
            <ul>
              {result?.disclaimers.map((d: string, i: number) => (<li key={i}>{d}</li>))}
            </ul>
          </Alert>

          {/* Action Buttons */}
          <div className="ui-row ui-row--center">
            <Button
              onClick={() => { setShowModal(false); onGetQuotesClick && onGetQuotesClick(); }}
              variant="primary"
            >
              Get Installer Quotes →
            </Button>
            <Button
              onClick={() => setShowModal(false)}
              variant="secondary"
            >
              Close
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default RebateCalculatorForm;



