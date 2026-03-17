import React from 'react';
import { Check } from 'lucide-react';
import { ARIA_LABELS } from '../../constants/labels';

// --- Progress Bar ---
interface ProgressBarProps {
  value: number; // 0 to 100
  max?: number;
  label?: string;
  showValue?: boolean;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({ 
  value, 
  max = 100, 
  label, 
  showValue = false 
}) => {
  const percentage = Math.min(100, Math.max(0, (value / max) * 100));

  return (
    <div className="w-full">
      <div className="flex justify-between mb-1">
        {label && <span className="text-sm font-medium text-white">{label}</span>}
        {showValue && <span className="text-sm font-medium text-slate-400">{Math.round(percentage)}%</span>}
      </div>
      <div className="w-full bg-slate-700 rounded-full h-2.5 overflow-hidden" role="progressbar" aria-valuenow={percentage} aria-valuemin={0} aria-valuemax={100} aria-label={ARIA_LABELS.progress}>
        <div 
          className="bg-brand-500 h-2.5 rounded-full transition-all duration-500 ease-out" 
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
};

// --- Stepper ---
interface StepperProps {
  steps: string[];
  currentStep: number; // 0-based index
}

export const Stepper: React.FC<StepperProps> = ({ steps, currentStep }) => {
  return (
    <div className="flex items-center w-full">
      {steps.map((step, index) => {
        const isCompleted = index < currentStep;
        const isCurrent = index === currentStep;
        const isLast = index === steps.length - 1;

        return (
          <div key={step} className={`flex items-center ${isLast ? 'flex-none' : 'flex-1'}`}>
            <div className="relative flex flex-col items-center group">
               {/* Circle */}
               <div className={`
                 w-8 h-8 rounded-full flex items-center justify-center border-2 z-10 transition-colors
                 ${isCompleted 
                    ? 'bg-brand-500 border-brand-500 text-brand-950' 
                    : isCurrent 
                      ? 'bg-slate-900 border-brand-500 text-brand-500' 
                      : 'bg-slate-900 border-slate-600 text-slate-500'}
               `}>
                 {isCompleted ? <Check className="w-4 h-4" /> : <span className="text-xs font-bold">{index + 1}</span>}
               </div>
               
               {/* Label */}
               <div className={`absolute -bottom-6 whitespace-nowrap text-xs font-medium transition-colors ${isCurrent ? 'text-brand-500' : 'text-slate-500'}`}>
                 {step}
               </div>
            </div>

            {/* Connector Line */}
            {!isLast && (
              <div className={`flex-1 h-0.5 mx-2 transition-colors ${index < currentStep ? 'bg-brand-500' : 'bg-slate-700'}`} />
            )}
          </div>
        );
      })}
    </div>
  );
};