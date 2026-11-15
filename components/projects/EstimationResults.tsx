'use client';

import React, { useState } from 'react';
import { Project, PricingMode } from '../../types';
import { runEstimationEngine } from '../../lib/estimation/calculations';
import { formatNumber, formatCurrency } from '../../lib/utils';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../ui/Card';
import { Button } from '../ui/Button';
import { Modal } from '../ui/Modal';
import { PricingEngine } from '../../lib/pricing/pricingEngine';
import { CostEngine } from '../../lib/cost/costEngine';
import { BOQEngine } from '../../lib/boq/boqEngine';
import { CurrencyConfig } from '../../lib/pricing/countryRates';
import {
  Printer,
  Boxes,
  Layers,
  AlertCircle,
  Ruler,
  Construction,
  Info,
  Sliders,
  DollarSign,
  TrendingUp,
  Hammer,
  ShieldCheck
} from 'lucide-react';
import { ReportPrint } from './ReportPrint';

interface EstimationResultsProps {
  project: Project;
  onEdit?: () => void;
}

export function EstimationResults({ project, onEdit }: EstimationResultsProps) {
  const [isSandModalOpen, setIsSandModalOpen] = useState(false);
  const [selectedTier, setSelectedTier] = useState<PricingMode>(
    (project.quality as any) === 'Basic' ? 'Economy' : (project.quality as PricingMode) || 'Standard'
  );

  // 1. Run raw quantity calculations
  const estimation = runEstimationEngine(project, project);
  const { quantities, builtUpAreaDisplay, builtUpAreaSqGaj } = estimation;

  // 2. Resolve country & currency information
  const country = project.country || 'India';
  const currencyInfo = CurrencyConfig[country] || CurrencyConfig['India'];
  const currency = currencyInfo.code;
  const symbol = currencyInfo.symbol;

  // 3. Resolve rate card for the active/selected mode
  const rates = PricingEngine.resolveRatesSync({ country }, selectedTier);

  // 4. Calculate cost details
  const costEstimate = CostEngine.calculateCost(
    quantities,
    rates,
    quantities.area.builtUpAreaSqFt,
    { country },
    selectedTier
  );

  // 5. Generate cost comparison matrix
  const comparisonMatrix = CostEngine.calculateComparisonMatrixSync(
    quantities,
    quantities.area.builtUpAreaSqFt,
    { country }
  );

  // 6. Generate Bill of Quantities (BOQ) list
  const boqItems = BOQEngine.generateBOQ(quantities, rates, project.wallType || 'Brick');

  const handlePrint = () => {
    window.print();
  };

  // Group materials into structural categories
  const categories = [
    {
      title: 'Foundation & Earthwork',
      items: [
        { name: 'Footing Excavation Volume', value: quantities.excavation.excavationVolumeCFT, unit: 'CFT', detail: `For ${quantities.excavation.numColumns} columns (width: ${quantities.excavation.footingWidthFt}ft)` },
        { name: 'PCC Bedding Concrete Volume', value: quantities.pcc.pccVolumeCFT, unit: 'CFT', detail: 'Concrete volume for leveling course' }
      ]
    },
    {
      title: 'Structural concrete & reinforcement (RCC)',
      items: [
        { name: 'Footings Concrete Volume', value: quantities.rcc.footings.volumeCFT, unit: 'CFT', detail: `RCC steel reinforcement: ${formatNumber(quantities.rcc.footings.steelKg, 0)} kg` },
        { name: 'Columns Concrete Volume', value: quantities.rcc.columns.volumeCFT, unit: 'CFT', detail: `RCC steel reinforcement: ${formatNumber(quantities.rcc.columns.steelKg, 0)} kg` },
        { name: 'Beams Concrete Volume', value: quantities.rcc.beams.volumeCFT, unit: 'CFT', detail: `RCC steel reinforcement: ${formatNumber(quantities.rcc.beams.steelKg, 0)} kg` },
        { name: 'Slabs Concrete Volume', value: quantities.rcc.slabs.volumeCFT, unit: 'CFT', detail: `RCC steel reinforcement: ${formatNumber(quantities.rcc.slabs.steelKg, 0)} kg` },
        { name: 'Staircases Concrete Volume', value: quantities.rcc.staircases.volumeCFT, unit: 'CFT', detail: `RCC steel reinforcement: ${formatNumber(quantities.rcc.staircases.steelKg, 0)} kg` }
      ]
    },
    {
      title: 'Raw Construction Materials Summary',
      items: [
        { name: 'Cement Required', value: quantities.summary.cementBags, unit: 'Bags', detail: `PCC: ${quantities.pcc.cementBags} | RCC: ${quantities.rcc.totalCementBags} | Plaster: ${quantities.plaster.totalCementBags} bags` },
        { name: 'Sand Required', value: quantities.summary.sandCFT, unit: 'CFT', detail: 'Click to view sand breakdown (plaster, concrete, masonry)', isSand: true },
        { name: 'Aggregates Required', value: quantities.summary.aggregateCFT, unit: 'CFT', detail: `PCC: ${quantities.pcc.aggregateCFT} | RCC: ${quantities.rcc.totalAggregateCFT} CFT` },
        { name: 'Steel Reinforcement Weight', value: quantities.summary.steelMT, unit: 'MT', detail: `Total weight: ${formatNumber(quantities.steel.totalSteelKg, 0)} kg` }
      ]
    },
    {
      title: 'Masonry & Partition Walls',
      items: (project.wallType as string) === 'AAC Blocks' || (project.wallType as string) === 'AAC Block Wall' ? [
        { name: 'AAC Block Quantity', value: quantities.summary.blocksCount, unit: 'Pcs', detail: 'Calculated with door/window deductions and wastage' },
        { name: 'Jointing Adhesive Bags', value: quantities.aac?.adhesiveBags || 0, unit: 'Bags', detail: 'Standard joint adhesive consumption' }
      ] : [
        { name: 'Red Clay Bricks Quantity', value: quantities.summary.bricksCount, unit: 'Pcs', detail: 'Calculated with door/window deductions and wastage' },
        { name: 'Wall Mortar Cement', value: quantities.bricks?.cementBags || 0, unit: 'Bags', detail: 'Cement bags for wall mortar jointing' },
        { name: 'Wall Mortar Sand', value: quantities.bricks?.sandCFT || 0, unit: 'CFT', detail: 'Sand volume for wall mortar jointing' }
      ]
    },
    {
      title: 'Plastering & Internal Finishes',
      items: [
        { name: 'Internal Wall Plaster Area', value: quantities.plaster.internalPlaster.areaSqFt, unit: 'Sq.Ft', detail: `Cement: ${quantities.plaster.internalPlaster.cementBags} bags | Sand: ${quantities.plaster.internalPlaster.sandCFT} CFT` },
        { name: 'External Wall Plaster Area', value: quantities.plaster.externalPlaster.areaSqFt, unit: 'Sq.Ft', detail: `Cement: ${quantities.plaster.externalPlaster.cementBags} bags | Sand: ${quantities.plaster.externalPlaster.sandCFT} CFT` },
        { name: 'Ceiling Plaster Area', value: quantities.plaster.ceilingPlaster.areaSqFt, unit: 'Sq.Ft', detail: `Cement: ${quantities.plaster.ceilingPlaster.cementBags} bags | Sand: ${quantities.plaster.ceilingPlaster.sandCFT} CFT` }
      ]
    },
    {
      title: 'Surface Finishes & Paint',
      items: [
        { name: 'Wall Putty Required', value: quantities.paint.puttyKg, unit: 'Kg', detail: 'Two-coat putty application coverage' },
        { name: 'Wall Primer Required', value: quantities.paint.primerLiters, unit: 'Liters', detail: 'Single-coat primer application' },
        { name: 'Interior Paint Required', value: quantities.paint.interiorPaintLiters, unit: 'Liters', detail: 'Double-coat interior paint' },
        { name: 'Exterior Paint Required', value: quantities.paint.exteriorPaintLiters, unit: 'Liters', detail: 'Double-coat weather coat paint' }
      ]
    },
    {
      title: 'Flooring Work',
      items: [
        { name: 'Tiled Floor Area', value: quantities.tiles.tileQuantitySqFt, unit: 'Sq.Ft', detail: `Includes wastage allowance (${quantities.tiles.tileWastageSqFt.toFixed(1)} Sq.Ft)` },
        { name: 'Floor Tiles Count (2x2 ft)', value: quantities.tiles.tilesCount, unit: 'Pcs', detail: 'Estimated pieces of standard size flooring tiles' }
      ]
    }
  ];

  const totalConcreteCFT = quantities.pcc.pccVolumeCFT + quantities.rcc.totalVolumeCFT;

  return (
    <div className="space-y-6">
      {/* Printable Sheet (hidden on screen, visible during print) */}
      <ReportPrint project={{ ...project, quality: selectedTier }} estimation={estimation} currency={currency} />

      {/* Top Controls Card */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
        <div>
          <h2 className="text-xl font-bold text-slate-900">{project.projectName} Estimate Sheet</h2>
          <p className="text-xs font-medium text-slate-450 mt-1">
            Structural Parameters: G+{project.floors - 1} Floor{project.floors > 1 ? 's' : ''} &bull; Country: {country}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          {onEdit && (
            <Button variant="outline" size="sm" onClick={onEdit} className="border-slate-200 text-xs">
              Edit Parameters
            </Button>
          )}

          <Button variant="primary" size="sm" onClick={handlePrint} className="bg-slate-900 text-white hover:bg-slate-800 text-xs">
            <Printer className="mr-2 h-4.5 w-4.5 text-amber-400" />
            <span>Print PDF Report</span>
          </Button>
        </div>
      </div>

      {/* Cost Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Estimated Budget */}
        <Card hoverEffect className="border-2 border-indigo-500 bg-gradient-to-br from-indigo-50/10 to-white shadow-sm relative overflow-hidden">
          <span className="absolute top-4 right-4 bg-indigo-100 text-indigo-800 text-[8px] font-extrabold px-2 py-0.5 rounded-md uppercase tracking-wider">
            Total Budget
          </span>
          <CardHeader className="pb-2">
            <CardDescription className="text-slate-500 font-bold flex items-center space-x-1.5">
              <DollarSign className="h-3.5 w-3.5 text-indigo-500" />
              <span>Project Budget ({selectedTier})</span>
            </CardDescription>
            <CardTitle className="text-2xl font-extrabold text-slate-950 mt-1.5">
              {formatCurrency(costEstimate.totalCost, currency as any)}
            </CardTitle>
          </CardHeader>
          <CardContent className="text-slate-500 text-2xs space-y-1">
            <div>
              BUA Cost Rate: <span className="font-semibold text-slate-700">{formatCurrency(Math.round(costEstimate.totalCost / quantities.area.builtUpAreaSqFt), currency as any)} / Sq.Ft</span>
            </div>
            <div className="border-t border-slate-100 pt-1 mt-1 font-semibold flex items-center justify-between text-slate-400">
              <span>Contingency (5%):</span>
              <span className="text-slate-700">{formatCurrency(costEstimate.contingency, currency as any)}</span>
            </div>
          </CardContent>
        </Card>

        {/* Material Share */}
        <Card hoverEffect className="border border-slate-100 bg-white">
          <CardHeader className="pb-2">
            <CardDescription className="text-slate-500 font-medium flex items-center space-x-1.5">
              <Boxes className="h-3.5 w-3.5 text-amber-500" />
              <span>Material Costs</span>
            </CardDescription>
            <CardTitle className="text-2xl font-extrabold text-slate-950 mt-1.5">
              {formatCurrency(costEstimate.totalMaterialCost, currency as any)}
            </CardTitle>
          </CardHeader>
          <CardContent className="text-slate-400 text-2xs">
            Reflects standard rates of concrete, steel, masonry bricks, flooring, paint, and finishing aggregates.
          </CardContent>
        </Card>

        {/* Labour Share */}
        <Card hoverEffect className="border border-slate-100 bg-white">
          <CardHeader className="pb-2">
            <CardDescription className="text-slate-500 font-medium flex items-center space-x-1.5">
              <Hammer className="h-3.5 w-3.5 text-emerald-500" />
              <span>Labour Expenses</span>
            </CardDescription>
            <CardTitle className="text-2xl font-extrabold text-slate-950 mt-1.5">
              {formatCurrency(costEstimate.labourCost, currency as any)}
            </CardTitle>
          </CardHeader>
          <CardContent className="text-slate-400 text-2xs">
            Labour charge resolved at standard rate of <span className="font-semibold text-slate-700">{formatCurrency(rates.labour, currency as any)}/Sq.Ft BUA</span>.
          </CardContent>
        </Card>

        {/* Built-Up Area */}
        <Card hoverEffect className="border border-slate-100 bg-white relative">
          <CardHeader className="pb-2">
            <CardDescription className="text-slate-500 font-medium flex items-center space-x-1.5">
              <Layers className="h-3.5 w-3.5 text-indigo-500" />
              <span>Built-Up Area</span>
            </CardDescription>
            <CardTitle className="text-2xl font-extrabold text-slate-950 mt-1.5">
              {formatNumber(builtUpAreaDisplay, 1)} Sq.{project.unit === 'Meter' ? 'm' : 'ft'}
            </CardTitle>
          </CardHeader>
          <CardContent className="text-slate-450 text-2xs">
            Dimensions: {project.plotLength} &times; {project.plotWidth} {project.unit} &bull; {project.floors} floor{project.floors > 1 ? 's' : ''} ({formatNumber(builtUpAreaSqGaj, 1)} Sq.Gaj).
          </CardContent>
        </Card>
      </div>

      {/* Pricing Tier Selector (Quick Action Comparison) */}
      <Card className="border border-slate-100 bg-white shadow-xs">
        <CardHeader className="pb-4">
          <CardTitle className="text-sm font-bold text-slate-900 flex items-center space-x-2">
            <TrendingUp className="h-5 w-5 text-indigo-500" />
            <span>Dynamic Finish Quality Cost Comparisons</span>
          </CardTitle>
          <CardDescription>Select a quality tier to recalculate rates, labor costs, and BOQs instantly</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {(['Economy', 'Standard', 'Premium', 'Luxury'] as PricingMode[]).map((tier) => {
              const estimate = comparisonMatrix[tier];
              const isSelected = selectedTier === tier;
              return (
                <button
                  key={tier}
                  type="button"
                  onClick={() => setSelectedTier(tier)}
                  className={`p-4 rounded-xl border text-left transition-all ${
                    isSelected
                      ? 'border-indigo-600 bg-indigo-50/20 shadow-sm ring-1 ring-indigo-500'
                      : 'border-slate-100 hover:border-slate-200 bg-slate-50/50'
                  }`}
                >
                  <span className={`text-xs font-bold uppercase tracking-wider ${isSelected ? 'text-indigo-800' : 'text-slate-455'}`}>
                    {tier} Finish
                  </span>
                  <div className="mt-2 text-md font-extrabold text-slate-900">
                    {formatCurrency(estimate.totalCost, currency as any)}
                  </div>
                  <p className="text-[10px] text-slate-400 mt-1 leading-none">
                    {formatCurrency(Math.round(estimate.totalCost / quantities.area.builtUpAreaSqFt), currency as any)} / sq.ft BUA
                  </p>
                </button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* BOQ Engine Output */}
      <Card className="border border-slate-100 bg-white shadow-sm overflow-hidden">
        <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between border-b border-slate-50 pb-4 gap-3">
          <div>
            <CardTitle className="text-sm font-bold text-slate-900">Professional Bill of Quantities (BOQ)</CardTitle>
            <CardDescription className="text-slate-500">Itemized material schedule, rates, and totals for the {selectedTier} tier</CardDescription>
          </div>
          <div className="flex items-center space-x-2 text-[10px] font-bold uppercase text-slate-500 bg-slate-50 px-3 py-1 rounded-xl border border-slate-100">
            <ShieldCheck className="h-4 w-4 text-emerald-500" />
            <span>Dynamic Registry Rules Resolved</span>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/40 text-slate-650 text-3xs font-bold uppercase tracking-wider border-b border-slate-100">
                  <th className="py-3 px-6">Description / Material</th>
                  <th className="py-3 px-6 text-right">Quantity</th>
                  <th className="py-3 px-6">Unit</th>
                  <th className="py-3 px-6 text-right">Unit Rate ({symbol})</th>
                  <th className="py-3 px-6 text-right">Total Cost ({symbol})</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 text-xs text-slate-650">
                {['Earthwork', 'Concrete Work', 'Structural Steel', 'Masonry', 'Plastering & Finishes', 'Flooring', 'Painting', 'Labour'].map((sectionName) => {
                  const sectionItems = boqItems.filter(item => item.section === sectionName);
                  if (sectionItems.length === 0) return null;

                  return (
                    <React.Fragment key={sectionName}>
                      <tr className="bg-slate-50/10 font-bold text-slate-900 border-y border-slate-100/50">
                        <td colSpan={5} className="py-2.5 px-6 uppercase text-3xs tracking-wider text-slate-500 bg-slate-50/10">
                          {sectionName}
                        </td>
                      </tr>
                      {sectionItems.map((item) => (
                        <tr key={item.id} className="hover:bg-slate-50/30 transition-colors">
                          <td className="py-3.5 px-6 font-semibold text-slate-900">{item.description}</td>
                          <td className="py-3.5 px-6 text-right font-extrabold text-slate-800">{formatNumber(item.quantity)}</td>
                          <td className="py-3.5 px-6 font-semibold text-slate-500">{item.unit}</td>
                          <td className="py-3.5 px-6 text-right font-bold text-slate-800">{formatCurrency(item.rate, currency as any)}</td>
                          <td className="py-3.5 px-6 text-right font-extrabold text-indigo-900">{formatCurrency(item.cost, currency as any)}</td>
                        </tr>
                      ))}
                    </React.Fragment>
                  );
                })}
                {/* Total row */}
                <tr className="bg-slate-950 text-white font-extrabold border-t border-slate-900">
                  <td colSpan={4} className="py-4 px-6 uppercase text-xs tracking-wider">
                    Total Estimated Project Cost (including 5% Contingency)
                  </td>
                  <td className="py-4 px-6 text-right text-sm text-amber-400">
                    {formatCurrency(costEstimate.totalCost, currency as any)}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Material Quantities Distribution Info */}
      <Card className="border border-slate-100 bg-white">
        <CardHeader>
          <CardTitle className="text-sm font-bold text-slate-900 flex items-center space-x-2">
            <Sliders className="h-5 w-5 text-indigo-500" />
            <span>Key Material Inventory Breakdown</span>
          </CardTitle>
          <CardDescription className="text-slate-500 font-medium">Major raw quantities required to achieve construction finishing specifications</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Cement */}
            <div className="p-4 rounded-xl border border-slate-100 bg-slate-50/50">
              <div className="flex justify-between items-center mb-2">
                <span className="text-xs font-bold text-slate-700 uppercase">Cement</span>
                <span className="text-xs font-extrabold text-indigo-800 bg-indigo-50 border border-indigo-200/50 px-2 py-0.5 rounded">{quantities.summary.cementBags} Bags</span>
              </div>
              <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-indigo-600 rounded-full" style={{ width: '85%' }}></div>
              </div>
              <p className="text-[10px] text-slate-500 mt-1.5 font-medium">Required for Concrete mix (RCC & PCC) and mortar/plaster.</p>
            </div>

            {/* Sand */}
            <div 
              onClick={() => setIsSandModalOpen(true)}
              className="p-4 rounded-xl border border-slate-100 bg-slate-50/50 cursor-pointer hover:bg-slate-100/50 transition-colors group"
            >
              <div className="flex justify-between items-center mb-2">
                <span className="text-xs font-bold text-slate-700 uppercase flex items-center gap-1">
                  Sand 
                  <span className="text-[9px] text-amber-600 font-extrabold border border-amber-300 bg-amber-50 px-1 py-0.2 rounded-full uppercase scale-90">View Breakdown</span>
                </span>
                <span className="text-xs font-extrabold text-amber-700 bg-amber-50 border border-amber-200/50 px-2 py-0.5 rounded">{quantities.summary.sandCFT} CFT</span>
              </div>
              <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-amber-500 rounded-full" style={{ width: '70%' }}></div>
              </div>
              <p className="text-[10px] text-slate-500 mt-1.5 font-medium">For structural concrete bedding, wall masonry, and plastering layers.</p>
            </div>

            {/* Aggregates */}
            <div className="p-4 rounded-xl border border-slate-100 bg-slate-50/50">
              <div className="flex justify-between items-center mb-2">
                <span className="text-xs font-bold text-slate-700 uppercase">Aggregates</span>
                <span className="text-xs font-extrabold text-blue-800 bg-blue-50 border border-blue-200/50 px-2 py-0.5 rounded">{quantities.summary.aggregateCFT} CFT</span>
              </div>
              <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-blue-500 rounded-full" style={{ width: '75%' }}></div>
              </div>
              <p className="text-[10px] text-slate-500 mt-1.5 font-medium">Coarse aggregate volume required for footing, slab, columns concrete.</p>
            </div>

            {/* Steel */}
            <div className="p-4 rounded-xl border border-slate-100 bg-slate-50/50">
              <div className="flex justify-between items-center mb-2">
                <span className="text-xs font-bold text-slate-700 uppercase">Steel</span>
                <span className="text-xs font-extrabold text-emerald-800 bg-emerald-50 border border-emerald-200/50 px-2 py-0.5 rounded">{quantities.summary.steelMT.toFixed(2)} MT</span>
              </div>
              <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-emerald-500 rounded-full" style={{ width: '60%' }}></div>
              </div>
              <p className="text-[10px] text-slate-500 mt-1.5 font-medium">Consolidated structural reinforcement bars for all RCC members.</p>
            </div>

            {/* Bricks/Blocks */}
            <div className="p-4 rounded-xl border border-slate-100 bg-slate-50/50">
              <div className="flex justify-between items-center mb-2">
                <span className="text-xs font-bold text-slate-700 uppercase">
                  {(project.wallType as string) === 'AAC Blocks' || (project.wallType as string) === 'AAC Block Wall' ? 'AAC Blocks' : 'Bricks'}
                </span>
                <span className="text-xs font-extrabold text-rose-800 bg-rose-50 border border-rose-200/50 px-2 py-0.5 rounded">
                  {(project.wallType as string) === 'AAC Blocks' || (project.wallType as string) === 'AAC Block Wall' 
                    ? `${quantities.summary.blocksCount} Blocks` 
                    : `${quantities.summary.bricksCount} Bricks`}
                </span>
              </div>
              <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-rose-500 rounded-full" style={{ width: '80%' }}></div>
              </div>
              <p className="text-[10px] text-slate-500 mt-1.5 font-medium">Partition walls and boundary masonry counting doors & window openings.</p>
            </div>

            {/* Finishes */}
            <div className="p-4 rounded-xl border border-slate-100 bg-slate-50/50">
              <div className="flex justify-between items-center mb-2">
                <span className="text-xs font-bold text-slate-700 uppercase">Tiles Area</span>
                <span className="text-xs font-extrabold text-cyan-800 bg-cyan-50 border border-cyan-200/50 px-2 py-0.5 rounded">{Math.round(quantities.summary.tilesSqFt)} Sq.Ft</span>
              </div>
              <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-cyan-500 rounded-full" style={{ width: '65%' }}></div>
              </div>
              <p className="text-[10px] text-slate-500 mt-1.5 font-medium">Includes {quantities.tiles.tilesCount} tiles of standard 2ft x 2ft dimensions.</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Sand Material Breakdown Modal */}
      <Modal
        isOpen={isSandModalOpen}
        onClose={() => setIsSandModalOpen(false)}
        title="Sand Material Breakdown"
        size="md"
      >
        <div className="space-y-6">
          <div className="bg-slate-50 p-4.5 rounded-2xl border border-slate-100">
            <h4 className="font-bold text-slate-900 text-sm">Total Sand Requirement</h4>
            <div className="mt-2.5 flex items-baseline justify-between">
              <div>
                <span className="text-3xl font-extrabold text-slate-900">
                  {formatNumber(quantities.summary.sandCFT)}
                </span>
                <span className="text-xs font-semibold text-slate-500 ml-1">Cft</span>
              </div>
              <div className="text-right">
                <p className="text-xs font-medium text-slate-500">Standard Conversion</p>
                <p className="text-xs font-bold text-slate-900">{(quantities.summary.sandCFT / 35.3147).toFixed(2)} m³</p>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h5 className="text-xs font-bold uppercase tracking-wider text-slate-400">Sand Types & Applications</h5>

            <div className="divide-y divide-slate-100">
              <div className="py-3.5 flex items-center justify-between">
                <div>
                  <p className="font-bold text-slate-800 text-sm">Concrete Sand (Coarse)</p>
                  <p className="text-xs text-slate-500 mt-0.5 font-medium">Used for foundation, columns, beams, and slabs concrete</p>
                </div>
                <div className="text-right flex-shrink-0 ml-4">
                  <p className="font-extrabold text-slate-900">{formatNumber(Math.round(quantities.summary.sandCFT * 0.5))} Cft</p>
                  <p className="text-xs text-slate-550 italic mt-0.5 font-medium">Approx. 50% Share</p>
                </div>
              </div>

              <div className="py-3.5 flex items-center justify-between">
                <div>
                  <p className="font-bold text-slate-800 text-sm">Plastering Sand (Fine)</p>
                  <p className="text-xs text-slate-500 mt-0.5 font-medium">Used for internal/external wall plastering and finishing</p>
                </div>
                <div className="text-right flex-shrink-0 ml-4">
                  <p className="font-extrabold text-slate-900">{formatNumber(Math.round(quantities.summary.sandCFT * 0.3))} Cft</p>
                  <p className="text-xs text-slate-550 italic mt-0.5 font-medium">Approx. 30% Share</p>
                </div>
              </div>

              <div className="py-3.5 flex items-center justify-between">
                <div>
                  <p className="font-bold text-slate-800 text-sm">Masonry Sand (River/Brickwork)</p>
                  <p className="text-xs text-slate-500 mt-0.5 font-medium">Used for brick laying and mortar joining walls</p>
                </div>
                <div className="text-right flex-shrink-0 ml-4">
                  <p className="font-extrabold text-slate-900">
                    {formatNumber(quantities.summary.sandCFT - Math.round(quantities.summary.sandCFT * 0.5) - Math.round(quantities.summary.sandCFT * 0.3))} Cft
                  </p>
                  <p className="text-xs text-slate-550 italic mt-0.5 font-medium">Approx. 20% Share</p>
                </div>
              </div>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-amber-500/5 border border-amber-500/10 text-2xs text-amber-700 font-semibold leading-normal">
            Note: The breakdown ratio (50% Concrete Sand, 30% Plaster Sand, 20% Masonry Sand) is based on standard construction schedules for concrete, plastering, and brickwork.
          </div>
        </div>
      </Modal>
    </div>
  );
}
