'use client';

import React, { useState } from 'react';
import { formatCurrency, formatNumber } from '../../lib/utils';
import { CurrencyType } from '../../types';

interface ChartDataItem {
  name: string;
  value: number;
  percentage: number;
  color: string;
}

interface DonutChartProps {
  data: ChartDataItem[];
  totalLabel: string;
  totalValue: number;
  currency: CurrencyType;
}

export function DonutChart({ data, totalLabel, totalValue, currency }: DonutChartProps) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  // Filter out items with 0 value to avoid division by zero or weird segments
  const activeData = data.filter((item) => item.value > 0);
  const sum = activeData.reduce((acc, item) => acc + item.value, 0);

  // SVG calculations for Donut
  const radius = 70;
  const strokeWidth = 18;
  const circumference = 2 * Math.PI * radius;
  
  let accumulatedPercent = 0;

  return (
    <div className="flex flex-col sm:flex-row items-center justify-around space-y-6 sm:space-y-0 sm:space-x-4">
      {/* Chart Canvas */}
      <div className="relative h-48 w-48 flex-shrink-0">
        <svg viewBox="0 0 200 200" className="w-full h-full transform -rotate-90">
          <circle
            cx="100"
            cy="100"
            r={radius}
            fill="transparent"
            stroke="#f1f5f9"
            strokeWidth={strokeWidth}
          />
          {activeData.map((item, idx) => {
            const percentage = (item.value / (sum || 1)) * 100;
            const strokeLength = (percentage / 100) * circumference;
            const strokeOffset = circumference - (accumulatedPercent / 100) * circumference;
            accumulatedPercent += percentage;

            const isHovered = hoveredIndex === idx;

            return (
              <circle
                key={item.name}
                cx="100"
                cy="100"
                r={radius}
                fill="transparent"
                stroke={item.color}
                strokeWidth={isHovered ? strokeWidth + 3 : strokeWidth}
                strokeDasharray={`${strokeLength} ${circumference}`}
                strokeDashoffset={strokeOffset}
                strokeLinecap="round"
                className="transition-all duration-300 cursor-pointer origin-center"
                style={{
                  transform: isHovered ? 'scale(1.02)' : 'scale(1)',
                }}
                onMouseEnter={() => setHoveredIndex(idx)}
                onMouseLeave={() => setHoveredIndex(null)}
              />
            );
          })}
        </svg>

        {/* Center Text */}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none p-4">
          {hoveredIndex !== null && activeData[hoveredIndex] ? (
            <>
              <span className="text-3xs font-bold text-slate-400 uppercase tracking-widest leading-none mb-1">
                {activeData[hoveredIndex].name}
              </span>
              <span className="text-sm font-bold text-slate-900 leading-none mb-0.5">
                {formatCurrency(activeData[hoveredIndex].value, currency)}
              </span>
              <span 
                className="text-2xs font-semibold px-1.5 py-0.5 rounded-full mt-1 border"
                style={{ 
                  color: activeData[hoveredIndex].color, 
                  backgroundColor: `${activeData[hoveredIndex].color}10`,
                  borderColor: `${activeData[hoveredIndex].color}25`
                }}
              >
                {formatNumber(activeData[hoveredIndex].percentage, 1)}%
              </span>
            </>
          ) : (
            <>
              <span className="text-3xs font-bold text-slate-400 uppercase tracking-widest leading-none mb-1.5">
                {totalLabel}
              </span>
              <span className="text-md font-extrabold text-slate-900 leading-none">
                {formatCurrency(totalValue, currency)}
              </span>
            </>
          )}
        </div>
      </div>

      {/* Legends Grid */}
      <div className="flex-1 grid grid-cols-2 gap-x-6 gap-y-2.5 max-w-xs sm:max-w-none w-full px-4 sm:px-0">
        {data.map((item, idx) => {
          const isHovered = hoveredIndex === idx;
          return (
            <div
              key={item.name}
              className={`flex items-center space-x-2.5 py-1 px-2.5 rounded-xl cursor-pointer transition-colors duration-200 ${
                isHovered ? 'bg-slate-50' : 'bg-transparent'
              }`}
              onMouseEnter={() => setHoveredIndex(idx)}
              onMouseLeave={() => setHoveredIndex(null)}
            >
              <span
                className="h-2.5 w-2.5 rounded-full flex-shrink-0 transition-transform duration-200"
                style={{ 
                  backgroundColor: item.color,
                  transform: isHovered ? 'scale(1.25)' : 'scale(1)' 
                }}
              />
              <div className="flex flex-col min-w-0">
                <span className="text-xs font-semibold text-slate-700 truncate">{item.name}</span>
                <span className="text-2xs font-medium text-slate-400">
                  {formatNumber(item.percentage, 1)}%
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

interface BarChartProps {
  data: {
    label: string;
    value: number;
    color: string;
  }[];
  currency: CurrencyType;
}

export function BarChart({ data, currency }: BarChartProps) {
  const maxValue = Math.max(...data.map((d) => d.value), 1);

  return (
    <div className="space-y-4">
      {data.map((item) => {
        const percentOfMax = (item.value / maxValue) * 100;
        return (
          <div key={item.label} className="space-y-1.5">
            {/* Label & Value */}
            <div className="flex justify-between items-center text-xs font-semibold">
              <span className="text-slate-600">{item.label}</span>
              <span className="text-slate-900">{formatCurrency(item.value, currency)}</span>
            </div>

            {/* Bar Track */}
            <div className="h-3 w-full bg-slate-50 border border-slate-100 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-1000 ease-out"
                style={{
                  width: `${percentOfMax}%`,
                  backgroundColor: item.color,
                  backgroundImage: `linear-gradient(to right, ${item.color}, ${item.color}dd)`,
                }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}
