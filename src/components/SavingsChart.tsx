'use client'

import React, { useState, useMemo } from 'react';
import {
  ResponsiveContainer,
  LineChart,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ReferenceLine,
  AreaChart,
  Area
} from 'recharts';
import { useChartColors } from '@/hooks/useChartColors';

// --- Icon Components ---
const LineChartIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4 mr-2"><path d="M3 3v18h18"/><path d="m19 9-5 5-4-4-3 3"/></svg>;
const BarChartIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4 mr-2"><line x1="12" x2="12" y1="20" y2="10"/><line x1="18" x2="18" y1="20" y2="4"/><line x1="6" x2="6" y1="20" y2="16"/></svg>;

interface SavingsChartProps {
  finalPrice: number;
  annualSavings: number;
  currentAnnualBill: number;
}

const formatCurrency = (value: number) => new Intl.NumberFormat('en-AU', {
  style: 'currency',
  currency: 'AUD',
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
}).format(value);

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="detail-card">
        <p className="cost-item-label mb-2">{label}</p>
        {payload.map((pld: any, index: number) => (
          <p key={index} style={{ color: pld.color }} className="text-body-small performance-item-value">
            {`${pld.name}: ${formatCurrency(pld.value)}`}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

const SavingsChart: React.FC<SavingsChartProps> = ({ finalPrice, annualSavings, currentAnnualBill }) => {
  const [activeTab, setActiveTab] = useState<'roi' | 'annual'>('roi');
  
  // Get theme-aware chart colors from design tokens
  const chartColors = useChartColors();

  const { roiData, annualData, breakEvenYear } = useMemo(() => {
    // Annual savings is now passed directly from the more detailed calculation
    const solarAnnualCost = currentAnnualBill - annualSavings; // More accurate new annual cost

    const roiDataPoints = Array.from({ length: 26 }, (_, i) => {
      const year = i;
      const cumulativeSavings = year * annualSavings;
      const netPosition = cumulativeSavings - finalPrice;
      return { year: `Year ${year}`, 'Net Savings': netPosition };
    });

    let breakEvenYear: number | null = null;
    if (annualSavings > 0) {
        for (let i = 0; i < roiDataPoints.length; i++) {
            if (roiDataPoints[i]['Net Savings'] >= 0) {
                breakEvenYear = i;
                break;
            }
        }
    }


    const annualDataPoints = [
      { name: 'Current Bill', 'Annual Cost': currentAnnualBill },
      { name: 'With Solar', 'Annual Cost': solarAnnualCost },
    ];

    return { roiData: roiDataPoints, annualData: annualDataPoints, breakEvenYear };
  }, [finalPrice, annualSavings, currentAnnualBill]);

  return (
    <div className="detail-card">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-4">
        <h3 className="detail-card-header mb-2 sm:mb-0">Financial Projections</h3>
        <div className="bg-surface p-1 rounded-lg flex space-x-1 w-full sm:w-auto border border-border">
          <button 
            onClick={() => setActiveTab('roi')} 
            className={`w-full sm:w-auto px-3 py-1 rounded-md text-label transition-colors flex items-center justify-center ${
              activeTab === 'roi' 
                ? 'bg-primary/10 text-primary' 
                : 'text-foreground-subtle hover:bg-surface-hover'
            }`}
          >
            <LineChartIcon /> Long-Term ROI
          </button>
          <button 
            onClick={() => setActiveTab('annual')} 
            className={`w-full sm:w-auto px-3 py-1 rounded-md text-label transition-colors flex items-center justify-center ${
              activeTab === 'annual' 
                ? 'bg-primary/10 text-primary' 
                : 'text-foreground-subtle hover:bg-surface-hover'
            }`}
          >
            <BarChartIcon /> Annual Cost
          </button>
        </div>
      </div>

      {activeTab === 'roi' && (
        <div className="animate-fade-in">
          <p className="text-body-small performance-item-label mb-4">
            This chart projects your net savings over 25 years. You&apos;re estimated to break even in
            <span className="text-primary"> {breakEvenYear !== null ? `Year ${breakEvenYear}` : 'N/A'}</span> and save approximately
            <span className="text-primary"> {formatCurrency(annualSavings * 25 - finalPrice)}</span> over the system&apos;s lifetime.
          </p>
          <div style={{ width: '100%', height: 300 }}>
            <ResponsiveContainer>
              <AreaChart data={roiData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                <defs>
                    <linearGradient id="colorSavings" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={chartColors.success} stopOpacity={0.8}/>
                        <stop offset="95%" stopColor={chartColors.success} stopOpacity={0}/>
                    </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke={chartColors.grid} />
                <XAxis dataKey="year" tick={{ fill: chartColors.text }} style={{ fontSize: 12 }} />
                <YAxis tickFormatter={formatCurrency} tick={{ fill: chartColors.text }} style={{ fontSize: 12 }} />
                <Tooltip content={<CustomTooltip />} />
                <Legend wrapperStyle={{ fontSize: '14px' }}/>
                <ReferenceLine y={0} stroke={chartColors.axis} strokeDasharray="3 3" />
                {breakEvenYear !== null && <ReferenceLine x={`Year ${breakEvenYear}`} stroke={chartColors.primary} label={{ value: 'Break-even Point', position: 'insideTopLeft', fill: chartColors.primary }} />}
                <Area type="monotone" dataKey="Net Savings" stroke={chartColors.success} fillOpacity={1} fill="url(#colorSavings)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {activeTab === 'annual' && (
        <div className="animate-fade-in">
          <p className="text-body-small performance-item-label mb-4">
            Comparison of your estimated annual electricity costs before and after installing solar panels.
            Your estimated annual savings are <span className="text-primary">{formatCurrency(annualSavings)}</span>.
          </p>
          <div style={{ width: '100%', height: 300 }}>
            <ResponsiveContainer>
              <BarChart data={annualData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={chartColors.grid} />
                <XAxis dataKey="name" tick={{ fill: chartColors.text }} style={{ fontSize: 12 }} />
                <YAxis tickFormatter={formatCurrency} tick={{ fill: chartColors.text }} style={{ fontSize: 12 }} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="Annual Cost" fill={chartColors.primary} radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </div>
  );
};

export default SavingsChart;
