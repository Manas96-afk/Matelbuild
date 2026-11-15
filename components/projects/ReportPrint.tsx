import React from 'react';
import { Project, EstimationResult, PricingMode } from '../../types';
import { formatNumber, formatCurrency } from '../../lib/utils';
import { PricingEngine } from '../../lib/pricing/pricingEngine';
import { CostEngine } from '../../lib/cost/costEngine';
import { BOQEngine, BOQItem } from '../../lib/boq/boqEngine';
import { CurrencyConfig } from '../../lib/pricing/countryRates';

interface ReportPrintProps {
  project: Project;
  estimation: EstimationResult;
  currency?: string;
}

export function ReportPrint({ project, estimation }: ReportPrintProps) {
  const { quantities, builtUpAreaDisplay } = estimation;

  // 1. Resolve country and currency formatting
  const country = project.country || 'India';
  const currencyInfo = CurrencyConfig[country] || CurrencyConfig['India'];
  const localCurrency = currencyInfo.code;
  const symbol = currencyInfo.symbol;

  // 2. Resolve quality tier
  const activeQuality: PricingMode = (project.quality as PricingMode) || 'Standard';

  // 3. Resolve rate card & detailed costs
  const rates = PricingEngine.resolveRatesSync({ country }, activeQuality);
  const costReport = CostEngine.calculateCost(
    quantities,
    rates,
    estimation.builtUpAreaSqFt,
    { country },
    activeQuality
  );

  const costPerSqFt = Math.round(costReport.totalCost / (estimation.builtUpAreaSqFt || 1));

  // 4. Generate BOQ & Matrix
  const boqItems: BOQItem[] = BOQEngine.generateBOQ(quantities, rates, project.wallType || 'Brick Masonry');
  const comparisonMatrix = CostEngine.calculateComparisonMatrixSync(
    quantities,
    estimation.builtUpAreaSqFt,
    { country }
  );

  return (
    <div className="bg-white text-slate-900 font-sans p-8 max-w-4xl mx-auto space-y-8 print:p-0 print:max-w-none">
      {/* ── Document Header ──────────────────────────────────────────────────────── */}
      <div className="flex items-start justify-between border-b-2 border-slate-900 pb-6">
        <div className="space-y-1">
          <div className="inline-flex items-center space-x-2">
            <span className="h-6 w-6 rounded bg-amber-500 flex items-center justify-center font-black text-slate-950 text-xs">M</span>
            <span className="font-extrabold text-xl text-slate-900 tracking-tight">MatelBuild</span>
            <span className="text-xs px-2 py-0.5 rounded bg-slate-100 font-semibold text-slate-600">Engineered BOQ</span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 pt-2">{project.projectName}</h1>
          <p className="text-xs text-slate-500">
            Location: {country} {project.state ? `, ${project.state}` : ''} | Generated: {new Date().toLocaleDateString()}
          </p>
        </div>
        <div className="text-right space-y-1">
          <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Estimated Total Cost</div>
          <div className="text-2xl font-black text-indigo-600">{formatCurrency(costReport.totalCost, localCurrency as any)}</div>
          <div className="text-xs font-semibold text-slate-500">
            Quality: <span className="font-bold text-slate-900">{activeQuality} Finish</span>
          </div>
        </div>
      </div>

      {/* ── Executive Summary Matrix ──────────────────────────────────────────────── */}
      <div className="grid grid-cols-4 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200 text-center">
        <div>
          <span className="block text-2xs font-bold text-slate-400 uppercase">Built-Up Area</span>
          <span className="text-base font-extrabold text-slate-900">{formatNumber(builtUpAreaDisplay)} {project.unit === 'Meter' ? 'sq.m' : 'sq.ft'}</span>
        </div>
        <div>
          <span className="block text-2xs font-bold text-slate-400 uppercase">Cost / Sq.Ft</span>
          <span className="text-base font-extrabold text-slate-900">{formatCurrency(costPerSqFt, localCurrency as any)}</span>
        </div>
        <div>
          <span className="block text-2xs font-bold text-slate-400 uppercase">Structural Steel</span>
          <span className="text-base font-extrabold text-slate-900">{formatNumber(quantities.summary?.steelMT || 0, 2)} MT</span>
        </div>
        <div>
          <span className="block text-2xs font-bold text-slate-400 uppercase">Cement Requirement</span>
          <span className="text-base font-extrabold text-slate-900">{formatNumber(quantities.summary?.cementBags || 0, 0)} Bags</span>
        </div>
      </div>

      {/* ── Bill of Quantities (BOQ Table) ─────────────────────────────────────── */}
      <div className="space-y-3">
        <h2 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider border-b border-slate-200 pb-2">
          Bill of Quantities (Itemized Breakup)
        </h2>
        <table className="w-full text-xs text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-200 text-slate-400 font-bold uppercase tracking-wider">
              <th className="py-2">Component</th>
              <th className="py-2">Item Description</th>
              <th className="py-2 text-right">Quantity</th>
              <th className="py-2 text-right">Unit Rate ({symbol})</th>
              <th className="py-2 text-right">Total ({symbol})</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-slate-700">
            {boqItems.map((item, idx) => (
              <tr key={idx} className="hover:bg-slate-50">
                <td className="py-2 font-bold text-slate-900">{item.section}</td>
                <td className="py-2">{item.description}</td>
                <td className="py-2 text-right font-semibold">{formatNumber(item.quantity)} {item.unit}</td>
                <td className="py-2 text-right font-mono">{formatCurrency(item.rate, localCurrency as any)}</td>
                <td className="py-2 text-right font-extrabold text-slate-900">{formatCurrency(item.cost, localCurrency as any)}</td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="border-t-2 border-slate-900 font-extrabold text-slate-900 text-sm">
              <td colSpan={4} className="py-3 text-right">Subtotal Material Expenses:</td>
              <td className="py-3 text-right">{formatCurrency(costReport.totalMaterialCost, localCurrency as any)}</td>
            </tr>
          </tfoot>
        </table>
      </div>

      {/* ── Cost Breakdown (Labor + Contingency) ─────────────────────────── */}
      <div className="grid grid-cols-2 gap-6 pt-2">
        <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2">
          <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Operational Cost Split</h3>
          <div className="space-y-1.5 text-xs text-slate-600">
            <div className="flex justify-between">
              <span>Materials Expenditure:</span>
              <span className="font-semibold text-slate-900">{formatCurrency(costReport.totalMaterialCost, localCurrency as any)}</span>
            </div>
            <div className="flex justify-between">
              <span>Labour & Craftsmanship:</span>
              <span className="font-semibold text-slate-900">{formatCurrency(costReport.labourCost, localCurrency as any)}</span>
            </div>
            <div className="flex justify-between">
              <span>Wastage & Contingency:</span>
              <span className="font-semibold text-slate-900">{formatCurrency(costReport.contingency, localCurrency as any)}</span>
            </div>
          </div>
        </div>

        <div className="bg-indigo-50/50 p-4 rounded-xl border border-indigo-100 space-y-2 text-xs">
          <h3 className="text-xs font-extrabold text-indigo-950 uppercase tracking-wider">Final Cost Summary</h3>
          <div className="space-y-1.5 text-indigo-900">
            <div className="flex justify-between">
              <span>Net Material & Labour:</span>
              <span className="font-bold">{formatCurrency(costReport.totalMaterialCost + costReport.labourCost, localCurrency as any)}</span>
            </div>
            <div className="flex justify-between">
              <span>Contingencies (5%):</span>
              <span className="font-bold">{formatCurrency(costReport.contingency, localCurrency as any)}</span>
            </div>
            <div className="flex justify-between border-t border-indigo-200 pt-1.5 text-sm font-black text-indigo-950">
              <span>Grand Total:</span>
              <span>{formatCurrency(costReport.totalCost, localCurrency as any)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* ── Quality Finish Matrix Comparison ────────────────────────────────────── */}
      <div className="space-y-3 pt-2">
        <h2 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider border-b border-slate-200 pb-2">
          Finish Tier Comparison Matrix
        </h2>
        <table className="w-full text-xs text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-200 text-slate-400 font-bold uppercase tracking-wider">
              <th className="py-2">Finish Tier</th>
              <th className="py-2 text-right">Material Expenses ({symbol})</th>
              <th className="py-2 text-right">Labour Costs ({symbol})</th>
              <th className="py-2 text-right">Contingencies ({symbol})</th>
              <th className="py-2 text-right">Total Project Cost ({symbol})</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-150 text-slate-700">
            {(['Economy', 'Standard', 'Premium', 'Luxury'] as const).map((tier) => {
              const estimate = comparisonMatrix[tier];
              const isCurrent = activeQuality === tier;
              return (
                <tr key={tier} className={isCurrent ? 'bg-indigo-50/40 font-bold text-indigo-950' : 'text-slate-600'}>
                  <td className="py-2.5 font-extrabold">{tier} Finish {isCurrent ? '(Active)' : ''}</td>
                  <td className="py-2.5 text-right">{formatCurrency(estimate.totalMaterialCost, localCurrency as any)}</td>
                  <td className="py-2.5 text-right">{formatCurrency(estimate.labourCost, localCurrency as any)}</td>
                  <td className="py-2.5 text-right">{formatCurrency(estimate.contingency, localCurrency as any)}</td>
                  <td className="py-2.5 text-right font-extrabold text-indigo-900">{formatCurrency(estimate.totalCost, localCurrency as any)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* ── Footer / Signature ─────────────────────────────────────────────────── */}
      <div className="border-t border-slate-200 pt-6 flex items-center justify-between text-2xs text-slate-400 font-medium">
        <div>Generated by MatelBuild AI Quantity Surveyor. Transparent engineering calculations.</div>
        <div className="text-right">Page 1 of 1</div>
      </div>
    </div>
  );
}
