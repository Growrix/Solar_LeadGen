
'use client'

import React, { useEffect, useState, useMemo } from 'react'
import SavingsChart from './SavingsChart';
import Button from '@/components/ui/button';
import { 
  Loader2, 
  MapPin, 
  DollarSign, 
  ArrowRight, 
  Home, 
  Zap, 
  Calculator, 
  CheckCircle2, 
  AlertCircle, 
  Battery, 
  ArrowLeft, 
  Building,
  Info
} from 'lucide-react';

const InfoTooltip = ({ text }: { text: string }) => (
    <span className="ml-1 inline-flex items-center" title={text}>
      <Info className="h-4 w-4 text-muted-foreground cursor-help" />
    </span>
);

interface InstantQuoteFormProps {
  onProceedToDetailedQuote: () => void;
  onQuoteCalculated: (data: any) => void;
  initialData?: Record<string, unknown> | null;
  hideSubmitButton?: boolean; // Hide"Get Detailed Quotes" button for homeowners with existing quotes
}

const InstantQuoteForm: React.FC<InstantQuoteFormProps> = ({ onProceedToDetailedQuote, onQuoteCalculated, initialData = null, hideSubmitButton = false }) => {
  const [quoteType, setQuoteType] = useState<'residential' | 'commercial'>('residential');
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isPrefilling, setIsPrefilling] = useState(false);
  
  // Generate or retrieve session ID for tracking
  const [sessionId] = useState(() => {
    if (typeof window !== 'undefined') {
      let id = sessionStorage.getItem('quote_session_id');
      if (!id) {
        id = `session_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
        sessionStorage.setItem('quote_session_id', id);
      }
      return id;
    }
    return `session_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
  });
  
  // Form data state
  const [formData, setFormData] = useState({
    postcode: '',
    location: '',
    state: '',
    roofType: '',
    budgetRange: '',
    batteryIncluded: false,
    batteryCapacity: '', // kWh
    batteryBrand: '',
    customBatteryCapacity: '',
    backupCritical: 'essential',
    batteryUsage: 'self-consumption',
    includeVPP: false,
    includeEVCharging: false,
    includeSmartHome: false,
    includeGridServices: false,
    desiredOffset: 100, // Changed from 80 to 100%
    hasExistingSystem: false,
    existingSystemSize: '',
    panelOrientation: 'north',
    roofTilt: 'optimal', // Changed from roofPitch to roofTilt
    shadingLevel: 'none', // Changed from shading to shadingLevel
    usagePattern: 'spread',
    customRetailRate: '',
    customFeedInRate: '',
    retailer: '',
    tariffPlan: '',
    panelBrand: '',
    includeOptimizers: false,
    includeMicroinverters: false,
    // Commercial fields
    peakDemand: '',
    isThreePhase: false,
    projectPriority: 'reduce_bills',
    // Additional arrays for complex roof layouts
    additionalArrays: [],
    // System size override
    systemSizeOverride: '',
  });
  
  // Energy usage input state
  const [electricityUsageType, setElectricityUsageType] = useState<'monthly' | 'quarterly'>('monthly');
  const [electricityValue, setElectricityValue] = useState('');
  
  // Quote result state
  const [quoteResult, setQuoteResult] = useState<any>(null);

  // External data caches
  const [stcZoneMultiplier, setStcZoneMultiplier] = useState<number | null>(null);
  const [defaultFeedIn, setDefaultFeedIn] = useState<number | null>(null);
  const [stateRebateRules, setStateRebateRules] = useState<any>(null);

  const handleStartOver = () => {
    // First scroll to position, then reset state to prevent jump
    const calculatorSection = document.getElementById('calculator-section');
    if (calculatorSection) {
      calculatorSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
    
    // Delay state reset slightly to allow scroll to start
    setTimeout(() => {
      setCurrentStep(1);
      setQuoteResult(null);
      setErrors({});
      setFormData({
        postcode: '',
        location: '',
        state: '',
        roofType: '',
        budgetRange: '',
        batteryIncluded: false,
        batteryCapacity: '',
        batteryBrand: '',
        customBatteryCapacity: '',
        backupCritical: 'essential',
        batteryUsage: 'self-consumption',
        includeVPP: false,
        includeEVCharging: false,
        includeSmartHome: false,
        includeGridServices: false,
        desiredOffset: 100,
        hasExistingSystem: false,
        existingSystemSize: '',
        panelOrientation: 'north',
        roofTilt: 'optimal',
        shadingLevel: 'none',
        usagePattern: 'spread',
        customRetailRate: '',
        customFeedInRate: '',
        retailer: '',
        tariffPlan: '',
        panelBrand: '',
        includeOptimizers: false,
        includeMicroinverters: false,
        peakDemand: '',
        isThreePhase: false,
        projectPriority: 'reduce_bills',
        additionalArrays: [],
        systemSizeOverride: '',
      });
      setElectricityValue('');
    }, 50);
  };

  useEffect(() => {
    if (!initialData) {
      return;
    }

    const data = initialData as Record<string, unknown>;

    const pickString = (keys: string[], fallback: string): string => {
      for (const key of keys) {
        const value = data[key];
        if (typeof value === 'string') {
          return value;
        }
        if (typeof value === 'number' && !Number.isNaN(value)) {
          return String(value);
        }
      }
      return fallback;
    };

    const pickNumber = (keys: string[], fallback: number): number => {
      for (const key of keys) {
        const value = data[key];
        if (typeof value === 'number' && !Number.isNaN(value)) {
          return value;
        }
        if (typeof value === 'string' && value.trim() !== '') {
          const parsed = Number(value);
          if (!Number.isNaN(parsed)) {
            return parsed;
          }
        }
      }
      return fallback;
    };

    const pickBoolean = (keys: string[], fallback: boolean): boolean => {
      for (const key of keys) {
        const value = data[key];
        if (typeof value === 'boolean') {
          return value;
        }
      }
      return fallback;
    };

    const pickArray = <T,>(key: string, fallback: T[]): T[] => {
      const value = data[key];
      return Array.isArray(value) ? (value as T[]) : fallback;
    };

    setIsPrefilling(true);

  const nextQuoteTypeRaw = pickString(['propertyType', 'quoteType'], 'residential');
    const nextQuoteType = nextQuoteTypeRaw === 'commercial' ? 'commercial' : 'residential';
    setQuoteType((prev) => (prev === nextQuoteType ? prev : nextQuoteType));

    setFormData((prev) => ({
      ...prev,
      postcode: pickString(['postcode', 'propertyPostcode'], prev.postcode),
      location: pickString(['location'], prev.location),
      state: pickString(['state'], prev.state),
      roofType: pickString(['roofType'], prev.roofType),
      budgetRange: pickString(['budgetRange'], prev.budgetRange),
      batteryIncluded: pickBoolean(['batteryIncluded', 'batteryRequired'], prev.batteryIncluded),
      batteryCapacity: pickString(['batteryCapacity'], prev.batteryCapacity),
      batteryBrand: pickString(['batteryBrand'], prev.batteryBrand),
      customBatteryCapacity: pickString(['customBatteryCapacity'], prev.customBatteryCapacity),
      backupCritical: pickString(['backupCritical'], prev.backupCritical),
      batteryUsage: pickString(['batteryUsage'], prev.batteryUsage),
      includeVPP: pickBoolean(['includeVPP'], prev.includeVPP),
      includeEVCharging: pickBoolean(['includeEVCharging'], prev.includeEVCharging),
      includeSmartHome: pickBoolean(['includeSmartHome'], prev.includeSmartHome),
      includeGridServices: pickBoolean(['includeGridServices'], prev.includeGridServices),
      desiredOffset: pickNumber(['desiredOffset'], prev.desiredOffset),
      hasExistingSystem: pickBoolean(['hasExistingSystem'], prev.hasExistingSystem),
      existingSystemSize: pickString(['existingSystemSize'], prev.existingSystemSize),
      panelOrientation: pickString(['panelOrientation'], prev.panelOrientation),
      roofTilt: pickString(['roofTilt'], prev.roofTilt),
      shadingLevel: pickString(['shadingLevel'], prev.shadingLevel),
      usagePattern: pickString(['usagePattern'], prev.usagePattern),
      customRetailRate: pickString(['customRetailRate'], prev.customRetailRate),
      customFeedInRate: pickString(['customFeedInRate'], prev.customFeedInRate),
      retailer: pickString(['retailer'], prev.retailer),
      tariffPlan: pickString(['tariffPlan'], prev.tariffPlan),
      panelBrand: pickString(['panelBrand'], prev.panelBrand),
      includeOptimizers: pickBoolean(['includeOptimizers'], prev.includeOptimizers),
      includeMicroinverters: pickBoolean(['includeMicroinverters'], prev.includeMicroinverters),
      peakDemand: pickString(['peakDemand'], prev.peakDemand),
      isThreePhase: pickBoolean(['isThreePhase'], prev.isThreePhase),
      projectPriority: pickString(['projectPriority'], prev.projectPriority),
      additionalArrays: pickArray('additionalArrays', prev.additionalArrays),
      systemSizeOverride: pickString(['systemSizeOverride'], prev.systemSizeOverride),
    }));

  const usageTypeRaw = pickString(['electricityUsageType'], 'monthly');
    setElectricityUsageType(usageTypeRaw === 'quarterly' ? 'quarterly' : 'monthly');
    setElectricityValue(pickString(['electricityValue'], ''));

    setErrors({});
    setCurrentStep(1);
    setQuoteResult(null);
    setLoading(false);

    const timeoutId = setTimeout(() => setIsPrefilling(false), 0);
    return () => {
      clearTimeout(timeoutId);
      setIsPrefilling(false);
    };
  }, [initialData]);

  useEffect(() => {
    const postcode = formData.postcode;
    if (postcode && postcode.length === 4) {
      fetchSTCZone(postcode).then(z => setStcZoneMultiplier(z)).catch(() => setStcZoneMultiplier(null));
      fetchFeedInRate(formData.state || postcode).then(f => setDefaultFeedIn(f)).catch(() => setDefaultFeedIn(null));
      fetchStateRebates(formData.state).then(r => setStateRebateRules(r)).catch(() => setStateRebateRules(null));
    }
  }, [formData.postcode, formData.state]);
  
  // When quote type changes, reset the entire form to prevent result mismatches
  useEffect(() => {
    if (isPrefilling) {
      return;
    }
    handleStartOver();
  }, [quoteType, isPrefilling]);

  // === Enhanced validation helpers ===
  const validateField = (name: string, value: any): string => {
    switch (name) {
      case 'postcode':
        if (!value) return 'Postcode is required.';
        if (!/^\d{4}$/.test(value)) return 'Postcode must be a 4-digit number.';
        
        const code = parseInt(value, 10);
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
            if (value.startsWith('0') && !value.startsWith('08') && !value.startsWith('09')) {
                return 'Invalid format. Only NT postcodes (08xx) start with 0.';
            }
            return `Postcode ${value} seems to be outside the standard Australian ranges. Please check and re-enter.`;
        }
        return '';
      
      case 'location': 
        return !value ? 'Location is required.' : (value.length < 2 ? 'Location too short.' : '');
      
      case 'state': 
        return !value ? 'State is required.' : '';
      
      case 'electricityValue':
        if (!value) return 'Usage value is required.';
        const numValue = Number(value);
        if (isNaN(numValue) || numValue <= 0) return 'Please enter a valid positive number.';
        
        // Realistic usage validation
        if (electricityUsageType === 'monthly') {
          if (numValue < 50) return 'Monthly bill seems too low. Please check the amount.';
          if (numValue > 2000) return 'Monthly bill seems very high. Please verify.';
        } else if (electricityUsageType === 'quarterly') {
          if (numValue < 150) return 'Quarterly bill seems too low. Please check the amount.';
          if (numValue > 6000) return 'Quarterly bill seems very high. Please verify.';
        }
        return '';
      
      case 'budgetRange': 
        return !value ? 'Budget selection is required.' : '';
      
      case 'roofType': 
        return !value ? 'Roof type is required.' : '';
        
      case 'batteryCapacity':
        if (formData.batteryIncluded && (!value || Number(value) <= 0)) {
          return 'Battery capacity is required when battery is selected.';
        }
        if (value && (Number(value) < 2 || Number(value) > 100)) {
          return 'Battery capacity should be between 2-100 kWh.';
        }
        return '';
        
      case 'systemSizeOverride':
        if (value) {
          const size = Number(value);
          if (isNaN(size) || size <= 0) return 'System size must be a positive number.';
          if (quoteType === 'residential' && size > 30) return 'Residential systems are typically limited to 30kW.';
          if (quoteType === 'commercial' && size > 100) return 'Large commercial systems require special approval.';
        }
        return '';
      
      case 'peakDemand':
        if (quoteType === 'commercial' && value && (isNaN(Number(value)) || Number(value) <= 0)) {
            return 'Peak demand must be a positive number.';
        }
        return '';
        
      case 'existingSystemSize':
        if (formData.hasExistingSystem && (!value || Number(value) <= 0)) {
          return 'Please specify your existing system size.';
        }
        return '';
      
      default: 
        return '';
    }
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setErrors(prev => ({ ...prev, [name]: validateField(name, value) }));
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors(prev => ({ ...prev, [field]: '' }));
  };

  const handleElectricityUsageChange = (type: 'monthly' | 'quarterly', value: string) => {
    setElectricityUsageType(type);
    setElectricityValue(value);
    if (errors.electricityValue) setErrors(prev => ({...prev, electricityValue: ''}));
  };

  const scrollToFirstError = (errorFields: string[]) => {
    if (errorFields.length === 0) return;
    
    const firstErrorField = errorFields[0];
    const fieldElement = document.getElementById(firstErrorField) || 
                        document.querySelector(`[name="${firstErrorField}"]`) as HTMLElement;
    
    if (fieldElement) {
      // Smooth scroll to the field with offset for better visibility
      const yOffset = -100; // Offset to show field below header
      const y = fieldElement.getBoundingClientRect().top + window.pageYOffset + yOffset;
      
      window.scrollTo({ top: y, behavior: 'smooth' });
      
      // Focus the field after a short delay to ensure scroll completes
      setTimeout(() => {
        fieldElement.focus();
        // Add shake animation with red border pulse
        fieldElement.style.animation = 'shake-with-border 0.5s ease-out';
        setTimeout(() => {
          fieldElement.style.animation = '';
        }, 500);
      }, 300);
    }
  };

  const handleNextStep = () => {
    const fieldsToValidate = ['postcode', 'location', 'state'];
    const step1Errors: Record<string, string> = {};
    
    fieldsToValidate.forEach(field => {
        const error = validateField(field, formData[field as keyof typeof formData]);
        if (error) step1Errors[field] = error;
    });

    if (Object.keys(step1Errors).length > 0) {
        setErrors(step1Errors);
        scrollToFirstError(Object.keys(step1Errors));
        return;
    }
    setErrors({});
    setCurrentStep(2);
  };

  const handlePrevStep = () => {
    setErrors({});
    setCurrentStep(1);
  };

  // === Enhanced calculation logic ===
  const calculateLossFactor = () => {
    // Updated orientation factors based on Australian conditions
    const orientationFactors: Record<string, number> = { 
      north: 1.00, northeast: 0.95, northwest: 0.95, 
      east: 0.87, west: 0.87, southeast: 0.82, 
      southwest: 0.82, south: 0.68 
    };
    
    // Updated shading factors
    const shadingFactors: Record<string, number> = { 
      none: 1.00, minimal: 0.95, partial: 0.85, 
      moderate: 0.70, heavy: 0.50 
    };
    
    // Updated tilt factors
    const tiltFactors: Record<string, number> = { 
      flat: 0.92, low: 0.96, optimal: 1.00, steep: 0.94 
    };
    
    const baseSystemLoss = 0.85; // Inverter, wiring, soiling, etc.
    
    return baseSystemLoss * 
           (orientationFactors[formData.panelOrientation] || 1.0) * 
           (shadingFactors[formData.shadingLevel] || 1.0) * 
           (tiltFactors[formData.roofTilt] || 1.0);
  };
  
  const getCostPerKwResidential = (kw: number) => {
    // Updated September 2025 pricing
    if (kw <= 5) return 1300;
    if (kw <= 10) return 1150;
    return 1050;
  };

  const getCostPerKwCommercial = (kw: number) => {
    // Updated September 2025 commercial pricing
    if (kw < 30) return 1100;
    if (kw <= 100) return 950;
    return 850;
  };
  
  // Enhanced battery costing
  const getBatteryCost = (capacity: number, brand: string = '') => {
    const baseCostPerKwh = brand === 'Tesla' ? 1150 : 
                          brand === 'Enphase' ? 1200 : 
                          1000; // Default
    return Math.round(capacity * baseCostPerKwh);
  };

  const recommendedSize = useMemo(() => {
    if (!electricityValue || !formData.postcode) return null;
    let annualKwh = electricityUsageType === 'monthly' ? Number(electricityValue) * 12 : Number(electricityValue) * 4 / 0.30;
    const insolation = getInsolationByPostcode(formData.postcode);
    const lossFactor = 0.78; // Use a static one for initial quick estimate
    const productionPerKwPerYear = insolation * 365 * lossFactor;
    if (productionPerKwPerYear === 0) return null;
    const requiredKw = (annualKwh * (formData.desiredOffset / 100)) / productionPerKwPerYear;
    return Math.round(requiredKw * 10) / 10;
  }, [electricityValue, electricityUsageType, formData.postcode, formData.desiredOffset]);
  
  // Save quote to database for admin tracking
  const saveQuoteToDatabase = async (resultData: any) => {
    try {
      const payload = {
        sessionId,
        quoteType,
        
        // Step 1: Location
        postcode: formData.postcode,
        location: formData.location,
        state: formData.state,
        
        // Step 2: Usage and preferences
        electricityUsageType,
        electricityValue: Number(electricityValue),
        budgetRange: formData.budgetRange,
        roofType: formData.roofType,
        desiredOffset: formData.desiredOffset,
        
        // Advanced options
        usagePattern: formData.usagePattern,
        panelOrientation: formData.panelOrientation,
        roofTilt: formData.roofTilt,
        shadingLevel: formData.shadingLevel,
        hasExistingSystem: formData.hasExistingSystem,
        existingSystemSize: formData.existingSystemSize ? String(formData.existingSystemSize) : null,
        
        // Battery configuration
        batteryIncluded: formData.batteryIncluded,
        batteryCapacity: formData.batteryCapacity ? String(formData.batteryCapacity) : null,
        batteryBrand: formData.batteryBrand || null,
        customBatteryCapacity: formData.customBatteryCapacity || null,
        backupCritical: formData.backupCritical || null,
        batteryUsage: formData.batteryUsage,
        includeVPP: formData.includeVPP,
        
        // Smart features
        includeEVCharging: formData.includeEVCharging,
        includeSmartHome: formData.includeSmartHome,
        includeGridServices: formData.includeGridServices,
        
        // Advanced system options
        panelBrand: formData.panelBrand || null,
        includeOptimizers: formData.includeOptimizers,
        includeMicroinverters: formData.includeMicroinverters,
        
        // Electricity plan
        customRetailRate: formData.customRetailRate ? String(formData.customRetailRate) : null,
        customFeedInRate: formData.customFeedInRate ? String(formData.customFeedInRate) : null,
        retailer: formData.retailer || null,
        tariffPlan: formData.tariffPlan || null,
        
        // Commercial-specific
        peakDemand: formData.peakDemand ? String(formData.peakDemand) : null,
        isThreePhase: formData.isThreePhase,
        projectPriority: formData.projectPriority || null,
        
        // System size override (if user manually specified)
        systemSizeOverride: formData.systemSizeOverride ? String(formData.systemSizeOverride) : null,
        
        // Additional roof arrays (for complex layouts)
        additionalArrays: formData.additionalArrays.length > 0 ? formData.additionalArrays : null,
        
        // Calculated results (stored as JSON)
        results: resultData,
      };
      
      const response = await fetch('/api/instant-quote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Failed to save quote' }));
        throw new Error(errorData.error || `HTTP ${response.status}`);
      }
      
      const savedQuote = await response.json();
      console.log('Quote saved successfully:', savedQuote.id);
      return savedQuote;
    } catch (error) {
      console.error('Error saving quote to database:', error);
      throw error;
    }
  };

  const handleCalculateQuote = async () => {
    const fields = [
        {field: 'electricityValue', value: electricityValue},
        {field: 'budgetRange', value: formData.budgetRange},
        {field: 'roofType', value: formData.roofType},
        {field: 'peakDemand', value: formData.peakDemand},
    ];

    const step2Errors = fields.reduce((acc, {field, value}) => {
        const error = validateField(field, value);
        if (error) acc[field] = error;
        return acc;
    }, {} as Record<string, string>);

    if (Object.keys(step2Errors).length > 0) {
        setErrors(step2Errors);
        scrollToFirstError(Object.keys(step2Errors));
        return;
    }

    setLoading(true);
    setErrors({});
    await new Promise(resolve => setTimeout(resolve, 800));

    try {
      const currentRetailRate = formData.customRetailRate ? Number(formData.customRetailRate) / 100 : 0.30;
      let annualKwh = electricityUsageType === 'monthly' ? Number(electricityValue) * 12 : Number(electricityValue) * 4 / currentRetailRate;
      const currentAnnualBill = electricityUsageType === 'monthly' ? Number(electricityValue) * 12 * currentRetailRate : Number(electricityValue) * 4;

      const insolation = getInsolationByPostcode(formData.postcode);
      const lossFactor = calculateLossFactor();
      const productionPerKwPerYear = insolation * 365 * lossFactor;
      const systemSizeKw = Math.round(((annualKwh * (formData.desiredOffset / 100)) / productionPerKwPerYear) * 10) / 10;

      const { stcValue } = calculateSTCs(systemSizeKw, stcZoneMultiplier ?? 1.382);
      
      const batteryKwhDefault = formData.batteryIncluded ? 10 : 0;
      const batteryCost = formData.batteryIncluded ? Math.round(batteryKwhDefault * 900) : 0;
      const batteryRebate = calculateBatteryRebate(batteryKwhDefault, formData.batteryIncluded);

      let stateRebateVal = 0;
      if (stateRebateRules?.enabled) stateRebateVal = stateRebateRules.amount;
      
      const feedIn = formData.customFeedInRate ? Number(formData.customFeedInRate) / 100 : (defaultFeedIn ?? 0.10);
      const annualProduction = Math.round(systemSizeKw * insolation * 365 * lossFactor);

      // --- Calculation diverges for Commercial vs Residential ---
      let annualSavings, simplePaybackYears, finalOutOfPocket, totalSystemCost, resultData;

      if (quoteType === 'commercial') {
        const avgCostPerKw = getCostPerKwCommercial(systemSizeKw);
        totalSystemCost = Math.round(systemSizeKw * avgCostPerKw) + batteryCost;

        // Simplified commercial savings
        const demandChargeRate = 15; // Placeholder $/kW/month
        const peakDemandValue = Number(formData.peakDemand) || 0;
        const peakDemandReduction = peakDemandValue > 0 ? Math.min(peakDemandValue * 0.4, systemSizeKw) : 0; // Assume solar shaves 40% of peak
        const demandChargeSavings = peakDemandReduction * demandChargeRate * 12;

        const selfConsumption = 0.7; // Higher for commercial
        const selfConsumedKwh = Math.round(annualProduction * selfConsumption);
        const exportedKwh = annualProduction - selfConsumedKwh;
        const energySavings = (selfConsumedKwh * currentRetailRate) + (exportedKwh * feedIn);

        annualSavings = Math.round(energySavings + demandChargeSavings);
        finalOutOfPocket = Math.max(totalSystemCost - stcValue - batteryRebate - stateRebateVal, 0);
        simplePaybackYears = annualSavings > 0 ? Math.round((finalOutOfPocket / annualSavings) * 10) / 10 : null;
        
        resultData = {
          quoteType: 'commercial',
          systemSize: systemSizeKw,
          annualProduction,
          annualSavings,
          demandChargeSavings,
          energySavings,
          currentAnnualBill,
          totalCost: totalSystemCost,
          federalRebate: stcValue,
          batteryRebate,
          stateRebate: stateRebateVal,
          finalPrice: finalOutOfPocket,
          simplePaybackYears,
          disclaimers: [
            'Commercial quotes are highly dependent on load profiles and network tariffs.',
            'Demand charge savings are an estimate. An interval data analysis is required for accuracy.',
            'This estimate does not include potential network upgrade costs.'
          ]
        };

      } else { // Residential
        const avgCostPerKw = getCostPerKwResidential(systemSizeKw);
        totalSystemCost = Math.round(systemSizeKw * avgCostPerKw) + batteryCost;
        
        const consumptionFactors: Record<string, number> = { daytime: 0.7, evening: 0.3, spread: 0.5 };
        const selfConsumption = consumptionFactors[formData.usagePattern] || 0.5;
        const selfConsumedKwh = Math.round(annualProduction * selfConsumption);
        const exportedKwh = annualProduction - selfConsumedKwh;
        
        annualSavings = Math.round((selfConsumedKwh * currentRetailRate) + (exportedKwh * feedIn));
        finalOutOfPocket = Math.max(totalSystemCost - stcValue - batteryRebate - stateRebateVal, 0);
        simplePaybackYears = annualSavings > 0 ? Math.round((finalOutOfPocket / annualSavings) * 10) / 10 : null;

        resultData = {
          quoteType: 'residential',
          systemSize: systemSizeKw,
          annualProduction,
          annualSavings,
          currentAnnualBill,
          totalCost: totalSystemCost,
          federalRebate: stcValue,
          batteryRebate,
          stateRebate: stateRebateVal,
          finalPrice: finalOutOfPocket,
          simplePaybackYears,
          disclaimers: [
            'This is an instant estimate based on user inputs and market averages.',
            'Installer pricing, STC values, and feed-in rates will vary.',
            'A detailed on-site assessment is required for a final, binding quote.'
          ]
        };
      }

      setQuoteResult(resultData);
      // FIX: Include electricityValue and electricityUsageType (separate state variables, not in formData)
      onQuoteCalculated({ 
        ...formData, 
        ...resultData, 
        propertyType: quoteType,
        electricityValue,  // Add electricity input value
        electricityUsageType  // Add billing period type
      });
      
      // Save quote to database (non-blocking)
      console.log('Attempting to save quote to database...');
      saveQuoteToDatabase(resultData).then(saved => {
        console.log('✅ Quote saved successfully:', saved);
      }).catch(err => {
        console.error('❌ Failed to save quote to database:', err);
        console.error('Error details:', err.message || err);
        // Don't block user experience if save fails
      });
      
      setCurrentStep(3);
      
      // Scroll to show result at top of viewport
      setTimeout(() => {
        document.getElementById('calculator-section')?.scrollIntoView({ 
          behavior: 'smooth', 
          block: 'start' 
        });
      }, 100);

    } catch (err) {
      console.error('Quote calculation error:', err);
      setErrors({ general: 'Failed to calculate quote. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => new Intl.NumberFormat('en-AU', { style: 'currency', currency: 'AUD', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(amount);
  
  const budgetOptions = {
    residential: [
        { value:"5000-10000", label:"$5,000 - $10,000" },
        { value:"10000-20000", label:"$10,000 - $20,000" },
        { value:"20000-30000", label:"$20,000 - $30,000" },
        { value:"30000+", label:"$30,000+" },
    ],
    commercial: [
        { value:"20000-50000", label:"$20,000 - $50,000" },
        { value:"50000-100000", label:"$50,000 - $100,000" },
        { value:"100000-250000", label:"$100,000 - $250,000" },
        { value:"250000+", label:"$250,000+" },
    ]
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="max-w-md mx-auto grid grid-cols-2 gap-3 mb-6">
          <button
              type="button"
              onClick={() => setQuoteType('residential')}
              className={`flex items-center space-x-3 p-4 rounded-2xl border transition-colors duration-200 ${
                  quoteType === 'residential'
                  ? 'border-primary/50 bg-background shadow-neu-outset'
                  : 'border-border bg-background shadow-neu-inset hover:shadow-neu-inset-sm'
              }`}
              aria-pressed={quoteType === 'residential'}
          >
              <div className={`p-2 rounded-xl transition-colors ${quoteType === 'residential' ? 'bg-background shadow-neu-inset text-primary' : 'bg-background shadow-neu-inset text-muted-foreground'}`}>
                  <Home className="h-5 w-5" />
              </div>
              <div className="text-left">
                  <span className="text-body-small text-foreground">Residential</span>
                  <span className="block text-caption text-muted-foreground">For your home</span>
              </div>
          </button>
          <button
              type="button"
              onClick={() => setQuoteType('commercial')}
              className={`flex items-center space-x-3 p-4 rounded-2xl border transition-colors duration-200 ${
                  quoteType === 'commercial'
                  ? 'border-primary/50 bg-background shadow-neu-outset'
                  : 'border-border bg-background shadow-neu-inset hover:shadow-neu-inset-sm'
              }`}
              aria-pressed={quoteType === 'commercial'}
          >
              <div className={`p-2 rounded-xl transition-colors ${quoteType === 'commercial' ? 'bg-background shadow-neu-inset text-primary' : 'bg-background shadow-neu-inset text-muted-foreground'}`}>
                  <Building className="h-5 w-5" />
              </div>
              <div className="text-left">
                  <span className="text-body-small text-foreground">Commercial</span>
                  <span className="block text-caption text-muted-foreground">For business</span>
              </div>
          </button>
      </div>
      <div className="flex items-center justify-center mb-8">
        <div className="flex items-center space-x-4">
          {[1, 2, 3].map((step) => (
            <React.Fragment key={step}>
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors
                  ${currentStep === step
                    ? 'theme-light:bg-black theme-light:text-foreground-secondary theme- theme- theme-purple:bg-accent theme-purple:text-accent-foreground'
                    : 'bg-surface text-foreground shadow-neu-inset'}
                  ${currentStep === step ? 'shadow-neu-outset' : ''}
                `}
              >
                {step === 3 && quoteResult ? (
                  <CheckCircle2 className="h-5 w-5" />
                ) : (
                  <span>{step}</span>
                )}
              </div>
              {step < 3 && (
                <div
                  className={`w-12 h-1 rounded-full transition-colors ${
                    currentStep > step
                      ? 'bg-primary shadow-neu-inset-sm'
                      : 'bg-background shadow-neu-inset'
                  }`}
                ></div>
              )}
            </React.Fragment>
          ))}
        </div>
      </div>

      <div className="theme-card p-4 sm:p-8 lg:p-12">
        {currentStep === 1 && (
          <div className="animate-fade-in" role="tabpanel" aria-labelledby="step-1" id="step-1-content">
            <h2 className="text-heading-2 text-foreground mb-6">Step 1: Your Property Details</h2>
            <form noValidate>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="postcode" className="block text-subtle text-label mb-2">
                    <MapPin className="inline h-4 w-4 mr-1" />Postcode *
                    <InfoTooltip text="Your postcode determines solar rebate zones and local weather data for accurate estimates." />
                  </label>
                  <input 
                    id="postcode"
                    type="text" 
                    name="postcode" 
                    value={formData.postcode} 
                    onChange={(e) => handleInputChange('postcode', e.target.value)} 
                    onBlur={handleBlur} 
                    placeholder="e.g., 2000" 
                    className={`w-full rounded-xl border px-4 py-3 text-body bg-surface text-foreground shadow-inner focus:outline-none focus:ring-2 focus:ring-primary ${errors.postcode ? 'border-destructive' : 'border-border'}`}
                    aria-invalid={errors.postcode ? 'true' : 'false'}
                    maxLength={4}
                    aria-required="true"
                    aria-describedby={errors.postcode ? 'postcode-error' : undefined}
                  />
                  {errors.postcode && <p id="postcode-error" className="text-destructive text-caption mt-1" role="alert">{errors.postcode}</p>}
                </div>
                
                <div>
                  <label htmlFor="location" className="block text-subtle text-label mb-2">
                    <MapPin className="inline h-4 w-4 mr-1" />Location (Suburb) *
                  </label>
                  <input 
                    id="location"
                    type="text" 
                    name="location" 
                    value={formData.location} 
                    onChange={(e) => handleInputChange('location', e.target.value)} 
                    onBlur={handleBlur} 
                    placeholder="e.g., Sydney" 
                    className={`w-full rounded-xl border px-4 py-3 text-body bg-surface text-foreground shadow-inner focus:outline-none focus:ring-2 focus:ring-primary ${errors.location ? 'border-destructive' : 'border-border'}`}
                    aria-required="true"
                    aria-describedby={errors.location ? 'location-error' : undefined}
                  />
                  {errors.location && <p id="location-error" className="text-destructive text-caption mt-1" role="alert">{errors.location}</p>}
                </div>
                
                <div>
                  <label htmlFor="state" className="block text-subtle text-label mb-2">
                    State *
                    <InfoTooltip text="Different states have varying solar rebates, feed-in tariffs, and weather conditions." />
                  </label>
                  <select 
                    id="state"
                    name="state" 
                    value={formData.state} 
                    onChange={(e) => handleInputChange('state', e.target.value)} 
                    onBlur={handleBlur} 
                    className={`form-select w-full ${errors.state ? 'border-destructive' : ''}`}
                    aria-required="true"
                    aria-describedby={errors.state ? 'state-error' : undefined}
                  >
                    <option value="">Select your state</option>
                    <option value="NSW">New South Wales</option>
                    <option value="VIC">Victoria</option>
                    <option value="QLD">Queensland</option>
                    <option value="WA">Western Australia</option>
                    <option value="SA">South Australia</option>
                    <option value="TAS">Tasmania</option>
                    <option value="ACT">Australian Capital Territory</option>
                    <option value="NT">Northern Territory</option>
                  </select>
                  {errors.state && <p id="state-error" className="text-destructive text-caption mt-1" role="alert">{errors.state}</p>}
                </div>
                
                <div>
                  <label htmlFor="retailer" className="block text-subtle text-label mb-2">
                    Electricity Retailer (Optional)
                    <InfoTooltip text="Knowing your retailer helps provide more accurate tariff estimates." />
                  </label>
                  <select 
                    id="retailer"
                    name="retailer" 
                    value={formData.retailer} 
                    onChange={(e) => handleInputChange('retailer', e.target.value)} 
                    className="form-select w-full"
                  >
                    <option value="">Select retailer (optional)</option>
                    <option value="origin">Origin Energy</option>
                    <option value="agl">AGL Energy</option>
                    <option value="energyaustralia">Energy Australia</option>
                    <option value="red">Red Energy</option>
                    <option value="alinta">Alinta Energy</option>
                    <option value="ergon">Ergon Energy (QLD)</option>
                    <option value="synergy">Synergy (WA)</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                
                <div className="md:col-span-2">
                  <fieldset className="p-4 bg-surface/30 rounded-xl">
                    <legend className="sr-only">Existing solar system</legend>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-foreground">Do you already have solar panels?</p>
                        <p className="text-subtle text-body-small mt-1">We&apos;ll factor this into your quote calculations</p>
                      </div>
                      <button 
                        type="button"
                        onClick={() => handleInputChange('hasExistingSystem', !formData.hasExistingSystem)} 
                        className={`toggle-switch toggle-switch-md ${formData.hasExistingSystem ? 'toggle-switch-on' : 'toggle-switch-off'}`}
                        aria-pressed={formData.hasExistingSystem}
                        aria-describedby="existing-system-description"
                      >
                        <span className={`toggle-knob toggle-knob-md ${formData.hasExistingSystem ? 'toggle-knob-on-md' : 'toggle-knob-off-md'}`}/>
                      </button>
                    </div>
                  </fieldset>
                  
                  {formData.hasExistingSystem && (
                    <div className="mt-4 animate-fade-in">
                      <label htmlFor="existingSystemSize" className="block text-subtle text-label mb-2">
                        Existing System Size (kW) *
                      </label>
                      <input 
                        id="existingSystemSize"
                        type="number" 
                        name="existingSystemSize" 
                        value={formData.existingSystemSize} 
                        onChange={(e) => handleInputChange('existingSystemSize', e.target.value)}
                        onBlur={handleBlur}
                        placeholder="e.g., 5.5" 
                        step="0.5"
                        min="0.5"
                        max="100"
                        className={`form-select w-full ${errors.existingSystemSize ? 'border-destructive' : ''}`}
                        aria-required={formData.hasExistingSystem}
                        aria-describedby={errors.existingSystemSize ? 'existing-size-error' : undefined}
                      />
                      {errors.existingSystemSize && <p id="existing-size-error" className="text-destructive text-caption mt-1" role="alert">{errors.existingSystemSize}</p>}
                    </div>
                  )}
                </div>
              </div>
            </form>
            
            <div className="flex justify-end mt-8">
              <Button
                variant="secondary"
                onClick={handleNextStep}
              >
                <span>Next Step</span><ArrowRight className="h-5 w-5" />
              </Button>
            </div>
          </div>
        )}

        {currentStep === 2 && (
          <div className="animate-fade-in">
            <h2 className="text-heading-2 text-foreground mb-6">Step 2: Energy & System Details</h2>
            <div className="space-y-6">
              {/* Enhanced Energy Usage */}
              <fieldset>
                <legend className="block text-subtle text-label mb-4">
                  <Zap />How would you like to tell us about your electricity usage? *
                  <InfoTooltip text="We can calculate your system size from either your bill amount or kWh usage. Choose what's easier for you." />
                </legend>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className={`step-2-option p-4 rounded-xl border-2 cursor-pointer transition-colors focus-within:ring-2 focus-within:ring-primary ${electricityUsageType === 'monthly' && electricityValue.includes('kwh') ? 'selected border-primary bg-primary/10' : 'border-border bg-surface/20 hover:border-muted'}`}>
                    <label className="cursor-pointer">
                      <div className="flex items-center space-x-3">
                        <input 
                          type="radio" 
                          name="usageType" 
                          value="monthly-kwh"
                          checked={electricityUsageType === 'monthly'}
                          onChange={() => setElectricityUsageType('monthly')}
                          className="sr-only"
                        />
                        <div className={`w-4 h-4 rounded-full border-2 flex-shrink-0 ${electricityUsageType === 'monthly' ? 'border-primary bg-primary' : 'border-muted'}`}></div>
                        <div>
                          <p className="text-foreground">Monthly kWh</p>
                          <p className="text-subtle text-body-small">From your electricity bill</p>
                        </div>
                      </div>
                      {electricityUsageType === 'monthly' && (
                        <input 
                          type="number" 
                          name="electricityValue" 
                          value={electricityValue} 
                          onChange={(e) => handleElectricityUsageChange('monthly', e.target.value)} 
                          onBlur={handleBlur} 
                          placeholder="e.g., 800" 
                          min="50"
                          max="5000"
                          className={`form-select w-full mt-3 ${errors.electricityValue ? 'border-destructive' : ''}`}
                          aria-describedby="monthly-kwh-help"
                        />
                      )}
                    </label>
                    <p id="monthly-kwh-help" className="text-caption text-subtle mt-1">Typical range: 200-2000 kWh</p>
                  </div>
                  
                  <div className={`step-2-option p-4 rounded-xl border-2 cursor-pointer transition-colors focus-within:ring-2 focus-within:ring-primary ${electricityUsageType === 'quarterly' ? 'selected border-primary bg-primary/10' : 'border-border bg-surface/20 hover:border-muted'}`}>
                    <label className="cursor-pointer">
                      <div className="flex items-center space-x-3">
                        <input 
                          type="radio" 
                          name="usageType" 
                          value="quarterly-bill"
                          checked={electricityUsageType === 'quarterly'}
                          onChange={() => setElectricityUsageType('quarterly')}
                          className="sr-only"
                        />
                        <div className={`w-4 h-4 rounded-full border-2 flex-shrink-0 ${electricityUsageType === 'quarterly' ? 'border-primary bg-primary' : 'border-muted'}`}></div>
                        <div>
                          <p className="text-foreground">Quarterly Bill ($)</p>
                          <p className="text-subtle text-body-small">Total amount you pay</p>
                        </div>
                      </div>
                      {electricityUsageType === 'quarterly' && (
                        <input 
                          type="number" 
                          name="electricityValue" 
                          value={electricityValue} 
                          onChange={(e) => handleElectricityUsageChange('quarterly', e.target.value)} 
                          onBlur={handleBlur} 
                          placeholder="e.g., 600" 
                          min="150"
                          max="6000"
                          className={`form-select w-full mt-3 ${errors.electricityValue ? 'border-destructive' : ''}`}
                          aria-describedby="quarterly-bill-help"
                        />
                      )}
                    </label>
                    <p id="quarterly-bill-help" className="text-caption text-subtle mt-1">Typical range: $300-$2000</p>
                  </div>
                  
                  <div className="p-4 rounded-xl border-2 border-dashed border-border bg-surface/50">
                    <div className="text-center">
                      <p className="text-subtle text-body-small">Don&apos;t have your bill?</p>
                      <p className="text-caption text-muted-foreground mt-1">We&apos;ll use average household usage for your area</p>
                    </div>
                  </div>
                </div>
                
                {errors.electricityValue && <p className="text-destructive text-caption mt-2" role="alert">{errors.electricityValue}</p>}
                
                {recommendedSize && (
                  <div className="mt-4 p-3 bg-primary/10 border border-primary/30 rounded-lg">
                    <p className="text-body-small text-primary text-center">
                      <strong>📊 Recommended System Size: {recommendedSize} kW</strong>
                      <br />
                      <span className="text-caption">Based on your usage and {formData.desiredOffset}% offset target</span>
                    </p>
                  </div>
                )}
                
                {/* System Size Override */}
                <div className="mt-4">
                  <label htmlFor="systemSizeOverride" className="block text-subtle text-label mb-2">
                    Override System Size (Optional)
                    <InfoTooltip text="Specify a custom system size if you have specific requirements or roof limitations." />
                  </label>
                  <input 
                    id="systemSizeOverride"
                    type="number" 
                    name="systemSizeOverride" 
                    value={formData.systemSizeOverride} 
                    onChange={(e) => handleInputChange('systemSizeOverride', e.target.value)}
                    onBlur={handleBlur}
                    placeholder="e.g., 6.6" 
                    step="0.1"
                    min="1"
                    max={quoteType === 'residential' ? '30' : '100'}
                    className={`form-select w-full ${errors.systemSizeOverride ? 'border-destructive' : ''}`}
                    aria-describedby={errors.systemSizeOverride ? 'system-override-error' : 'system-override-help'}
                  />
                  {errors.systemSizeOverride && <p id="system-override-error" className="text-destructive text-caption mt-1" role="alert">{errors.systemSizeOverride}</p>}
                  <p id="system-override-help" className="text-caption text-subtle mt-1">Leave blank to use our recommendation</p>
                </div>
                
                {/* Desired Offset Slider */}
                <div className="mt-4">
                  <label htmlFor="desiredOffset" className="block text-subtle text-label mb-2">
                    Electricity Bill Offset Target: {formData.desiredOffset}%
                    <InfoTooltip text="How much of your electricity bill do you want to offset with solar? 100% means zero electricity bills." />
                  </label>
                  <div className="px-3">
                    <input 
                      id="desiredOffset"
                      type="range" 
                      min="25" 
                      max="150" 
                      step="5"
                      value={formData.desiredOffset} 
                      onChange={(e) => handleInputChange('desiredOffset', Number(e.target.value))}
                      className="slider-track slider"
                    />
                    <div className="flex justify-between text-caption text-subtle mt-1">
                      <span>25% (Reduce bills)</span>
                      <span>100% (Zero bills)</span>
                      <span>150% (Export income)</span>
                    </div>
                  </div>
                </div>
              </fieldset>

              {/* Commercial Specific Inputs */}
              {quoteType === 'commercial' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6 border-t border-border">
                    <div><label className="block text-subtle text-label mb-2">Peak Demand (kW)</label><input type="number" name="peakDemand" value={formData.peakDemand} onChange={(e) => handleInputChange('peakDemand', e.target.value)} onBlur={handleBlur} placeholder="e.g. 50" className={`form-select w-full ${errors.peakDemand ? 'border-destructive' : ''}`}/>{errors.peakDemand && <p className="text-destructive text-caption mt-1">{errors.peakDemand}</p>}</div>
                    <div><label className="block text-subtle text-label mb-2">Project Priority</label><select name="projectPriority" value={formData.projectPriority} onChange={(e) => handleInputChange('projectPriority', e.target.value)} className="form-select w-full"><option value="reduce_bills">Reduce Energy Bills</option><option value="reduce_demand">Reduce Demand Charges</option><option value="max_roi">Maximize ROI</option></select></div>
                    <div className="info-section md:col-span-2 flex items-center justify-between"><p className="text-foreground">Is it a three-phase power supply?</p><button onClick={() => handleInputChange('isThreePhase', !formData.isThreePhase)} className={`toggle-switch toggle-switch-md ${formData.isThreePhase ? 'toggle-switch-on' : 'toggle-switch-off'}`}><span className={`toggle-knob toggle-knob-md ${formData.isThreePhase ? 'toggle-knob-on-md' : 'toggle-knob-off-md'}`}/></button></div>
                </div>
              )}

              {/* Enhanced Roof Configuration */}
              <fieldset className="pt-6 border-t border-border">
                <legend className="text-heading-4 text-foreground mb-4">
                  🏠 Roof & System Configuration
                </legend>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="panelOrientation" className="block text-subtle text-label mb-2">
                      Panel Orientation *
                      <InfoTooltip text="North-facing panels generate the most electricity in Australia. Other orientations are still viable." />
                    </label>
                    <select 
                      id="panelOrientation"
                      name="panelOrientation" 
                      value={formData.panelOrientation} 
                      onChange={(e) => handleInputChange('panelOrientation', e.target.value)} 
                      className="form-select w-full"
                      aria-describedby="orientation-help"
                    >
                      <option value="north">🧭 North (Best - 100%)</option>
                      <option value="northeast">🧭 Northeast (95%)</option>
                      <option value="northwest">🧭 Northwest (95%)</option>
                      <option value="east">🧭 East (87%)</option>
                      <option value="west">🧭 West (87%)</option>
                      <option value="southeast">🧭 Southeast (82%)</option>
                      <option value="southwest">🧭 Southwest (82%)</option>
                      <option value="south">🧭 South (68%)</option>
                    </select>
                    <p id="orientation-help" className="text-caption text-subtle mt-1">Percentages show relative performance vs. north-facing</p>
                  </div>
                  
                  <div>
                    <label htmlFor="roofTilt" className="block text-subtle text-label mb-2">
                      Roof Tilt *
                      <InfoTooltip text="Optimal tilt is usually 20-35° in Australia. Flat roofs can use tilt frames." />
                    </label>
                    <select 
                      id="roofTilt"
                      name="roofTilt" 
                      value={formData.roofTilt} 
                      onChange={(e) => handleInputChange('roofTilt', e.target.value)} 
                      className="form-select w-full"
                    >
                      <option value="flat">📐 Flat (0-10° - 92%)</option>
                      <option value="low">📐 Low Pitch (10-20° - 96%)</option>
                      <option value="optimal">📐 Optimal (20-35° - 100%)</option>
                      <option value="steep">📐 Steep (35°+ - 94%)</option>
                    </select>
                  </div>
                  
                  <div>
                    <label htmlFor="shadingLevel" className="block text-subtle text-label mb-2">
                      Shading Level *
                      <InfoTooltip text="Even partial shading can significantly impact solar performance. Consider power optimizers for shaded areas." />
                    </label>
                    <select 
                      id="shadingLevel"
                      name="shadingLevel" 
                      value={formData.shadingLevel} 
                      onChange={(e) => handleInputChange('shadingLevel', e.target.value)} 
                      className="form-select w-full"
                    >
                      <option value="none">☀️ No Shade (100%)</option>
                      <option value="minimal">🌤️ Minimal Shade (&lt;10% - 95%)</option>
                      <option value="partial">⛅ Partial Shade (10-25% - 85%)</option>
                      <option value="moderate">🌥️ Moderate Shade (25-50% - 70%)</option>
                      <option value="heavy">☁️ Heavy Shade (50%+ - 50%)</option>
                    </select>
                  </div>
                  
                  <div>
                    <label htmlFor="roofType" className="block text-subtle text-label mb-2">
                      Roof Material *
                      <InfoTooltip text="Different roof materials affect installation cost and method. Tile roofs typically cost more to install." />
                    </label>
                    <select 
                      id="roofType"
                      name="roofType" 
                      value={formData.roofType} 
                      onChange={(e) => handleInputChange('roofType', e.target.value)} 
                      onBlur={handleBlur} 
                      className={`form-select w-full ${errors.roofType ? 'border-destructive' : ''}`}
                      aria-required="true"
                      aria-describedby={errors.roofType ? 'roof-type-error' : undefined}
                    >
                      <option value="">Select roof material</option>
                      <option value="tile">🏠 Concrete/Clay Tiles</option>
                      <option value="metal">🏭 Metal/Tin (Colorbond)</option>
                      <option value="flat">🏢 Flat Roof (Membrane)</option>
                      <option value="slate">🏛️ Slate</option>
                      <option value="other">❓ Other</option>
                    </select>
                    {errors.roofType && <p id="roof-type-error" className="text-destructive text-caption mt-1" role="alert">{errors.roofType}</p>}
                  </div>
                  
                  {/* Panel Brand Preference */}
                  <div>
                    <label htmlFor="panelBrand" className="block text-subtle text-label mb-2">
                      Panel Brand Preference (Optional)
                      <InfoTooltip text="Premium brands like Sunpower and LG offer higher efficiency but cost more. Good value brands include Trina and JA Solar." />
                    </label>
                    <select 
                      id="panelBrand"
                      name="panelBrand" 
                      value={formData.panelBrand} 
                      onChange={(e) => handleInputChange('panelBrand', e.target.value)} 
                      className="form-select w-full"
                    >
                      <option value="">No preference</option>
                      <option value="tier1">🥇 Tier 1 Brands (Premium)</option>
                      <option value="sunpower">☀️ SunPower (Premium)</option>
                      <option value="lg">🔋 LG (Premium)</option>
                      <option value="trina">⚡ Trina Solar (Value)</option>
                      <option value="ja-solar">🌟 JA Solar (Value)</option>
                      <option value="jinko">💫 Jinko Solar (Value)</option>
                      <option value="canadian">🍁 Canadian Solar (Value)</option>
                    </select>
                  </div>
                  
                  {quoteType === 'residential' && (
                    <div>
                      <label htmlFor="usagePattern" className="block text-subtle text-label mb-2">
                        Energy Usage Pattern *
                        <InfoTooltip text="When you use most electricity affects self-consumption and battery sizing recommendations." />
                      </label>
                      <select 
                        id="usagePattern"
                        name="usagePattern" 
                        value={formData.usagePattern} 
                        onChange={(e) => handleInputChange('usagePattern', e.target.value)} 
                        className="form-select w-full"
                      >
                        <option value="spread">⏰ Evenly Spread (Day & Night)</option>
                        <option value="daytime">🌅 Mainly Daytime (Business Hours)</option>
                        <option value="evening">🌃 Mainly Evenings/Weekends</option>
                        <option value="night">🌙 Mainly Overnight (Shift Workers)</option>
                      </select>
                    </div>
                  )}
                </div>
                
                {/* Advanced Options */}
                <div className="info-section mt-6">
                  <h4 className="text-label text-foreground mb-3">
                    🔧 Advanced System Options
                  </h4>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <label className="text-foreground">Power Optimizers</label>
                        <p className="text-caption text-subtle">Maximize output in shading</p>
                      </div>
                      <button 
                        type="button"
                        onClick={() => handleInputChange('includeOptimizers', !formData.includeOptimizers)} 
                        className={`toggle-switch toggle-switch-sm ${formData.includeOptimizers ? 'toggle-switch-on' : 'toggle-switch-off'}`}
                        aria-pressed={formData.includeOptimizers}
                      >
                        <span className={`toggle-knob toggle-knob-sm ${formData.includeOptimizers ? 'toggle-knob-on-sm' : 'toggle-knob-off-sm'}`}/>
                      </button>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <label className="text-foreground">Microinverters</label>
                        <p className="text-caption text-subtle">Panel-level monitoring</p>
                      </div>
                      <button 
                        type="button"
                        onClick={() => handleInputChange('includeMicroinverters', !formData.includeMicroinverters)} 
                        className={`toggle-switch toggle-switch-sm ${formData.includeMicroinverters ? 'toggle-switch-on' : 'toggle-switch-off'}`}
                        aria-pressed={formData.includeMicroinverters}
                      >
                        <span className={`toggle-knob toggle-knob-sm ${formData.includeMicroinverters ? 'toggle-knob-on-sm' : 'toggle-knob-off-sm'}`}/>
                      </button>
                    </div>
                  </div>
                </div>
              </fieldset>
              
              {/* Enhanced Budget & Tariff Section */}
              <fieldset className="pt-6 border-t border-border">
                <legend className="text-heading-4 text-foreground mb-4">
                  💰 Budget & Electricity Tariff
                </legend>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="budgetRange" className="block text-subtle text-label mb-2">
                      Budget Range *
                      <InfoTooltip text="This helps us recommend appropriate system sizes and component quality levels." />
                    </label>
                    <select 
                      id="budgetRange"
                      name="budgetRange" 
                      value={formData.budgetRange} 
                      onChange={(e) => handleInputChange('budgetRange', e.target.value)} 
                      onBlur={handleBlur} 
                      className={`form-select w-full ${errors.budgetRange ? 'border-destructive' : ''}`}
                      aria-required="true"
                      aria-describedby={errors.budgetRange ? 'budget-error' : undefined}
                    >
                      <option value="">Select your budget range</option>
                      {budgetOptions[quoteType].map(opt => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                      ))}
                      <option value="no-limit">💎 Budget not a concern</option>
                    </select>
                    {errors.budgetRange && <p id="budget-error" className="text-destructive text-caption mt-1" role="alert">{errors.budgetRange}</p>}
                  </div>
                  
                  <div>
                    <label htmlFor="tariffPlan" className="block text-subtle text-label mb-2">
                      Tariff Plan (Optional)
                      <InfoTooltip text="Your tariff type affects savings calculations. Time-of-use tariffs can benefit from battery storage." />
                    </label>
                    <select 
                      id="tariffPlan"
                      name="tariffPlan" 
                      value={formData.tariffPlan} 
                      onChange={(e) => handleInputChange('tariffPlan', e.target.value)} 
                      className="form-select w-full"
                    >
                      <option value="">Select tariff type</option>
                      <option value="flat">📊 Flat Rate (Single rate all day)</option>
                      <option value="tou">⏰ Time of Use (Peak/Off-peak)</option>
                      <option value="demand">⚡ Demand Tariff (Peak demand charges)</option>
                      <option value="controlled">🔌 Controlled Load (Hot water)</option>
                    </select>
                  </div>
                  
                  <div>
                    <label htmlFor="customRetailRate" className="block text-subtle text-label mb-2">
                      Your Electricity Rate (c/kWh)
                      <InfoTooltip text="Found on your electricity bill. Typical rates: NSW 28-35c, VIC 25-30c, QLD 25-30c, SA 35-45c." />
                    </label>
                    <input 
                      id="customRetailRate"
                      type="number" 
                      name="customRetailRate" 
                      value={formData.customRetailRate} 
                      onChange={(e) => handleInputChange('customRetailRate', e.target.value)} 
                      placeholder="e.g., 32.5" 
                      min="15"
                      max="60"
                      step="0.1"
                      className="form-select w-full"
                      aria-describedby="retail-rate-help"
                    />
                    <p id="retail-rate-help" className="text-caption text-subtle mt-1">Leave blank to use state average</p>
                  </div>
                  
                  <div>
                    <label htmlFor="customFeedInRate" className="block text-subtle text-label mb-2">
                      Feed-in Tariff (c/kWh)
                      <InfoTooltip text="What you're paid for excess solar exported to the grid. Varies by retailer and state." />
                    </label>
                    <input 
                      id="customFeedInRate"
                      type="number" 
                      name="customFeedInRate" 
                      value={formData.customFeedInRate} 
                      onChange={(e) => handleInputChange('customFeedInRate', e.target.value)} 
                      placeholder="e.g., 8.5" 
                      min="0"
                      max="25"
                      step="0.1"
                      className="form-select w-full"
                      aria-describedby="feed-in-help"
                    />
                    <p id="feed-in-help" className="text-caption text-subtle mt-1">Typical range: 6-12c/kWh</p>
                  </div>
                </div>
              </fieldset>

              {/* Enhanced Battery Configuration */}
              <fieldset className="pt-6 border-t border-border">
                <legend className="text-heading-4 text-foreground mb-4">
                  🔋 Battery Storage Options
                </legend>
                
                <div className="info-section flex items-center justify-between mb-6">
                  <div className="flex items-center space-x-3">
                    <Battery className="h-5 w-5 text-primary" />
                    <div>
                      <p className="text-foreground">Include Battery Storage</p>
                      <p className="text-subtle text-body-small">Up to $3,000 rebate available • Reduce bills by 70-90%</p>
                    </div>
                  </div>
                  <button 
                    type="button"
                    onClick={() => handleInputChange('batteryIncluded', !formData.batteryIncluded)} 
                    className={`toggle-switch toggle-switch-md ${formData.batteryIncluded ? 'toggle-switch-on' : 'toggle-switch-off'}`}
                    aria-pressed={formData.batteryIncluded}
                    aria-describedby="battery-toggle-help"
                  >
                    <span className={`toggle-knob toggle-knob-md ${formData.batteryIncluded ? 'toggle-knob-on-md' : 'toggle-knob-off-md'}`}/>
                  </button>
                </div>
                
                {formData.batteryIncluded && (
                  <div className="space-y-6 animate-fade-in">
                    <div className="info-section mb-6">
                      <div className="flex items-start gap-3">
                        <div className="text-info text-heading-3">💡</div>
                        <div>
                          <h4 className="text-foreground mb-1">Battery Sizing Guide</h4>
                          <p className="text-body-small text-subtle">
                            A good rule of thumb: battery capacity (kWh) should be 50-80% of your daily usage. 
                            Most Australian homes use 15-25 kWh per day.
                          </p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      <div>
                        <label htmlFor="batteryCapacity" className="block text-subtle text-label mb-2">
                          Battery Capacity *
                          <InfoTooltip text="Battery capacity determines how much energy you can store. Larger batteries provide more backup power and energy independence." />
                        </label>
                        <select 
                          id="batteryCapacity"
                          name="batteryCapacity" 
                          value={formData.batteryCapacity} 
                          onChange={(e) => handleInputChange('batteryCapacity', e.target.value)} 
                          className="form-select w-full"
                        >
                          <option value="">Select capacity</option>
                          <option value="5">🔋 5 kWh (Small - Emergency backup)</option>
                          <option value="7">🔋 7 kWh (Small-Medium)</option>
                          <option value="10">🔋 10 kWh (Medium - Popular choice)</option>
                          <option value="13.5">🔋 13.5 kWh (Large - Tesla Powerwall 2)</option>
                          <option value="16">🔋 16 kWh (Large)</option>
                          <option value="20">🔋 20 kWh (Extra Large)</option>
                          <option value="custom">⚙️ Custom Size</option>
                        </select>
                        
                        {formData.batteryCapacity === 'custom' && (
                          <input 
                            type="number" 
                            placeholder="Enter capacity in kWh" 
                            className={`form-select w-full mt-2`}
                            min="3"
                            max="100"
                            step="0.5"
                            onChange={(e) => handleInputChange('customBatteryCapacity', e.target.value)}
                          />
                        )}
                      </div>
                      
                      <div>
                        <label htmlFor="batteryBrand" className="block text-subtle text-label mb-2">
                          Battery Brand Preference
                          <InfoTooltip text="Different brands offer varying warranties, features, and pricing. Tesla and LG are premium options." />
                        </label>
                        <select 
                          id="batteryBrand"
                          name="batteryBrand" 
                          value={formData.batteryBrand} 
                          onChange={(e) => handleInputChange('batteryBrand', e.target.value)} 
                          className="form-select w-full"
                        >
                          <option value="">No brand preference</option>
                          <option value="tesla">🚗 Tesla Powerwall (Premium)</option>
                          <option value="enphase">⚡ Enphase IQ (Modular)</option>
                          <option value="lg">🔋 LG Chem RESU (Popular)</option>
                          <option value="byd">🏭 BYD Battery-Box (Value)</option>
                          <option value="alpha">🔧 Alpha ESS (Australian)</option>
                          <option value="fronius">☀️ Fronius Solar Battery</option>
                          <option value="sungrow">🌟 Sungrow SBR</option>
                          <option value="pylontech">⚡ Pylontech (Value)</option>
                        </select>
                      </div>
                      
                      <div>
                        <label htmlFor="backupCritical" className="block text-subtle text-label mb-2">
                          Backup Power Priority
                          <InfoTooltip text="What's most important to keep running during outages? This affects battery and inverter specifications." />
                        </label>
                        <select 
                          id="backupCritical"
                          name="backupCritical" 
                          value={formData.backupCritical} 
                          onChange={(e) => handleInputChange('backupCritical', e.target.value)} 
                          className="form-select w-full"
                        >
                          <option value="essential">🏠 Essential circuits only (lights, fridge)</option>
                          <option value="partial">🔌 Partial home backup</option>
                          <option value="whole">🏡 Whole home backup</option>
                          <option value="none">❌ No backup requirements</option>
                        </select>
                      </div>
                      
                      <div>
                        <label htmlFor="batteryUsage" className="block text-subtle text-label mb-2">
                          Primary Battery Purpose
                          <InfoTooltip text="Different purposes optimize battery sizing and configuration differently." />
                        </label>
                        <select 
                          id="batteryUsage"
                          name="batteryUsage" 
                          value={formData.batteryUsage} 
                          onChange={(e) => handleInputChange('batteryUsage', e.target.value)} 
                          className="form-select w-full"
                        >
                          <option value="self-consumption">🏠 Maximize self-consumption</option>
                          <option value="backup">⚡ Emergency backup power</option>
                          <option value="arbitrage">📈 Peak shaving / Time shifting</option>
                          <option value="independence">🌍 Energy independence</option>
                        </select>
                      </div>
                    </div>
                    
                    {/* Battery Features */}
                    <div className="p-4 bg-background shadow-neu-inset rounded-2xl border border-border">
                      <h4 className="text-label text-foreground mb-3">
                        🔧 Advanced Battery Features
                      </h4>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <label className="text-foreground">Virtual Power Plant (VPP)</label>
                            <p className="text-caption text-subtle">Earn money by sharing battery capacity</p>
                          </div>
                          <button 
                            type="button"
                            onClick={() => handleInputChange('includeVPP', !formData.includeVPP)} 
                            className={`toggle-switch toggle-switch-sm ${formData.includeVPP ? 'toggle-switch-on' : 'toggle-switch-off'}`}
                            aria-pressed={formData.includeVPP}
                          >
                            <span className={`toggle-knob toggle-knob-sm ${formData.includeVPP ? 'toggle-knob-on-sm' : 'toggle-knob-off-sm'}`}/>
                          </button>
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <div>
                            <label className="text-foreground">EV Charging Integration</label>
                            <p className="text-caption text-muted-foreground">Optimize for electric vehicle charging</p>
                          </div>
                          <button 
                            type="button"
                            onClick={() => handleInputChange('includeEVCharging', !formData.includeEVCharging)} 
                            className={`toggle-switch toggle-switch-sm ${formData.includeEVCharging ? 'toggle-switch-on' : 'toggle-switch-off'}`}
                            aria-pressed={formData.includeEVCharging}
                          >
                            <span className={`toggle-knob toggle-knob-sm ${formData.includeEVCharging ? 'toggle-knob-on-sm' : 'toggle-knob-off-sm'}`}/>
                          </button>
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <div>
                            <label className="text-foreground">Smart Home Integration</label>
                            <p className="text-caption text-muted-foreground">Connect with smart home systems</p>
                          </div>
                          <button 
                            type="button"
                            onClick={() => handleInputChange('includeSmartHome', !formData.includeSmartHome)} 
                            className={`toggle-switch toggle-switch-sm ${formData.includeSmartHome ? 'toggle-switch-on' : 'toggle-switch-off'}`}
                            aria-pressed={formData.includeSmartHome}
                          >
                            <span className={`toggle-knob toggle-knob-sm ${formData.includeSmartHome ? 'toggle-knob-on-sm' : 'toggle-knob-off-sm'}`}/>
                          </button>
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <div>
                            <label className="text-foreground">Grid Services Revenue</label>
                            <p className="text-caption text-muted-foreground">FCAS and grid stabilization earnings</p>
                          </div>
                          <button 
                            type="button"
                            onClick={() => handleInputChange('includeGridServices', !formData.includeGridServices)} 
                            className={`toggle-switch toggle-switch-sm ${formData.includeGridServices ? 'toggle-switch-on' : 'toggle-switch-off'}`}
                            aria-pressed={formData.includeGridServices}
                          >
                            <span className={`toggle-knob toggle-knob-sm ${formData.includeGridServices ? 'toggle-knob-on-sm' : 'toggle-knob-off-sm'}`}/>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </fieldset>
            </div>
            {errors.general && (<div className="mt-6 bg-destructive/10 shadow-neu-inset border border-destructive/30 rounded-2xl p-4 flex items-center space-x-3"><AlertCircle /><p className="text-destructive text-body-small">{errors.general}</p></div>)}
            {/* Migrated: buttons → shadcn Button - only default and secondary variants */}
            <div className="flex justify-between mt-8">
              <Button onClick={handlePrevStep} variant="secondary">
                <ArrowLeft /><span>Back</span>
              </Button>
              <Button onClick={handleCalculateQuote} disabled={loading} variant="primary">
                {loading ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    <span>Calculating...</span>
                  </>
                ) : (
                  <>
                    <Calculator />
                    <span>Get My Quote</span>
                  </>
                )}
              </Button>
            </div>
          </div>
        )}

        {currentStep === 3 && quoteResult && (
          <div className="animate-slide-in-top">
            <div className="text-center mb-8">
              <div className="icon-container mx-auto mb-4">
                <CheckCircle2 className="h-6 w-6" />
              </div>
              <h2 className="text-heading-2 text-foreground mb-2">
                Your Instant {quoteType === 'commercial' ? 'Commercial' : 'Residential'} Solar Quote
              </h2>
              <p className="text-foreground-subtle">An estimate based on your provided details</p>
            </div>
            
            {/* Informational banner for homeowners with existing quotes */}
            {hideSubmitButton && (
              <div className="info-section mb-6">
                <div className="flex items-start space-x-3">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5 text-info mt-0.5 flex-shrink-0">
                    <circle cx="12" cy="12" r="10" />
                    <path d="M12 16v-4" />
                    <path d="M12 8h.01" />
                  </svg>
                  <div>
                    <h4 className="text-foreground mb-1">Viewing Mode</h4>
                    <p className="text-body-small text-subtle">You already have an active quote request. You can view instant quote estimates here, but cannot submit new requests at this time. Check your dashboard to manage your existing quotes.</p>
                  </div>
                </div>
              </div>
            )}
            
            {/* Enhanced Residential Results */}
            {quoteResult.quoteType === 'residential' && (
              <div className="space-y-8">
                {/* Key Metrics Overview */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="metric-card">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="icon-container">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                        </svg>
                      </div>
                      <div>
                        <h3 className="metric-card-label">Out-of-Pocket Cost</h3>
                        <p className="metric-card-value">{formatCurrency(quoteResult.finalPrice)}</p>
                      </div>
                    </div>
                    <p className="metric-card-description">After all rebates and incentives</p>
                  </div>
                  
                  <div className="metric-card">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="icon-container">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                        </svg>
                      </div>
                      <div>
                        <h3 className="metric-card-label">Payback Period</h3>
                        <p className="metric-card-value">{quoteResult.simplePaybackYears ?? 'N/A'} Years</p>
                      </div>
                    </div>
                    <p className="metric-card-description">Time to break even on investment</p>
                  </div>
                  
                  <div className="metric-card">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="icon-container">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                      </div>
                      <div>
                        <h3 className="metric-card-label">Annual Savings</h3>
                        <p className="metric-card-value">{formatCurrency(quoteResult.annualSavings)}</p>
                      </div>
                    </div>
                    <p className="metric-card-description">Estimated electricity bill reduction</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* Cost Breakdown */}
                  <div className="detail-card">
                    <h3 className="detail-card-header">
                      <span className="text-heading-2">💰</span>
                      Detailed Cost Breakdown
                    </h3>
                    
                    <div className="space-y-4">
                      <div className="cost-item">
                        <span className="cost-item-label">System Hardware</span>
                        <span className="cost-item-value">{formatCurrency(quoteResult.totalCost * 0.6)}</span>
                      </div>
                      
                      <div className="cost-item">
                        <span className="cost-item-label">Installation & Labor</span>
                        <span className="cost-item-value">{formatCurrency(quoteResult.totalCost * 0.3)}</span>
                      </div>
                      
                      <div className="cost-item">
                        <span className="cost-item-label">Design & Permits</span>
                        <span className="cost-item-value">{formatCurrency(quoteResult.totalCost * 0.1)}</span>
                      </div>
                      
                      <div className="border-t border-border pt-3 mt-3">
                        <div className="flex justify-between items-center text-heading-4">
                          <span className="cost-item-label">Subtotal</span>
                          <span className="cost-item-value">{formatCurrency(quoteResult.totalCost)}</span>
                        </div>
                      </div>
                      
                      <div className="space-y-2 pt-2">
                        <div className="rebate-item">
                          <span className="rebate-item-label">
                            <span>Federal Rebate (STCs)</span>
                            <InfoTooltip text="Small-scale Technology Certificates - Federal government incentive based on system size and location" />
                          </span>
                          <span className="rebate-item-value">-{formatCurrency(quoteResult.federalRebate)}</span>
                        </div>
                        
                        {quoteResult.batteryRebate > 0 && (
                          <div className="rebate-item">
                            <span className="rebate-item-label">
                              <span>Battery Rebate</span>
                              <InfoTooltip text="Federal or state incentive for battery storage systems" />
                            </span>
                            <span className="rebate-item-value">-{formatCurrency(quoteResult.batteryRebate)}</span>
                          </div>
                        )}
                        
                        {quoteResult.stateRebate > 0 && (
                          <div className="rebate-item">
                            <span className="rebate-item-label">
                              <span>State Rebate</span>
                              <InfoTooltip text="State-specific rebates like Victoria's Solar Homes Program" />
                            </span>
                            <span className="rebate-item-value">-{formatCurrency(quoteResult.stateRebate)}</span>
                          </div>
                        )}
                      </div>
                      
                      <div className="summary-box">
                        <div className="flex justify-between items-center text-heading-3">
                          <span className="summary-box-label">Final Price</span>
                          <span className="summary-box-value">{formatCurrency(quoteResult.finalPrice)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* System Specifications */}
                  <div className="space-y-6">
                    <div className="detail-card">
                      <h3 className="detail-card-header">
                        <span className="text-heading-2">⚡</span>
                        System Specifications
                      </h3>
                      
                      <div className="grid grid-cols-2 gap-4 mb-6">
                        <div className="spec-card">
                          <p className="spec-card-value">{quoteResult.systemSize}kW</p>
                          <p className="spec-card-label">System Size</p>
                        </div>
                        
                        <div className="spec-card">
                          <p className="spec-card-value">{Math.ceil(quoteResult.systemSize * 1000 / 440)}</p>
                          <p className="spec-card-label">Solar Panels</p>
                        </div>
                      </div>
                      
                      <div className="space-y-3 text-body-small">
                        <div className="flex justify-between">
                          <span className="performance-item-label">Panel Wattage</span>
                          <span className="performance-item-value">440W each</span>
                        </div>
                        
                        <div className="flex justify-between">
                          <span className="performance-item-label">Inverter Size</span>
                          <span className="performance-item-value">{Math.min(5, Math.floor(quoteResult.systemSize))}kW</span>
                        </div>
                        
                        <div className="flex justify-between">
                          <span className="performance-item-label">Battery Storage</span>
                          <span className="performance-item-value">
                            {formData.batteryIncluded ? `${formData.batteryCapacity || '10'}kWh` : 'None'}
                          </span>
                        </div>
                        
                        <div className="flex justify-between">
                          <span className="performance-item-label">Warranty</span>
                          <span className="performance-item-value">25 years panels, 10 years inverter</span>
                        </div>
                      </div>
                    </div>
                    
                    {/* Energy Performance */}
                    <div className="detail-card">
                      <h3 className="detail-card-header">
                        <span className="text-heading-2">🌞</span>
                        Energy Performance
                      </h3>
                      
                      <div className="space-y-4">
                        <div className="performance-item">
                          <span className="performance-item-label">Annual Generation</span>
                          <span className="performance-item-value">{quoteResult.annualProduction?.toLocaleString()} kWh</span>
                        </div>
                        
                        <div className="performance-item">
                          <span className="performance-item-label">Daily Average</span>
                          <span className="performance-item-value">{Math.round((quoteResult.annualProduction || 0) / 365)} kWh</span>
                        </div>
                        
                        <div className="performance-item">
                          <span className="performance-item-label">CO₂ Reduction</span>
                          <span className="performance-item-value">{Math.round((quoteResult.annualProduction || 0) * 0.82)} kg/year</span>
                        </div>
                        
                        <div className="performance-item">
                          <span className="performance-item-label">25-Year Savings</span>
                          <span className="performance-item-value">{formatCurrency((quoteResult.annualSavings || 0) * 25)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Commercial Results */}
            {quoteResult.quoteType === 'commercial' && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                 <div className="space-y-6">
                    <div className="detail-card">
                      <div className="text-center">
                        <p className="performance-item-label">Estimated Out-of-Pocket Cost</p>
                        <p className="text-heading-1 md:text-heading-1 text-primary tracking-tight mt-1">{formatCurrency(quoteResult.finalPrice)}</p>
                      </div>
                      <div className="mt-6 pt-6 border-t border-border">
                        <h3 className="detail-card-header justify-center">Cost Breakdown</h3>
                        <div className="space-y-3 max-w-md mx-auto">
                          <div className="flex justify-between items-center text-body-small">
                            <span className="cost-item-label">Total System Cost</span>
                            <span className="cost-item-value">{formatCurrency(quoteResult.totalCost)}</span>
                          </div>
                          <div className="rebate-item text-body-small">
                            <span>Federal Rebate (STCs)</span>
                            <span className="rebate-item-value">-{formatCurrency(quoteResult.federalRebate)}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="detail-card text-center">
                      <h3 className="detail-card-header justify-center">Simple Payback Period</h3>
                      <p className="text-heading-1 text-primary tracking-tight">{quoteResult.simplePaybackYears ?? 'N/A'} Years</p>
                    </div>
                 </div>
                 <div className="space-y-6">
                    <div className="detail-card">
                      <h3 className="detail-card-header justify-center">Recommended System</h3>
                      <div className="grid grid-cols-2 gap-4 text-center">
                        <div className="spec-card">
                          <p className="spec-card-value">{quoteResult.systemSize}kW</p>
                          <p className="spec-card-label">System Size</p>
                        </div>
                        <div className="spec-card">
                          <p className="spec-card-value">{formData.batteryIncluded ? 'Yes' : 'No'}</p>
                          <p className="spec-card-label">Battery Included</p>
                        </div>
                      </div>
                    </div>
                    <div className="detail-card">
                      <h3 className="detail-card-header justify-center">Annual Savings Breakdown</h3>
                      <div className="space-y-3">
                        <div className="flex justify-between items-center text-body-small">
                          <span className="performance-item-label">Energy Savings</span>
                          <span className="performance-item-value">{formatCurrency(quoteResult.energySavings)}</span>
                        </div>
                        <div className="flex justify-between items-center text-body-small">
                          <span className="performance-item-label">Demand Charge Savings</span>
                          <span className="performance-item-value">{formatCurrency(quoteResult.demandChargeSavings)}</span>
                        </div>
                        <div className="flex justify-between items-center text-body pt-2 border-t border-border">
                          <span className="cost-item-label">Total Annual Savings</span>
                          <span className="cost-item-value">{formatCurrency(quoteResult.annualSavings)}</span>
                        </div>
                      </div>
                    </div>
                 </div>
              </div>
            )}
            
            <div className="my-8">
              <SavingsChart 
                finalPrice={quoteResult.finalPrice} 
                annualSavings={quoteResult.annualSavings} 
                currentAnnualBill={quoteResult.currentAnnualBill} 
              />
            </div>
            
            <div className="disclaimer-box mt-8">
              <h4 className="disclaimer-box-title">Important Information</h4>
              <ul className="disclaimer-box-list">
                {quoteResult.disclaimers.map((d: string, i: number) => (
                  <li key={i}>
                    <span className="mt-1">•</span>
                    <span>{d}</span>
                  </li>
                ))}
              </ul>
            </div>
            
            {/* Action Buttons - only default and secondary variants */}
            {hideSubmitButton ? (
              <div className="flex justify-center mt-8">
                <Button onClick={handleStartOver} variant="secondary">
                  Get Another Quote
                </Button>
              </div>
            ) : (
              <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8">
                <Button onClick={onProceedToDetailedQuote} variant="primary">
                  <span>Get Detailed Quotes from Installers</span>
                  <ArrowRight />
                </Button>
                <Button onClick={handleStartOver} variant="secondary">
                  Get Another Quote
                </Button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default InstantQuoteForm

// --- Helper & Placeholder Functions ---
const calculateSTCs = (kw: number, zoneMultiplier: number) => {
    const yearsRemaining = Math.max(0, 2030 - new Date().getFullYear() + 1);
    const stcs = Math.round(zoneMultiplier * kw * yearsRemaining);
    const stcPrice = 40; // Placeholder AUD per STC
    return { stcs, stcValue: stcs * stcPrice };
}

const calculateBatteryRebate = (batteryKwh: number, batteryIncluded: boolean) => {
    if (!batteryIncluded || batteryKwh <= 0) return 0;
    const rebate = Math.round(Math.min(batteryKwh * 0.9 * 372, batteryKwh * 0.9 * 372));
    return rebate;
}

const getInsolationByPostcode = (postcode: string) => {
    const mapping: Record<string, number> = { '2': 4.3, '3': 3.6, '4': 4.5, '5': 4.7, '6': 4.8, '7': 3.8, '0': 5.0 };
    return mapping[postcode.charAt(0)] || 4.2;
}

async function fetchSTCZone(postcode: string): Promise<number> {
  const zoneMap: Record<string, number> = { '2': 1.382, '3': 1.185, '4': 1.536, '5': 1.382, '6': 1.536, '7': 1.185, '0': 1.622 };
  return zoneMap[postcode.charAt(0)] || 1.382;
}

async function fetchFeedInRate(stateOrPostcode: string): Promise<number> {
  const defaultByState: Record<string, number> = { NSW: 0.09, VIC: 0.09, QLD: 0.12, WA: 0.08, SA: 0.10, TAS: 0.09, ACT: 0.08, NT: 0.06 };
  return defaultByState[stateOrPostcode] ?? 0.10;
}

async function fetchStateRebates(state: string): Promise<any> {
  const exampleRules: Record<string, any> = { VIC: { enabled: true, type: 'flat', amount: 1400 }, NSW: { enabled: false } };
  return exampleRules[state] ?? { enabled: false };
}









